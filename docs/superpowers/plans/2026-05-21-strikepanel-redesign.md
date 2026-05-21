# StrikePanel Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply Jack's visual design language (Kanit font, gradient headings, Framer Motion FadeIn/Magnet, video parallax) to the StrikePanel `/` landing page — all content and brand colours stay identical.

**Architecture:** Move shared `FadeIn` and `Magnet` components to `components/ui/` so both `/jack` and `/` share them; update 12 files across nav, hero, and all sections; rewrite Hero, Problem, and Pricing from scratch; apply light font + animation upgrades to the remaining sections.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion 12 (`useScroll`, `useTransform`, `motion.div`, `FadeIn`, `Magnet`), Kanit font via Google Fonts.

---

## File Map

| File | Action |
|------|--------|
| `components/ui/FadeIn.tsx` | **Create** (move from `components/jack/ui/`) |
| `components/ui/Magnet.tsx` | **Create** (move from `components/jack/ui/`) |
| `components/jack/ui/FadeIn.tsx` | **Delete** (moved) |
| `components/jack/ui/Magnet.tsx` | **Delete** (moved) |
| `components/jack/sections/HeroSection.tsx` | **Modify** — update imports |
| `components/jack/sections/AboutSection.tsx` | **Modify** — update imports |
| `components/jack/sections/ServicesSection.tsx` | **Modify** — update imports |
| `app/globals.css` | **Modify** — add Kanit font + `--fk` variable |
| `app/page.tsx` | **Modify** — remove `<Stats>` and `<RevealWrapper>` |
| `public/training.mp4` | **Add** — copy from `C:\Users\steph\Downloads\277900_medium.mp4` |
| `components/nav/Nav.tsx` | **Modify** — Kanit + Magnet CTA + FadeIn |
| `components/hero/Hero.tsx` | **Rewrite** — video parallax, grain, frosted stats bar |
| `components/sections/Problem.tsx` | **Rewrite** — white bg, rounded top, FadeIn list |
| `components/sections/Demo.tsx` | **Modify** — Kanit h2 + gradient text + FadeIn |
| `components/sections/features.module.css` | **Modify** — Kanit tab font |
| `components/sections/Features.tsx` | **Modify** — Kanit h2 + gradient text + FadeIn |
| `components/sections/CrossPlatform.tsx` | **Modify** — Kanit h2 + gradient text + FadeIn |
| `components/sections/Social.tsx` | **Modify** — Kanit quote font + FadeIn |
| `components/sections/Pricing.tsx` | **Rewrite** — dark rounded top, Kanit price, Magnet CTA |
| `components/sections/Footer.tsx` | **Modify** — Kanit logo + nav link font |

**Verify command (run after each task):** `cd C:\Users\steph\website-project && npx tsc --noEmit`

---

## Task 1: Relocate FadeIn + Magnet to `components/ui/`; update Jack imports

**Files:**
- Create: `components/ui/FadeIn.tsx`
- Create: `components/ui/Magnet.tsx`
- Delete: `components/jack/ui/FadeIn.tsx`
- Delete: `components/jack/ui/Magnet.tsx`
- Modify: `components/jack/sections/HeroSection.tsx`
- Modify: `components/jack/sections/AboutSection.tsx`
- Modify: `components/jack/sections/ServicesSection.tsx`

- [ ] **Step 1: Create `components/ui/FadeIn.tsx`**

```tsx
'use client'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  x?: number
  y?: number
  className?: string
}

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  className,
}: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Create `components/ui/Magnet.tsx`**

```tsx
'use client'
import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react'

interface MagnetProps {
  children: ReactNode
  padding?: number
  strength?: number
  activeTransition?: string
  inactiveTransition?: string
  className?: string
}

export default function Magnet({
  children,
  padding = 150,
  strength = 3,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.6s ease-in-out',
  className,
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('translate3d(0,0,0)')
  const [transition, setTransition] = useState(inactiveTransition)
  const isActive = useRef(false)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = e.clientX - centerX
    const dy = e.clientY - centerY
    const distX = Math.abs(e.clientX - rect.left - rect.width / 2)
    const distY = Math.abs(e.clientY - rect.top - rect.height / 2)
    const withinX = distX < rect.width / 2 + padding
    const withinY = distY < rect.height / 2 + padding

    if (withinX && withinY) {
      if (!isActive.current) {
        isActive.current = true
        setTransition(activeTransition)
      }
      setTransform(`translate3d(${dx / strength}px, ${dy / strength}px, 0)`)
    } else if (isActive.current) {
      isActive.current = false
      setTransition(inactiveTransition)
      setTransform('translate3d(0,0,0)')
    }
  }, [padding, strength, activeTransition, inactiveTransition])

  const handleMouseLeave = useCallback(() => {
    isActive.current = false
    setTransition(inactiveTransition)
    setTransform('translate3d(0,0,0)')
  }, [inactiveTransition])

  const attachListeners = useCallback(() => {
    window.addEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  const detachListeners = useCallback(() => {
    window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  const handleMouseLeaveAndDetach = useCallback(() => {
    detachListeners()
    handleMouseLeave()
  }, [detachListeners, handleMouseLeave])

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [handleMouseMove])

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={attachListeners}
      onMouseLeave={handleMouseLeaveAndDetach}
      style={{ transform, transition, willChange: 'transform', display: 'inline-block' }}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Update `components/jack/sections/HeroSection.tsx` imports**

Find lines 2–3 (the FadeIn and Magnet imports):
```tsx
import FadeIn from '../ui/FadeIn'
import Magnet from '../ui/Magnet'
```
Replace with:
```tsx
import FadeIn from '@/components/ui/FadeIn'
import Magnet from '@/components/ui/Magnet'
```

- [ ] **Step 4: Update `components/jack/sections/AboutSection.tsx` import**

Find line 1:
```tsx
import FadeIn from '../ui/FadeIn'
```
Replace with:
```tsx
import FadeIn from '@/components/ui/FadeIn'
```

- [ ] **Step 5: Update `components/jack/sections/ServicesSection.tsx` import**

Find line 1:
```tsx
import FadeIn from '../ui/FadeIn'
```
Replace with:
```tsx
import FadeIn from '@/components/ui/FadeIn'
```

- [ ] **Step 6: Delete old files**

```bash
rm "C:\Users\steph\website-project\components\jack\ui\FadeIn.tsx"
rm "C:\Users\steph\website-project\components\jack\ui\Magnet.tsx"
```

- [ ] **Step 7: Verify TypeScript**

```bash
cd C:\Users\steph\website-project && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 8: Commit**

```bash
git add components/ui/FadeIn.tsx components/ui/Magnet.tsx
git add components/jack/sections/HeroSection.tsx components/jack/sections/AboutSection.tsx components/jack/sections/ServicesSection.tsx
git rm components/jack/ui/FadeIn.tsx components/jack/ui/Magnet.tsx
git commit -m "refactor: move FadeIn + Magnet to components/ui/ for site-wide use"
```

---

## Task 2: Add Kanit font and `--fk` CSS variable

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Edit the Google Fonts import URL in `app/globals.css` line 1**

Current line 1:
```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap');
```
Replace with:
```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@300;400;500;600&family=Kanit:wght@300;400;700;900&display=swap');
```

- [ ] **Step 2: Add `--fk` variable after the `--fm` line in `:root`**

Find:
```css
  --fm: 'IBM Plex Mono', monospace;
```
Replace with:
```css
  --fm: 'IBM Plex Mono', monospace;
  --fk: 'Kanit', sans-serif;
```

- [ ] **Step 3: Verify the file looks correct** — check that `:root` block now contains `--fk: 'Kanit', sans-serif;` and the Google Fonts URL contains `family=Kanit:wght@300;400;700;900`.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "style: add Kanit font and --fk CSS variable"
```

---

## Task 3: Clean up `page.tsx` — remove Stats and RevealWrapper

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace the entire `app/page.tsx` with this**

```tsx
import Nav from '@/components/nav/Nav'
import Hero from '@/components/hero/Hero'
import Ticker from '@/components/sections/Ticker'
import Problem from '@/components/sections/Problem'
import Demo from '@/components/sections/Demo'
import Features from '@/components/sections/Features'
import CrossPlatform from '@/components/sections/CrossPlatform'
import Social from '@/components/sections/Social'
import Pricing from '@/components/sections/Pricing'
import Footer from '@/components/sections/Footer'

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <Problem />
        <Demo />
        <Features />
        <CrossPlatform />
        <Social />
        <Pricing />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd C:\Users\steph\website-project && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "refactor: remove Stats section and RevealWrapper from page layout"
```

---

## Task 4: Nav — Kanit typography + Magnet CTA + FadeIn mount animation

**Files:**
- Modify: `components/nav/Nav.tsx`

- [ ] **Step 1: Replace the entire `components/nav/Nav.tsx` with this**

```tsx
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
          {[['FEATURES', '#features'], ['DEMO', '#demo'], ['PRICING', '#pricing']].map(([label, href]) => (
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
              href="#pricing"
              style={{
                background: 'linear-gradient(135deg,#c8892a,#e0a83a)',
                color: '#000', fontWeight: 700, fontFamily: 'var(--fk)',
                borderRadius: 100, padding: '10px 22px', fontSize: 13,
                letterSpacing: 1, boxShadow: '0 0 24px rgba(200,137,42,.35)',
                transition: 'box-shadow .2s',
                display: 'inline-block',
              }}
            >
              START FREE TRIAL
            </a>
          </Magnet>
        </div>
      </FadeIn>
    </nav>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd C:\Users\steph\website-project && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/nav/Nav.tsx
git commit -m "feat: apply Kanit font, Magnet CTA, and FadeIn animation to Nav"
```

---

## Task 5: Hero — full rewrite with video parallax, grain overlay, and frosted stats bar

**Files:**
- Add: `public/training.mp4`
- Rewrite: `components/hero/Hero.tsx`

- [ ] **Step 1: Copy training video to `public/`**

```bash
copy "C:\Users\steph\Downloads\277900_medium.mp4" "C:\Users\steph\website-project\public\training.mp4"
```

Verify the file exists:
```bash
dir "C:\Users\steph\website-project\public\training.mp4"
```

- [ ] **Step 2: Replace the entire `components/hero/Hero.tsx` with this**

```tsx
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

// SVG fractal noise encoded for use as a CSS background-image
const GRAIN_SVG = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  // Video moves down 120px over the full scroll of the hero section (parallax)
  const y = useTransform(scrollYProgress, [0, 1], [0, 120])

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
      {/* ── Parallax video layer ── */}
      <motion.div
        style={{
          y,
          position: 'absolute',
          inset: '-10%',
          zIndex: 0,
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
        {/* marginTop: auto pushes all content to the lower half of the section */}
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
              fontSize: 'clamp(72px,13vw,160px)',
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
                <a href="#pricing" style={{
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
                <a href="#demo" style={{
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
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd C:\Users\steph\website-project && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add public/training.mp4 components/hero/Hero.tsx
git commit -m "feat: rewrite Hero with video parallax, film grain overlay, and frosted stats bar"
```

---

## Task 6: Problem — full rewrite with white background and rounded top

**Files:**
- Rewrite: `components/sections/Problem.tsx`

- [ ] **Step 1: Replace the entire `components/sections/Problem.tsx` with this**

```tsx
'use client'
import FadeIn from '@/components/ui/FadeIn'

const problems = [
  'Tracking athletes in spreadsheets',
  'No fight camp timeline tools',
  'Guessing readiness and recovery',
  'Losing athlete history between camps',
]
const fixes = [
  'One dashboard for every athlete',
  'Full fight camp timelines with phase tracking',
  'Daily readiness scores backed by real data',
  'Complete athlete history, always accessible',
]

export default function Problem() {
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 5,
        background: '#ffffff',
        borderRadius: '60px 60px 0 0',
        marginTop: -40,
        padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,80px)',
      }}
    >
      {/* Section heading */}
      <FadeIn delay={0} y={40}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(48px,8vw,96px)' }}>
          <div style={{
            fontFamily: 'var(--fm)',
            fontSize: 10,
            letterSpacing: 4,
            color: '#c8892a',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            // THE PROBLEM &amp; THE FIX
          </div>
          <h2 style={{
            fontFamily: 'var(--fk)',
            fontWeight: 900,
            fontSize: 'clamp(3rem,9vw,120px)',
            color: '#0C0C0C',
            lineHeight: 0.9,
            textTransform: 'uppercase',
          }}>
            COACHING<br />
            ON SPREADSHEETS<br />
            IS KILLING<br />
            YOUR EDGE
          </h2>
        </div>
      </FadeIn>

      {/* Two-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, maxWidth: 1200, margin: '0 auto' }}>

        {/* Left: The Problem */}
        <div>
          <div style={{
            fontFamily: 'var(--fm)',
            fontSize: 10,
            letterSpacing: 4,
            color: '#ef4444',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}>
            // THE PROBLEM
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {problems.map((p, i) => (
              <FadeIn key={p} delay={i * 0.1} y={20}>
                <div style={{
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                  paddingTop: 20,
                  paddingBottom: 20,
                  borderBottom: '1px solid rgba(12,12,12,0.1)',
                }}>
                  <span style={{
                    color: '#ef4444',
                    fontFamily: 'var(--fk)',
                    fontWeight: 700,
                    fontSize: 20,
                    flexShrink: 0,
                    lineHeight: 1.3,
                  }}>✕</span>
                  <span style={{
                    fontFamily: 'var(--fb)',
                    fontSize: 'clamp(15px,1.8vw,18px)',
                    color: '#0C0C0C',
                    lineHeight: 1.5,
                  }}>{p}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Right: The Fix */}
        <div>
          <div style={{
            fontFamily: 'var(--fm)',
            fontSize: 10,
            letterSpacing: 4,
            color: '#10b981',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}>
            // THE FIX
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {fixes.map((f, i) => (
              <FadeIn key={f} delay={0.1 + i * 0.1} y={20}>
                <div style={{
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                  paddingTop: 20,
                  paddingBottom: 20,
                  borderBottom: '1px solid rgba(12,12,12,0.1)',
                }}>
                  <span style={{
                    color: '#10b981',
                    fontFamily: 'var(--fk)',
                    fontWeight: 700,
                    fontSize: 20,
                    flexShrink: 0,
                    lineHeight: 1.3,
                  }}>✓</span>
                  <span style={{
                    fontFamily: 'var(--fb)',
                    fontSize: 'clamp(15px,1.8vw,18px)',
                    color: '#0C0C0C',
                    lineHeight: 1.5,
                  }}>{f}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd C:\Users\steph\website-project && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/sections/Problem.tsx
git commit -m "feat: rewrite Problem section with white background, rounded top, and FadeIn list animations"
```

---

## Task 7: Demo — Kanit heading + gradient text + FadeIn

**Files:**
- Modify: `components/sections/Demo.tsx`

- [ ] **Step 1: Replace the entire `components/sections/Demo.tsx` with this**

```tsx
import FadeIn from '@/components/ui/FadeIn'

export default function Demo() {
  return (
    <section id="demo" style={{ padding: 'clamp(80px,10vw,130px) clamp(20px,5vw,80px)', textAlign: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(0,212,240,.06),transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <FadeIn delay={0} y={40}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12 }}>// LIVE DEMO</div>
          <h2 style={{
            fontFamily: 'var(--fk)',
            fontWeight: 900,
            fontSize: 'clamp(36px,5vw,64px)',
            marginBottom: 8,
            letterSpacing: 2,
            background: 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>SEE IT IN ACTION</h2>
          <p style={{ fontFamily: 'var(--fb)', color: 'var(--muted)', marginBottom: 40, fontSize: 16 }}>No signup required — try the real app</p>
        </FadeIn>
        <FadeIn delay={0.15} y={20}>
          <div style={{ display: 'inline-block', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,212,240,.15)', boxShadow: '0 0 80px rgba(0,212,240,.08),0 32px 64px rgba(0,0,0,.6)' }}>
            <iframe src="https://strikepanel.vercel.app/demo" width={820} height={580} style={{ display: 'block', border: 'none', background: '#04070f' }} title="StrikePanel™ Live Demo" loading="lazy" />
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd C:\Users\steph\website-project && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/sections/Demo.tsx
git commit -m "feat: apply Kanit gradient heading and FadeIn animations to Demo section"
```

---

## Task 8: Features — Kanit heading + Kanit tab font + FadeIn

**Files:**
- Modify: `components/sections/features.module.css`
- Modify: `components/sections/Features.tsx`

- [ ] **Step 1: Update `components/sections/features.module.css` — change tab font from `var(--fm)` to `var(--fk)`**

Find:
```css
.tab {
  font-family: var(--fm); font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
```
Replace with:
```css
.tab {
  font-family: var(--fk); font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
```

- [ ] **Step 2: In `components/sections/Features.tsx`, update the section heading block (lines 261–266)**

Find:
```tsx
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <div style={{ fontFamily:'var(--fm)', fontSize:10, letterSpacing:4, color:'var(--accent)', textTransform:'uppercase', marginBottom:12 }}>// FEATURES</div>
          <h2 style={{ fontFamily:'var(--fh)', fontSize:'clamp(40px,5vw,72px)', letterSpacing:2 }}>EVERY TOOL A COACH NEEDS</h2>
        </div>
```
Replace with:
```tsx
        <FadeIn delay={0} y={40}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ fontFamily:'var(--fm)', fontSize:10, letterSpacing:4, color:'var(--accent)', textTransform:'uppercase', marginBottom:12 }}>// FEATURES</div>
            <h2 style={{
              fontFamily: 'var(--fk)',
              fontWeight: 900,
              fontSize: 'clamp(40px,5vw,72px)',
              letterSpacing: 2,
              background: 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>EVERY TOOL A COACH NEEDS</h2>
          </div>
        </FadeIn>
```

- [ ] **Step 3: Add the FadeIn import at the top of `components/sections/Features.tsx`**

Find line 1:
```tsx
'use client'
```
Replace with:
```tsx
'use client'
import FadeIn from '@/components/ui/FadeIn'
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd C:\Users\steph\website-project && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add components/sections/Features.tsx components/sections/features.module.css
git commit -m "feat: apply Kanit font and FadeIn animation to Features section heading and tabs"
```

---

## Task 9: CrossPlatform — Kanit heading + gradient text + FadeIn

**Files:**
- Modify: `components/sections/CrossPlatform.tsx`

- [ ] **Step 1: Replace the entire `components/sections/CrossPlatform.tsx` with this**

```tsx
import FadeIn from '@/components/ui/FadeIn'
import DeviceParallax from './DeviceParallax'

const bullets = [
  'WORKS OFFLINE',
  'ONE LICENSE',
  'HOME SCREEN INSTALL',
  'YOUR DATA, NEVER OURS',
]

export default function CrossPlatform() {
  return (
    <section style={{ background: 'var(--bg)', padding: 'clamp(80px,10vw,130px) clamp(20px,5vw,64px) 0', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <FadeIn delay={0} y={40}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', marginBottom: 64 }}>
            <div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12 }}>// CROSS-PLATFORM</div>
              <h2 style={{
                fontFamily: 'var(--fk)',
                fontWeight: 900,
                fontSize: 'clamp(56px,8vw,110px)',
                lineHeight: .92,
                letterSpacing: 2,
                background: 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                RUNS ON<br />EVERYTHING.
              </h2>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 16, color: 'rgba(245,240,232,.65)', lineHeight: 1.7, marginBottom: 28 }}>
                Phone, tablet, laptop. Install from your browser — no app store, no update prompts, works offline. One license covers every device you own.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {bullets.map((b) => (
                  <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase' }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={0.15} y={20}>
          <DeviceParallax />
        </FadeIn>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd C:\Users\steph\website-project && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/sections/CrossPlatform.tsx
git commit -m "feat: apply Kanit gradient heading and FadeIn animations to CrossPlatform section"
```

---

## Task 10: Social — Kanit quote font + FadeIn

**Files:**
- Modify: `components/sections/Social.tsx`

- [ ] **Step 1: Replace the entire `components/sections/Social.tsx` with this**

```tsx
import FadeIn from '@/components/ui/FadeIn'

export default function Social() {
  return (
    <section style={{ padding: 'clamp(80px,10vw,130px) clamp(20px,5vw,80px)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <FadeIn delay={0} y={40}>
          <div style={{ fontFamily: 'var(--fk)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 40 }}>// WHAT COACHES SAY</div>
          <div style={{ background: 'rgba(8,14,26,.9)', border: '1px solid rgba(255,255,255,.07)', borderLeft: '3px solid var(--amber)', borderRadius: 16, padding: 40, textAlign: 'left' }}>
            <p style={{ fontFamily: 'var(--fk)', fontWeight: 300, fontSize: 'clamp(18px,2.5vw,24px)', lineHeight: 1.6, fontStyle: 'italic', color: 'var(--cream)', marginBottom: 28 }}>
              &quot;Finally a tool built for combat sports, not ported from a generic fitness app. My fighters&apos; readiness is up, weight cuts are smoother, and I spend less time on spreadsheets and more time coaching.&quot;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#c8892a,#e0a83a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--fk)', fontWeight: 900, fontSize: 22, color: '#000' }}>R</div>
              <div>
                <div style={{ fontFamily: 'var(--fk)', fontWeight: 700, fontSize: 15 }}>Ray Torres</div>
                <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'var(--muted)' }}>HEAD COACH · 12 FIGHTERS</div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd C:\Users\steph\website-project && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/sections/Social.tsx
git commit -m "feat: apply Kanit font and FadeIn animation to Social testimonial section"
```

---

## Task 11: Pricing — full rewrite with dark rounded top, Kanit gradient heading, Magnet CTA

**Files:**
- Rewrite: `components/sections/Pricing.tsx`

- [ ] **Step 1: Replace the entire `components/sections/Pricing.tsx` with this**

```tsx
'use client'
import FadeIn from '@/components/ui/FadeIn'
import Magnet from '@/components/ui/Magnet'

const features = [
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
            <span style={{ fontFamily: 'var(--fb)', color: 'var(--muted)', fontSize: 16 }}>/mo</span>
          </div>

          <div style={{
            fontFamily: 'var(--fm)',
            fontSize: 10,
            letterSpacing: 3,
            color: 'var(--muted)',
            marginBottom: 36,
          }}>
            EVERYTHING INCLUDED · CANCEL ANYTIME
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
              href="https://strikepanel.vercel.app"
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
              Start Your Free Trial
            </a>
          </Magnet>
        </div>
      </FadeIn>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd C:\Users\steph\website-project && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/sections/Pricing.tsx
git commit -m "feat: rewrite Pricing with dark rounded-top section, Kanit gradient heading, and Magnet CTA"
```

---

## Task 12: Footer — Kanit logo and nav links

**Files:**
- Modify: `components/sections/Footer.tsx`

- [ ] **Step 1: Replace the entire `components/sections/Footer.tsx` with this**

```tsx
export default function Footer() {
  const links = [
    { label: 'Features', href: '#features' },
    { label: 'Demo',     href: '#demo' },
    { label: 'Pricing',  href: '#pricing' },
    { label: 'Privacy',  href: '/privacy' },
    { label: 'Terms',    href: '/terms' },
  ]
  return (
    <footer style={{ borderTop: '2px solid rgba(200,137,42,.22)', padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,80px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: 'var(--fk)', fontWeight: 900, fontSize: 22, letterSpacing: 4, marginBottom: 6 }}>
            STRIKE<span style={{ color: 'var(--accent)' }}>PANEL</span>™
          </div>
          <div style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--muted)' }}>Training intelligence for combat sports coaches.</div>
        </div>
        <nav style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {links.map((l) => (
            <a key={l.label} href={l.href} style={{ fontFamily: 'var(--fk)', fontWeight: 400, fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', transition: 'color .2s' }}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'var(--muted2)', textAlign: 'center' }}>
        © 2025 STRIKEPANEL™ · ALL RIGHTS RESERVED
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd C:\Users\steph\website-project && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Run a full build to validate the entire site**

```bash
cd C:\Users\steph\website-project && npm run build
```

Expected: `✓ Compiled successfully` with no type errors

- [ ] **Step 4: Commit**

```bash
git add components/sections/Footer.tsx
git commit -m "feat: apply Kanit font to Footer logo and navigation links"
```

---

## Visual Verification Checklist

After all tasks are complete, run `npm run dev` and visit `http://localhost:3000`. Confirm:

- [ ] Kanit font loads on all headings — no Bebas Neue visible anywhere on `/`
- [ ] Hero: training video plays as full-bleed background, B&W desaturated
- [ ] Hero: video moves at a slower rate than the page when scrolling (parallax effect)
- [ ] Hero: film grain texture visible as a subtle overlay on the video
- [ ] Hero: "COACH SMARTER. WIN MORE." has grey gradient text (no amber stroke on SMARTER.)
- [ ] Hero: "Get Access — $99" button has amber glow and responds to mouse proximity
- [ ] Hero: frosted stats bar visible at the bottom with 500+, $0, 14, ∞
- [ ] Problem section: appears with white background and rounded top corners over the section below Hero
- [ ] Problem: dark text on white, staggered FadeIn on each problem/fix row
- [ ] Nav: logo and links use Kanit; CTA responds to mouse proximity via Magnet
- [ ] All h2 headings across Demo, Features, CrossPlatform use Kanit gradient text
- [ ] Pricing: dark section with rounded top, large Kanit gradient heading, Magnet CTA
- [ ] `/jack` route still works and looks unchanged
