'use client'

import { Plus, X } from 'lucide-react'
import { useCartStore } from '@/store/use-cart-store'
import { formatMoney } from '@/lib/utils'

/**
 * Bottom product card shown when a shelf item is selected.
 */
export const ProductModal = () => {
  const product = useCartStore((state) => state.selectedProduct)
  const setSelectedProduct = useCartStore((state) => state.setSelectedProduct)
  const addItem = useCartStore((state) => state.addItem)

  if (!product) return null

  /**
   * Adds the product, closes the card, and restores free-look.
   */
  const handleAdd = () => {
    addItem(product)
    setSelectedProduct(null)
    window.setTimeout(() => {
      document.querySelector('canvas')?.requestPointerLock()
    }, 80)
  }

  /**
   * Closes the card and restores free-look for continued walking.
   */
  const handleClose = () => {
    setSelectedProduct(null)
    window.setTimeout(() => {
      document.querySelector('canvas')?.requestPointerLock()
    }, 80)
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-28 z-40 flex justify-center px-4">
      <div className="pointer-events-auto relative flex w-full max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-2 top-2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close product card"
        >
          <X className="h-4 w-4" />
        </button>

        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-inner"
          style={{ backgroundColor: product.color }}
        >
          <span className="px-1 text-center leading-tight">
            {product.name.split(' ')[0]}
          </span>
        </div>

        <div className="min-w-0 flex-1 pr-6">
          <p className="truncate text-sm font-semibold text-slate-900">
            {product.name}
          </p>
          <p className="truncate text-xs text-slate-500">{product.description}</p>
          <p className="mt-0.5 text-sm font-bold text-[#0066cc]">
            {formatMoney(product.price)}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#0066cc] px-3 py-2 text-sm font-semibold text-white shadow hover:bg-[#0055a5]"
        >
          Add to cart
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
