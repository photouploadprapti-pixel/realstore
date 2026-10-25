'use client'

import { Text } from '@react-three/drei'
import type { DepartmentId, Product } from '@/types/product'
import { DEPARTMENT_LABELS, getProductsByDepartment } from '@/lib/products'
import { ProductMesh } from '@/components/product-mesh'

interface GondolaProps {
  leftDepartment: DepartmentId
  rightDepartment: DepartmentId
  position: [number, number, number]
  gondolaId: string
  aimedInstanceId: string | null
  onSelectProduct: (product: Product) => void
}

const SHELF_HEIGHTS = [0.38, 0.88, 1.38, 1.88, 2.35]
const SLOTS_PER_SHELF = 8
const AISLE_LENGTH = 11
const DEPTH = 0.42

/**
 * Double-sided supermarket gondola with products facing both aisles.
 * @param props - Departments, placement, aim id, and handlers
 */
export const Gondola = ({
  leftDepartment,
  rightDepartment,
  position,
  gondolaId,
  aimedInstanceId,
  onSelectProduct,
}: GondolaProps) => {
  return (
    <group position={position}>
      <mesh position={[0, 1.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 2.7, AISLE_LENGTH]} />
        <meshStandardMaterial color="#d9e4f0" roughness={0.65} />
      </mesh>

      {([-AISLE_LENGTH / 2, AISLE_LENGTH / 2] as const).map((z) => (
        <mesh key={z} position={[0, 1.35, z]} castShadow>
          <boxGeometry args={[0.95, 2.7, 0.14]} />
          <meshStandardMaterial color="#0055a5" roughness={0.4} />
        </mesh>
      ))}

      <mesh position={[0, 2.75, 0]} castShadow>
        <boxGeometry args={[0.95, 0.16, AISLE_LENGTH + 0.1]} />
        <meshStandardMaterial color="#0066cc" roughness={0.35} />
      </mesh>

      <ShelfFace
        department={leftDepartment}
        faceDirection={-1}
        faceId={`${gondolaId}-L`}
        aimedInstanceId={aimedInstanceId}
        onSelectProduct={onSelectProduct}
      />
      <ShelfFace
        department={rightDepartment}
        faceDirection={1}
        faceId={`${gondolaId}-R`}
        aimedInstanceId={aimedInstanceId}
        onSelectProduct={onSelectProduct}
      />

      <EndCapProducts
        department={rightDepartment}
        z={AISLE_LENGTH / 2 + 0.28}
        capId={`${gondolaId}-capF`}
        aimedInstanceId={aimedInstanceId}
        onSelectProduct={onSelectProduct}
      />
      <EndCapProducts
        department={leftDepartment}
        z={-AISLE_LENGTH / 2 - 0.28}
        capId={`${gondolaId}-capB`}
        aimedInstanceId={aimedInstanceId}
        onSelectProduct={onSelectProduct}
      />
    </group>
  )
}

interface ShelfFaceProps {
  department: DepartmentId
  faceDirection: 1 | -1
  faceId: string
  aimedInstanceId: string | null
  onSelectProduct: (product: Product) => void
}

/**
 * One stocked face of a gondola.
 * @param props - Department, facing, unique face id, and handlers
 */
const ShelfFace = ({
  department,
  faceDirection,
  faceId,
  aimedInstanceId,
  onSelectProduct,
}: ShelfFaceProps) => {
  const products = getProductsByDepartment(department)
  const label = DEPARTMENT_LABELS[department]
  const rotationY = faceDirection === 1 ? Math.PI / 2 : -Math.PI / 2
  const faceX = faceDirection * (DEPTH / 2 + 0.02)

  return (
    <group>
      {SHELF_HEIGHTS.map((y) => (
        <group key={y}>
          <mesh position={[faceDirection * 0.28, y, 0]} receiveShadow castShadow>
            <boxGeometry args={[DEPTH, 0.05, AISLE_LENGTH - 0.25]} />
            <meshStandardMaterial color="#f7fafc" roughness={0.5} />
          </mesh>
          <mesh position={[faceDirection * 0.48, y - 0.03, 0]}>
            <boxGeometry args={[0.07, 0.12, AISLE_LENGTH - 0.25]} />
            <meshStandardMaterial color="#0066cc" roughness={0.35} />
          </mesh>
        </group>
      ))}

      <group position={[faceDirection * 0.2, 3.05, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.08, 0.5, 3.4]} />
          <meshStandardMaterial color="#0066cc" />
        </mesh>
        <Text
          position={[faceDirection * 0.05, 0, 0]}
          rotation={[0, rotationY, 0]}
          fontSize={0.17}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={3}
        >
          {label}
        </Text>
      </group>

      {SHELF_HEIGHTS.flatMap((shelfY, shelfIndex) =>
        Array.from({ length: SLOTS_PER_SHELF }, (_, slot) => {
          const product =
            products[(shelfIndex * SLOTS_PER_SHELF + slot) % products.length]
          const z =
            -AISLE_LENGTH / 2 +
            0.9 +
            slot * ((AISLE_LENGTH - 1.8) / (SLOTS_PER_SHELF - 1))
          const instanceId = `${faceId}-s${shelfIndex}-p${slot}`

          return (
            <ProductMesh
              key={instanceId}
              instanceId={instanceId}
              product={product}
              position={[faceX, shelfY + 0.2, z]}
              rotationY={rotationY}
              isAimed={aimedInstanceId === instanceId}
              onSelect={onSelectProduct}
            />
          )
        })
      )}
    </group>
  )
}

interface EndCapProductsProps {
  department: DepartmentId
  z: number
  capId: string
  aimedInstanceId: string | null
  onSelectProduct: (product: Product) => void
}

/**
 * End-cap product display facing the walkway.
 * @param props - Department, Z, unique cap id, and handlers
 */
const EndCapProducts = ({
  department,
  z,
  capId,
  aimedInstanceId,
  onSelectProduct,
}: EndCapProductsProps) => {
  const products = getProductsByDepartment(department)

  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.9, 2.4, 0.35]} />
        <meshStandardMaterial color="#0055a5" />
      </mesh>
      <Text
        position={[0, 2.2, 0.2]}
        fontSize={0.11}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        RealStore
      </Text>
      {[0.5, 1.1, 1.7].flatMap((y, row) =>
        [-0.25, 0, 0.25].map((x, col) => {
          const product = products[(row * 3 + col) % products.length]
          const instanceId = `${capId}-r${row}-c${col}`
          return (
            <ProductMesh
              key={instanceId}
              instanceId={instanceId}
              product={product}
              position={[x, y, 0.22]}
              rotationY={0}
              isAimed={aimedInstanceId === instanceId}
              onSelect={onSelectProduct}
            />
          )
        })
      )}
    </group>
  )
}
