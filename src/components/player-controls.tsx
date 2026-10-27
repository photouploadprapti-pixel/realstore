'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/** Matches byomid.com/supermarket walk speeds. */
const WALK_SPEED = 2.7
const RUN_SPEED = 4.2
const TURN_SPEED = 1.6
const LOOK_SPEED = 0.0022
const PLAYER_HEIGHT = 1.65
const PLAYER_RADIUS = 0.28
const PITCH_LIMIT = 1.1

/** Walkable store bounds (x/z). */
export const STORE_BOUNDS = {
  minX: -10.5,
  maxX: 10.5,
  minZ: -12.5,
  maxZ: 8.0,
}

/**
 * Shelf / fixture collisions. Checkout counters sit behind the spawn line
 * so the player is never trapped at start.
 */
const OBSTACLES: { minX: number; maxX: number; minZ: number; maxZ: number }[] = [
  { minX: -5.55, maxX: -4.45, minZ: -8.2, maxZ: 3.2 },
  { minX: 4.45, maxX: 5.55, minZ: -8.2, maxZ: 3.2 },
  { minX: -1.0, maxX: 1.0, minZ: -7.6, maxZ: -6.4 },
  { minX: -1.0, maxX: 1.0, minZ: 0.4, maxZ: 1.6 },
]

const MOVE_CODES = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ShiftLeft',
  'ShiftRight',
])

interface PlayerControlsProps {
  /** Shopping session has started. */
  enabled: boolean
  /** When false (cart/checkout open), keys are ignored. */
  movementEnabled: boolean
  onLock?: () => void
  onUnlock?: () => void
}

/**
 * Byomid-style controls:
 * - W/↑ S/↓ walk · A/D strafe · ←/→ turn
 * - Mouse look while pointer-locked (click canvas to lock)
 * @param props - Enable flags and lock callbacks
 */
export const PlayerControls = ({
  enabled,
  movementEnabled,
  onLock,
  onUnlock,
}: PlayerControlsProps) => {
  const { camera, gl } = useThree()
  const keysRef = useRef<Set<string>>(new Set())
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const isLocked = useRef(false)
  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const wish = useRef(new THREE.Vector3())
  const spawned = useRef(false)

  useEffect(() => {
    if (spawned.current) return
    spawned.current = true
    // Clear center aisle — in front of checkouts, facing into the store
    camera.position.set(0, PLAYER_HEIGHT, 5.5)
    euler.current.set(0, 0, 0)
    camera.quaternion.setFromEuler(euler.current)

    const w = window as unknown as {
      __rsCam?: THREE.Camera
      __rsEuler?: THREE.Euler
      __rsKeys?: Set<string>
      __rsTeleport?: (x: number, z: number, yaw: number) => void
    }
    w.__rsCam = camera
    w.__rsEuler = euler.current
    w.__rsKeys = keysRef.current
    w.__rsTeleport = (x, z, yaw) => {
      camera.position.set(x, PLAYER_HEIGHT, z)
      euler.current.set(0, yaw, 0)
      camera.quaternion.setFromEuler(euler.current)
    }
    /** Deterministic step for smoke tests (avoids headless rAF throttle). */
    ;(window as unknown as { __rsStep?: (dt: number) => void }).__rsStep = (dt) => {
      const keys = keysRef.current
      if (keys.has('ArrowLeft')) {
        euler.current.y += TURN_SPEED * dt
        camera.quaternion.setFromEuler(euler.current)
      }
      if (keys.has('ArrowRight')) {
        euler.current.y -= TURN_SPEED * dt
        camera.quaternion.setFromEuler(euler.current)
      }
      let moveF =
        (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) -
        (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0)
      let moveR = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0)
      const len = Math.hypot(moveF, moveR)
      if (len > 1) {
        moveF /= len
        moveR /= len
      }
      if (!moveF && !moveR) return
      const yaw = euler.current.y
      const fx = -Math.sin(yaw)
      const fz = -Math.cos(yaw)
      const rx = Math.cos(yaw)
      const rz = -Math.sin(yaw)
      const speed =
        (keys.has('ShiftLeft') || keys.has('ShiftRight') ? RUN_SPEED : WALK_SPEED) * dt
      const dx = (fx * moveF + rx * moveR) * speed
      const dz = (fz * moveF + rz * moveR) * speed
      const nextX = THREE.MathUtils.clamp(
        camera.position.x + dx,
        STORE_BOUNDS.minX,
        STORE_BOUNDS.maxX
      )
      const nextZ = THREE.MathUtils.clamp(
        camera.position.z + dz,
        STORE_BOUNDS.minZ,
        STORE_BOUNDS.maxZ
      )
      if (!collides(nextX, camera.position.z)) camera.position.x = nextX
      if (!collides(camera.position.x, nextZ)) camera.position.z = nextZ
      camera.position.y = PLAYER_HEIGHT
    }
  }, [camera])

  useEffect(() => {
    const canvas = gl.domElement

    /**
     * Requests pointer lock for mouse look (byomid startFree equivalent).
     */
    const startFree = () => {
      if (!enabled) return
      if (document.pointerLockElement === canvas) return
      canvas.requestPointerLock()
    }

    /**
     * Tracks pressed movement keys (Set, like the byomid demo).
     * @param event - Keyboard event
     */
    const onKeyDown = (event: KeyboardEvent) => {
      if (!MOVE_CODES.has(event.code)) return
      event.preventDefault()
      if (!enabled || !movementEnabled) return
      keysRef.current.add(event.code)
      startFree()
    }

    /**
     * Clears released keys.
     * @param event - Keyboard event
     */
    const onKeyUp = (event: KeyboardEvent) => {
      keysRef.current.delete(event.code)
    }

    /**
     * Clears keys on blur / tab hide.
     */
    const clearKeys = () => {
      keysRef.current.clear()
    }

    /**
     * Mouse look while pointer-locked.
     * @param event - Mouse move
     */
    const onMouseMove = (event: MouseEvent) => {
      if (!enabled || !isLocked.current) return
      euler.current.y -= event.movementX * LOOK_SPEED
      euler.current.x -= event.movementY * LOOK_SPEED
      euler.current.x = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, euler.current.x))
      camera.quaternion.setFromEuler(euler.current)
    }

    /**
     * Click canvas to enter free-look (demo pattern).
     */
    const onCanvasClick = () => {
      if (!enabled) return
      startFree()
    }

    /**
     * Blocks context menu on the canvas.
     * @param event - Context menu event
     */
    const onContextMenu = (event: Event) => {
      event.preventDefault()
    }

    /**
     * Syncs pointer-lock state.
     */
    const onLockChange = () => {
      const locked = document.pointerLockElement === canvas
      isLocked.current = locked
      if (locked) onLock?.()
      else onUnlock?.()
    }

    window.addEventListener('keydown', onKeyDown, { passive: false })
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', clearKeys)
    document.addEventListener('visibilitychange', clearKeys)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('pointerlockchange', onLockChange)
    canvas.addEventListener('click', onCanvasClick)
    canvas.addEventListener('contextmenu', onContextMenu)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', clearKeys)
      document.removeEventListener('visibilitychange', clearKeys)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('pointerlockchange', onLockChange)
      canvas.removeEventListener('click', onCanvasClick)
      canvas.removeEventListener('contextmenu', onContextMenu)
    }
  }, [camera, enabled, gl.domElement, movementEnabled, onLock, onUnlock])

  // Clear keys when UI disables movement (cart / checkout)
  useEffect(() => {
    if (!movementEnabled) keysRef.current.clear()
  }, [movementEnabled])

  useFrame((_, delta) => {
    if (!enabled || !movementEnabled) return

    const dt = Math.min(delta, 0.05)
    const keys = keysRef.current

    // ← → turn in place (byomid behavior)
    if (keys.has('ArrowLeft')) {
      euler.current.y += TURN_SPEED * dt
      camera.quaternion.setFromEuler(euler.current)
    }
    if (keys.has('ArrowRight')) {
      euler.current.y -= TURN_SPEED * dt
      camera.quaternion.setFromEuler(euler.current)
    }

    // W/↑ S/↓ walk · A/D strafe
    let moveF =
      (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) -
      (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0)
    let moveR = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0)

    const len = Math.hypot(moveF, moveR)
    if (len > 1) {
      moveF /= len
      moveR /= len
    }
    if (!moveF && !moveR) return

    const yaw = euler.current.y
    forward.current.set(-Math.sin(yaw), 0, -Math.cos(yaw))
    right.current.set(Math.cos(yaw), 0, -Math.sin(yaw))

    const speed =
      (keys.has('ShiftLeft') || keys.has('ShiftRight') ? RUN_SPEED : WALK_SPEED) * dt

    wish.current
      .set(0, 0, 0)
      .addScaledVector(forward.current, moveF)
      .addScaledVector(right.current, moveR)
      .multiplyScalar(speed)

    const nextX = THREE.MathUtils.clamp(
      camera.position.x + wish.current.x,
      STORE_BOUNDS.minX,
      STORE_BOUNDS.maxX
    )
    const nextZ = THREE.MathUtils.clamp(
      camera.position.z + wish.current.z,
      STORE_BOUNDS.minZ,
      STORE_BOUNDS.maxZ
    )

    if (!collides(nextX, camera.position.z)) camera.position.x = nextX
    if (!collides(camera.position.x, nextZ)) camera.position.z = nextZ
    camera.position.y = PLAYER_HEIGHT
  })

  return null
}

/**
 * AABB collision test with player radius.
 * @param x - World X
 * @param z - World Z
 */
const collides = (x: number, z: number) => {
  return OBSTACLES.some(
    (box) =>
      x + PLAYER_RADIUS > box.minX &&
      x - PLAYER_RADIUS < box.maxX &&
      z + PLAYER_RADIUS > box.minZ &&
      z - PLAYER_RADIUS < box.maxZ
  )
}
