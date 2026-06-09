'use client'
import { useState } from 'react'
import FadeIn from '@/components/ui/FadeIn'

const athletes = [
  { name: 'PRIYA SHARMA',   score: 92, color: '#10b981', status: 'READY',   rec: 'PEAK LOAD — PUSH TODAY' },
  { name: 'JAKE THOMPSON',  score: 67, color: '#c8892a', status: 'CAUTION', rec: 'MODERATE INTENSITY ONLY' },
  { name: 'MARCUS MENDEZ',  score: 34, color: '#ef4444', status: 'REST',    rec: 'LIGHT WORK — FLAG FOR REVIEW' },
]

type State = 'idle' | 'loading' | 'success' | 'error'

export default function Demo() {
  const [email, setEmail]         = useState('')
  const [state, setState]         = useState<State>('idle')
  const [errMsg, setErrMsg]       = useState('')
  const [checkEmail, setCheckEmail] = useState('')
  const [checkState, setCheckState] = useState<'idle' | 'loading' | 'done'>('idle')

  async function submit() {
    const val = email.trim()
    if (!val || !val.includes('@')) return
    setState('loading')
    try {
      const res  = await fetch('/api/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: val.toLowerCase() }),
      })
      const data = await res.json()
      if (data.ok) {
        setState('success')
      } else {
        setErrMsg(data.msg || 'Something went wrong — try again.')
        setState('error')
      }
    } catch {
      setErrMsg('Could not reach the server. Check your connection.')
      setState('error')
    }
  }

  async function submitChecklist() {
    const val = checkEmail.trim()
    if (!val || !val.includes('@')) return
    setCheckState('loading')
    try {
      await fetch('/api/email-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: val.toLowerCase(), source: 'checklist' }),
      })
    } catch { /* silent */ }
    setCheckState('done')
  }

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
            // FREE TRIAL
          </div>
          <h2 style={{
            fontFamily: 'var(--fk)', fontWeight: 900,
            fontSize: 'clamp(36px,5vw,64px)',
            marginBottom: 8, letterSpacing: 2,
            background: 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            14 DAYS.<br />YOUR ATHLETES.<br />FULL ACCESS.
          </h2>
          <p style={{ fontFamily: 'var(--fb)', color: 'var(--muted)', marginBottom: 40, fontSize: 16 }}>
            Add your real fighters. Run real check-ins. No card required.
          </p>
        </FadeIn>

        <FadeIn delay={0.15} y={20}>
          {/* App preview card */}
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
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--fk)', fontWeight: 700, fontSize: 14, color: 'var(--cream)', letterSpacing: 1 }}>
                    {a.name}
                  </div>
                  <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', marginTop: 3 }}>
                    {a.rec}
                  </div>
                </div>
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

            {/* Gradient fade + trial form */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(4,7,15,1) 0%, rgba(4,7,15,.92) 38%, rgba(4,7,15,.4) 62%, transparent 80%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
              paddingBottom: 36, paddingLeft: 24, paddingRight: 24,
            }}>

              {state === 'idle' && (
                <div style={{ width: '100%', maxWidth: 400 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && submit()}
                      placeholder="coach@yourgym.com"
                      style={{
                        flex: 1,
                        background: 'rgba(8,14,30,0.9)',
                        border: '1px solid rgba(0,212,240,0.3)',
                        borderRadius: 8,
                        padding: '12px 16px',
                        color: 'var(--cream)',
                        fontFamily: 'var(--fb)',
                        fontSize: 13,
                        outline: 'none',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                      }}
                    />
                    <button
                      onClick={submit}
                      style={{
                        background: 'rgba(0,212,240,0.1)',
                        border: '1px solid rgba(0,212,240,0.4)',
                        borderRadius: 8,
                        padding: '12px 20px',
                        color: 'var(--accent)',
                        fontFamily: 'var(--fk)',
                        fontSize: 13,
                        letterSpacing: 1,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                      }}
                    >
                      START FREE TRIAL
                    </button>
                  </div>
                  <div style={{
                    fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 2,
                    color: 'rgba(122,133,160,0.5)', marginTop: 10, textAlign: 'center',
                  }}>
                    14 DAYS · NO CARD · FULL ACCESS · UP TO 20 ATHLETES
                  </div>
                </div>
              )}

              {state === 'loading' && (
                <div style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 2, color: 'var(--muted)' }}>
                  SENDING YOUR KEY…
                </div>
              )}

              {state === 'success' && (
                <div style={{
                  background: 'rgba(0,212,240,0.06)',
                  border: '1px solid rgba(0,212,240,0.2)',
                  borderRadius: 10,
                  padding: '20px 28px',
                  textAlign: 'center',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  width: '100%', maxWidth: 400,
                }}>
                  <div style={{ fontFamily: 'var(--fk)', fontSize: 20, letterSpacing: 2, color: 'var(--accent)', marginBottom: 8 }}>
                    CHECK YOUR EMAIL
                  </div>
                  <div style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--muted)', lineHeight: 1.65 }}>
                    Your 14-day trial key is on its way.<br />
                    Open strikepanel, paste the key, and you&apos;re live.
                  </div>
                </div>
              )}

              {state === 'error' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%', maxWidth: 400 }}>
                  <div style={{ fontFamily: 'var(--fb)', fontSize: 12, color: '#e05a5a' }}>{errMsg}</div>
                  <button
                    onClick={() => setState('idle')}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2,
                      color: 'var(--muted)', textDecoration: 'underline',
                    }}
                  >
                    TRY AGAIN
                  </button>
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Checklist email capture */}
        <FadeIn delay={0.25} y={20}>
          <div style={{ marginTop: 32, maxWidth: 420, margin: '32px auto 0' }}>
            <div style={{
              fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 2,
              color: 'rgba(122,133,160,0.4)', textAlign: 'center', marginBottom: 12,
            }}>
              NOT READY TO START? GET THE FREE CHECKLIST FIRST
            </div>
            {checkState === 'done' ? (
              <div style={{
                fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2,
                color: 'var(--accent)', textAlign: 'center',
              }}>
                CHECKLIST ON ITS WAY — CHECK YOUR INBOX
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  value={checkEmail}
                  onChange={e => setCheckEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitChecklist()}
                  placeholder="coach@yourgym.com"
                  disabled={checkState === 'loading'}
                  style={{
                    flex: 1,
                    background: 'rgba(8,14,30,0.6)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: 'var(--cream)',
                    fontFamily: 'var(--fb)',
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
                <button
                  onClick={submitChecklist}
                  disabled={checkState === 'loading'}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    padding: '10px 16px',
                    color: 'rgba(122,133,160,0.7)',
                    fontFamily: 'var(--fk)',
                    fontSize: 10,
                    letterSpacing: 1,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  SEND CHECKLIST
                </button>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
