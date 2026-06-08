'use client'
import { useState } from 'react'
import FadeIn from '@/components/ui/FadeIn'
import Magnet from '@/components/ui/Magnet'

const features = [
  'Cloud-based — works in any browser',
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
  const [trialEmail, setTrialEmail] = useState('')
  const [trialState, setTrialState] = useState<'idle'|'loading'|'done'|'error'>('idle')
  const [trialMsg, setTrialMsg] = useState('')
  const [showTrial, setShowTrial] = useState(false)

  async function startTrial() {
    if (!trialEmail.includes('@')) { setTrialMsg('Enter a valid email.'); setTrialState('error'); return; }
    setTrialState('loading')
    try {
      const res = await fetch('/api/trial', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: trialEmail }) })
      const data = await res.json()
      if (data.ok) { setTrialState('done') } else { setTrialMsg(data.msg || 'Something went wrong.'); setTrialState('error') }
    } catch { setTrialMsg('Network error — try again.'); setTrialState('error') }
  }

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

      <FadeIn delay={0.1} y={20}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
          {[
            { label: 'TrainingPeaks', price: '$420/yr', note: 'Endurance only' },
            { label: 'CoachMePlus',   price: '$348/yr', note: 'No combat sports' },
            { label: 'TeamBuildr',    price: '$588/yr', note: 'No check-in links' },
          ].map((c) => (
            <div key={c.label} style={{
              background: 'rgba(255,255,255,.03)',
              border: '1px solid rgba(255,255,255,.07)',
              borderRadius: 10,
              padding: '10px 18px',
              textAlign: 'center',
              opacity: 0.55,
            }}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', textDecoration: 'line-through' }}>{c.price}</div>
              <div style={{ fontFamily: 'var(--fc)', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{c.label}</div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1, color: 'var(--muted2)', marginTop: 2 }}>{c.note}</div>
            </div>
          ))}
          <div style={{
            background: 'rgba(200,137,42,.08)',
            border: '1px solid rgba(200,137,42,.35)',
            borderRadius: 10,
            padding: '10px 18px',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 2, color: 'var(--amber)' }}>$99 ONCE</div>
            <div style={{ fontFamily: 'var(--fc)', fontSize: 12, color: 'var(--cream)', marginTop: 2 }}>strikepanel</div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 1, color: 'var(--accent)', marginTop: 2 }}>Combat sports · AI · Check-ins</div>
          </div>
        </div>
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
            <span style={{ fontFamily: 'var(--fb)', color: 'var(--amber)', fontSize: 13, letterSpacing: 2, fontWeight: 700, marginLeft: 4 }}>ONE-TIME</span>
          </div>

          <div style={{
            fontFamily: 'var(--fm)',
            fontSize: 10,
            letterSpacing: 3,
            color: 'var(--muted)',
            marginBottom: 20,
          }}>
            EVERYTHING INCLUDED · NO SUBSCRIPTION
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 36 }}>
            {[
              { icon: '↩', text: '30-DAY REFUND POLICY' },
              { icon: '🔒', text: 'SECURE CHECKOUT' },
              { icon: '⚡', text: 'INSTANT ACCESS' },
            ].map(({ icon, text }) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 2,
                color: 'var(--muted2)',
              }}>
                <span style={{ fontSize: 11 }}>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
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
              href="https://payhip.com/Strikepanel"
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
              Get Instant Access — $99
            </a>
          </Magnet>

          {/* Trial CTA */}
          {!showTrial && trialState !== 'done' && (
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <button
                onClick={() => setShowTrial(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--muted)', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.2)' }}
              >
                Not sure? Try free for 14 days →
              </button>
            </div>
          )}

          {showTrial && trialState !== 'done' && (
            <div style={{ marginTop: 20, padding: '18px 20px', background: 'rgba(0,212,240,0.04)', border: '1px solid rgba(0,212,240,0.15)', borderRadius: 14 }}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 3, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 10 }}>14-Day Free Trial</div>
              <div style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.5 }}>Full access. No credit card. Key sent to your inbox instantly.</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  value={trialEmail}
                  onChange={e => { setTrialEmail(e.target.value); setTrialState('idle'); }}
                  placeholder="your@email.com"
                  style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#f5f0e8', fontFamily: 'var(--fb)', fontSize: 14, outline: 'none' }}
                />
                <button
                  onClick={startTrial}
                  disabled={trialState === 'loading'}
                  style={{ background: 'rgba(0,212,240,0.12)', border: '1px solid rgba(0,212,240,0.3)', color: '#00D4F0', fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 2, padding: '10px 18px', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap', textTransform: 'uppercase' }}
                >
                  {trialState === 'loading' ? '...' : 'Start Trial'}
                </button>
              </div>
              {trialState === 'error' && <div style={{ fontFamily: 'var(--fb)', fontSize: 12, color: '#FF3C3C', marginTop: 8 }}>{trialMsg}</div>}
            </div>
          )}

          {trialState === 'done' && (
            <div style={{ marginTop: 20, padding: '18px 20px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>✓</div>
              <div style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--green)', fontWeight: 600 }}>Trial key sent — check your inbox.</div>
              <div style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>14 days full access. Upgrade to lifetime at any time.</div>
            </div>
          )}
        </div>
      </FadeIn>
    </section>
  )
}
