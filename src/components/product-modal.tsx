'use client'

import { useEffect } from 'react'
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

  /**
   * Adds the product, closes the card, and restores free-look.
   */
  const handleAdd = () => {
    if (!product) return
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

  useEffect(() => {
    if (!product) return
    /**
     * Confirms add with E while the product card is open.
     * @param event - Keyboard event
     */
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'KeyE' || event.code === 'Enter') {
        event.preventDefault()
        handleAdd()
      }
      if (event.code === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bind to current product only
  }, [product])

  if (!product) return null

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
          <kbd className="ml-0.5 rounded bg-white/20 px-1.5 py-0.5 text-[10px]">E</kbd>
        </button>
      </div>
    </div>
  )
}
