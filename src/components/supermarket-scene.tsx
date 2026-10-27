'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Gondola } from '@/components/aisle-shelves'
import { PlayerControls } from '@/components/player-controls'
import { ShoppingCartModel } from '@/components/shopping-cart-model'
import { getProductById, getProductsByDepartment } from '@/lib/products'
import { useCartStore } from '@/store/use-cart-store'
import { ProductMesh } from '@/components/product-mesh'
import type { Product } from '@/types/product'

interface SupermarketSceneProps {
  controlsEnabled: boolean
  movementEnabled: boolean
  onLockChange: (locked: boolean) => void
}

/**
 * Full 3D supermarket environment with aisles, lighting, and product raycasting.
 * @param props - Control flags and pointer-lock callback
 */
export const SupermarketScene = ({
  controlsEnabled,
  movementEnabled,
  onLockChange,
}: SupermarketSceneProps) => {
  const { camera, scene, gl } = useThree()
  const setSelectedProduct = useCartStore((state) => state.setSelectedProduct)
  const setAimedProduct = useCartStore((state) => state.setAimedProduct)
  const addItem = useCartStore((state) => state.addItem)
  const selectedProduct = useCartStore((state) => state.selectedProduct)
  const aimedProduct = useCartStore((state) => state.aimedProduct)
  const [aimedInstanceId, setAimedInstanceId] = useState<string | null>(null)
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const center = useMemo(() => new THREE.Vector2(0, 0), [])
  const aimCooldown = useRef(0)
  const eulerRef = useRef<THREE.Euler | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const w = window as unknown as {
      __rsScene?: THREE.Scene
      __rsCountProducts?: () => { products: number; unique: number }
      __rsTeleport?: (x: number, z: number, yaw: number) => void
      __rsEuler?: THREE.Euler
    }
    w.__rsScene = scene
    w.__rsCountProducts = () => {
      const ids: string[] = []
      scene.traverse((obj) => {
        if (obj.userData?.type === 'product' && obj.userData.instanceId) {
          ids.push(obj.userData.instanceId as string)
        }
      })
      return { products: ids.length, unique: new Set(ids).size }
    }
    w.__rsTeleport = (x, z, yaw) => {
      camera.position.set(x, 1.65, z)
      const euler = w.__rsEuler
      if (euler) {
        euler.set(0, yaw, 0)
        camera.quaternion.setFromEuler(euler)
      }
      eulerRef.current = euler ?? null
    }
  }, [camera, scene])

  useEffect(() => {
    /**
     * E / Space adds the aimed product (demo-style quick add).
     * @param event - Keyboard event
     */
    const onKeyDown = (event: KeyboardEvent) => {
      if (!controlsEnabled || selectedProduct) return
      if (event.code !== 'KeyE' && event.code !== 'Space') return
      if (!aimedProduct) return
      event.preventDefault()
      addItem(aimedProduct)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [addItem, aimedProduct, controlsEnabled, selectedProduct])

  /**
   * Selects a catalog product from the 3D scene.
   * @param product - Selected product
   */
  const handleSelectProduct = useCallback(
    (product: Product) => {
      setSelectedProduct(product)
    },
    [setSelectedProduct]
  )

  useEffect(() => {
    /**
     * Selects the aimed product only when the click hits the WebGL canvas.
     * @param event - Mouse click
     */
    const onClick = (event: MouseEvent) => {
      if (!controlsEnabled) return
      if (event.target !== gl.domElement) return
      // While product card is open, ignore canvas picks so Add to cart is safe
      if (selectedProduct) return

      raycaster.setFromCamera(center, camera)
      const hits = raycaster.intersectObjects(scene.children, true)
      const hit = hits.find((item) => item.object.userData?.type === 'product')
      if (!hit) return
      const productId = hit.object.userData.productId as string | undefined
      const product = productId ? getProductById(productId) : undefined
      if (product) handleSelectProduct(product)
    }

    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [
    camera,
    center,
    controlsEnabled,
    gl.domElement,
    handleSelectProduct,
    raycaster,
    scene,
    selectedProduct,
  ])

  useFrame((_, delta) => {
    if (!controlsEnabled || selectedProduct) {
      if (aimedInstanceId) setAimedInstanceId(null)
      if (useCartStore.getState().aimedProduct) setAimedProduct(null)
      return
    }

    aimCooldown.current -= delta
    if (aimCooldown.current > 0) return
    aimCooldown.current = 0.05

    raycaster.setFromCamera(center, camera)
    const hits = raycaster.intersectObjects(scene.children, true)
    const hit = hits.find((item) => item.object.userData?.type === 'product')
    const nextId =
      (hit?.object.userData.instanceId as string | undefined) ?? null
    setAimedInstanceId((prev) => (prev === nextId ? prev : nextId))

    const productId = hit?.object.userData.productId as string | undefined
    const product = productId ? getProductById(productId) ?? null : null
    const currentAimed = useCartStore.getState().aimedProduct
    if ((product?.id ?? null) !== (currentAimed?.id ?? null)) {
      setAimedProduct(product)
    }
  })

  return (
    <>
      <color attach="background" args={['#cfd9e6']} />
      <fog attach="fog" args={['#cfd9e6', 22, 48]} />

      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#f5f8fc', '#9aa8b8', 0.55]} />
      <directionalLight
        castShadow
        position={[8, 14, 6]}
        intensity={1.35}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={40}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-6, 10, -4]} intensity={0.35} color="#dfe9f5" />
      <pointLight position={[0, 3.6, -2]} intensity={0.55} distance={18} />
      <pointLight position={[-5, 3.4, 2]} intensity={0.35} distance={12} color="#e8f1ff" />
      <pointLight position={[5, 3.4, 2]} intensity={0.35} distance={12} color="#e8f1ff" />

      <StoreArchitecture />

      <Gondola
        gondolaId="left"
        leftDepartment="dairy"
        rightDepartment="everyday"
        position={[-5, 0, -2.5]}
        aimedInstanceId={aimedInstanceId}
        onSelectProduct={handleSelectProduct}
      />
      <Gondola
        gondolaId="right"
        leftDepartment="snacks"
        rightDepartment="home"
        position={[5, 0, -2.5]}
        aimedInstanceId={aimedInstanceId}
        onSelectProduct={handleSelectProduct}
      />

      <PromoBin
        binId="bin-back"
        position={[0, 0, -7]}
        department="snacks"
        color="#c41e3a"
        aimedInstanceId={aimedInstanceId}
        onSelectProduct={handleSelectProduct}
      />
      <PromoBin
        binId="bin-front"
        position={[0, 0, 1]}
        department="everyday"
        color="#0066cc"
        aimedInstanceId={aimedInstanceId}
        onSelectProduct={handleSelectProduct}
      />

      <ShoppingCartModel />

      <PlayerControls
        enabled={controlsEnabled}
        movementEnabled={movementEnabled}
        onLock={() => onLockChange(true)}
        onUnlock={() => onLockChange(false)}
      />
    </>
  )
}

/**
 * Floor, ceiling, walls, and structural pillars.
 */
const StoreArchitecture = () => {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 34]} />
        <meshStandardMaterial color="#e8edf3" roughness={0.42} metalness={0.08} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -1]} receiveShadow>
        <planeGeometry args={[3.2, 22]} />
        <meshStandardMaterial color="#f4f7fb" roughness={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.4, 0]}>
        <planeGeometry args={[30, 34]} />
        <meshStandardMaterial color="#eef3f8" roughness={0.9} />
      </mesh>
      {[-12, -6, 0, 6, 12].map((z) => (
        <mesh key={z} position={[0, 4.25, z]}>
          <boxGeometry args={[28, 0.14, 0.4]} />
          <meshStandardMaterial color="#c5d0dc" />
        </mesh>
      ))}
      {[-9, -4, 1, 6].map((z) => (
        <mesh key={`light-${z}`} position={[0, 4.32, z]}>
          <boxGeometry args={[16, 0.06, 0.55]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1.1}
          />
        </mesh>
      ))}
      <mesh position={[0, 2.2, -15.5]} receiveShadow>
        <boxGeometry args={[30, 4.4, 0.35]} />
        <meshStandardMaterial color="#edf2f7" />
      </mesh>
      <mesh position={[-14.5, 2.2, -1]}>
        <boxGeometry args={[0.35, 4.4, 30]} />
        <meshStandardMaterial color="#e4ebf3" />
      </mesh>
      <mesh position={[14.5, 2.2, -1]}>
        <boxGeometry args={[0.35, 4.4, 30]} />
        <meshStandardMaterial color="#e4ebf3" />
      </mesh>
      {[
        [-11, -13],
        [11, -13],
        [-11, 7],
        [11, 7],
        [-8, -13],
        [8, -13],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 2.2, z]} castShadow>
          <boxGeometry args={[0.6, 4.4, 0.6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.55} />
        </mesh>
      ))}
      <CheckoutCounter position={[-5, 0, 9]} />
      <CheckoutCounter position={[0, 0, 9]} />
      <CheckoutCounter position={[5, 0, 9]} />
    </group>
  )
}

interface CheckoutCounterProps {
  position: [number, number, number]
}

/**
 * Checkout counter near the entrance.
 * @param props - World position
 */
const CheckoutCounter = ({ position }: CheckoutCounterProps) => {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.9, 1.1]} />
        <meshStandardMaterial color="#0066cc" />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[2.3, 0.08, 1.2]} />
        <meshStandardMaterial color="#f5f7fa" />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[2.0, 0.35, 0.9]} />
        <meshStandardMaterial color="#c41e3a" />
      </mesh>
    </group>
  )
}

interface PromoBinProps {
  binId: string
  position: [number, number, number]
  department: 'everyday' | 'snacks' | 'dairy' | 'home'
  color: string
  aimedInstanceId: string | null
  onSelectProduct: (product: Product) => void
}

/**
 * Low promotional bin filled with products.
 * @param props - Bin id, position, stock, and handlers
 */
const PromoBin = ({
  binId,
  position,
  department,
  color,
  aimedInstanceId,
  onSelectProduct,
}: PromoBinProps) => {
  const products = getProductsByDepartment(department)

  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.7, 1.1]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.72, 0]} receiveShadow>
        <boxGeometry args={[1.5, 0.05, 1.0]} />
        <meshStandardMaterial color="#f4f7fb" />
      </mesh>
      {[-0.35, 0, 0.35].flatMap((x, xi) =>
        [-0.25, 0.25].map((z, zi) => {
          const product = products[(xi * 2 + zi) % products.length]
          const instanceId = `${binId}-${xi}-${zi}`
          return (
            <ProductMesh
              key={instanceId}
              instanceId={instanceId}
              product={product}
              position={[x, 0.95, z]}
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
