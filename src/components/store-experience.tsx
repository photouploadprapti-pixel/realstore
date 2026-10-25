'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { StoreHeader } from '@/components/store-header'
import { ProductModal } from '@/components/product-modal'
import { CartDrawer } from '@/components/cart-drawer'
import { CheckoutModal } from '@/components/checkout-modal'
import { StoreToast } from '@/components/store-toast'
import { useCartStore } from '@/store/use-cart-store'

const StoreCanvas = dynamic(
  () =>
    import('@/components/store-canvas').then((mod) => ({
      default: mod.StoreCanvas,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-600">
        Loading 3D store…
      </div>
    ),
  }
)

/**
 * Client shell combining the 3D canvas with HTML UI overlays.
 */
export const StoreExperience = () => {
  const [locked, setLocked] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)
  const selectedProduct = useCartStore((state) => state.selectedProduct)
  const isCartOpen = useCartStore((state) => state.isCartOpen)
  const isCheckoutOpen = useCartStore((state) => state.isCheckoutOpen)

  const uiBlocking = Boolean(selectedProduct) || isCartOpen || isCheckoutOpen

  /**
   * Starts shopping and requests free-look.
   */
  const enterStore = () => {
    setHasEntered(true)
    window.setTimeout(() => {
      document.querySelector('canvas')?.requestPointerLock()
    }, 50)
  }

  /**
   * Requests pointer lock for mouse look.
   */
  const enableFreeLook = () => {
    document.querySelector('canvas')?.requestPointerLock()
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-200">
      <StoreCanvas
        controlsEnabled={hasEntered}
        movementEnabled={hasEntered && !isCartOpen && !isCheckoutOpen}
        onLockChange={setLocked}
      />

      <div className="pointer-events-none absolute inset-0 z-20">
        <StoreHeader />
        <StoreToast />
        <ProductModal />
        <CartDrawer />
        <CheckoutModal />

        {hasEntered && !uiBlocking && (
          <div className="absolute left-1/2 top-1/2 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_2px_rgba(0,102,204,0.85)]" />
        )}

        {!hasEntered && (
          <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-slate-900/40 pt-14">
            <div className="mx-4 max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0066cc]">
                RealStore Virtual
              </p>
              <h1 className="mt-2 font-[family-name:var(--font-outfit)] text-2xl font-bold text-slate-900">
                Walk the aisles
              </h1>
              <div className="mt-4 space-y-2 text-left text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-800">Walk:</span>{' '}
                  <kbd className="rounded bg-slate-100 px-1.5 py-0.5">↑</kbd>{' '}
                  <kbd className="rounded bg-slate-100 px-1.5 py-0.5">↓</kbd>
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Turn:</span>{' '}
                  <kbd className="rounded bg-slate-100 px-1.5 py-0.5">←</kbd>{' '}
                  <kbd className="rounded bg-slate-100 px-1.5 py-0.5">→</kbd>
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Look:</span> mouse
                  (free look) or right-drag
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Shop:</span> aim +
                  click → Add to cart
                </p>
              </div>
              <button
                type="button"
                onClick={enterStore}
                className="mt-5 rounded-full bg-[#0066cc] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0055a5]"
              >
                Start shopping
              </button>
            </div>
          </div>
        )}

        {hasEntered && !uiBlocking && (
          <div className="pointer-events-none absolute bottom-16 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2">
            <div className="rounded-full bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
              ↑↓ walk · ←→ turn · mouse look · click to select
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
          </div>
        )}
      </div>
    </div>
  )
}
