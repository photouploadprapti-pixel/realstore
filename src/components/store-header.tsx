'use client'

import { Search, ShoppingCart, User } from 'lucide-react'
import { useCartStore } from '@/store/use-cart-store'
import { cn, formatMoney } from '@/lib/utils'

/**
 * Persistent e-commerce header overlay above the 3D canvas.
 */
export const StoreHeader = () => {
  const openCart = useCartStore((state) => state.openCart)
  const itemCount = useCartStore((state) => state.itemCount())
  const subtotal = useCartStore((state) => state.subtotal())

  return (
    <header className="pointer-events-auto absolute inset-x-0 top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0066cc] text-sm font-bold text-white">
              R
            </span>
            <span className="text-lg font-bold tracking-tight text-[#0066cc]">
              RealStore
            </span>
          </div>
          <nav className="ml-4 hidden items-center gap-4 text-sm text-slate-600 md:flex">
            <span className="cursor-default hover:text-[#0066cc]">Aisles</span>
            <span className="cursor-default hover:text-[#0066cc]">Deals</span>
            <span className="cursor-default hover:text-[#0066cc]">Fresh</span>
          </nav>
        </div>

        <div className="hidden max-w-md flex-1 items-center sm:flex">
          <label className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search products..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none ring-[#0066cc]/30 focus:ring-2"
              readOnly
            />
          </label>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 sm:inline-flex"
            aria-label="Sign in"
          >
            <User className="h-4 w-4" />
            Sign in
          </button>

          <button
            type="button"
            onClick={openCart}
            className={cn(
              'inline-flex items-center gap-2 rounded-full bg-[#0066cc] px-3 py-2 text-sm font-semibold text-white',
              'shadow-md transition hover:bg-[#0055a5] active:scale-[0.98]'
            )}
          >
            <span className="relative">
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c41e3a] px-1 text-[10px] font-bold">
                  {itemCount}
                </span>
              )}
            </span>
            <span className="hidden sm:inline">Shopping cart</span>
            <span className="tabular-nums">{formatMoney(subtotal)}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
