'use client'
import dynamic from 'next/dynamic'
import HeroWidget from './HeroWidget'

const HeroCanvas = dynamic(() => import('./HeroCanvas'), { ssr: false })

export default function Hero() {
  return (
    <section style={{
      minHeight: '100vh', position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center',
      padding: '0 clamp(20px,5vw,80px)',
    }}>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1600&q=80)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(.14) saturate(.4)',
      }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(105deg,rgba(4,7,15,.95) 0%,rgba(4,7,15,.6) 55%,transparent 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(180deg,transparent 70%,rgba(4,7,15,1) 100%)' }} />
      <div style={{ position: 'absolute', top: -200, left: -200, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,212,240,.09),transparent 70%)', animation: 'ambientPulse 7s ease-in-out infinite', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -150, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(200,137,42,.08),transparent 70%)', animation: 'ambientPulse 9s ease-in-out infinite', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(0,212,240,.032) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,240,.032) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 48, paddingTop: 80 }}>
        <div style={{ flex: '0 0 auto', maxWidth: 620 }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 16, animation: 'fadeUp .6s ease forwards' }}>
            // TRAINING INTELLIGENCE
          </div>
          <h1 style={{ fontFamily: 'var(--fh)', fontSize: 'clamp(74px,9.5vw,120px)', lineHeight: .92, letterSpacing: 2, marginBottom: 24, animation: 'fadeUp .8s .1s ease both' }}>
            COACH<br />
            <span style={{ WebkitTextStroke: '2px var(--accent)', color: 'transparent' }}>SMARTER.</span><br />
            WIN MORE.
          </h1>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 18, color: 'rgba(245,240,232,.7)', lineHeight: 1.65, maxWidth: 480, marginBottom: 36, animation: 'fadeUp .8s .2s ease both' }}>
            Morning briefs, fight camp timelines, AI session plans, and readiness scores — all in one dashboard built for combat sports.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', animation: 'fadeUp .8s .3s ease both' }}>
            <a href="#pricing" style={{ background: 'linear-gradient(135deg,#c8892a,#e0a83a)', color: '#000', fontWeight: 700, borderRadius: 100, padding: '14px 32px', fontSize: 15, boxShadow: '0 0 32px rgba(200,137,42,.4)', letterSpacing: .5 }}>
              Get Access — $99
            </a>
            <a href="#demo" style={{ border: '1px solid rgba(255,255,255,.14)', color: 'var(--cream)', borderRadius: 100, padding: '14px 28px', fontSize: 15, background: 'rgba(255,255,255,.03)' }}>
              Watch Demo
            </a>
          </div>
        </div>

        <div style={{ flex: '0 0 auto', position: 'relative', width: 400, height: 400 }}>
          <HeroCanvas />
          <div style={{ position: 'relative', zIndex: 5 }}>
            <HeroWidget />
          </div>
        </div>
      </div>
    </section>
  )
}
