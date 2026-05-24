import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StrikePanel™ — Training Intelligence for Combat Sports',
  description: 'The coaching platform built for combat sports. Morning briefs, fight camp timelines, AI session plans, and readiness scores — all in one dashboard.',
  metadataBase: new URL('https://strikepanel.vercel.app'),
  openGraph: {
    title: 'StrikePanel™ — Training Intelligence for Combat Sports',
    description: 'Morning briefs, fight camp timelines, AI session plans, and readiness scores — all in one dashboard built for combat sports.',
    url: 'https://strikepanel.vercel.app/landing',
    siteName: 'StrikePanel™',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'StrikePanel™' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StrikePanel™ — Training Intelligence for Combat Sports',
    description: 'Morning briefs, fight camp timelines, AI session plans, and readiness scores — all in one dashboard.',
    images: ['/og.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
