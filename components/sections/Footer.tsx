export default function Footer() {
  const links = [
    { label: 'Features', href: '#features' },
    { label: 'Demo',     href: '/demo' },
    { label: 'Pricing',  href: '#pricing' },
    { label: 'Get Access', href: 'https://payhip.com/Strikepanel' },
  ]

  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,.06)', background: 'var(--bg)' }}>

      {/* Pre-footer CTA */}
      <div style={{
        textAlign: 'center',
        padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)',
        borderBottom: '1px solid rgba(200,137,42,.15)',
      }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 16 }}>
          // READY TO COACH SMARTER?
        </div>
        <h2 style={{
          fontFamily: 'var(--fk)',
          fontWeight: 900,
          fontSize: 'clamp(32px,5vw,72px)',
          lineHeight: 0.95,
          textTransform: 'uppercase',
          background: 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 24,
        }}>
          STOP CHASING.<br />
          START WINNING.
        </h2>
        <p style={{ fontFamily: 'var(--fb)', fontSize: 16, color: 'rgba(245,240,232,.5)', maxWidth: 460, margin: '0 auto 36px' }}>
          One-time payment. Every feature. Every athlete. No subscription ever.
        </p>
        <a
          href="https://payhip.com/Strikepanel"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg,#c8892a,#e0a83a)',
            color: '#000', fontWeight: 700, fontFamily: 'var(--fk)',
            borderRadius: 100, padding: '16px 44px', fontSize: 18,
            boxShadow: '0 0 48px rgba(200,137,42,.45)',
            letterSpacing: 0.5,
          }}
        >
          Start Coaching Smarter →
        </a>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 2, color: 'var(--muted2)', marginTop: 14 }}>
          30-DAY REFUND POLICY · INSTANT DELIVERY
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
        padding: 'clamp(24px,3vw,36px) clamp(20px,5vw,80px)',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--fk)', fontWeight: 900, fontSize: 18, letterSpacing: 4, marginBottom: 4 }}>
            STRIKE<span style={{ color: 'var(--accent)' }}>PANEL</span>™
          </div>
          <div style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--muted2)' }}>Training intelligence for combat sports coaches.</div>
        </div>

        <nav style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith('http') ? '_blank' : undefined}
              rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              style={{
                fontFamily: 'var(--fk)', fontWeight: 400, fontSize: 10,
                letterSpacing: 2, color: 'var(--muted2)', textTransform: 'uppercase',
                transition: 'color .2s',
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'var(--muted2)' }}>
          © 2026 STRIKEPANEL™
        </div>
      </div>
    </footer>
  )
}
