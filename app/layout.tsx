import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StrikePanel™ — Training Intelligence for Combat Sports',
  description: 'The cloud coaching platform built for combat sports. Morning briefs, fight camp timelines, AI session plans, and readiness scores — all in one dashboard. One-time $99.',
  metadataBase: new URL('https://strikepanel.uk'),
  alternates: {
    canonical: 'https://strikepanel.uk',
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'StrikePanel™ — Training Intelligence for Combat Sports',
    description: 'Morning briefs, fight camp timelines, AI session plans & readiness scores. Built for combat sports coaches. Cloud-based. One-time $99.',
    type: 'website',
    url: 'https://strikepanel.uk',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'StrikePanel — Training Intelligence for Combat Sports',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StrikePanel™ — Training Intelligence for Combat Sports',
    description: 'Morning briefs, fight camp timelines, AI session plans & readiness scores. Built for combat sports coaches.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
