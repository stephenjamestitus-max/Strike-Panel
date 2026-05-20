const features = [
  'All 14 sport categories',
  'Unlimited athletes',
  'Unlimited AI session plans',
  'Fight camp timeline tools',
  'Weight cut tracker',
  'Morning brief dashboard',
  'Readiness score system',
  'Progress tracking & charts',
]

export default function Pricing() {
  return (
    <section id="pricing" style={{ padding: 'clamp(80px,10vw,130px) clamp(20px,5vw,80px)', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12 }}>// PRICING</div>
      <h2 style={{ fontFamily: 'var(--fh)', fontSize: 'clamp(36px,5vw,64px)', letterSpacing: 2, marginBottom: 56 }}>
        OLD SCHOOL GRIT.<br />NEW SCHOOL DATA.
      </h2>
      <div style={{ display: 'inline-block', background: 'linear-gradient(145deg,rgba(200,137,42,.12),rgba(200,137,42,.06))', border: '1px solid rgba(200,137,42,.3)', borderRadius: 24, padding: '48px 56px', maxWidth: 480, width: '100%', boxShadow: '0 0 80px rgba(200,137,42,.08)' }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--fb)', fontSize: 20, color: 'var(--muted)', textDecoration: 'line-through', marginRight: 12 }}>$149</span>
          <span style={{ fontFamily: 'var(--fh)', fontSize: 72, color: 'var(--amber)', letterSpacing: 2 }}>$99</span>
          <span style={{ fontFamily: 'var(--fb)', color: 'var(--muted)', fontSize: 16 }}>/mo</span>
        </div>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', marginBottom: 36 }}>EVERYTHING INCLUDED · CANCEL ANYTIME</div>
        <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {features.map((f) => (
            <li key={f} style={{ display: 'flex', gap: 12, alignItems: 'center', fontFamily: 'var(--fb)', fontSize: 15 }}>
              <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>{f}
            </li>
          ))}
        </ul>
        <a href="https://strikepanel.vercel.app" style={{ display: 'block', background: 'linear-gradient(135deg,#c8892a,#e0a83a)', color: '#000', fontWeight: 700, borderRadius: 100, padding: '16px 32px', fontSize: 16, boxShadow: '0 0 40px rgba(200,137,42,.45)', textAlign: 'center', letterSpacing: .5 }}>
          Start Your Free Trial
        </a>
      </div>
    </section>
  )
}
