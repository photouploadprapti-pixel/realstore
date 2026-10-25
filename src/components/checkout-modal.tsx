'use client'

import { useState, type FormEvent } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { useCartStore } from '@/store/use-cart-store'
import { formatMoney } from '@/lib/utils'

/**
 * Dummy checkout dialog that completes an order from the cart.
 */
export const CheckoutModal = () => {
  const isOpen = useCartStore((state) => state.isCheckoutOpen)
  const closeCheckout = useCartStore((state) => state.closeCheckout)
  const clearCart = useCartStore((state) => state.clearCart)
  const items = useCartStore((state) => state.items)
  const subtotal = useCartStore((state) => state.subtotal())
  const [done, setDone] = useState(false)
  const [name, setName] = useState('')

  if (!isOpen) return null

  /**
   * Submits the prototype checkout form.
   * @param event - Form submit event
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setDone(true)
    clearCart()
  }

  /**
   * Closes checkout and resets success state.
   */
  const handleClose = () => {
    setDone(false)
    setName('')
    closeCheckout()
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-[60] flex items-center justify-center bg-black/45 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 rounded-full p-2 text-slate-400 hover:bg-slate-100"
          aria-label="Close checkout"
        >
          <X className="h-5 w-5" />
        </button>

        {done ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle2 className="mb-3 h-14 w-14 text-emerald-500" />
            <h2 className="text-xl font-bold text-slate-900">Order placed!</h2>
            <p className="mt-2 max-w-sm text-sm text-slate-600">
              Thanks{name ? `, ${name}` : ''}. This is a prototype checkout —
              no payment was processed.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-6 rounded-full bg-[#0066cc] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0055a5]"
            >
              Keep shopping
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-900">Checkout</h2>
            <p className="mt-1 text-sm text-slate-500">
              {items.length} line item{items.length === 1 ? '' : 's'} ·{' '}
              {formatMoney(subtotal)}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Full name</span>
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-[#0066cc]/30 focus:ring-2"
                  placeholder="Alex Shopper"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Email</span>
                <input
                  required
                  type="email"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-[#0066cc]/30 focus:ring-2"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Delivery address
                </span>
                <input
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-[#0066cc]/30 focus:ring-2"
                  placeholder="123 Market Street"
                />
              </label>

              <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Card ending in <strong>4242</strong> · Demo payment only
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-[#0066cc] py-3 text-sm font-semibold text-white hover:bg-[#0055a5]"
              >
                Place order · {formatMoney(subtotal)}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
