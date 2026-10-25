'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { Product } from '@/types/product'

interface ProductMeshProps {
  product: Product
  /** Unique id for this shelf slot (not the catalog product id). */
  instanceId: string
  position: [number, number, number]
  rotationY?: number
  onSelect: (product: Product) => void
  /** Whether THIS instance is aimed by the crosshair. */
  isAimed: boolean
}

/**
 * Lightweight textured box representing one shelf product instance.
 * @param props - Product data, unique instance id, placement, and handlers
 */
export const ProductMesh = ({
  product,
  instanceId,
  position,
  rotationY = 0,
  onSelect,
  isAimed,
}: ProductMeshProps) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const targetScale = useRef(1)

  const labelTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.fillStyle = product.color
    ctx.fillRect(0, 0, 256, 256)
    ctx.fillStyle = product.accent
    ctx.fillRect(16, 16, 224, 224)
    ctx.fillStyle = product.color
    ctx.fillRect(28, 28, 200, 80)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'center'
    wrapText(ctx, product.name, 128, 60, 180, 24)

    ctx.fillStyle = '#111111'
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText(`$${product.price.toFixed(2)}`, 128, 160)

    ctx.fillStyle = product.color
    ctx.font = '14px sans-serif'
    ctx.fillText('RealStore', 128, 210)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    return texture
  }, [product])

  useFrame(() => {
    if (!meshRef.current) return
    targetScale.current = isAimed ? 1.12 : 1
    const s = meshRef.current.scale.x
    const next = THREE.MathUtils.lerp(s, targetScale.current, 0.2)
    meshRef.current.scale.setScalar(next)
  })

  /**
   * Selects this product instance.
   * @param event - R3F pointer event
   */
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    onSelect(product)
  }

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh
        ref={meshRef}
        castShadow
        userData={{
          type: 'product',
          productId: product.id,
          instanceId,
        }}
        onClick={handleClick}
        onPointerOver={(event) => {
          event.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <boxGeometry args={[0.26, 0.34, 0.16]} />
        <meshStandardMaterial
          color={labelTexture ? '#ffffff' : product.color}
          map={labelTexture ?? undefined}
          roughness={0.48}
          metalness={0.04}
          emissive={isAimed ? '#0066cc' : '#000000'}
          emissiveIntensity={isAimed ? 0.22 : 0}
        />
      </mesh>
      {isAimed && (
        <mesh position={[0, 0.34, 0.02]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial
            color="#0066cc"
            emissive="#0066cc"
            emissiveIntensity={0.7}
          />
        </mesh>
      )}
    </group>
  )
}

/**
 * Draws wrapped text centered on a canvas context.
 * @param ctx - 2D canvas context
 * @param text - String to draw
 * @param x - Center X
 * @param y - Baseline Y
 * @param maxWidth - Wrap width
 * @param lineHeight - Line spacing
 */
const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) => {
  const words = text.split(' ')
  let line = ''
  let offsetY = y

  for (const word of words) {
    const test = `${line}${word} `
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, offsetY)
      line = `${word} `
      offsetY += lineHeight
    } else {
      line = test
    }
  }
  ctx.fillText(line.trim(), x, offsetY)
}
