'use client'

import { HelpCircle, Map, Search, Volume2, VolumeX, X } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { PRODUCTS } from '@/lib/products'
import { formatMoney } from '@/lib/utils'
import { useCartStore } from '@/store/use-cart-store'
import type { Product } from '@/types/product'

/** Props for the left tool rail and search drawer. */
export interface StoreToolsProps {
  isSearchOpen: boolean
  isSoundOn: boolean
  onToggleSound: () => void
  onOpenMap: () => void
  onOpenSearch: () => void
  onCloseSearch: () => void
  onSelectProduct: (product: Product) => void
}

/**
 * Side tool rail + search panel inspired by virtual supermarket demos.
 * @param props - Tool panel state and handlers
 */
export const StoreTools = ({
  isSearchOpen,
  isSoundOn,
  onToggleSound,
  onOpenMap,
  onOpenSearch,
  onCloseSearch,
  onSelectProduct,
}: StoreToolsProps) => {
  const [query, setQuery] = useState('')
  const addItem = useCartStore((state) => state.addItem)
  const showToast = useCartStore((state) => state.showToast)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PRODUCTS.slice(0, 8)
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    ).slice(0, 12)
  }, [query])

  return (
    <>
      <div className="pointer-events-auto absolute left-3 top-20 z-30 flex flex-col gap-2">
        <ToolButton label="Search products" onClick={onOpenSearch}>
          <Search className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Store map" onClick={onOpenMap}>
          <Map className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label={isSoundOn ? 'Mute sounds' : 'Enable sounds'}
          onClick={onToggleSound}
        >
          {isSoundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </ToolButton>
        <ToolButton
          label="Help"
          onClick={() =>
            showToast('↑↓←→ move · mouse look · click or E to add · Esc unlocks mouse')
          }
        >
          <HelpCircle className="h-4 w-4" />
        </ToolButton>
      </div>

      {isSearchOpen && (
        <div className="pointer-events-auto absolute inset-0 z-50 flex justify-end bg-black/35 p-3 pt-16 sm:p-6 sm:pt-20">
          <div className="flex h-full max-h-[80vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products..."
                className="flex-1 text-sm outline-none"
              />
              <button
                type="button"
                onClick={onCloseSearch}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto p-2">
              {results.map((product) => (
                <li key={product.id}>
                  <div className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      onClick={() => {
                        onSelectProduct(product)
                        onCloseSearch()
                      }}
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                        style={{ backgroundColor: product.color }}
                      >
                        {product.name.slice(0, 3)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">
                          {product.name}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {formatMoney(product.price)}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-[#0066cc] px-2.5 py-1 text-xs font-semibold text-white"
                      onClick={() => {
                        addItem(product)
                        onCloseSearch()
                      }}
                    >
                      Add
                    </button>
                  </div>
                </li>
              ))}
              {results.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-slate-500">
                  No products match “{query}”
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}

interface ToolButtonProps {
  label: string
  onClick: () => void
  children: ReactNode
}

/**
 * Round tool button for the left rail.
 * @param props - Label, click handler, icon
 */
const ToolButton = ({ label, onClick, children }: ToolButtonProps) => {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#0066cc] shadow-md ring-1 ring-slate-200/80 transition hover:bg-[#0066cc] hover:text-white"
    >
      {children}
    </button>
  )
}
