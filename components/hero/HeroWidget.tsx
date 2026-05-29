'use client'
import { useRef, useEffect } from 'react'

const athletes = [
  { name: 'Priya Kapoor',   sport: 'Muay Thai · 52kg',  score: 91, color: '#10b981' },
  { name: 'Jake Sullivan',  sport: 'Boxing · 67kg',      score: 74, color: '#c8892a' },
  { name: 'Marcus Mendez',  sport: 'MMA · 77kg',         score: 38, color: '#ef4444' },
]

export default function HeroWidget() {
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = widgetRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect()
      const x = ((e.clientX - left) / width - 0.5) * 12
      const y = ((e.clientY - top) / height - 0.5) * -12
      el.style.transform = `perspective(1200px) rotateX(${y}deg) rotateY(${x}deg)`
    }
    const onLeave = () => { el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)' }
    document.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => { document.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) }
  }, [])

  return (
    <div
      ref={widgetRef}
      style={{
        background: 'linear-gradient(145deg,#0c1524,#080e1a)',
        border: '1px solid rgba(0,212,240,.18)',
        borderRadius: 16, padding: 24, minWidth: 340,
        boxShadow: '0 0 40px rgba(0,212,240,.07),0 0 0 1px rgba(0,212,240,.18)',
        animation: 'float 7s ease-in-out infinite, glow 4s ease-in-out infinite',
        position: 'relative', overflow: 'hidden',
        transition: 'transform .15s ease-out',
      }}
    >
      <div style={{ position: 'absolute', left: 0, right: 0, height: 4,
        background: 'linear-gradient(180deg,transparent,rgba(0,212,240,.08),transparent)',
        animation: 'scanline 4s linear infinite', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase' }}>// MORNING BRIEF</div>
          <div style={{ fontFamily: 'var(--fh)', fontSize: 22, letterSpacing: 2, marginTop: 2 }}>
            SQUAD AVG <span style={{ color: 'var(--amber)' }}>68</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-dot 2s infinite', marginLeft: 'auto', marginBottom: 4 }} />
          <div style={{ fontFamily: 'var(--fm)', fontSize: 9, color: 'var(--muted)' }}>3 ONLINE</div>
        </div>
      </div>

      {athletes.map((a) => (
        <div key={a.name} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', borderRadius: 8, marginBottom: 8,
          background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${a.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--fh)', fontSize: 14, color: a.color,
            }}>
              {a.name[0]}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--fc)', fontWeight: 600, fontSize: 13 }}>{a.name}</div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--muted)' }}>{a.sport}</div>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--fh)', fontSize: 24, color: a.color }}>{a.score}</div>
        </div>
      ))}

      <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
        {athletes.map((a) => (
          <div key={a.name} style={{ flex: 1, height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 2 }}>
            <div style={{ height: '100%', borderRadius: 2, background: a.color, width: `${a.score}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}
