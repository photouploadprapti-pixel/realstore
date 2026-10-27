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
      <div className="flex h-full w-full items-center justify-center bg-[#eaf0f5] text-[#004e9f]">
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
 * Client shell with byomid-style supermarket UX overlays.
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
  const itemCount = useCartStore((state) => state.itemCount())

  const uiBlocking =
    Boolean(selectedProduct) || isCartOpen || isCheckoutOpen || mapOpen || searchOpen

  /**
   * Starts shopping and locks the pointer for mouse look.
   */
  const enterStore = () => {
    setHasEntered(true)
    window.setTimeout(() => {
      document.querySelector('canvas')?.requestPointerLock()
    }, 100)
  }

  /**
   * Re-locks the pointer for free look.
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
    <div className="relative h-dvh w-full overflow-hidden bg-[#eaf0f5]">
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
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 select-none text-3xl font-light leading-none text-white drop-shadow-[0_0_6px_rgba(0,78,159,0.95)]">
            +
          </div>
        )}

        {hasEntered && !uiBlocking && aimedProduct && (
          <div className="absolute left-1/2 top-[55%] z-10 flex -translate-x-1/2 flex-col items-center gap-2">
            <div className="rounded-lg bg-[#004e9f] px-3 py-1.5 text-xs font-semibold text-white shadow">
              {aimedProduct.name}
            </div>
            <div className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#004e9f] shadow">
              Add to cart <kbd className="rounded bg-[#004e9f]/10 px-1">E</kbd>
            </div>
          </div>
        )}

        {!hasEntered && (
          <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-[#183149]/45 pt-16">
            <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-[0_12px_42px_#0c244321]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#004e9f]">
                RealStore · 3D shopping
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-outfit)] text-3xl font-bold text-[#183149] sm:text-4xl">
                Welcome to
                <br />
                RealStore
              </h1>
              <p className="mt-3 text-sm text-[#64758a]">
                Walk the aisles, pick products from the shelves, and finish at
                checkout — same control pattern as{' '}
                <a
                  href="https://byomid.com/supermarket/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[#004e9f] underline-offset-2 hover:underline"
                >
                  byomid.com/supermarket
                </a>
                .
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 text-left text-xs text-[#64758a]">
                <p className="rounded-xl bg-[#f2f6fb] px-3 py-2">
                  <span className="font-semibold text-[#183149]">Walk</span>
                  <br />
                  W / ↑ · S / ↓
                </p>
                <p className="rounded-xl bg-[#f2f6fb] px-3 py-2">
                  <span className="font-semibold text-[#183149]">Strafe</span>
                  <br />
                  A · D
                </p>
                <p className="rounded-xl bg-[#f2f6fb] px-3 py-2">
                  <span className="font-semibold text-[#183149]">Turn</span>
                  <br />
                  ← · →
                </p>
                <p className="rounded-xl bg-[#f2f6fb] px-3 py-2">
                  <span className="font-semibold text-[#183149]">Look / Add</span>
                  <br />
                  Mouse · E
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={enterStore}
                  className="rounded-lg bg-[#004e9f] px-8 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#003b79]"
                >
                  Start shopping
                </button>
                <button
                  type="button"
                  onClick={() => {
                    enterStore()
                    window.setTimeout(() => openPanel(() => setMapOpen(true)), 250)
                  }}
                  className="rounded-lg border border-[#e3e9ef] bg-white px-8 py-3 text-sm font-semibold text-[#183149] hover:bg-[#f2f6fb]"
                >
                  View store
                </button>
              </div>
              <p className="mt-4 text-[11px] text-[#64758a]">
                Unofficial demo · no real payments
              </p>
            </div>
          </div>
        )}

        {hasEntered && !uiBlocking && (
          <div className="pointer-events-none absolute bottom-[7.5rem] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2">
            <div className="rounded-full bg-[#183149]/70 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
              ↑↓←→ move · mouse look · E add
            </div>
            {!locked && (
              <button
                type="button"
                onClick={enableFreeLook}
                className="pointer-events-auto rounded-lg bg-[#004e9f] px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-[#003b79]"
              >
                Click for free look
              </button>
            )}
            {itemCount > 0 && (
              <button
                type="button"
                onClick={openCart}
                className="pointer-events-auto rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#004e9f] shadow ring-1 ring-[#e3e9ef]"
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
