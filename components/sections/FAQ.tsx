'use client'
import { useState } from 'react'
import FadeIn from '@/components/ui/FadeIn'

const faqs = [
  {
    q: 'Is there a subscription or monthly fee?',
    a: 'No. strikepane is a one-time payment of $99. You get lifetime access including all future updates. No renewals, no surprises.',
  },
  {
    q: 'Does it work offline?',
    a: 'Yes. strikepane is a Progressive Web App (PWA). Once installed, the core dashboard works completely offline — perfect for gyms with patchy Wi-Fi.',
  },
  {
    q: 'How many athletes can I track?',
    a: 'Unlimited. There\'s no cap on athletes, sessions, or data. Whether you coach 5 fighters or 50, the system scales without extra cost.',
  },
  {
    q: 'What is the AI Session Builder?',
    a: 'It\'s a built-in AI coach powered by Google Gemini. You describe your session goals, athlete readiness, and fight camp phase — it generates a complete training plan in seconds.',
  },
  {
    q: 'What happens after I purchase?',
    a: 'You\'ll receive an access key via Payhip immediately after payment. Open strikepane, enter your key, and you\'re live within minutes. No app store, no download — it installs as a PWA directly from your browser.',
  },
  {
    q: 'Does it work on mobile and iPad?',
    a: 'Yes. strikepane is built to work on any device — desktop, tablet, or phone. It\'s optimised for the iPad dashboard view coaches use courtside.',
  },
  {
    q: 'Can I try it before paying?',
    a: 'Yes. Hit "Try free for 14 days" on the pricing section, enter your email, and we\'ll send you a trial key instantly. Full access — no card required. At the end of 14 days you\'ll be prompted to grab the lifetime license for $99.',
  },
  {
    q: 'What if it\'s not right for me?',
    a: 'You\'re covered by a 30-day money-back guarantee. If strikepane isn\'t the right fit, email us and we\'ll refund you immediately — no questions asked.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section
      id="faq"
      style={{
        background: 'var(--bg)',
        padding: 'clamp(80px,10vw,130px) clamp(20px,5vw,80px)',
        position: 'relative',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '30%', right: '10%',
        width: 600, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse,rgba(0,212,240,.04),transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <FadeIn delay={0} y={40}>
          <div style={{
            fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4,
            color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 16,
          }}>
            // FAQ
          </div>
          <h2 style={{
            fontFamily: 'var(--fk)', fontWeight: 900,
            fontSize: 'clamp(2.5rem,6vw,72px)',
            textTransform: 'uppercase',
            background: 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 'clamp(40px,6vw,64px)',
            lineHeight: 0.9,
          }}>
            EVERYTHING<br />YOU NEED<br />TO KNOW
          </h2>
        </FadeIn>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {faqs.map((faq, i) => (
            <FadeIn key={faq.q} delay={i * 0.06} y={16}>
              <div
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', gap: 16, padding: '22px 0',
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 16,
                    color: open === i ? 'var(--cream)' : 'rgba(245,240,232,.75)',
                    transition: 'color .2s',
                  }}>
                    {faq.q}
                  </span>
                  <span style={{
                    fontFamily: 'var(--fk)', fontSize: 22, color: 'var(--accent)',
                    flexShrink: 0, lineHeight: 1,
                    transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
                    transition: 'transform .25s',
                    display: 'inline-block',
                  }}>
                    +
                  </span>
                </button>
                <div style={{
                  overflow: 'hidden',
                  maxHeight: open === i ? 300 : 0,
                  transition: 'max-height .35s ease',
                }}>
                  <p style={{
                    fontFamily: 'var(--fb)', fontSize: 15, lineHeight: 1.7,
                    color: 'var(--muted)', paddingBottom: 22,
                  }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* 30-day guarantee badge */}
        <FadeIn delay={0.4} y={20}>
          <div style={{
            marginTop: 56,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            background: 'rgba(16,185,129,0.07)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 16,
            padding: '24px 28px',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(16,185,129,0.15)',
              border: '2px solid rgba(16,185,129,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>
              🛡️
            </div>
            <div>
              <div style={{ fontFamily: 'var(--fk)', fontWeight: 700, fontSize: 16, color: 'var(--green)', marginBottom: 4 }}>
                30-Day Money-Back Guarantee
              </div>
              <div style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>
                Not the right fit? Email us within 30 days for a full refund — no questions asked.
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
