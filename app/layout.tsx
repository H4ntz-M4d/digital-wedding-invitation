import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { wedding } from '@/config/wedding'
import './globals.css'

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const sans = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
})

const title = `The Wedding of ${wedding.groom.nickname} & ${wedding.bride.nickname}`

export const metadata: Metadata = {
  metadataBase: new URL('https://dhanny-uddin.site'),
  title,
  description: wedding.opening.message,
  robots: { index: false, follow: false },
  referrer: 'strict-origin-when-cross-origin',
  openGraph: {
    title,
    description: wedding.opening.message,
    images: [wedding.cover.image],
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#f7f2e8',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
