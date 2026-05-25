import FadeIn from '@/components/ui/FadeIn'

const steps = [
  {
    num: '01',
    title: 'Add Your Athletes',
    body: 'Create athlete profiles in seconds. Set their sport, weight class, fight record, and upcoming bouts. Everything lives in the cloud — access it from any device.',
    tag: '// ONE-TIME SETUP',
    accent: 'var(--accent)',
  },
  {
    num: '02',
    title: 'Share Their Check-In Link',
    body: 'Each athlete gets a unique URL. They open it on any phone the morning of training — no app download, no account, no friction. They input sleep, fatigue, soreness, and optional WHOOP data, then hit submit.',
    tag: '// strikepanel.uk/checkin?coach=TOKEN',
    accent: 'var(--amber)',
    highlight: true,
  },
  {
    num: '03',
    title: 'Wake Up To Your Brief',
    body: 'Every check-in auto-populates your morning brief with readiness scores, colour-coded alerts, and AI-generated session adjustments. By the time you reach the gym, you already know who to push, who to rest, and what weight cut needs attention.',
    tag: '// FULLY AUTOMATED',
    accent: 'var(--green)',
  },
]

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{
        background: '#04070f',
        padding: 'clamp(80px,10vw,130px) clamp(20px,5vw,80px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 800,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse,rgba(0,212,240,.05),transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <FadeIn delay={0} y={40}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12 }}>
              // HOW IT WORKS
            </div>
            <h2 style={{
              fontFamily: 'var(--fk)',
              fontWeight: 900,
              fontSize: 'clamp(36px,5vw,64px)',
              letterSpacing: 2,
              textTransform: 'uppercase',
              background: 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: 16,
            }}>
              THREE STEPS.<br />ZERO CHASING.
            </h2>
            <p style={{ fontFamily: 'var(--fb)', fontSize: 16, color: 'rgba(245,240,232,.5)', maxWidth: 480, margin: '0 auto' }}>
              No more texting fighters at 7am. Set up once, share their link, and let the brief build itself.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {steps.map((step, i) => (
            <FadeIn key={step.num} delay={i * 0.12} y={30}>
              <div style={{
                background: step.highlight
                  ? 'rgba(200,137,42,.06)'
                  : 'rgba(8,14,26,.8)',
                border: step.highlight
                  ? '1px solid rgba(200,137,42,.28)'
                  : '1px solid rgba(255,255,255,.07)',
                borderRadius: 20,
                padding: '36px 32px',
                height: '100%',
                position: 'relative',
              }}>
                {/* Step number */}
                <div style={{
                  fontFamily: 'var(--fk)',
                  fontWeight: 900,
                  fontSize: 72,
                  lineHeight: 1,
                  color: step.accent,
                  opacity: 0.18,
                  position: 'absolute',
                  top: 24,
                  right: 28,
                }}>
                  {step.num}
                </div>

                {/* Tag */}
                <div style={{
                  fontFamily: 'var(--fm)',
                  fontSize: 9,
                  letterSpacing: 3,
                  color: step.accent,
                  marginBottom: 16,
                  opacity: 0.75,
                }}>
                  {step.tag}
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily: 'var(--fk)',
                  fontWeight: 900,
                  fontSize: 'clamp(22px,2.5vw,28px)',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: 'var(--cream)',
                  marginBottom: 16,
                  lineHeight: 1.1,
                }}>
                  {step.title}
                </h3>

                {/* Body */}
                <p style={{
                  fontFamily: 'var(--fb)',
                  fontSize: 15,
                  color: 'rgba(245,240,232,.6)',
                  lineHeight: 1.7,
                }}>
                  {step.body}
                </p>

                {/* Bottom accent line */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 32,
                  right: 32,
                  height: 2,
                  background: step.accent,
                  opacity: 0.3,
                  borderRadius: 1,
                }} />
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Connector line between step 1 and 2 */}
        <FadeIn delay={0.4} y={0}>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(0,212,240,.06)',
              border: '1px solid rgba(0,212,240,.18)',
              borderRadius: 100,
              padding: '12px 24px',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' }} />
              <span style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 3, color: 'var(--accent)' }}>
                NO APP DOWNLOAD FOR ATHLETES · NO ACCOUNTS · NO HARDWARE REQUIRED
              </span>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' }} />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
