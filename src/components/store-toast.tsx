'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/store/use-cart-store'

/**
 * Brief confirmation toast when items are added to the cart.
 */
export const StoreToast = () => {
  const toastMessage = useCartStore((state) => state.toastMessage)
  const clearToast = useCartStore((state) => state.clearToast)

  useEffect(() => {
    if (!toastMessage) return
    const timer = window.setTimeout(() => clearToast(), 2200)
    return () => window.clearTimeout(timer)
  }, [toastMessage, clearToast])

  if (!toastMessage) return null

  return (
    <div className="pointer-events-none absolute left-1/2 top-20 z-40 -translate-x-1/2">
      <div className="rounded-xl bg-[#0066cc] px-4 py-2 text-sm font-medium text-white shadow-lg">
        {toastMessage}
      </div>
    </div>
  )
}
