import FadeIn from '@/components/ui/FadeIn'
import DeviceParallax from './DeviceParallax'

const bullets = [
  'WORKS OFFLINE',
  'ONE LICENSE',
  'HOME SCREEN INSTALL',
  'YOUR DATA, NEVER OURS',
]

export default function CrossPlatform() {
  return (
    <section style={{ background: 'var(--bg)', padding: 'clamp(80px,10vw,130px) clamp(20px,5vw,64px) 0', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <FadeIn delay={0} y={40}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', marginBottom: 64 }}>
            <div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12 }}>// CROSS-PLATFORM</div>
              <h2 style={{
                fontFamily: 'var(--fk)',
                fontWeight: 900,
                fontSize: 'clamp(56px,8vw,110px)',
                lineHeight: .92,
                letterSpacing: 2,
                background: 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                RUNS ON<br />EVERYTHING.
              </h2>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 16, color: 'rgba(245,240,232,.65)', lineHeight: 1.7, marginBottom: 28 }}>
                Phone, tablet, laptop. Install from your browser — no app store, no update prompts, works offline. One license covers every device you own.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {bullets.map((b) => (
                  <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={0.15} y={20}>
          <DeviceParallax />
        </FadeIn>
      </div>
    </section>
  )
}
