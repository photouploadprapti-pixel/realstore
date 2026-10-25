import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind class names with conflict resolution.
 * @param inputs - Class name values to combine
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as USD currency.
 * @param amount - Numeric amount
 */
export const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
