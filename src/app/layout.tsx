import type { Metadata } from 'next'
import { DM_Sans, Outfit } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
})

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'RealStore — 3D Virtual Supermarket',
  description:
    'Walk the aisles of a 3D virtual supermarket, pick products off the shelves, and checkout.',
}

/**
 * Root layout for the RealStore app.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${outfit.variable} h-full`}>
      <body className="min-h-full overflow-hidden bg-slate-200 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
