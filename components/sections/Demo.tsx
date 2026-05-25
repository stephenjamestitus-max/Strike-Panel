import FadeIn from '@/components/ui/FadeIn'

export default function Demo() {
  return (
    <section id="demo" style={{ padding: 'clamp(80px,10vw,130px) clamp(20px,5vw,80px)', textAlign: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(0,212,240,.06),transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <FadeIn delay={0} y={40}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12 }}>// LIVE DEMO</div>
          <h2 style={{
            fontFamily: 'var(--fk)',
            fontWeight: 900,
            fontSize: 'clamp(36px,5vw,64px)',
            marginBottom: 8,
            letterSpacing: 2,
            background: 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>SEE IT IN ACTION</h2>
          <p style={{ fontFamily: 'var(--fb)', color: 'var(--muted)', marginBottom: 40, fontSize: 16 }}>No signup required — try the real app</p>
        </FadeIn>
        <FadeIn delay={0.15} y={20}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
            <div style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(200,137,42,0.2)', boxShadow: '0 0 80px rgba(200,137,42,0.08),0 32px 64px rgba(0,0,0,.6)', background: '#08090f', padding: '40px 60px' }}>
              <img
                src="/iphone-mockup.png"
                alt="StrikePanel app on iPhone"
                style={{ width: 260, display: 'block', margin: '0 auto' }}
              />
            </div>
            <a
              href="https://strikepanel.uk/app"
              style={{
                display: 'inline-block',
                background: 'var(--amber)',
                color: '#0C0C0C',
                fontFamily: 'var(--fk)',
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: 1,
                padding: '16px 40px',
                borderRadius: 100,
                textDecoration: 'none',
              }}
            >
              TRY THE APP — FREE
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
