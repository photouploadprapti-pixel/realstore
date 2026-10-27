'use client'

import { MapPin, X } from 'lucide-react'
import { DEPARTMENT_LABELS } from '@/lib/products'
import type { DepartmentId } from '@/types/product'

interface StoreMapProps {
  open: boolean
  onClose: () => void
  onTeleport: (department: DepartmentId) => void
}

const SPOTS: { id: DepartmentId; label: string; x: string; y: string }[] = [
  { id: 'everyday', label: DEPARTMENT_LABELS.everyday, x: '22%', y: '42%' },
  { id: 'dairy', label: DEPARTMENT_LABELS.dairy, x: '22%', y: '68%' },
  { id: 'snacks', label: DEPARTMENT_LABELS.snacks, x: '78%', y: '42%' },
  { id: 'home', label: DEPARTMENT_LABELS.home, x: '78%', y: '68%' },
]

/**
 * Simple store map overlay with teleport destinations (demo-style).
 * @param props - Open state, close handler, teleport callback
 */
export const StoreMap = ({ open, onClose, onTeleport }: StoreMapProps) => {
  if (!open) return null

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 text-slate-400 hover:bg-slate-100"
          aria-label="Close map"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-bold text-slate-900">Store map</h2>
        <p className="mt-1 text-sm text-slate-500">
          You are here — pick a destination to walk there instantly.
        </p>

        <div className="relative mt-4 h-64 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-slate-100 to-slate-200">
          {/* Aisle lanes */}
          <div className="absolute inset-y-4 left-[18%] w-[20%] rounded-lg bg-[#0066cc]/15" />
          <div className="absolute inset-y-4 right-[18%] w-[20%] rounded-lg bg-[#0066cc]/15" />
          <div className="absolute inset-x-[38%] inset-y-4 rounded-lg bg-white/70" />

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#0066cc] px-2.5 py-1 text-[11px] font-semibold text-white">
            <MapPin className="h-3 w-3" />
            You are here
          </div>

          {SPOTS.map((spot) => (
            <button
              key={spot.id}
              type="button"
              onClick={() => {
                onTeleport(spot.id)
                onClose()
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white px-2 py-1 text-[10px] font-semibold text-[#0066cc] shadow ring-1 ring-[#0066cc]/30 hover:bg-[#0066cc] hover:text-white"
              style={{ left: spot.x, top: spot.y }}
            >
              {spot.label.split(' ')[0]}
            </button>
          ))}
        </div>

        <p className="mt-3 text-center text-xs text-slate-400">
          ↑↓←→ move · mouse look · click product or press E to add
        </p>
      </div>
    </div>
  )
}
