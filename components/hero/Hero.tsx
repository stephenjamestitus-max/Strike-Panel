'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import FadeIn from '@/components/ui/FadeIn'
import Magnet from '@/components/ui/Magnet'

const stats = [
  { value: '500+', label: 'Athletes Tracked' },
  { value: '$0',   label: 'Setup Cost' },
  { value: '14',   label: 'Sport Categories' },
  { value: '∞',    label: 'AI Sessions' },
]

const GRAIN_SVG = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  // Three simultaneous scroll-driven transforms on the video layer:
  // 1. Drift up at 0.4× scroll speed (classic parallax depth)
  // 2. Slowly zoom in — feels like being pulled into the gym
  // 3. Fade to black as the section exits — smooth transition into Problem
  const videoY       = useTransform(scrollYProgress, [0, 1],    [0, 120])
  const videoScale   = useTransform(scrollYProgress, [0, 1],    [1, 1.12])
  const videoOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/* ── Cinematic video layer: parallax + zoom-in + fade-out ── */}
      <motion.div
        style={{
          y: videoY,
          scale: videoScale,
          opacity: videoOpacity,
          position: 'absolute',
          inset: '-10%',
          zIndex: 0,
          willChange: 'transform, opacity',
        }}
      >
        <video
          src="/training.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
            filter: 'saturate(0.15) brightness(0.75)',
          }}
        />
      </motion.div>

      {/* ── Film grain overlay ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          backgroundImage: GRAIN_SVG,
          backgroundSize: '180px 180px',
          opacity: 0.06,
          mixBlendMode: 'overlay',
        }}
      />

      {/* ── Scanlines ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
        }}
      />

      {/* ── Vignette + directional gradient ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background: [
            'radial-gradient(ellipse at 50% 50%, transparent 25%, rgba(4,7,15,0.75) 100%)',
            'linear-gradient(to right, rgba(4,7,15,0.92) 0%, rgba(4,7,15,0.65) 45%, rgba(4,7,15,0.25) 100%)',
            'linear-gradient(to top, rgba(4,7,15,1) 0%, transparent 55%)',
          ].join(', '),
        }}
      />

      {/* ── Hero content ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: 'clamp(100px,12vw,140px) clamp(20px,5vw,80px) 110px',
        }}
      >
        <div style={{ maxWidth: 700, marginTop: 'auto' }}>
          <FadeIn delay={0} y={-20} duration={0.6}>
            <div style={{
              fontFamily: 'var(--fm)',
              fontSize: 11,
              letterSpacing: 4,
              color: 'var(--accent)',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}>
              // TRAINING INTELLIGENCE
            </div>
          </FadeIn>

          <FadeIn delay={0.15} y={40} duration={0.8}>
            <h1 style={{
              fontFamily: 'var(--fk)',
              fontWeight: 900,
              fontSize: 'clamp(60px,10vw,120px)',
              lineHeight: 0.88,
              textTransform: 'uppercase',
              letterSpacing: '-1px',
              background: 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: 28,
            }}>
              COACH<br />
              SMARTER.<br />
              WIN MORE.
            </h1>
          </FadeIn>

          <FadeIn delay={0.3} y={20}>
            <p style={{
              fontFamily: 'var(--fb)',
              fontSize: 18,
              color: 'rgba(245,240,232,.7)',
              lineHeight: 1.65,
              maxWidth: 480,
              marginBottom: 40,
            }}>
              Morning briefs, fight camp timelines, AI session plans, and readiness scores — all in one dashboard built for combat sports.
            </p>
          </FadeIn>

          <FadeIn delay={0.45} y={20}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Magnet padding={100} strength={4}>
                <a href="https://payhip.com/Strikepanel" target="_blank" rel="noopener noreferrer" style={{
                  background: 'linear-gradient(135deg,#c8892a,#e0a83a)',
                  color: '#000',
                  fontWeight: 700,
                  fontFamily: 'var(--fk)',
                  borderRadius: 100,
                  padding: '14px 32px',
                  fontSize: 15,
                  boxShadow: '0 0 32px rgba(200,137,42,.45)',
                  letterSpacing: 0.5,
                  display: 'inline-block',
                }}>
                  Get Access — $99
                </a>
              </Magnet>
              <Magnet padding={100} strength={4}>
                <a href="/demo" style={{
                  border: '1px solid rgba(255,255,255,.18)',
                  color: 'var(--cream)',
                  borderRadius: 100,
                  padding: '14px 28px',
                  fontSize: 15,
                  background: 'rgba(255,255,255,.03)',
                  fontFamily: 'var(--fk)',
                  display: 'inline-block',
                }}>
                  Watch Demo
                </a>
              </Magnet>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* ── Frosted glass stats bar ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          background: 'rgba(4,7,15,0.55)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            style={{
              textAlign: 'center',
              padding: '20px 12px',
              borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            <div style={{
              fontFamily: 'var(--fk)',
              fontWeight: 900,
              fontSize: 'clamp(28px,4vw,48px)',
              color: 'var(--amber)',
              lineHeight: 1,
            }}>
              {s.value}
            </div>
            <div style={{
              fontFamily: 'var(--fm)',
              fontSize: 9,
              letterSpacing: 3,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              marginTop: 6,
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
