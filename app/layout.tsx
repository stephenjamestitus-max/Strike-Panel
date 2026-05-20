import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StrikePanel™ — Training Intelligence for Combat Sports',
  description: 'The coaching platform built for combat sports. Morning briefs, fight camp timelines, AI session plans, and readiness scores — all in one dashboard.',
  openGraph: {
    title: 'StrikePanel™',
    description: 'Training intelligence for combat sports coaches.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
