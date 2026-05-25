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
      background: '#070910',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top bar — app palette */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 24px',
        background: '#0d1528',
        borderBottom: '1px solid rgba(0,212,240,0.18)',
        flexShrink: 0,
        zIndex: 10,
      }}>
        {/* Logo mark + wordmark */}
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Inline orb mark — miniature version of the SVG logo */}
          <svg viewBox="0 0 120 120" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="o" cx="38%" cy="32%" r="65%">
                <stop offset="0%"  stopColor="#1e2844"/>
                <stop offset="50%" stopColor="#0f1428"/>
                <stop offset="100%" stopColor="#080c18"/>
              </radialGradient>
              <filter id="g">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <circle cx="60" cy="60" r="54" fill="url(#o)" stroke="#00D4F0" strokeWidth="1.6" strokeOpacity="0.6"/>
            <circle cx="60" cy="60" r="36" fill="none" stroke="#00D4F0" strokeWidth="1" strokeOpacity="0.2"/>
            <g filter="url(#g)" stroke="#00D4F0" strokeLinecap="round">
              <line x1="60" y1="6"  x2="60" y2="33"  strokeWidth="3"/>
              <line x1="60" y1="87" x2="60" y2="114" strokeWidth="3"/>
              <line x1="6"  y1="60" x2="33" y2="60"  strokeWidth="3"/>
              <line x1="87" y1="60" x2="114" y2="60" strokeWidth="3"/>
            </g>
            <g stroke="#00D4F0" strokeLinecap="round" strokeOpacity="0.5">
              <line x1="19" y1="19" x2="27" y2="27" strokeWidth="1.8"/>
              <line x1="101" y1="101" x2="93" y2="93" strokeWidth="1.8"/>
              <line x1="101" y1="19"  x2="93" y2="27"  strokeWidth="1.8"/>
              <line x1="19"  y1="101" x2="27" y2="93"  strokeWidth="1.8"/>
            </g>
            <circle cx="60" cy="60" r="13" fill="#00D4F0" filter="url(#g)"/>
            <circle cx="55.5" cy="55.5" r="4.5" fill="white" fillOpacity="0.25"/>
            <text x="60" y="64.5" fontFamily="Arial Black,sans-serif" fontWeight="900" fontSize="10"
                  fill="#07111e" textAnchor="middle" letterSpacing="0.8">SP</text>
          </svg>
          <div>
            <span style={{
              fontFamily: "'Arial Black', Helvetica, sans-serif",
              fontWeight: 900,
              fontSize: 16,
              color: '#ffffff',
              letterSpacing: 2,
            }}>
              STRIKE<span style={{ color: '#00D4F0' }}>PANEL</span>
              <span style={{ color: '#00D4F0', fontSize: 10, verticalAlign: 'super' }}>™</span>
            </span>
          </div>
        </a>

        <span style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 10,
          letterSpacing: 3,
          color: 'rgba(0,212,240,0.55)',
          textTransform: 'uppercase',
        }}>
          // LIVE DEMO — NO SIGNUP REQUIRED
        </span>

        <a
          href="https://payhip.com/Strikepanel"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'linear-gradient(135deg,#c8892a,#e0a83a)',
            color: '#0C0C0C',
            fontFamily: "'Arial Black', Helvetica, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 1,
            padding: '9px 22px',
            borderRadius: 100,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 0 20px rgba(200,137,42,0.35)',
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
          background: '#070910',
        }}
        title="StrikePanel Live Demo"
        allow="fullscreen"
      />
    </div>
  )
}
