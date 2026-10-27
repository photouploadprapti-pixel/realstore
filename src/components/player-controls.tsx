'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const MOVE_SPEED = 5.5
const LOOK_SPEED = 0.002
const PLAYER_HEIGHT = 1.65
const PLAYER_RADIUS = 0.32
const PITCH_LIMIT = 1.15

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
  movementEnabled: boolean
  onLock?: () => void
  onUnlock?: () => void
}

/**
 * Returns 1/0 from a possibly undefined key flag (avoids NaN from Number(undefined)).
 * @param value - Key pressed flag
 */
const keyBit = (value: boolean | undefined) => (value ? 1 : 0)

/**
 * FPS walk controls: ↑↓←→ / WASD move relative to look; mouse looks around.
 * @param props - Enable flags and lock callbacks
 */
export const PlayerControls = ({
  enabled,
  movementEnabled,
  onLock,
  onUnlock,
}: PlayerControlsProps) => {
  const { camera, gl } = useThree()
  const keysRef = useRef<Record<string, boolean>>({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
  })
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const isLocked = useRef(false)
  const isDragging = useRef(false)
  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const wish = useRef(new THREE.Vector3())
  const spawned = useRef(false)

  useEffect(() => {
    if (spawned.current) return
    spawned.current = true
    // Spawn in the clear center aisle, facing into the store (-Z)
    camera.position.set(0, PLAYER_HEIGHT, 8.2)
    euler.current.set(0, 0, 0)
    camera.quaternion.setFromEuler(euler.current)

    if (typeof window !== 'undefined') {
      const w = window as unknown as {
        __rsCam?: THREE.Camera
        __rsEuler?: THREE.Euler
        __rsKeys?: Record<string, boolean>
      }
      w.__rsCam = camera
      w.__rsEuler = euler.current
      w.__rsKeys = keysRef.current
    }
  }, [camera])

  useEffect(() => {
    const canvas = gl.domElement
    const moveCodes = new Set([
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'KeyW',
      'KeyA',
      'KeyS',
      'KeyD',
    ])

    /**
     * Tracks pressed movement keys.
     * @param event - Keyboard event
     */
    const onKeyDown = (event: KeyboardEvent) => {
      if (!moveCodes.has(event.code)) return
      event.preventDefault()
      keysRef.current[event.code] = true
    }

    /**
     * Clears released movement keys.
     * @param event - Keyboard event
     */
    const onKeyUp = (event: KeyboardEvent) => {
      if (!moveCodes.has(event.code)) return
      keysRef.current[event.code] = false
    }

    /**
     * Clears all keys when the window loses focus (prevents stuck keys).
     */
    const clearKeys = () => {
      for (const code of moveCodes) keysRef.current[code] = false
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
     * Starts right-drag look when not pointer-locked.
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
     * Blocks the browser context menu for right-drag look.
     * @param event - Context menu event
     */
    const onContextMenu = (event: Event) => {
      event.preventDefault()
    }

    /**
     * Syncs pointer-lock state for free look.
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
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('pointerlockchange', onLockChange)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('contextmenu', onContextMenu)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', clearKeys)
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

    // Demo-style: all four arrows / WASD move on the floor plane
    const moveForward = keyBit(keys.ArrowUp || keys.KeyW) - keyBit(keys.ArrowDown || keys.KeyS)
    const moveStrafe = keyBit(keys.ArrowRight || keys.KeyD) - keyBit(keys.ArrowLeft || keys.KeyA)

    if (!moveForward && !moveStrafe) return

    // Yaw-only facing so pitch does not break walking
    const yaw = euler.current.y
    forward.current.set(-Math.sin(yaw), 0, -Math.cos(yaw))
    right.current.set(Math.cos(yaw), 0, -Math.sin(yaw))

    wish.current
      .set(0, 0, 0)
      .addScaledVector(forward.current, moveForward)
      .addScaledVector(right.current, moveStrafe)

    if (wish.current.lengthSq() < 0.0001) return
    wish.current.normalize().multiplyScalar(MOVE_SPEED * dt)

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

    // Axis-separated sliding along shelves
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
