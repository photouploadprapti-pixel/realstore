'use client'

import { create } from 'zustand'
import type { CartItem, Product } from '@/types/product'

interface CartState {
  items: CartItem[]
  isCartOpen: boolean
  isCheckoutOpen: boolean
  selectedProduct: Product | null
  /** Product currently under the crosshair (not yet confirmed). */
  aimedProduct: Product | null
  toastMessage: string | null
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  openCheckout: () => void
  closeCheckout: () => void
  setSelectedProduct: (product: Product | null) => void
  setAimedProduct: (product: Product | null) => void
  showToast: (message: string) => void
  clearToast: () => void
  itemCount: () => number
  subtotal: () => number
}

/**
 * Global shopping cart and UI overlay state.
 */
export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isCartOpen: false,
  isCheckoutOpen: false,
  selectedProduct: null,
  aimedProduct: null,
  toastMessage: null,

  addItem: (product) => {
    const existing = get().items.find((item) => item.product.id === product.id)
    if (existing) {
      set({
        items: get().items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
        toastMessage: `${product.name} added to your cart`,
      })
    } else {
      set({
        items: [...get().items, { product, quantity: 1 }],
        toastMessage: `${product.name} added to your cart`,
      })
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((item) => item.product.id !== productId) })
  },

  setQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    set({
      items: get().items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    })
  },

  clearCart: () => set({ items: [] }),

  openCart: () => {
    if (typeof document !== 'undefined') document.exitPointerLock()
    set({ isCartOpen: true })
  },
  closeCart: () => set({ isCartOpen: false }),
  openCheckout: () => {
    if (typeof document !== 'undefined') document.exitPointerLock()
    set({ isCheckoutOpen: true, isCartOpen: false })
  },
  closeCheckout: () => set({ isCheckoutOpen: false }),
  setSelectedProduct: (product) => {
    // Release free-look so the shopper can click Add to cart
    if (product && typeof document !== 'undefined') document.exitPointerLock()
    set({ selectedProduct: product })
  },
  setAimedProduct: (product) => set({ aimedProduct: product }),
  showToast: (message) => set({ toastMessage: message }),
  clearToast: () => set({ toastMessage: null }),

  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  subtotal: () =>
    get().items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    ),
}))
