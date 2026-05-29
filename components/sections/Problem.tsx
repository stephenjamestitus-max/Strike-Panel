import FadeIn from '@/components/ui/FadeIn'

const problems = [
  'Tracking athletes in spreadsheets',
  'No fight camp timeline tools',
  'Guessing readiness and recovery',
  'Losing athlete history between camps',
  'Chasing fighters every morning for their check-in data',
]
const fixes = [
  'One cloud dashboard for every athlete',
  'Full fight camp timelines with phase tracking',
  'Daily readiness scores backed by real data',
  'Complete athlete history, synced and always accessible',
  'Athletes check in via a shared link — brief builds itself',
]

export default function Problem() {
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 5,
        background: '#ffffff',
        borderRadius: '60px 60px 0 0',
        marginTop: -40,
        padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,80px)',
      }}
    >
      {/* Section heading */}
      <FadeIn delay={0} y={40}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(48px,8vw,96px)' }}>
          <div style={{
            fontFamily: 'var(--fm)',
            fontSize: 10,
            letterSpacing: 4,
            color: '#c8892a',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            // THE PROBLEM & THE FIX
          </div>
          <h2 style={{
            fontFamily: 'var(--fk)',
            fontWeight: 900,
            fontSize: 'clamp(3rem,9vw,120px)',
            color: '#0C0C0C',
            lineHeight: 0.9,
            textTransform: 'uppercase',
          }}>
            COACHING<br />
            ON SPREADSHEETS<br />
            IS KILLING<br />
            YOUR EDGE
          </h2>
        </div>
      </FadeIn>

      {/* Two-column grid */}
      <div className="sp-grid-2">

        {/* Left: The Problem */}
        <div>
          <div style={{
            fontFamily: 'var(--fm)',
            fontSize: 10,
            letterSpacing: 4,
            color: '#ef4444',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}>
            // THE PROBLEM
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {problems.map((p, i) => (
              <FadeIn key={p} delay={i * 0.1} y={20}>
                <div style={{
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                  paddingTop: 20,
                  paddingBottom: 20,
                  borderBottom: '1px solid rgba(12,12,12,0.1)',
                }}>
                  <span style={{
                    color: '#ef4444',
                    fontFamily: 'var(--fk)',
                    fontWeight: 700,
                    fontSize: 20,
                    flexShrink: 0,
                    lineHeight: 1.3,
                  }}>✕</span>
                  <span style={{
                    fontFamily: 'var(--fb)',
                    fontSize: 'clamp(15px,1.8vw,18px)',
                    color: '#0C0C0C',
                    lineHeight: 1.5,
                  }}>{p}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Right: The Fix */}
        <div>
          <div style={{
            fontFamily: 'var(--fm)',
            fontSize: 10,
            letterSpacing: 4,
            color: '#10b981',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}>
            // THE FIX
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {fixes.map((f, i) => (
              <FadeIn key={f} delay={0.1 + i * 0.1} y={20}>
                <div style={{
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                  paddingTop: 20,
                  paddingBottom: 20,
                  borderBottom: '1px solid rgba(12,12,12,0.1)',
                }}>
                  <span style={{
                    color: '#10b981',
                    fontFamily: 'var(--fk)',
                    fontWeight: 700,
                    fontSize: 20,
                    flexShrink: 0,
                    lineHeight: 1.3,
                  }}>✓</span>
                  <span style={{
                    fontFamily: 'var(--fb)',
                    fontSize: 'clamp(15px,1.8vw,18px)',
                    color: '#0C0C0C',
                    lineHeight: 1.5,
                  }}>{f}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
