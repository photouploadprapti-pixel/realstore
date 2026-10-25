'use client'

import { Minus, Plus, Trash2, X } from 'lucide-react'
import { useCartStore } from '@/store/use-cart-store'
import { cn, formatMoney } from '@/lib/utils'

/**
 * Sliding cart sidebar with quantity controls and checkout CTA.
 */
export const CartDrawer = () => {
  const isOpen = useCartStore((state) => state.isCartOpen)
  const items = useCartStore((state) => state.items)
  const closeCartStore = useCartStore((state) => state.closeCart)

  /**
   * Closes the cart drawer and restores free-look for walking.
   */
  const closeCart = () => {
    closeCartStore()
    window.setTimeout(() => {
      document.querySelector('canvas')?.requestPointerLock()
    }, 80)
  }
  const setQuantity = useCartStore((state) => state.setQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const openCheckout = useCartStore((state) => state.openCheckout)
  const subtotal = useCartStore((state) => state.subtotal())

  return (
    <>
      <div
        className={cn(
          'pointer-events-auto absolute inset-0 z-40 bg-black/35 transition-opacity',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />

      <aside
        className={cn(
          'pointer-events-auto absolute right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">Shopping cart</h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              Your cart is empty. Walk the aisles and click products to add them.
            </p>
          ) : (
            <ul className="space-y-4">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex gap-3 rounded-xl border border-slate-100 p-3"
                >
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                    style={{ backgroundColor: product.color }}
                  >
                    {product.name.slice(0, 8)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatMoney(product.price)} each
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        aria-label={`Remove ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-slate-200">
                        <button
                          type="button"
                          className="p-1.5 text-slate-600 hover:bg-slate-50"
                          onClick={() => setQuantity(product.id, quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-semibold">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          className="p-1.5 text-slate-600 hover:bg-slate-50"
                          onClick={() => setQuantity(product.id, quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-[#0066cc]">
                        {formatMoney(product.price * quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="text-lg font-bold text-slate-900">
              {formatMoney(subtotal)}
            </span>
          </div>
          <button
            type="button"
            disabled={items.length === 0}
            onClick={openCheckout}
            className="w-full rounded-full bg-[#0066cc] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0055a5] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Proceed to checkout
          </button>
        </div>
      </aside>
    </>
  )
}
