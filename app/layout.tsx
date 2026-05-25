import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StrikePanel™ — Training Intelligence for Combat Sports Coaches',
  description: 'The coaching dashboard built for boxing, MMA, Muay Thai and BJJ coaches. Daily readiness scores, fight camp timelines, AI session plans. $99 one-time — no subscription.',
  metadataBase: new URL('https://strikepanel.uk'),
  alternates: { canonical: 'https://strikepanel.uk' },
  openGraph: {
    title: 'StrikePanel™ — Training Intelligence for Combat Sports Coaches',
    description: 'Daily readiness scores, fight camp timelines, AI session plans. Built for boxing, MMA, Muay Thai and BJJ coaches. $99 one-time.',
    url: 'https://strikepanel.uk',
    siteName: 'StrikePanel',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StrikePanel™ — Training Intelligence for Combat Sports',
    description: 'Daily readiness scores, fight camp timelines, AI session plans. $99 one-time.',
  },
  keywords: ['boxing coach software', 'MMA coaching app', 'combat sports training', 'athlete readiness tracking', 'fight camp management', 'muay thai coach', 'bjj coach tools'],
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
