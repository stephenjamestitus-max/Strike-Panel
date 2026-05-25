import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Demo — StrikePanel',
  description: 'Try StrikePanel free. No signup required — see the real app in action.',
}

export default function DemoPage() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#04070f',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: '#08090f',
        borderBottom: '1px solid rgba(200,137,42,0.2)',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--fk)', fontWeight: 900, fontSize: 18, color: '#c8892a', letterSpacing: 2 }}>
            STRIKE<span style={{ color: '#f5f0e8' }}>PANEL</span>
          </span>
        </a>

        <span style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 3, color: '#6b7894', textTransform: 'uppercase' }}>
          // LIVE DEMO — NO SIGNUP REQUIRED
        </span>

        <a
          href="https://payhip.com/Strikepanel"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#c8892a',
            color: '#0C0C0C',
            fontFamily: 'var(--fk)',
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 1,
            padding: '10px 24px',
            borderRadius: 100,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Get Access — $99
        </a>
      </div>

      {/* Full-screen demo iframe */}
      <iframe
        src="https://strikepanel.vercel.app/demo"
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          background: '#04070f',
        }}
        title="StrikePanel Live Demo"
        allow="fullscreen"
      />
    </div>
  )
}
