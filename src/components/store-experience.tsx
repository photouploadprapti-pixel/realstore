'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { StoreHeader } from '@/components/store-header'
import { ProductModal } from '@/components/product-modal'
import { CartDrawer } from '@/components/cart-drawer'
import { CheckoutModal } from '@/components/checkout-modal'
import { StoreToast } from '@/components/store-toast'
import { CartHud } from '@/components/cart-hud'
import { StoreMap } from '@/components/store-map'
import { StoreTools } from '@/components/store-tools'
import { useCartStore } from '@/store/use-cart-store'
import type { DepartmentId, Product } from '@/types/product'

const StoreCanvas = dynamic(
  () =>
    import('@/components/store-canvas').then((mod) => ({
      default: mod.StoreCanvas,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-600">
        Preparing store…
      </div>
    ),
  }
)

/** World teleport spots for each department. */
const TELEPORTS: Record<DepartmentId, { x: number; z: number; yaw: number }> = {
  everyday: { x: -3.2, z: -2, yaw: Math.PI / 2 },
  dairy: { x: -3.2, z: 1, yaw: Math.PI / 2 },
  snacks: { x: 3.2, z: -2, yaw: -Math.PI / 2 },
  home: { x: 3.2, z: 1, yaw: -Math.PI / 2 },
}

/**
 * Client shell combining the 3D canvas with demo-style UI overlays.
 */
export const StoreExperience = () => {
  const [locked, setLocked] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(false)

  const selectedProduct = useCartStore((state) => state.selectedProduct)
  const aimedProduct = useCartStore((state) => state.aimedProduct)
  const isCartOpen = useCartStore((state) => state.isCartOpen)
  const isCheckoutOpen = useCartStore((state) => state.isCheckoutOpen)
  const setSelectedProduct = useCartStore((state) => state.setSelectedProduct)
  const openCart = useCartStore((state) => state.openCart)

  const uiBlocking =
    Boolean(selectedProduct) || isCartOpen || isCheckoutOpen || mapOpen || searchOpen

  /**
   * Starts shopping and requests free-look.
   */
  const enterStore = () => {
    setHasEntered(true)
    window.setTimeout(() => {
      document.querySelector('canvas')?.requestPointerLock()
    }, 80)
  }

  /**
   * Requests pointer lock for mouse look.
   */
  const enableFreeLook = () => {
    document.querySelector('canvas')?.requestPointerLock()
  }

  /**
   * Opens a UI panel and releases the pointer.
   * @param open - Panel opener
   */
  const openPanel = (open: () => void) => {
    document.exitPointerLock()
    open()
  }

  /**
   * Teleports the shopper to a department aisle.
   * @param department - Target department
   */
  const handleTeleport = (department: DepartmentId) => {
    const spot = TELEPORTS[department]
    const teleport = (
      window as unknown as {
        __rsTeleport?: (x: number, z: number, yaw: number) => void
      }
    ).__rsTeleport
    teleport?.(spot.x, spot.z, spot.yaw)
    window.setTimeout(() => enableFreeLook(), 100)
  }

  /**
   * Opens a product from search results.
   * @param product - Catalog product
   */
  const handleSearchSelect = (product: Product) => {
    setSelectedProduct(product)
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-200">
      <StoreCanvas
        controlsEnabled={hasEntered}
        movementEnabled={hasEntered && !isCartOpen && !isCheckoutOpen && !mapOpen && !searchOpen}
        onLockChange={setLocked}
      />

      <div className="pointer-events-none absolute inset-0 z-20">
        <StoreHeader />
        <StoreToast />
        <ProductModal />
        <CartDrawer />
        <CheckoutModal />

        {hasEntered && (
          <>
            <CartHud />
            <StoreTools
              isSearchOpen={searchOpen}
              isSoundOn={soundOn}
              onToggleSound={() => setSoundOn((value) => !value)}
              onOpenMap={() => openPanel(() => setMapOpen(true))}
              onOpenSearch={() => openPanel(() => setSearchOpen(true))}
              onCloseSearch={() => {
                setSearchOpen(false)
                window.setTimeout(enableFreeLook, 80)
              }}
              onSelectProduct={handleSearchSelect}
            />
            <StoreMap
              open={mapOpen}
              onClose={() => {
                setMapOpen(false)
                window.setTimeout(enableFreeLook, 80)
              }}
              onTeleport={handleTeleport}
            />
          </>
        )}

        {hasEntered && !uiBlocking && (
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-2xl font-light leading-none text-white drop-shadow-[0_0_4px_rgba(0,102,204,0.9)]">
            +
          </div>
        )}

        {hasEntered && !uiBlocking && aimedProduct && (
          <div className="absolute left-1/2 top-[54%] z-10 -translate-x-1/2 rounded-full bg-[#0066cc] px-3 py-1 text-xs font-semibold text-white shadow">
            {aimedProduct.name} · press E to add
          </div>
        )}

        {!hasEntered && (
          <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-900/50 to-slate-900/70 pt-14">
            <div className="mx-4 max-w-lg rounded-3xl bg-white p-8 text-center shadow-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0066cc]">
                RealStore
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-outfit)] text-3xl font-bold text-slate-900 sm:text-4xl">
                Welcome to the
                <br />
                3D supermarket
              </h1>
              <p className="mt-3 text-sm text-slate-600">
                Walk the aisles, pick products from the shelves, and checkout —
                inspired by immersive store demos like{' '}
                <a
                  href="https://byomid.com/supermarket/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[#0066cc] underline-offset-2 hover:underline"
                >
                  byomid.com/supermarket
                </a>
                .
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 text-left text-xs text-slate-600 sm:text-sm">
                <p className="rounded-xl bg-slate-50 px-3 py-2">
                  <span className="font-semibold text-slate-800">Move</span>
                  <br />
                  ↑ ↓ ← → or WASD
                </p>
                <p className="rounded-xl bg-slate-50 px-3 py-2">
                  <span className="font-semibold text-slate-800">Look</span>
                  <br />
                  Mouse (free look)
                </p>
                <p className="rounded-xl bg-slate-50 px-3 py-2">
                  <span className="font-semibold text-slate-800">Add</span>
                  <br />
                  Click product or press E
                </p>
                <p className="rounded-xl bg-slate-50 px-3 py-2">
                  <span className="font-semibold text-slate-800">Tools</span>
                  <br />
                  Search · Map · Cart
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={enterStore}
                  className="rounded-full bg-[#0066cc] px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0055a5]"
                >
                  Start shopping
                </button>
                <button
                  type="button"
                  onClick={() => {
                    enterStore()
                    window.setTimeout(() => openPanel(() => setMapOpen(true)), 200)
                  }}
                  className="rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View store map
                </button>
              </div>
              <p className="mt-4 text-[11px] text-slate-400">
                Demo prototype · no real payments
              </p>
            </div>
          </div>
        )}

        {hasEntered && !uiBlocking && (
          <div className="pointer-events-none absolute bottom-[7.5rem] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2">
            <div className="rounded-full bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
              ↑↓←→ move · mouse look · E add · Esc release mouse
            </div>
            {!locked && (
              <button
                type="button"
                onClick={enableFreeLook}
                className="pointer-events-auto rounded-full bg-[#0066cc] px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-[#0055a5]"
              >
                Enable free look
              </button>
            )}
            {aimedProduct && (
              <button
                type="button"
                onClick={openCart}
                className="pointer-events-auto rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-[#0066cc] shadow ring-1 ring-slate-200"
              >
                Continue to checkout
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
