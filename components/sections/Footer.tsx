export default function Footer() {
  const links = [
    { label: 'Features', href: '#features' },
    { label: 'Demo',     href: '#demo' },
    { label: 'Pricing',  href: '#pricing' },
    { label: 'Privacy',  href: '/privacy' },
    { label: 'Terms',    href: '/terms' },
  ]
  return (
    <footer style={{ borderTop: '2px solid rgba(200,137,42,.22)', padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,80px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: 'var(--fk)', fontWeight: 900, fontSize: 22, letterSpacing: 4, marginBottom: 6 }}>
            STRIKE<span style={{ color: 'var(--accent)' }}>PANEL</span>™
          </div>
          <div style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--muted)' }}>Training intelligence for combat sports coaches.</div>
        </div>
        <nav style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {links.map((l) => (
            <a key={l.label} href={l.href} style={{ fontFamily: 'var(--fk)', fontWeight: 400, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', transition: 'color .2s' }}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'var(--muted2)', textAlign: 'center' }}>
        © 2025 STRIKEPANE™ · ALL RIGHTS RESERVED
      </div>
    </footer>
  )
}
