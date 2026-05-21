import FadeIn from '@/components/ui/FadeIn'

const posts = [
  {
    tag: 'FIGHT CAMP',
    title: 'How to build a 10-week fight camp that doesn\'t burn your fighter out',
    read: '4 min read',
  },
  {
    tag: 'WEIGHT CUTS',
    title: 'The data behind why your fighter falls apart in round 3',
    read: '5 min read',
  },
  {
    tag: 'OVERTRAINING',
    title: 'Readiness scores: the metric every combat coach should be tracking',
    read: '3 min read',
  },
]

export default function BlogTeaser() {
  return (
    <section
      style={{
        background: 'var(--surface)',
        padding: 'clamp(80px,10vw,130px) clamp(20px,5vw,80px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative line accent */}
      <div style={{
        position: 'absolute', top: 0, left: 'clamp(20px,5vw,80px)', right: 'clamp(20px,5vw,80px)',
        height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,.07), transparent)',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(40px,6vw,64px)', flexWrap: 'wrap', gap: 24 }}>
          <FadeIn delay={0} y={30}>
            <div>
              <div style={{
                fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4,
                color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 16,
              }}>
                // THE BLOG
              </div>
              <h2 style={{
                fontFamily: 'var(--fk)', fontWeight: 900,
                fontSize: 'clamp(2.2rem,5vw,60px)',
                textTransform: 'uppercase', lineHeight: 0.9,
                background: 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                TRAIN SMARTER.<br />COACH BETTER.
              </h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1} y={20}>
            <a
              href="/blog"
              style={{
                fontFamily: 'var(--fk)', fontWeight: 700, fontSize: 13,
                letterSpacing: 2, color: 'var(--accent)',
                border: '1px solid rgba(0,212,240,.25)',
                borderRadius: 100, padding: '10px 24px',
                transition: 'border-color .2s',
                display: 'inline-block',
                textTransform: 'uppercase',
              }}
            >
              READ THE BLOG →
            </a>
          </FadeIn>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {posts.map((post, i) => (
            <FadeIn key={post.title} delay={i * 0.1} y={20}>
              <a
                href="/blog"
                style={{
                  display: 'block',
                  background: 'rgba(255,255,255,.03)',
                  border: '1px solid rgba(255,255,255,.06)',
                  borderRadius: 16, padding: '28px 24px',
                  transition: 'border-color .2s, background .2s',
                }}
              >
                <div style={{
                  fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 3,
                  color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 14,
                }}>
                  {post.tag}
                </div>
                <h3 style={{
                  fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 16,
                  color: 'var(--cream)', lineHeight: 1.45, marginBottom: 20,
                }}>
                  {post.title}
                </h3>
                <div style={{
                  fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--muted)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ color: 'var(--accent)', fontSize: 14 }}>→</span>
                  {post.read}
                </div>
              </a>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3} y={16}>
          <p style={{
            fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--muted)',
            marginTop: 28, textAlign: 'center',
          }}>
            Fight camp planning, weight cuts, overtraining — written for coaches who take it seriously.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
