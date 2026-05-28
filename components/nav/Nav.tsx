'use client'
import { useEffect, useState } from 'react'
import FadeIn from '@/components/ui/FadeIn'
import Magnet from '@/components/ui/Magnet'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px clamp(20px,5vw,64px)',
        background: 'rgba(4,7,15,.92)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(255,255,255,.04)',
        transition: 'border-color .3s',
      }}
    >
      <FadeIn delay={0} y={-20} duration={0.5}>
        <a href="/" style={{ fontFamily: 'var(--fk)', fontWeight: 900, fontSize: 22, letterSpacing: 4 }}>
          STRIKE<span style={{ color: 'var(--accent)' }}>PANEL</span>™
        </a>
      </FadeIn>

      <FadeIn delay={0.1} y={-20} duration={0.5}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {[['FEATURES', '#features'], ['DEMO', '/demo'], ['BLOG', '/blog'], ['PRICING', '#pricing']].map(([label, href]) => (
            <a
              key={label}
              href={href}
              style={{
                fontFamily: 'var(--fk)', fontWeight: 400, fontSize: 12,
                letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase',
                transition: 'color .2s',
              }}
            >
              {label}
            </a>
          ))}
          <Magnet padding={100} strength={4}>
            <a
              href="https://strikepane.gumroad.com/l/strikepane"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg,#c8892a,#e0a83a)',
                color: '#000', fontWeight: 700, fontFamily: 'var(--fk)',
                borderRadius: 100, padding: '10px 22px', fontSize: 13,
                letterSpacing: 1, boxShadow: '0 0 24px rgba(200,137,42,.35)',
                transition: 'box-shadow .2s',
                display: 'inline-block',
              }}
            >
              GET ACCESS — $99
            </a>
          </Magnet>
        </div>
      </FadeIn>
    </nav>
  )
}
