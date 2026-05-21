'use client'
import { useEffect, useState } from 'react'
import FadeIn from '@/components/ui/FadeIn'
import Magnet from '@/components/ui/Magnet'

const navLinks: [string, string][] = [
  ['FEATURES', '#features'],
  ['DEMO',     '/demo'],
  ['BLOG',     '/blog'],
  ['PRICING',  '#pricing'],
]

export default function Nav() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px clamp(16px,5vw,64px)',
          background: 'rgba(4,7,15,.95)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(255,255,255,.04)',
          transition: 'border-color .3s',
        }}
      >
        {/* Logo */}
        <FadeIn delay={0} y={-20} duration={0.5}>
          <a
            href="/landing"
            style={{ fontFamily: 'var(--fk)', fontWeight: 900, fontSize: 20, letterSpacing: 3 }}
          >
            STRIKE<span style={{ color: 'var(--accent)' }}>PANEL</span>™
          </a>
        </FadeIn>

        {/* ── Desktop: links + CTA ── */}
        <FadeIn delay={0.1} y={-20} duration={0.5}>
          <div className="nav-desktop" style={{ gap: 32, alignItems: 'center' }}>
            {navLinks.map(([label, href]) => (
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
                href="https://strikepanel.gumroad.com/l/strikepanel"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg,#c8892a,#e0a83a)',
                  color: '#000', fontWeight: 700, fontFamily: 'var(--fk)',
                  borderRadius: 100, padding: '10px 22px', fontSize: 13,
                  letterSpacing: 1, boxShadow: '0 0 24px rgba(200,137,42,.35)',
                  display: 'inline-block',
                }}
              >
                GET ACCESS — $99
              </a>
            </Magnet>
          </div>
        </FadeIn>

        {/* ── Mobile: compact CTA + hamburger ── */}
        <div className="nav-mobile" style={{ alignItems: 'center', gap: 10 }}>
          <a
            href="https://strikepanel.gumroad.com/l/strikepanel"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'linear-gradient(135deg,#c8892a,#e0a83a)',
              color: '#000', fontWeight: 700, fontFamily: 'var(--fk)',
              borderRadius: 100, padding: '8px 16px', fontSize: 12,
              letterSpacing: 0.5, display: 'inline-block',
              boxShadow: '0 0 16px rgba(200,137,42,.3)',
            }}
          >
            GET ACCESS
          </a>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,.15)',
              borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
              color: 'var(--cream)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <line x1="2" y1="5"  x2="16" y2="5"  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="2" y1="9"  x2="16" y2="9"  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="2" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ── Mobile dropdown menu ── */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 57,
            left: 0,
            right: 0,
            zIndex: 199,
            background: 'rgba(4,7,15,.98)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderBottom: '1px solid rgba(255,255,255,.08)',
            padding: '8px 0 16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {navLinks.map(([label, href]) => (
            <a
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: 'var(--fk)', fontWeight: 400, fontSize: 13,
                letterSpacing: '3px', color: 'var(--cream)', textTransform: 'uppercase',
                padding: '16px clamp(16px,5vw,64px)',
                borderBottom: '1px solid rgba(255,255,255,.05)',
                transition: 'color .2s',
              }}
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </>
  )
}
