'use client'
import FadeIn from '@/components/ui/FadeIn'
import Magnet from '@/components/ui/Magnet'

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
    <section
      id="pricing"
      style={{
        background: 'var(--bg)',
        borderRadius: '60px 60px 0 0',
        marginTop: -40,
        position: 'relative',
        zIndex: 10,
        padding: 'clamp(80px,10vw,130px) clamp(20px,5vw,80px)',
        textAlign: 'center',
      }}
    >
      <FadeIn delay={0} y={40}>
        <div style={{
          fontFamily: 'var(--fm)',
          fontSize: 10,
          letterSpacing: 4,
          color: 'var(--accent)',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          // PRICING
        </div>
        <h2 style={{
          fontFamily: 'var(--fk)',
          fontWeight: 900,
          fontSize: 'clamp(3rem,9vw,120px)',
          lineHeight: 0.9,
          textTransform: 'uppercase',
          background: 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 'clamp(48px,8vw,80px)',
        }}>
          OLD SCHOOL<br />
          GRIT.<br />
          NEW SCHOOL<br />
          DATA.
        </h2>
      </FadeIn>

      <FadeIn delay={0.2} y={30}>
        <div style={{
          display: 'inline-block',
          border: '2px solid rgba(215,226,234,0.25)',
          borderRadius: 'clamp(40px,5vw,60px)',
          padding: '48px 56px',
          background: 'rgba(12,12,12,0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 0 80px rgba(200,137,42,0.08)',
        }}>
          {/* Urgency banner */}
          <div style={{
            fontFamily: 'var(--fb)',
            fontSize: 13,
            color: 'var(--amber)',
            marginBottom: 20,
            background: 'rgba(200,137,42,0.1)',
            border: '1px solid rgba(200,137,42,0.25)',
            borderRadius: 8,
            padding: '8px 16px',
          }}>
            🔥 Launch Price — Was $149, Now $99. Goes up with Phase 2.
          </div>

          {/* Price row */}
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--fb)', fontSize: 20, color: 'var(--muted)', textDecoration: 'line-through', marginRight: 12 }}>$149</span>
            <span style={{
              fontFamily: 'var(--fk)',
              fontWeight: 900,
              fontSize: 'clamp(72px,10vw,120px)',
              color: 'var(--amber)',
              lineHeight: 1,
            }}>$99</span>
          </div>

          <div style={{
            fontFamily: 'var(--fm)',
            fontSize: 10,
            letterSpacing: 3,
            color: 'var(--muted)',
            marginBottom: 36,
          }}>
            ONE-TIME PAYMENT · LIFETIME ACCESS · 30-DAY GUARANTEE
          </div>

          <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {features.map((f) => (
              <li key={f} style={{ display: 'flex', gap: 12, alignItems: 'center', fontFamily: 'var(--fb)', fontSize: 15 }}>
                <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>{f}
              </li>
            ))}
          </ul>

          <Magnet padding={120} strength={3}>
            <a
              href="https://strikepane.gumroad.com/l/strikepane"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                background: 'linear-gradient(135deg,#c8892a,#e0a83a)',
                color: '#000',
                fontWeight: 700,
                fontFamily: 'var(--fk)',
                borderRadius: 100,
                padding: '16px 32px',
                fontSize: 16,
                boxShadow: '0 0 40px rgba(200,137,42,.45)',
                textAlign: 'center',
                letterSpacing: 0.5,
              }}
            >
              Get Access — $99
            </a>
          </Magnet>

          {/* Money-back guarantee */}
          <p style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--muted)', marginTop: 16 }}>
            🛡️ 30-day money-back guarantee, no questions asked.
          </p>
        </div>
      </FadeIn>
    </section>
  )
}
