'use client'
import { useEffect, useState } from 'react'
import FadeIn from '@/components/ui/FadeIn'
import Magnet from '@/components/ui/Magnet'

const NAV_LINKS = [
  ['FEATURES', '#features'],
  ['DEMO', '/demo'],
  ['PRICING', '#pricing'],
] as const

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  return (
    <>
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

        {/* Desktop links */}
        <FadeIn delay={0.1} y={-20} duration={0.5}>
          <div className="sp-nav-links">
            {NAV_LINKS.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="sp-nav-link"
                style={{
                  fontFamily: 'var(--fk)', fontWeight: 400, fontSize: 12,
                  letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase',
                }}
              >
                {label}
              </a>
            ))}
            <Magnet padding={100} strength={4}>
              <a
                href="https://payhip.com/Strikepanel"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg,#c8892a,#e0a83a)',
                  color: '#000', fontWeight: 700, fontFamily: 'var(--fk)',
                  borderRadius: 100, padding: '10px 22px', fontSize: 13,
                  letterSpacing: 1, boxShadow: '0 0 24px rgba(200,137,42,.35)',
                  transition: 'box-shadow .2s', display: 'inline-block',
                }}
              >
                GET ACCESS
              </a>
            </Magnet>
          </div>
        </FadeIn>

        {/* Hamburger (mobile only) */}
        <button
          className={`sp-hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Mobile overlay menu */}
      <div className={`sp-mobile-menu${menuOpen ? ' open' : ''}`}>
        {NAV_LINKS.map(([label, href]) => (
          <a
            key={label}
            href={href}
            className="sp-mobile-link"
            onClick={close}
          >
            {label}
          </a>
        ))}
        <a
          href="https://payhip.com/Strikepanel"
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
          style={{
            background: 'linear-gradient(135deg,#c8892a,#e0a83a)',
            color: '#000', fontWeight: 700, fontFamily: 'var(--fk)',
            borderRadius: 100, padding: '18px 44px', fontSize: 18,
            letterSpacing: 1, marginTop: 16, display: 'inline-block',
            boxShadow: '0 0 40px rgba(200,137,42,.45)',
          }}
        >
          GET ACCESS
        </a>
      </div>
    </>
  )
}
