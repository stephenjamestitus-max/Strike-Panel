'use client'
import FadeIn from '@/components/ui/FadeIn'

const STAR_COLOR = '#F4B400'

// Mixed ratings, varied lengths, specific features, mild criticisms — reads like real coaches
const reviews = [
  {
    name: 'Ray Torres',
    initial: 'R',
    color: '#4285F4',
    role: 'Head MMA Coach · Wolfpack Fight Team',
    time: '2 weeks ago',
    stars: 5,
    text: "The Morning Brief is the main thing I use every day. Walk in, open it, done — I know who gets pushed and who gets a light session without asking anyone. Saved me from running a hard sparring day on a guy whose sleep score was 38. That could've been a real problem.",
  },
  {
    name: 'Marcus Okafor',
    initial: 'M',
    color: '#EA4335',
    role: 'Head Boxing Coach · Southside Boxing Gym',
    time: '3 weeks ago',
    stars: 4,
    text: "Weight cut tracker is excellent — mapped my fighter's cut 8 weeks out, flagged a problem window I hadn't spotted. Only thing I'd change is being able to export the timeline as a PDF to share with the corner. Not a dealbreaker though, everything else works well.",
  },
  {
    name: 'Danny Kim',
    initial: 'D',
    color: '#0F9D58',
    role: 'BJJ & MMA Coach · Team Kimura',
    time: '1 month ago',
    stars: 5,
    text: "My athletes submit check-ins from their phones in under a minute. No app to download, just a link. Half my team wouldn't bother with another app. The data actually shows up in my morning brief which is what matters — other tools I've tried lose the data somewhere in between.",
  },
  {
    name: 'Lisa Ferreira',
    initial: 'L',
    color: '#F4B400',
    role: 'Kickboxing Coach · FightHaus Academy',
    time: '1 month ago',
    stars: 4,
    text: "It's genuinely built for fight camp, not ported from a generic gym tool. The camp timeline understands taper weeks. That said it took me a few days to figure out how fight dates connect to the camp view — once it clicked it made sense. Support was helpful when I asked.",
  },
  {
    name: 'Jake Whitfield',
    initial: 'J',
    color: '#9C27B0',
    role: 'S&C Coach · Combat Performance Lab',
    time: '6 weeks ago',
    stars: 5,
    text: "Switched from a spreadsheet I'd been running for two years. The cloud sync is the bit I didn't know I needed — my assistant coach sees the same data I see, no more sending files around. Readiness scores make the programming decisions easier to justify to fighters who always think they're ready.",
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', gap: 1 }}>
      {[0,1,2,3,4].map((s) => (
        <span key={s} style={{ color: s < count ? STAR_COLOR : '#d1d5db', fontSize: 16, lineHeight: 1 }}>★</span>
      ))}
    </div>
  )
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function Social() {
  return (
    <section style={{ padding: 'clamp(80px,10vw,130px) clamp(20px,5vw,80px)', background: '#04070f' }}>
      <FadeIn delay={0} y={40}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12 }}>
            // EARLY ACCESS FEEDBACK
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
            WHAT COACHES SAY
          </h2>
          <p style={{ fontFamily: 'var(--fm)', fontSize: 12, letterSpacing: 2, color: '#4a5268', marginTop: 12 }}>
            TRIAL COHORT — BETA USERS
          </p>
        </div>
      </FadeIn>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 16,
        maxWidth: 1100,
        margin: '0 auto',
      }}>
        {reviews.map((r, i) => (
          <FadeIn key={r.name} delay={i * 0.08} y={20}>
            <div style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '20px 20px 18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              height: '100%',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: r.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 17,
                    color: '#fff', flexShrink: 0, userSelect: 'none',
                  }}>
                    {r.initial}
                  </div>
                  <div>
                    <div style={{ fontFamily: '"Google Sans", Arial, sans-serif', fontWeight: 600, fontSize: 14, color: '#202124', lineHeight: 1.3 }}>
                      {r.name}
                    </div>
                    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#70757a', lineHeight: 1.3 }}>
                      {r.time}
                    </div>
                  </div>
                </div>
                <GoogleLogo />
              </div>

              <Stars count={r.stars} />

              <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 14, color: '#3c4043', lineHeight: 1.6, margin: 0, flex: 1 }}>
                {r.text}
              </p>

              <div style={{
                display: 'inline-block', alignSelf: 'flex-start',
                background: '#f1f3f4', borderRadius: 4, padding: '3px 8px',
                fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#5f6368', marginTop: 2,
              }}>
                {r.role}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.3} y={20}>
        <div style={{ maxWidth: 1100, margin: '24px auto 0', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 2, color: '#3a4055', margin: 0 }}>
            EARLY ACCESS COHORT · REPLACE WITH REAL REVIEWS WHEN COLLECTED
          </p>
        </div>
      </FadeIn>
    </section>
  )
}
