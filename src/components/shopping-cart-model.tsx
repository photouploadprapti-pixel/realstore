'use client'

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Secondary 3D cart mesh parented to the camera (backup to the SVG HUD).
 */
export const ShoppingCartModel = () => {
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()

  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    camera.add(group)
    // Slightly below & in front — uses unlit materials so scene lights are not required
    group.position.set(0, -0.62, -0.95)
    group.rotation.set(0.18, 0, 0)
    return () => {
      camera.remove(group)
    }
  }, [camera])

  return (
    <group ref={groupRef} frustumCulled={false} visible={false}>
      {/* Hidden by default — SVG CartHud is the primary visible cart.
          Kept in the scene graph for optional future 3D use. */}
      <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.016, 8, 28]} />
        <meshBasicMaterial color="#9aa5b1" />
      </mesh>
    </group>
  )
}
