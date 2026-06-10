'use client'
import FadeIn from '@/components/ui/FadeIn'

const proofPoints = [
  {
    stat: '0–100',
    label: 'READINESS SCORE',
    text: 'Every fighter scored every morning from sleep, soreness, mood, and resting HR. Know who to push and who to protect before they walk in.',
  },
  {
    stat: '60 sec',
    label: 'ATHLETE CHECK-IN',
    text: 'Fighters tap a link on their phone — no app download, no account. Their data lands in your Morning Brief before you finish your coffee.',
  },
  {
    stat: '5+ days',
    label: 'EARLY CUT WARNING',
    text: 'The weight cut tracker maps the full cut from camp start to fight night, and flags crash-cut risk nearly a week before it becomes a problem.',
  },
]

export default function Social() {
  return (
    <section style={{ padding: 'clamp(80px,10vw,130px) clamp(20px,5vw,80px)', background: '#04070f' }}>
      <FadeIn delay={0} y={40}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12 }}>
            // WHY COACHES SWITCH
          </div>
          <h2 style={{
            fontFamily: 'var(--fk)',
            fontWeight: 900,
            fontSize: 'clamp(28px,4vw,52px)',
            letterSpacing: 2,
            textTransform: 'uppercase',
            background: 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            BUILT FOR THE CORNER
          </h2>
        </div>
      </FadeIn>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 16,
        maxWidth: 1100,
        margin: '0 auto',
      }}>
        {proofPoints.map((p, i) => (
          <FadeIn key={p.label} delay={i * 0.08} y={20}>
            <div style={{
              background: '#0a101e',
              border: '1px solid rgba(0,212,240,0.12)',
              borderRadius: 12,
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              height: '100%',
            }}>
              <div style={{
                fontFamily: 'var(--fk)',
                fontWeight: 900,
                fontSize: 40,
                color: 'var(--accent)',
                lineHeight: 1,
              }}>
                {p.stat}
              </div>
              <div style={{
                fontFamily: 'var(--fm)',
                fontSize: 11,
                letterSpacing: 3,
                color: '#7a85a0',
              }}>
                {p.label}
              </div>
              <p style={{
                fontFamily: 'var(--fb, Arial, sans-serif)',
                fontSize: 14,
                color: '#aab3c7',
                lineHeight: 1.7,
                margin: 0,
                flex: 1,
              }}>
                {p.text}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.3} y={20}>
        <div style={{
          maxWidth: 1100,
          margin: '24px auto 0',
          background: 'rgba(0,212,240,0.04)',
          border: '1px solid rgba(0,212,240,0.15)',
          borderRadius: 12,
          padding: '22px 28px',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--fm)',
            fontSize: 12,
            letterSpacing: 2,
            color: '#7a85a0',
            margin: 0,
            lineHeight: 1.8,
          }}>
            EARLY ACCESS — OUR FIRST TRIAL COHORT IS RUNNING NOW.{' '}
            <a href="#demo" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
              START YOUR FREE 14-DAY TRIAL
            </a>{' '}
            AND TELL US WHAT TO BUILD NEXT.
          </p>
        </div>
      </FadeIn>
    </section>
  )
}
