import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Demo — StrikePanel',
  description: 'Try StrikePanel free. No signup required — Morning Brief, fight countdowns, boxing timer. Interactive demo with real fight camp data.',
  openGraph: {
    title: 'StrikePanel™ — Live Demo',
    description: 'Try every feature free — Morning Brief, fight countdowns, AI workouts, boxing timer. No sign-up. Buy once for $99.',
    url: 'https://strikepanel.uk/demo',
    images: [{ url: 'https://strikepanel.uk/og-demo.png', width: 1200, height: 630 }],
  },
}

export default function DemoPage() {
  return (
    <iframe
      src="/demo.html"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        border: 'none',
        background: '#080b14',
      }}
      title="StrikePanel Live Demo"
      allow="autoplay"
    />
  )
}
