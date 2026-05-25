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
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'inline-block', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,212,240,.15)', boxShadow: '0 0 80px rgba(0,212,240,.08),0 32px 64px rgba(0,0,0,.6)' }}>
              <iframe src="https://strikepanel.vercel.app/demo" width={820} height={580} style={{ display: 'block', border: 'none', background: '#04070f' }} title="StrikePanel™ Live Demo" loading="lazy" />
            </div>
            <a
              href="/demo"
              style={{
                fontFamily: 'var(--fm)',
                fontSize: 11,
                letterSpacing: 2,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Open full screen ↗
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
