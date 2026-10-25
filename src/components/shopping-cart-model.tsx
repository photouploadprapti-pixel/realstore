'use client'

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * First-person wire shopping cart attached to the camera (bottom of view).
 */
export const ShoppingCartModel = () => {
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()

  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    camera.add(group)
    group.position.set(0, -0.52, -0.9)
    group.rotation.set(0.15, 0, 0)
    return () => {
      camera.remove(group)
    }
  }, [camera])

  const metal = '#8a96a3'
  const dark = '#4a5560'

  return (
    <group ref={groupRef} frustumCulled={false}>
      {/* Outer rim */}
      <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.014, 8, 28]} />
        <meshStandardMaterial color={metal} metalness={0.75} roughness={0.3} />
      </mesh>

      {/* Vertical wires */}
      {[-0.22, -0.08, 0.08, 0.22].map((x) => (
        <mesh key={`vx-${x}`} position={[x, 0.0, 0]}>
          <boxGeometry args={[0.012, 0.3, 0.45]} />
          <meshStandardMaterial color={metal} metalness={0.7} roughness={0.35} />
        </mesh>
      ))}

      {/* Depth wires */}
      {[-0.18, 0, 0.18].map((z) => (
        <mesh key={`vz-${z}`} position={[0, 0.0, z]}>
          <boxGeometry args={[0.45, 0.3, 0.012]} />
          <meshStandardMaterial color={metal} metalness={0.7} roughness={0.35} />
        </mesh>
      ))}

      {/* Basket floor */}
      <mesh position={[0, -0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.42, 0.42]} />
        <meshStandardMaterial
          color={dark}
          metalness={0.55}
          roughness={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Handle */}
      <mesh position={[0, 0.3, 0.08]} rotation={[0.4, 0, Math.PI / 2]}>
        <torusGeometry args={[0.18, 0.012, 8, 16, Math.PI]} />
        <meshStandardMaterial color={dark} metalness={0.65} roughness={0.35} />
      </mesh>

      {/* Red child-seat flap */}
      <mesh position={[0, 0.2, 0.2]}>
        <boxGeometry args={[0.24, 0.035, 0.14]} />
        <meshStandardMaterial color="#c41e3a" roughness={0.45} />
      </mesh>

      {/* Front corners accent */}
      <mesh position={[-0.2, -0.05, 0.2]}>
        <boxGeometry args={[0.04, 0.04, 0.04]} />
        <meshStandardMaterial color="#0066cc" />
      </mesh>
      <mesh position={[0.2, -0.05, 0.2]}>
        <boxGeometry args={[0.04, 0.04, 0.04]} />
        <meshStandardMaterial color="#0066cc" />
      </mesh>
    </group>
  )
}
