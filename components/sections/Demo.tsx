import FadeIn from '@/components/ui/FadeIn'

const athletes = [
  { name: 'PRIYA SHARMA',   score: 92, color: '#10b981', status: 'READY',   rec: 'PEAK LOAD — PUSH TODAY' },
  { name: 'JAKE THOMPSON',  score: 67, color: '#c8892a', status: 'CAUTION', rec: 'MODERATE INTENSITY ONLY' },
  { name: 'MARCUS MENDEZ',  score: 34, color: '#ef4444', status: 'REST',    rec: 'LIGHT WORK — FLAG FOR REVIEW' },
]

export default function Demo() {
  return (
    <section
      id="demo"
      style={{
        padding: 'clamp(80px,10vw,130px) clamp(20px,5vw,80px)',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 900, height: 600, borderRadius: '50%',
        background: 'radial-gradient(ellipse,rgba(0,212,240,.06),transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <FadeIn delay={0} y={40}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12 }}>
            // LIVE DEMO
          </div>
          <h2 style={{
            fontFamily: 'var(--fk)', fontWeight: 900,
            fontSize: 'clamp(36px,5vw,64px)',
            marginBottom: 8, letterSpacing: 2,
            background: 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            SEE IT IN ACTION
          </h2>
          <p style={{ fontFamily: 'var(--fb)', color: 'var(--muted)', marginBottom: 40, fontSize: 16 }}>
            No signup required — explore the real app
          </p>
        </FadeIn>

        <FadeIn delay={0.15} y={20}>
          {/* Preview card */}
          <div style={{
            width: '100%', maxWidth: 740, margin: '0 auto',
            borderRadius: 16, overflow: 'hidden',
            border: '1px solid rgba(0,212,240,.12)',
            background: '#080e1a',
            position: 'relative',
            boxShadow: '0 0 80px rgba(0,212,240,.06), 0 32px 64px rgba(0,0,0,.6)',
          }}>
            {/* App header bar */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255,255,255,.06)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'rgba(8,14,30,.8)',
            }}>
              <div>
                <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 3, color: 'var(--accent)', marginBottom: 4 }}>
                  // MORNING BRIEF
                </div>
                <div style={{ fontFamily: 'var(--fk)', fontWeight: 900, fontSize: 17, color: 'var(--cream)', letterSpacing: 1 }}>
                  SUNDAY 25 MAY 2026
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: '#10b981' }}>3/3 CHECKED IN</div>
                <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', marginTop: 2 }}>SQUAD AVG · 64</div>
              </div>
            </div>

            {/* Athlete rows */}
            {athletes.map((a, i) => (
              <div key={a.name} style={{
                padding: '16px 24px',
                borderBottom: i < athletes.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
                display: 'flex', alignItems: 'center', gap: 16,
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.01)',
              }}>
                {/* Score circle */}
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${a.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${a.color}14`,
                }}>
                  <span style={{ fontFamily: 'var(--fk)', fontWeight: 900, fontSize: 18, color: a.color }}>
                    {a.score}
                  </span>
                </div>

                {/* Name + recommendation */}
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--fk)', fontWeight: 700, fontSize: 14, color: 'var(--cream)', letterSpacing: 1 }}>
                    {a.name}
                  </div>
                  <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', marginTop: 3 }}>
                    {a.rec}
                  </div>
                </div>

                {/* Status badge */}
                <div style={{
                  fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 2,
                  color: a.color, border: `1px solid ${a.color}40`,
                  borderRadius: 4, padding: '4px 10px',
                  background: `${a.color}0f`,
                }}>
                  {a.status}
                </div>
              </div>
            ))}

            {/* Gradient overlay + CTA */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(4,7,15,.97) 0%, rgba(4,7,15,.5) 45%, transparent 75%)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              paddingBottom: 36,
            }}>
              <a
                href="/demo"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: 'rgba(0,212,240,.08)',
                  border: '1px solid rgba(0,212,240,.35)',
                  borderRadius: 100,
                  padding: '14px 32px',
                  fontFamily: 'var(--fk)', fontWeight: 700, fontSize: 15,
                  color: 'var(--accent)', letterSpacing: 1,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  transition: 'background .2s, border-color .2s',
                }}
              >
                <span style={{ fontSize: 18 }}>▶</span>
                Open Live Demo — No Signup
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
