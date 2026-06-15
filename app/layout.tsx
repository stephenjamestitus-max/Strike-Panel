import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'strikepanel™ — Training Intelligence for Combat Sports',
  description: 'The cloud coaching platform built for combat sports. Morning briefs, fight camp timelines, AI session plans, and readiness scores — all in one dashboard. One-time $99.',
  metadataBase: new URL('https://strikepanel.uk'),
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
    title: 'strikepanel™ — Training Intelligence for Combat Sports',
    description: 'Morning briefs, fight camp timelines, AI session plans & readiness scores. Built for combat sports coaches. Cloud-based. One-time $99.',
    type: 'website',
    url: 'https://strikepanel.uk',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'strikepanel — Training Intelligence for Combat Sports',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'strikepanel™ — Training Intelligence for Combat Sports',
    description: 'Morning briefs, fight camp timelines, AI session plans & readiness scores. Built for combat sports coaches.',
    images: ['/og-image.png'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'strikepanel',
  applicationCategory: 'SportsApplication',
  operatingSystem: 'Web',
  url: 'https://strikepanel.uk',
  description: 'Cloud coaching platform for combat sports coaches. Morning briefs, athlete check-in links, fight camp timelines, AI session plans, and readiness scores.',
  offers: {
    '@type': 'Offer',
    price: '99',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
