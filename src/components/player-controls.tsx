'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const MOVE_SPEED = 5.2
const TURN_SPEED = 1.8
const LOOK_SPEED = 0.002
const PLAYER_HEIGHT = 1.65
const PLAYER_RADIUS = 0.35
const PITCH_LIMIT = 1.2

/** Walkable store bounds (x/z). */
export const STORE_BOUNDS = {
  minX: -10.5,
  maxX: 10.5,
  minZ: -12.5,
  maxZ: 9.5,
}

/** Shelf and fixture collision boxes. */
const OBSTACLES: { minX: number; maxX: number; minZ: number; maxZ: number }[] = [
  { minX: -5.55, maxX: -4.45, minZ: -8.2, maxZ: 3.2 },
  { minX: 4.45, maxX: 5.55, minZ: -8.2, maxZ: 3.2 },
  { minX: -1.0, maxX: 1.0, minZ: -7.6, maxZ: -6.4 },
  { minX: -1.0, maxX: 1.0, minZ: 0.4, maxZ: 1.6 },
  { minX: -6.2, maxX: -3.8, minZ: 8.3, maxZ: 9.7 },
  { minX: -1.2, maxX: 1.2, minZ: 8.3, maxZ: 9.7 },
  { minX: 3.8, maxX: 6.2, minZ: 8.3, maxZ: 9.7 },
]

interface PlayerControlsProps {
  enabled: boolean
  /** When true, arrow keys still move even if a product card is open. */
  movementEnabled: boolean
  onLock?: () => void
  onUnlock?: () => void
}

/**
 * Store walking controls: ↑↓ walk, ←→ turn, mouse looks when locked.
 * @param props - Enable flags and lock callbacks
 */
export const PlayerControls = ({
  enabled,
  movementEnabled,
  onLock,
  onUnlock,
}: PlayerControlsProps) => {
  const { camera, gl } = useThree()
  const keysRef = useRef<Record<string, boolean>>({})
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const isLocked = useRef(false)
  const isDragging = useRef(false)
  const forward = useRef(new THREE.Vector3())
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    camera.position.set(0, PLAYER_HEIGHT, 7)
    euler.current.set(0, 0, 0)
    camera.quaternion.setFromEuler(euler.current)
    // Test hooks for Playwright / manual debugging
    if (typeof window !== 'undefined') {
      const w = window as unknown as {
        __rsCam?: THREE.Camera
        __rsEuler?: THREE.Euler
        __rsKeys?: Record<string, boolean>
        __rsStep?: (dt: number) => void
      }
      w.__rsCam = camera
      w.__rsEuler = euler.current
      w.__rsKeys = keysRef.current
      w.__rsStep = (dt: number) => {
        const keys = keysRef.current
        const turn =
          Number(Boolean(keys.ArrowRight || keys.KeyD)) -
          Number(Boolean(keys.ArrowLeft || keys.KeyA))
        if (turn) {
          euler.current.y -= turn * TURN_SPEED * dt
          camera.quaternion.setFromEuler(euler.current)
        }
        const walk =
          Number(Boolean(keys.ArrowUp || keys.KeyW)) -
          Number(Boolean(keys.ArrowDown || keys.KeyS))
        if (!walk) {
          return { moved: false, keys: { ...keys }, walk, turn }
        }
        const fx = -Math.sin(euler.current.y) * walk * MOVE_SPEED * dt
        const fz = -Math.cos(euler.current.y) * walk * MOVE_SPEED * dt
        const nextX = THREE.MathUtils.clamp(
          camera.position.x + fx,
          STORE_BOUNDS.minX,
          STORE_BOUNDS.maxX
        )
        const nextZ = THREE.MathUtils.clamp(
          camera.position.z + fz,
          STORE_BOUNDS.minZ,
          STORE_BOUNDS.maxZ
        )
        const blockedX = collides(nextX, camera.position.z)
        const blockedZ = collides(camera.position.x, nextZ)
        if (!blockedX) camera.position.x = nextX
        if (!blockedZ) camera.position.z = nextZ
        camera.position.y = PLAYER_HEIGHT
        return {
          moved: !blockedX || !blockedZ,
          walk,
          turn,
          nextZ,
          blockedZ,
          z: camera.position.z,
        }
      }
    }
  }, [camera])

  useEffect(() => {
    const canvas = gl.domElement

    /**
     * Tracks movement keys (always, so keys are not missed while UI is open).
     * @param event - Keyboard event
     */
    const onKeyDown = (event: KeyboardEvent) => {
      const code = event.code
      if (
        code === 'ArrowUp' ||
        code === 'ArrowDown' ||
        code === 'ArrowLeft' ||
        code === 'ArrowRight' ||
        code === 'KeyW' ||
        code === 'KeyA' ||
        code === 'KeyS' ||
        code === 'KeyD'
      ) {
        event.preventDefault()
        keysRef.current[code] = true
      }
    }

    /**
     * Clears released keys.
     * @param event - Keyboard event
     */
    const onKeyUp = (event: KeyboardEvent) => {
      keysRef.current[event.code] = false
    }

    /**
     * Mouse look while pointer-locked or right-dragging.
     * @param event - Mouse move
     */
    const onMouseMove = (event: MouseEvent) => {
      if (!enabled) return
      if (!isLocked.current && !isDragging.current) return

      euler.current.y -= event.movementX * LOOK_SPEED
      euler.current.x -= event.movementY * LOOK_SPEED
      euler.current.x = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, euler.current.x))
      camera.quaternion.setFromEuler(euler.current)
    }

    /**
     * Right-drag look when not pointer-locked.
     * @param event - Pointer down
     */
    const onPointerDown = (event: PointerEvent) => {
      if (!enabled || event.button !== 2) return
      if (isLocked.current) return
      event.preventDefault()
      isDragging.current = true
      canvas.setPointerCapture(event.pointerId)
    }

    /**
     * Ends drag look.
     * @param event - Pointer up
     */
    const onPointerUp = (event: PointerEvent) => {
      isDragging.current = false
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId)
      }
    }

    /**
     * Prevents context menu during right-drag look.
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
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('pointerlockchange', onLockChange)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('contextmenu', onContextMenu)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('pointerlockchange', onLockChange)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('contextmenu', onContextMenu)
    }
  }, [camera, enabled, gl.domElement, onLock, onUnlock])

  useFrame((_, delta) => {
    if (!enabled || !movementEnabled) return

    const dt = Math.min(delta, 0.05)
    const keys = keysRef.current

    // ← → turn in place (works without mouse)
    const turn =
      Number(keys.ArrowRight || keys.KeyD) - Number(keys.ArrowLeft || keys.KeyA)
    if (turn) {
      euler.current.y -= turn * TURN_SPEED * dt
      camera.quaternion.setFromEuler(euler.current)
    }

    // ↑ ↓ walk along facing direction on the floor plane
    const walk =
      Number(keys.ArrowUp || keys.KeyW) - Number(keys.ArrowDown || keys.KeyS)
    if (!walk) return

    // Use yaw only so pitch does not break walking direction
    forward.current.set(-Math.sin(euler.current.y), 0, -Math.cos(euler.current.y))
    forward.current.multiplyScalar(walk * MOVE_SPEED * dt)

    const tryX = camera.position.x + forward.current.x
    const tryZ = camera.position.z + forward.current.z
    const nextX = THREE.MathUtils.clamp(tryX, STORE_BOUNDS.minX, STORE_BOUNDS.maxX)
    const nextZ = THREE.MathUtils.clamp(tryZ, STORE_BOUNDS.minZ, STORE_BOUNDS.maxZ)

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
