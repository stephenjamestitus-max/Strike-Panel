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
          <div style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            borderRadius: 24,
            border: '1px solid rgba(0,212,240,.15)',
            boxShadow: '0 0 80px rgba(0,212,240,.08),0 32px 64px rgba(0,0,0,.6)',
            padding: 'clamp(40px,6vw,72px) clamp(32px,5vw,64px)',
            background: 'rgba(8,14,26,0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            maxWidth: 520,
          }}>
            {/* Mock dashboard preview dots */}
            <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-start' }}>
              {['#ef4444','#f59e0b','#10b981'].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
              ))}
            </div>
            {/* Stats preview row */}
            <div style={{ display: 'flex', gap: 16, width: '100%' }}>
              {[
                { label: 'ATHLETES', value: '12', color: 'var(--accent)' },
                { label: 'READY', value: '9', color: 'var(--green)' },
                { label: 'FLAGGED', value: '3', color: 'var(--amber)' },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,.04)', borderRadius: 12, padding: '16px 12px', textAlign: 'center', border: '1px solid rgba(255,255,255,.07)' }}>
                  <div style={{ fontFamily: 'var(--fk)', fontWeight: 900, fontSize: 28, color: s.color }}>{s.value}</div>
                  <div style={{ fontFamily: 'var(--fm)', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
              See your full roster — readiness scores, weight cuts, session logs — all in one place.
            </p>
            <a
              href="/demo"
              style={{
                background: 'linear-gradient(135deg,rgba(0,212,240,.15),rgba(0,212,240,.05))',
                border: '1px solid rgba(0,212,240,.35)',
                color: 'var(--accent)',
                fontFamily: 'var(--fk)',
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: 1,
                borderRadius: 100,
                padding: '13px 32px',
                transition: 'box-shadow .2s',
              }}
            >
              OPEN LIVE DEMO →
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
