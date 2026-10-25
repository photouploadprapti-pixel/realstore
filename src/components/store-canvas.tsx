'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { SupermarketScene } from '@/components/supermarket-scene'

interface StoreCanvasProps {
  controlsEnabled: boolean
  movementEnabled: boolean
  onLockChange: (locked: boolean) => void
}

/**
 * WebGL canvas host for the supermarket scene.
 * @param props - Control flags and pointer-lock handler
 */
export const StoreCanvas = ({
  controlsEnabled,
  movementEnabled,
  onLockChange,
}: StoreCanvasProps) => {
  return (
    <Canvas
      className="absolute inset-0 h-full w-full touch-none"
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 68, near: 0.1, far: 80, position: [0, 1.65, 7] }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl }) => {
        gl.shadowMap.enabled = true
      }}
    >
      <Suspense fallback={null}>
        <SupermarketScene
          controlsEnabled={controlsEnabled}
          movementEnabled={movementEnabled}
          onLockChange={onLockChange}
        />
      </Suspense>
    </Canvas>
  )
}
