'use client'

import { useCartStore } from '@/store/use-cart-store'

/**
 * First-person wire shopping-cart silhouette at the bottom center of the view
 * (inspired by virtual supermarket demos like byomid.com/supermarket).
 */
export const CartHud = () => {
  const itemCount = useCartStore((state) => state.itemCount())

  return (
    <div
      className="pointer-events-none absolute bottom-0 left-1/2 z-20 w-[min(420px,78vw)] -translate-x-1/2"
      aria-hidden
    >
      <svg
        viewBox="0 0 420 120"
        className="h-auto w-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
      >
        {/* Basket rim */}
        <path
          d="M40 28 H380 L360 95 H60 Z"
          fill="none"
          stroke="#9aa5b1"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* Wire grid */}
        <path
          d="M90 28 V95 M140 28 V95 M190 28 V95 M230 28 V95 M280 28 V95 M330 28 V95"
          fill="none"
          stroke="#b0bac4"
          strokeWidth="2.5"
          opacity="0.9"
        />
        <path
          d="M55 50 H365 M62 70 H358"
          fill="none"
          stroke="#b0bac4"
          strokeWidth="2"
          opacity="0.75"
        />
        {/* Child seat bar */}
        <rect x="155" y="18" width="110" height="14" rx="3" fill="#c41e3a" />
        {/* Handle arch */}
        <path
          d="M150 28 C150 2, 270 2, 270 28"
          fill="none"
          stroke="#6b7785"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Blue corner accents */}
        <circle cx="60" cy="95" r="5" fill="#0066cc" />
        <circle cx="360" cy="95" r="5" fill="#0066cc" />
      </svg>

      {itemCount > 0 && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 rounded-full bg-[#0066cc] px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
          {itemCount} in cart
        </div>
      )}
    </div>
  )
}
