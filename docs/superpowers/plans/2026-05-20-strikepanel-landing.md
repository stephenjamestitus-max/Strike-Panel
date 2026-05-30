# StrikePanel™ Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete StrikePanel™ marketing landing page in Next.js 15 (App Router) with React Three Fiber, Framer Motion, and Tailwind CSS.

**Architecture:** Modular React server-component architecture; each section is a dedicated file. Client-side interactivity (`'use client'`) scoped to Nav (scroll state), Hero (mouse parallax + R3F), and Features (tab state). Brand tokens live in `lib/constants.ts` and are surfaced as CSS custom properties in `globals.css`. Complex multi-shadow/pseudo-element styles use CSS Modules; everything else uses Tailwind utilities.

**Tech Stack:** Next.js 15 · React 19 · Tailwind CSS 4 · Framer Motion 12 · @react-three/fiber + @react-three/drei · Vitest + @testing-library/react

---

## File Map

```
app/
  layout.tsx            ← fonts, global meta, body background
  page.tsx              ← assembles all sections
  globals.css           ← CSS custom properties, keyframes, base resets

lib/
  constants.ts          ← brand color/font tokens as JS constants
  animations.ts         ← shared Framer Motion variants

components/
  ui/
    RevealWrapper.tsx   ← IntersectionObserver fade-up utility (client)
  nav/
    Nav.tsx             ← fixed nav, scroll-aware border (client)
  hero/
    Hero.tsx            ← layout shell (server)
    HeroWidget.tsx      ← readiness card, scanline, pulse dot (client)
    HeroCanvas.tsx      ← R3F particle scene (client, lazy)
  sections/
    Ticker.tsx          ← CSS marquee (server)
    Stats.tsx           ← 4-stat bar (server)
    Problem.tsx         ← two-column problem/fix (server)
    Demo.tsx            ← iframe embed (server)
    Features.tsx        ← 5-tab showcase (client)
    features.module.css ← tab pill styles
    CrossPlatform.tsx   ← CSS device frames section (server)
    devices/
      devices.module.css  ← all iPhone/MacBook/iPad CSS
      IPhone.tsx          ← iPhone 15 Pro frame + content
      MacBook.tsx         ← MacBook Pro 14" frame + content
      IPad.tsx            ← iPad Pro 11" frame + content
      AppContent.tsx      ← shared scaled app UI mockup
    Social.tsx          ← coach quote card (server)
    Pricing.tsx         ← pricing card (server)
    Footer.tsx          ← links + copyright (server)

tests/
  nav.test.tsx
  features.test.tsx
  reveal-wrapper.test.tsx
  hero-widget.test.tsx
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `vitest.config.ts`

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd C:/Users/steph/website-project
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```
When prompted, accept all defaults. This creates `app/`, `components/`, `public/`, `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`.

- [ ] **Step 2: Install additional dependencies**

```bash
cd C:/Users/steph/website-project
npm install framer-motion @react-three/fiber @react-three/drei three
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/three
```

- [ ] **Step 3: Create vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
})
```

- [ ] **Step 4: Create test setup file**

Create `tests/setup.ts`:
```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Verify scaffold**

```bash
cd C:/Users/steph/website-project && npm run build 2>&1 | tail -5
```
Expected: `✓ Compiled successfully` (or similar Next.js build success output).

- [ ] **Step 7: Commit**

```bash
cd C:/Users/steph/website-project
git init
git add package.json next.config.ts tailwind.config.ts tsconfig.json vitest.config.ts tests/setup.ts
git commit -m "chore: scaffold Next.js 15 + Tailwind + Framer Motion + R3F + Vitest"
```

---

## Task 2: Brand System

**Files:**
- Create: `lib/constants.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Write brand constants**

Create `lib/constants.ts`:
```ts
export const colors = {
  bg: '#04070f',
  surface: '#080e1a',
  card: '#0c1524',
  accent: '#00D4F0',
  amber: '#c8892a',
  gold: '#e0a83a',
  green: '#10b981',
  red: '#ef4444',
  purple: '#8b5cf6',
  cream: '#f5f0e8',
  muted: '#6b7894',
  muted2: '#4a566b',
} as const

export const fonts = {
  headline: "'Bebas Neue', sans-serif",
  body: "'Barlow', sans-serif",
  ui: "'IBM Plex Sans', sans-serif",
  mono: "'IBM Plex Mono', monospace",
  inter: "'Inter', sans-serif",
} as const

export const CTAPrimary =
  'bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-bold rounded-full px-8 py-3 shadow-[0_0_32px_rgba(200,137,42,0.4)] hover:shadow-[0_0_48px_rgba(200,137,42,0.6)] transition-shadow'
```

- [ ] **Step 2: Replace globals.css**

Replace the contents of `app/globals.css` with:
```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #04070f;
  --surface: #080e1a;
  --card: #0c1524;
  --accent: #00D4F0;
  --amber: #c8892a;
  --gold: #e0a83a;
  --green: #10b981;
  --red: #ef4444;
  --purple: #8b5cf6;
  --cream: #f5f0e8;
  --muted: #6b7894;
  --muted2: #4a566b;
  --border: rgba(255,255,255,.07);
  --fh: 'Bebas Neue', sans-serif;
  --fb: 'Barlow', sans-serif;
  --fc: 'IBM Plex Sans', sans-serif;
  --fi: 'Inter', sans-serif;
  --fm: 'IBM Plex Mono', monospace;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { background: var(--bg); color: var(--cream); font-family: var(--fb); overflow-x: hidden; }
a { text-decoration: none; color: inherit; }

@keyframes pulse-dot {
  0%,100% { box-shadow: 0 0 0 0 rgba(0,212,240,.5) }
  70%      { box-shadow: 0 0 0 7px rgba(0,212,240,0) }
}
@keyframes ticker    { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes float     { 0%,100% { transform: translateY(0) rotateX(0) rotateY(0) } 50% { transform: translateY(-10px) rotateX(1deg) rotateY(1deg) } }
@keyframes fadeUp    { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
@keyframes scaleIn   { from { opacity:0; transform:scale(.95) } to { opacity:1; transform:scale(1) } }
@keyframes drawBar   { from { width:0!important } to {} }
@keyframes glow      { 0%,100% { box-shadow:0 0 40px rgba(0,212,240,.07),0 0 0 1px rgba(0,212,240,.18) } 50% { box-shadow:0 0 70px rgba(0,212,240,.16),0 0 0 1px rgba(0,212,240,.32) } }
@keyframes ambientPulse { 0%,100% { opacity:.04 } 50% { opacity:.09 } }
@keyframes scanline  { 0% { top:-4px } 100% { top:100% } }
@keyframes slidePanel { to { transform:translateX(var(--slide-to)) } }

.reveal { opacity:0; transform:translateY(32px); transition:opacity .65s ease,transform .65s ease; }
.reveal.in { opacity:1; transform:none; }
.d1{transition-delay:.1s}.d2{transition-delay:.2s}.d3{transition-delay:.3s}.d4{transition-delay:.4s}
```

- [ ] **Step 3: Update tailwind.config.ts to extend brand colors**

Replace `tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#04070f',
        surface: '#080e1a',
        card: '#0c1524',
        accent: '#00D4F0',
        amber: { DEFAULT: '#c8892a', light: '#e0a83a' },
        cream: '#f5f0e8',
        muted: '#6b7894',
      },
      fontFamily: {
        headline: ['Bebas Neue', 'sans-serif'],
        body: ['Barlow', 'sans-serif'],
        ui: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 4: Commit**

```bash
cd C:/Users/steph/website-project
git add lib/constants.ts app/globals.css tailwind.config.ts
git commit -m "feat: add brand token system — CSS vars, Tailwind extensions, JS constants"
```

---

## Task 3: Animation Variants + RevealWrapper

**Files:**
- Create: `lib/animations.ts`
- Create: `components/ui/RevealWrapper.tsx`
- Create: `tests/reveal-wrapper.test.tsx`

- [ ] **Step 1: Write failing test**

Create `tests/reveal-wrapper.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act } from '@testing-library/react'
import RevealWrapper from '@/components/ui/RevealWrapper'

// Mock IntersectionObserver
const observeMock = vi.fn()
const disconnectMock = vi.fn()
beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', vi.fn((cb) => ({
    observe: observeMock,
    disconnect: disconnectMock,
    unobserve: vi.fn(),
  })))
})

describe('RevealWrapper', () => {
  it('renders children with reveal class', () => {
    const { container } = render(<RevealWrapper><p>hello</p></RevealWrapper>)
    expect(container.querySelector('.reveal')).toBeTruthy()
    expect(container.querySelector('p')?.textContent).toBe('hello')
  })

  it('adds "in" class when intersection fires', async () => {
    let intersectCallback: IntersectionObserverCallback = () => {}
    vi.stubGlobal('IntersectionObserver', vi.fn((cb) => {
      intersectCallback = cb
      return { observe: observeMock, disconnect: disconnectMock, unobserve: vi.fn() }
    }))
    const { container } = render(<RevealWrapper><p>hi</p></RevealWrapper>)
    const el = container.firstChild as Element
    act(() => intersectCallback([{ isIntersecting: true, target: el } as any], {} as any))
    expect(el.classList.contains('in')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd C:/Users/steph/website-project && npx vitest run tests/reveal-wrapper.test.tsx 2>&1 | tail -10
```
Expected: FAIL — `Cannot find module '@/components/ui/RevealWrapper'`

- [ ] **Step 3: Create animation variants**

Create `lib/animations.ts`:
```ts
import type { Variants } from 'framer-motion'

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}
```

- [ ] **Step 4: Create RevealWrapper**

Create `components/ui/RevealWrapper.tsx`:
```tsx
'use client'
import { useEffect, useRef } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  delay?: 'd1' | 'd2' | 'd3' | 'd4'
}

export default function RevealWrapper({ children, className = '', delay }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('in'); observer.disconnect() } },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${delay ?? ''} ${className}`.trim()}>
      {children}
    </div>
  )
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
cd C:/Users/steph/website-project && npx vitest run tests/reveal-wrapper.test.tsx 2>&1 | tail -5
```
Expected: `✓ 2 tests passed`

- [ ] **Step 6: Commit**

```bash
cd C:/Users/steph/website-project
git add lib/animations.ts components/ui/RevealWrapper.tsx tests/reveal-wrapper.test.tsx
git commit -m "feat: animation variants + RevealWrapper IntersectionObserver utility"
```

---

## Task 4: Layout + App Shell

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Update layout.tsx**

Replace `app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StrikePanel™ — Training Intelligence for Combat Sports',
  description: 'The coaching platform built for combat sports. Morning briefs, fight camp timelines, AI session plans, and readiness scores — all in one dashboard.',
  openGraph: {
    title: 'StrikePanel™',
    description: 'Training intelligence for combat sports coaches.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Stub page.tsx**

Replace `app/page.tsx`:
```tsx
export default function Page() {
  return (
    <main>
      <p style={{ color: '#00D4F0', padding: 40 }}>StrikePanel™ — building…</p>
    </main>
  )
}
```

- [ ] **Step 3: Verify dev server starts**

```bash
cd C:/Users/steph/website-project && npm run dev &
sleep 4 && curl -s http://localhost:3000 | grep -o 'StrikePanel' | head -1
```
Expected: `StrikePanel`

Kill the dev server after confirming: `pkill -f "next dev"` (Windows: `taskkill /f /im node.exe`)

- [ ] **Step 4: Commit**

```bash
cd C:/Users/steph/website-project
git add app/layout.tsx app/page.tsx
git commit -m "feat: app shell with metadata"
```

---

## Task 5: Nav Component

**Files:**
- Create: `components/nav/Nav.tsx`
- Create: `tests/nav.test.tsx`

- [ ] **Step 1: Write failing test**

Create `tests/nav.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Nav from '@/components/nav/Nav'

describe('Nav', () => {
  it('renders logo text', () => {
    render(<Nav />)
    expect(screen.getByText(/STRIKE/)).toBeTruthy()
  })

  it('renders CTA button', () => {
    render(<Nav />)
    expect(screen.getByRole('link', { name: /Get Access/i })).toBeTruthy()
  })

  it('renders nav links', () => {
    render(<Nav />)
    expect(screen.getByText('DEMO')).toBeTruthy()
    expect(screen.getByText('BLOG')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd C:/Users/steph/website-project && npx vitest run tests/nav.test.tsx 2>&1 | tail -5
```
Expected: FAIL — module not found

- [ ] **Step 3: Create Nav component**

Create `components/nav/Nav.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'

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
        borderBottom: scrolled ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(255,255,255,.04)',
        transition: 'border-color .3s',
      }}
    >
      {/* Logo */}
      <a href="/" style={{ fontFamily: 'var(--fh)', fontSize: 22, letterSpacing: 4 }}>
        STRIKE<span style={{ color: 'var(--accent)' }}>PANEL</span>™
      </a>

      {/* Links */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        {['DEMO', 'BLOG'].map((lk) => (
          <a
            key={lk}
            href={`#${lk.toLowerCase()}`}
            style={{
              fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '2.5px',
              color: 'var(--muted)', textTransform: 'uppercase',
              transition: 'color .2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--cream)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >
            {lk}
          </a>
        ))}
        <a
          href="#pricing"
          style={{
            background: 'linear-gradient(135deg,#c8892a,#e0a83a)',
            color: '#000', fontWeight: 700, borderRadius: 100,
            padding: '10px 22px', fontSize: 13, letterSpacing: 1,
            boxShadow: '0 0 24px rgba(200,137,42,.35)',
            transition: 'box-shadow .2s, transform .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(200,137,42,.55)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(200,137,42,.35)'; e.currentTarget.style.transform = 'none' }}
        >
          Get Access — $99
        </a>
      </div>
    </nav>
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
cd C:/Users/steph/website-project && npx vitest run tests/nav.test.tsx 2>&1 | tail -5
```
Expected: `✓ 3 tests passed`

- [ ] **Step 5: Commit**

```bash
cd C:/Users/steph/website-project
git add components/nav/Nav.tsx tests/nav.test.tsx
git commit -m "feat: Nav — fixed, scroll-aware, amber CTA"
```

---

## Task 6: Hero Widget

**Files:**
- Create: `components/hero/HeroWidget.tsx`
- Create: `tests/hero-widget.test.tsx`

- [ ] **Step 1: Write failing test**

Create `tests/hero-widget.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HeroWidget from '@/components/hero/HeroWidget'

describe('HeroWidget', () => {
  it('renders athlete names', () => {
    render(<HeroWidget />)
    expect(screen.getByText(/Priya/)).toBeTruthy()
    expect(screen.getByText(/Jake/)).toBeTruthy()
    expect(screen.getByText(/Marcus/)).toBeTruthy()
  })

  it('renders readiness scores', () => {
    render(<HeroWidget />)
    expect(screen.getByText('91')).toBeTruthy()
    expect(screen.getByText('74')).toBeTruthy()
    expect(screen.getByText('38')).toBeTruthy()
  })

  it('renders squad average', () => {
    render(<HeroWidget />)
    expect(screen.getByText(/SQUAD AVG/i)).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd C:/Users/steph/website-project && npx vitest run tests/hero-widget.test.tsx 2>&1 | tail -5
```

- [ ] **Step 3: Create HeroWidget**

Create `components/hero/HeroWidget.tsx`:
```tsx
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
      {/* Scanline */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 4,
        background: 'linear-gradient(180deg,transparent,rgba(0,212,240,.08),transparent)',
        animation: 'scanline 4s linear infinite', pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase' }}>
            // MORNING BRIEF
          </div>
          <div style={{ fontFamily: 'var(--fh)', fontSize: 22, letterSpacing: 2, marginTop: 2 }}>
            SQUAD AVG <span style={{ color: 'var(--amber)' }}>68</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-dot 2s infinite', marginLeft: 'auto', marginBottom: 4 }} />
          <div style={{ fontFamily: 'var(--fm)', fontSize: 9, color: 'var(--muted)' }}>3 ONLINE</div>
        </div>
      </div>

      {/* Athletes */}
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
          <div style={{
            fontFamily: 'var(--fh)', fontSize: 24, color: a.color,
            textShadow: `0 0 12px ${a.color}66`,
          }}>{a.score}</div>
        </div>
      ))}

      {/* Progress bars */}
      <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
        {athletes.map((a) => (
          <div key={a.name} style={{ flex: 1, height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 2 }}>
            <div style={{
              height: '100%', borderRadius: 2, background: a.color,
              width: `${a.score}%`, animation: 'drawBar .9s ease forwards',
            }} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
cd C:/Users/steph/website-project && npx vitest run tests/hero-widget.test.tsx 2>&1 | tail -5
```
Expected: `✓ 3 tests passed`

- [ ] **Step 5: Commit**

```bash
cd C:/Users/steph/website-project
git add components/hero/HeroWidget.tsx tests/hero-widget.test.tsx
git commit -m "feat: HeroWidget — readiness card with scanline, float, mouse parallax"
```

---

## Task 7: HeroCanvas (R3F)

**Files:**
- Create: `components/hero/HeroCanvas.tsx`

- [ ] **Step 1: Create HeroCanvas**

Create `components/hero/HeroCanvas.tsx`:
```tsx
'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function Particles() {
  const mesh = useRef<THREE.Points>(null)
  const { mouse } = useThree()

  const [positions, colors] = useMemo(() => {
    const count = 400
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 6
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4
      // cyan to white gradient
      const t = Math.random()
      col[i * 3]     = t * 0.0 + (1 - t) * 1.0
      col[i * 3 + 1] = t * 0.83 + (1 - t) * 1.0
      col[i * 3 + 2] = t * 0.94 + (1 - t) * 1.0
    }
    return [pos, col]
  }, [])

  useFrame((_, delta) => {
    if (!mesh.current) return
    mesh.current.rotation.y += delta * 0.04
    mesh.current.rotation.x += delta * 0.02
    mesh.current.rotation.y += mouse.x * 0.003
    mesh.current.rotation.x += mouse.y * 0.002
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} vertexColors transparent opacity={0.75} sizeAttenuation />
    </points>
  )
}

export default function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      gl={{ antialias: false, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} color="#00D4F0" intensity={2} />
      <pointLight position={[-2, -2, 1]} color="#c8892a" intensity={1.5} />
      <Particles />
    </Canvas>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd C:/Users/steph/website-project
git add components/hero/HeroCanvas.tsx
git commit -m "feat: HeroCanvas — R3F particle field with mouse-driven camera tilt"
```

---

## Task 8: Hero Section

**Files:**
- Create: `components/hero/Hero.tsx`

- [ ] **Step 1: Create Hero**

Create `components/hero/Hero.tsx`:
```tsx
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
      {/* Background photo */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1600&q=80)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(.14) saturate(.4)',
      }} />

      {/* Overlays */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(105deg,rgba(4,7,15,.95) 0%,rgba(4,7,15,.6) 55%,transparent 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(180deg,transparent 70%,rgba(4,7,15,1) 100%)' }} />

      {/* Ambient orbs */}
      <div style={{ position: 'absolute', top: -200, left: -200, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,212,240,.09),transparent 70%)', animation: 'ambientPulse 7s ease-in-out infinite', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -150, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(200,137,42,.08),transparent 70%)', animation: 'ambientPulse 9s ease-in-out infinite', zIndex: 1, pointerEvents: 'none' }} />

      {/* Grid overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(0,212,240,.032) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,240,.032) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 48, paddingTop: 80 }}>
        {/* Left: copy */}
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
            <a href="#pricing" style={{
              background: 'linear-gradient(135deg,#c8892a,#e0a83a)', color: '#000',
              fontWeight: 700, borderRadius: 100, padding: '14px 32px', fontSize: 15,
              boxShadow: '0 0 32px rgba(200,137,42,.4)', letterSpacing: .5,
            }}>
              Get Access — $99
            </a>
            <a href="#demo" style={{
              border: '1px solid rgba(255,255,255,.14)', color: 'var(--cream)',
              borderRadius: 100, padding: '14px 28px', fontSize: 15,
              background: 'rgba(255,255,255,.03)',
            }}>
              Watch Demo
            </a>
          </div>
        </div>

        {/* Right: widget + R3F */}
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
```

- [ ] **Step 2: Commit**

```bash
cd C:/Users/steph/website-project
git add components/hero/Hero.tsx
git commit -m "feat: Hero section — photo bg, grid overlay, orbs, widget + R3F canvas"
```

---

## Task 9: Ticker + Stats

**Files:**
- Create: `components/sections/Ticker.tsx`
- Create: `components/sections/Stats.tsx`

- [ ] **Step 1: Create Ticker**

Create `components/sections/Ticker.tsx`:
```tsx
const items = ['MORNING BRIEF','FIGHT CAMP','ATHLETE MANAGEMENT','AI SESSIONS','PROGRESS TRACKING','WEIGHT CUT TOOLS','FIGHT COUNTDOWN','READINESS SCORES']

export default function Ticker() {
  const repeated = [...items, ...items]
  return (
    <div style={{
      overflow: 'hidden', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
      padding: '14px 0', background: 'rgba(8,14,26,.8)',
    }}>
      <div style={{
        display: 'flex', gap: 0, width: 'max-content',
        animation: 'ticker 40s linear infinite',
      }}>
        {repeated.map((item, i) => (
          <span key={i} style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap', padding: '0 32px' }}>
            {item}
            <span style={{ color: 'var(--amber)', marginLeft: 32 }}>·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create Stats**

Create `components/sections/Stats.tsx`:
```tsx
const stats = [
  { value: '500+', label: 'Athletes Tracked' },
  { value: '$0',   label: 'Setup Cost' },
  { value: '14',   label: 'Sport Categories' },
  { value: '∞',    label: 'AI Sessions' },
]

export default function Stats() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
      borderBottom: '1px solid var(--border)',
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          padding: '32px 24px', textAlign: 'center',
          borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
          background: 'rgba(8,14,26,.5)',
        }}>
          <div style={{ fontFamily: 'var(--fh)', fontSize: 48, letterSpacing: 2, color: 'var(--amber)' }}>{s.value}</div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd C:/Users/steph/website-project
git add components/sections/Ticker.tsx components/sections/Stats.tsx
git commit -m "feat: Ticker marquee + Stats bar"
```

---

## Task 10: Problem Section

**Files:**
- Create: `components/sections/Problem.tsx`

- [ ] **Step 1: Create Problem**

Create `components/sections/Problem.tsx`:
```tsx
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
    <section style={{
      position: 'relative', overflow: 'hidden',
      padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,80px)',
    }}>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1598971639058-a23f57357aba?w=1400&q=70)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(.08) saturate(.3)',
      }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(180deg,rgba(4,7,15,.85),rgba(4,7,15,.95))' }} />

      <div style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, maxWidth: 1200, margin: '0 auto' }}>
        {/* Problem */}
        <div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--red)', textTransform: 'uppercase', marginBottom: 16 }}>// THE PROBLEM</div>
          <h2 style={{ fontFamily: 'var(--fh)', fontSize: 'clamp(36px,4vw,52px)', lineHeight: 1.05, marginBottom: 32, color: 'rgba(245,240,232,.5)' }}>
            COACHING ON SPREADSHEETS IS KILLING YOUR EDGE
          </h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {problems.map((p) => (
              <li key={p} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontFamily: 'var(--fb)', fontSize: 16, color: 'var(--muted)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--red)', marginTop: 2, flexShrink: 0 }}>✕</span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Fix */}
        <div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 16 }}>// THE FIX</div>
          <h2 style={{ fontFamily: 'var(--fh)', fontSize: 'clamp(36px,4vw,52px)', lineHeight: 1.05, marginBottom: 32 }}>
            STRIKEPANEL GIVES YOU THE INTELLIGENCE TO WIN
          </h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {fixes.map((f) => (
              <li key={f} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontFamily: 'var(--fb)', fontSize: 16, lineHeight: 1.5 }}>
                <span style={{ color: 'var(--green)', marginTop: 2, flexShrink: 0 }}>✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd C:/Users/steph/website-project
git add components/sections/Problem.tsx
git commit -m "feat: Problem section — dark photo bg, two-column problem/fix"
```

---

## Task 11: Demo Section

**Files:**
- Create: `components/sections/Demo.tsx`

- [ ] **Step 1: Create Demo**

Create `components/sections/Demo.tsx`:
```tsx
export default function Demo() {
  return (
    <section id="demo" style={{ padding: 'clamp(80px,10vw,130px) clamp(20px,5vw,80px)', textAlign: 'center', position: 'relative' }}>
      {/* Ambient glow behind iframe */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(0,212,240,.06),transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12 }}>
          // LIVE DEMO
        </div>
        <h2 style={{ fontFamily: 'var(--fh)', fontSize: 'clamp(36px,5vw,64px)', marginBottom: 8, letterSpacing: 2 }}>
          SEE IT IN ACTION
        </h2>
        <p style={{ fontFamily: 'var(--fb)', color: 'var(--muted)', marginBottom: 40, fontSize: 16 }}>
          No signup required — try the real app
        </p>

        <div style={{ display: 'inline-block', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,212,240,.15)', boxShadow: '0 0 80px rgba(0,212,240,.08),0 32px 64px rgba(0,0,0,.6)' }}>
          <iframe
            src="https://strikepane.uk/demo"
            width={820}
            height={580}
            style={{ display: 'block', border: 'none', background: '#04070f' }}
            title="StrikePanel™ Live Demo"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd C:/Users/steph/website-project
git add components/sections/Demo.tsx
git commit -m "feat: Demo section — live iframe with ambient glow"
```

---

## Task 12: Features Section — Tab Infrastructure

**Files:**
- Create: `components/sections/Features.tsx`
- Create: `components/sections/features.module.css`
- Create: `tests/features.test.tsx`

- [ ] **Step 1: Write failing test**

Create `tests/features.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Features from '@/components/sections/Features'

describe('Features tabs', () => {
  it('renders all 5 tab labels', () => {
    render(<Features />)
    expect(screen.getByRole('button', { name: /Morning Brief/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Fight Camp/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Athletes/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /AI Sessions/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Progress/i })).toBeTruthy()
  })

  it('shows Morning Brief panel by default', () => {
    render(<Features />)
    expect(screen.getByText(/SQUAD AVG/i)).toBeTruthy()
  })

  it('switches to Fight Camp panel on click', () => {
    render(<Features />)
    fireEvent.click(screen.getByRole('button', { name: /Fight Camp/i }))
    expect(screen.getByText(/DAYS TO FIGHT/i)).toBeTruthy()
  })

  it('switches to Athletes panel on click', () => {
    render(<Features />)
    fireEvent.click(screen.getByRole('button', { name: /Athletes/i }))
    expect(screen.getByText(/ACTIVE/i)).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd C:/Users/steph/website-project && npx vitest run tests/features.test.tsx 2>&1 | tail -5
```

- [ ] **Step 3: Create features.module.css**

Create `components/sections/features.module.css`:
```css
.tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 32px; }

.tab {
  font-family: var(--fm); font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
  padding: 10px 20px; border-radius: 100px; border: 1px solid rgba(255,255,255,.1);
  background: transparent; color: var(--muted); cursor: pointer; transition: all .2s;
}
.tab:hover { border-color: rgba(255,255,255,.2); color: var(--cream); }
.tabActive {
  background: linear-gradient(135deg, #c8892a, #e0a83a); color: #000;
  border-color: transparent; font-weight: 700;
  box-shadow: 0 0 20px rgba(200,137,42,.35);
}

.panel { animation: fadeUp .4s ease forwards; }
```

- [ ] **Step 4: Create Features shell with Morning Brief + Fight Camp panels**

Create `components/sections/Features.tsx`:
```tsx
'use client'
import { useState } from 'react'
import styles from './features.module.css'

const tabs = ['Morning Brief', 'Fight Camp', 'Athletes', 'AI Sessions', 'Progress']

/* ── Morning Brief Panel ── */
function MorningBrief() {
  return (
    <div className={styles.panel}>
      {/* Brief hero banner */}
      <div style={{ background: 'linear-gradient(135deg,rgba(0,212,240,.08),rgba(0,212,240,.04))', border: '1px solid rgba(0,212,240,.15)', borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', marginBottom: 6 }}>TUESDAY, 20 MAY 2025</div>
        <div style={{ fontFamily: 'var(--fh)', fontSize: 28, letterSpacing: 2 }}>3 ATHLETES CHECKED IN · SQUAD AVG <span style={{ color: 'var(--accent)' }}>68</span></div>
        <div style={{ fontFamily: 'var(--fb)', color: 'var(--muted)', marginTop: 8, fontSize: 14 }}>Marcus needs a rest day. Priya is peaking — push hard. Jake trains as normal.</div>
      </div>

      {/* Marcus alert */}
      <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 10, padding: '14px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontFamily: 'var(--fh)', fontSize: 32, color: 'var(--red)' }}>38</div>
        <div>
          <div style={{ fontFamily: 'var(--fc)', fontWeight: 700, color: 'var(--red)', fontSize: 13 }}>MARCUS — REST DAY</div>
          <div style={{ fontFamily: 'var(--fb)', color: 'var(--muted)', fontSize: 13 }}>Low sleep, high fatigue reported. Do not train at intensity today.</div>
        </div>
      </div>

      {/* Readiness grid */}
      <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>SQUAD READINESS SCORES</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[{name:'PRIYA',score:91,color:'#10b981'},{name:'JAKE',score:74,color:'#c8892a'},{name:'MARCUS',score:38,color:'#ef4444'}].map(a => (
          <div key={a.name} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'var(--muted)', marginBottom: 8 }}>{a.name}</div>
            <div style={{ fontFamily: 'var(--fh)', fontSize: 40, color: a.color }}>{a.score}<span style={{ fontSize: 16, color: 'var(--muted)' }}>/100</span></div>
            <div style={{ height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 2, marginTop: 10 }}>
              <div style={{ height: '100%', background: a.color, width: `${a.score}%`, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Fight Camp Panel ── */
function FightCamp() {
  return (
    <div className={styles.panel}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        {[{label:'DAYS TO FIGHT',value:'21',color:'#ef4444'},{label:'CURRENT KG',value:'79.2',color:'#c8892a'},{label:'TARGET KG',value:'77',color:'#10b981'}].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: '16px 18px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--fh)', fontSize: 40, color: s.color }}>{s.value}</div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 2, color: 'var(--muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Fight card */}
      <div style={{ background: 'linear-gradient(135deg,rgba(239,68,68,.1),rgba(239,68,68,.05))', border: '1px solid rgba(239,68,68,.3)', borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 3, color: 'var(--red)', marginBottom: 8 }}>UPCOMING BOUT</div>
        <div style={{ fontFamily: 'var(--fh)', fontSize: 28, letterSpacing: 2 }}>MARCUS "EL TORO" MENDEZ</div>
        <div style={{ fontFamily: 'var(--fb)', color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Fight Night London · Welterweight (77kg)</div>
      </div>

      {/* Phase bars */}
      <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>CAMP PHASES</div>
      {[{phase:'Base Fitness',pct:100,status:'Complete',color:'#10b981'},{phase:'Sparring Block',pct:78,status:'Complete',color:'#10b981'},{phase:'Peak Week',pct:45,status:'In Progress',color:'#c8892a'},{phase:'Weight Cut',pct:12,status:'Upcoming',color:'#6b7894'}].map(p => (
        <div key={p.phase} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
          <div style={{ fontFamily:'var(--fb)', fontSize:13, width:120, flexShrink:0 }}>{p.phase}</div>
          <div style={{ flex:1, height:6, background:'rgba(255,255,255,.06)', borderRadius:3 }}>
            <div style={{ height:'100%', background:p.color, width:`${p.pct}%`, borderRadius:3 }} />
          </div>
          <div style={{ fontFamily:'var(--fm)', fontSize:10, color:p.color, width:80, textAlign:'right' }}>{p.status}</div>
        </div>
      ))}
    </div>
  )
}

/* ── Athletes Panel ── */
function Athletes() {
  const roster = [
    { initials:'P', name:'Priya Sharma',  detail:'Muay Thai · 52kg · 18-2', score:91, color:'#10b981' },
    { initials:'J', name:'Jake Thompson', detail:'Boxing · 67kg · 22-4',     score:74, color:'#c8892a' },
    { initials:'M', name:'Marcus Mendez', detail:'MMA · 77kg · 15-3',        score:38, color:'#ef4444' },
  ]
  return (
    <div className={styles.panel}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {[{label:'ACTIVE',value:'12'},{label:'ON ALERT',value:'3'},{label:'IN CAMP',value:'2'}].map(s => (
          <div key={s.label} style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)', borderRadius:10, padding:'16px', textAlign:'center' }}>
            <div style={{ fontFamily:'var(--fh)', fontSize:36, color:'var(--amber)' }}>{s.value}</div>
            <div style={{ fontFamily:'var(--fm)', fontSize:9, letterSpacing:2, color:'var(--muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>
      {roster.map(a => (
        <div key={a.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)', borderRadius:10, marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:'50%', border:`1.5px solid ${a.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--fh)', fontSize:18, color:a.color }}>{a.initials}</div>
            <div>
              <div style={{ fontFamily:'var(--fc)', fontWeight:600, fontSize:14 }}>{a.name}</div>
              <div style={{ fontFamily:'var(--fm)', fontSize:10, color:'var(--muted)' }}>{a.detail}</div>
            </div>
          </div>
          <div style={{ fontFamily:'var(--fh)', fontSize:28, color:a.color }}>{a.score}</div>
        </div>
      ))}
    </div>
  )
}

/* ── AI Sessions Panel ── */
function AISessions() {
  const exercises = [
    {name:'Jump Rope',    detail:'10 min · Warm-up'},
    {name:'Shadow Boxing',detail:'3 × 3 min · Technique'},
    {name:'Heavy Bag',    detail:'5 × 3 min · Power'},
    {name:'Pad Work',     detail:'4 × 3 min · Combinations'},
    {name:'Sprawl & Shoot',detail:'3 × 5 min · Wrestling'},
    {name:'Core Circuit', detail:'15 min · Conditioning'},
    {name:'Cool Down',    detail:'10 min · Recovery'},
  ]
  return (
    <div className={styles.panel}>
      <div style={{ background:'linear-gradient(135deg,rgba(139,92,246,.12),rgba(139,92,246,.06))', border:'1px solid rgba(139,92,246,.25)', borderRadius:12, padding:'16px 20px', marginBottom:16, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontFamily:'var(--fh)', fontSize:13, letterSpacing:3, color:'var(--purple)' }}>AI SESSION GENERATOR</div>
      </div>
      <div style={{ fontFamily:'var(--fh)', fontSize:22, marginBottom:4 }}>PEAK WEEK — FIGHT PREP</div>
      <div style={{ fontFamily:'var(--fb)', color:'var(--muted)', fontSize:13, marginBottom:20 }}>Generated for Marcus Mendez · 21 days to fight</div>
      {exercises.map((e, i) => (
        <div key={e.name} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:8, marginBottom:6 }}>
          <div style={{ fontFamily:'var(--fh)', fontSize:18, color:'var(--amber)', width:24, textAlign:'center' }}>{i+1}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'var(--fc)', fontWeight:600, fontSize:14 }}>{e.name}</div>
            <div style={{ fontFamily:'var(--fm)', fontSize:10, color:'var(--muted)' }}>{e.detail}</div>
          </div>
        </div>
      ))}
      <div style={{ display:'flex', gap:12, marginTop:16 }}>
        <button style={{ flex:1, background:'linear-gradient(135deg,#c8892a,#e0a83a)', color:'#000', fontWeight:700, border:'none', borderRadius:8, padding:'12px', cursor:'pointer', fontFamily:'var(--fc)' }}>Save Plan</button>
        <button style={{ flex:1, background:'rgba(139,92,246,.1)', color:'var(--purple)', border:'1px solid rgba(139,92,246,.3)', borderRadius:8, padding:'12px', cursor:'pointer', fontFamily:'var(--fc)' }}>Regenerate</button>
      </div>
    </div>
  )
}

/* ── Progress Panel ── */
function Progress() {
  const weeks = ['W1','W2','W3','W4','W5','W6','W7','W8']
  const readiness = [72,68,75,71,80,76,82,91]
  const performance = [65,70,74,72,78,80,83,88]
  const recovery = [60,65,70,68,75,72,80,85]

  // Simple SVG chart
  const W = 600, H = 160
  const toPath = (vals: number[]) => vals.map((v,i) => `${i===0?'M':'L'}${(i/(vals.length-1))*W},${H - (v/100)*(H-20)-10}`).join(' ')

  return (
    <div className={styles.panel}>
      <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:20, marginBottom:20, overflow:'hidden' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'auto' }}>
          {/* grid */}
          {[25,50,75].map(y => <line key={y} x1={0} x2={W} y1={H-(y/100)*(H-20)-10} y2={H-(y/100)*(H-20)-10} stroke="rgba(255,255,255,.04)" strokeWidth={1} />)}
          <path d={toPath(readiness)}   fill="none" stroke="#00D4F0" strokeWidth={2} />
          <path d={toPath(performance)} fill="none" stroke="#c8892a" strokeWidth={2} />
          <path d={toPath(recovery)}    fill="none" stroke="#10b981" strokeWidth={2} />
        </svg>
        <div style={{ display:'flex', gap:20, marginTop:12 }}>
          {[{label:'Readiness',color:'#00D4F0'},{label:'Performance',color:'#c8892a'},{label:'Recovery',color:'#10b981'}].map(l => (
            <div key={l.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:16, height:2, background:l.color, borderRadius:1 }} />
              <span style={{ fontFamily:'var(--fm)', fontSize:10, color:'var(--muted)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflow:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'var(--fm)', fontSize:12 }}>
          <thead>
            <tr>
              {['WEEK','READINESS','PERFORMANCE','RECOVERY','SESSIONS'].map(h => (
                <th key={h} style={{ padding:'8px 12px', textAlign:'left', color:'var(--muted)', fontSize:9, letterSpacing:2, borderBottom:'1px solid rgba(255,255,255,.06)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((w, i) => (
              <tr key={w} style={{ borderBottom:'1px solid rgba(255,255,255,.03)' }}>
                <td style={{ padding:'10px 12px', color:'var(--muted)' }}>{w}</td>
                <td style={{ padding:'10px 12px', color:'#00D4F0' }}>{readiness[i]}</td>
                <td style={{ padding:'10px 12px', color:'#c8892a' }}>{performance[i]}</td>
                <td style={{ padding:'10px 12px', color:'#10b981' }}>{recovery[i]}</td>
                <td style={{ padding:'10px 12px', color:'var(--cream)' }}>{Math.floor(Math.random()*3)+4}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Features Shell ── */
const panels = { 'Morning Brief': MorningBrief, 'Fight Camp': FightCamp, Athletes, 'AI Sessions': AISessions, Progress }

export default function Features() {
  const [active, setActive] = useState<string>('Morning Brief')
  const Panel = panels[active as keyof typeof panels]

  return (
    <section id="features" style={{ padding:'clamp(80px,10vw,130px) clamp(20px,5vw,80px)' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <div style={{ fontFamily:'var(--fm)', fontSize:10, letterSpacing:4, color:'var(--accent)', textTransform:'uppercase', marginBottom:12 }}>// FEATURES</div>
          <h2 style={{ fontFamily:'var(--fh)', fontSize:'clamp(40px,5vw,72px)', letterSpacing:2 }}>EVERY TOOL A COACH NEEDS</h2>
        </div>

        <div className={styles.tabs}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActive(t)} className={`${styles.tab} ${active===t ? styles.tabActive : ''}`}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ background:'rgba(8,14,26,.8)', border:'1px solid var(--border)', borderRadius:16, padding:32 }}>
          <Panel />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
cd C:/Users/steph/website-project && npx vitest run tests/features.test.tsx 2>&1 | tail -5
```
Expected: `✓ 4 tests passed`

- [ ] **Step 6: Commit**

```bash
cd C:/Users/steph/website-project
git add components/sections/Features.tsx components/sections/features.module.css tests/features.test.tsx
git commit -m "feat: Features section — 5-tab showcase with all panels"
```

---

## Task 13: CSS Device Frames Module

**Files:**
- Create: `components/sections/devices/devices.module.css`
- Create: `components/sections/devices/IPhone.tsx`
- Create: `components/sections/devices/MacBook.tsx`
- Create: `components/sections/devices/IPad.tsx`
- Create: `components/sections/devices/AppContent.tsx`

- [ ] **Step 1: Create devices.module.css**

Create `components/sections/devices/devices.module.css`:
```css
/* ══ Shared ══ */
.devInner { transform-origin: top left; }

/* ══ iPhone 15 Pro — Natural Titanium ══ */
.iphone {
  width: 186px; border-radius: 50px; padding: 0 7px 7px; position: relative;
  background: linear-gradient(160deg,#6a6055 0%,#4a4038 10%,#363028 25%,#242018 45%,#1c1a16 58%,#28221c 70%,#3c342c 84%,#504840 100%);
  box-shadow:
    inset 2px 2px 0 rgba(255,245,210,.2), inset -1.5px -1.5px 0 rgba(0,0,0,.6),
    inset 0 0 0 1.5px rgba(255,235,160,.07),
    0 0 0 1.5px #080604, 0 0 0 3px rgba(100,90,70,.4),
    0 6px 18px rgba(0,0,0,.6), 0 30px 80px rgba(0,0,0,.92), 0 60px 140px rgba(0,0,0,.7);
}
.iphone::after {
  content: ''; position: absolute; inset: 0; border-radius: 50px;
  background: linear-gradient(148deg,rgba(255,248,210,.14) 0%,rgba(255,245,190,.05) 25%,transparent 52%,rgba(0,0,0,.08) 100%);
  pointer-events: none; z-index: 20;
}
.iphoneScreen {
  background: #000; border-radius: 43px; overflow: hidden;
  display: flex; flex-direction: column; height: 390px; position: relative;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.05), inset 0 4px 16px rgba(0,0,0,.7);
}
.iphoneScreen::after {
  content: ''; position: absolute; inset: 0; border-radius: 43px;
  background: linear-gradient(138deg,rgba(255,255,255,.1) 0%,rgba(255,255,255,.04) 32%,transparent 62%);
  pointer-events: none; z-index: 200;
}
.island {
  width: 90px; height: 30px;
  background: radial-gradient(ellipse at 50% 30%,#0c0c10 0%,#000 100%);
  border-radius: 15px; margin: 10px auto 0; flex-shrink: 0; position: relative; z-index: 5;
  box-shadow: 0 0 0 1.5px rgba(50,45,35,.7), inset 0 1px 4px rgba(0,0,0,.95);
}
.island::before {
  content: ''; position: absolute; width: 11px; height: 11px;
  background: radial-gradient(circle at 36% 30%,#1c1c30 10%,#0c0c18 55%,#000 100%);
  border-radius: 50%; top: 50%; right: 7px; transform: translateY(-50%);
  box-shadow: 0 0 0 1px rgba(50,50,80,.4), inset 0 0 4px rgba(60,80,200,.08);
}
.island::after {
  content: ''; position: absolute; width: 5px; height: 5px;
  background: radial-gradient(circle,#1a1828,#000);
  border-radius: 50%; top: 50%; right: 22px; transform: translateY(-50%);
  box-shadow: 0 0 3px rgba(0,80,255,.18);
}
.statusBar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 20px; height: 0; flex-shrink: 0; margin-top: -30px;
  position: relative; z-index: 10; pointer-events: none;
}
.statusTime { font-family: var(--fc); font-size: 11px; font-weight: 700; color: rgba(255,255,255,.95); letter-spacing: .2px; }
.statusBatt { display: flex; align-items: center; gap: 4px; }
.statusBatt::before {
  content: ''; display: block; width: 14px; height: 9px;
  border: 1.5px solid rgba(255,255,255,.6); border-radius: 2px;
  background: linear-gradient(90deg,rgba(16,185,129,.9) 0% 72%,transparent 72%);
  box-shadow: inset 0 0 2px rgba(0,0,0,.3);
}
.statusBatt::after {
  content: ''; display: block; width: 2.5px; height: 5px;
  background: rgba(255,255,255,.55); border-radius: 0 1px 1px 0; margin-left: -1px;
}
.iphoneContent { flex: 1; overflow: hidden; position: relative; margin-top: 8px; }
.homeBar {
  width: 108px; height: 5px;
  background: linear-gradient(90deg,rgba(255,255,255,.12),rgba(255,255,255,.34),rgba(255,255,255,.12));
  border-radius: 3px; margin: 8px auto 11px; flex-shrink: 0;
  box-shadow: 0 0 8px rgba(255,255,255,.08);
}
.btn {
  position: absolute; border-radius: 2px;
  background: linear-gradient(180deg,#524840 0%,#3c3028 60%,#302820 100%);
  box-shadow: inset 0 1px 0 rgba(255,245,200,.22), inset 0 -1px 0 rgba(0,0,0,.55), 1px 0 2px rgba(0,0,0,.4);
}
.btnSilent  { left: -4px; top: 72px;  width: 4px; height: 24px; border-radius: 2px 0 0 2px; }
.btnVolUp   { left: -4px; top: 110px; width: 4px; height: 50px; border-radius: 2px 0 0 2px; }
.btnVolDn   { left: -4px; top: 170px; width: 4px; height: 50px; border-radius: 2px 0 0 2px; }
.btnPower   {
  right: -4px; top: 130px; width: 4px; height: 70px; border-radius: 0 2px 2px 0;
  background: linear-gradient(180deg,#524840 0%,#3c3028 60%,#302820 100%);
  box-shadow: inset 0 1px 0 rgba(255,245,200,.22), inset 0 -1px 0 rgba(0,0,0,.55), -1px 0 2px rgba(0,0,0,.4);
}

/* ══ MacBook Pro 14" — Space Gray ══ */
.macbook { width: 100%; max-width: 580px; position: relative; margin: 0 auto; filter: drop-shadow(0 50px 110px rgba(0,0,0,.92)) drop-shadow(0 18px 40px rgba(0,0,0,.58)); }
.macLid {
  background: linear-gradient(188deg,#404042 0%,#323234 18%,#262628 42%,#1e1e20 60%,#262628 76%,#303032 90%,#3c3c3e 100%);
  border-radius: 14px 14px 0 0; padding: 18px 12px 12px; position: relative;
  box-shadow:
    inset 0 1.5px 0 rgba(255,255,255,.22), inset 1px 0 0 rgba(255,255,255,.09),
    inset -1px 0 0 rgba(255,255,255,.09), inset 0 0 0 1px rgba(255,255,255,.04),
    inset 0 -1px 0 rgba(0,0,0,.3);
}
.macLid::before {
  content: ''; position: absolute; inset: 0; border-radius: 14px 14px 0 0;
  background: linear-gradient(155deg,rgba(255,255,255,.10) 0%,rgba(255,255,255,.03) 28%,transparent 55%,rgba(0,0,0,.04) 100%);
  pointer-events: none;
}
.macCam {
  width: 8px; height: 8px;
  background: radial-gradient(circle at 38% 32%,#282830 15%,#141418 55%,#000 100%);
  border-radius: 50%; border: 1px solid rgba(255,255,255,.07);
  position: absolute; top: 8px; left: 50%; transform: translateX(-50%);
  box-shadow: 0 0 0 2px rgba(0,0,0,.5);
}
.macCam::before {
  content: ''; position: absolute; width: 3.5px; height: 3.5px;
  background: radial-gradient(circle,#1a3018,#082008); border-radius: 50%;
  top: 50%; left: 50%; transform: translate(-50%,-50%);
  box-shadow: 0 0 5px rgba(20,200,20,.3);
}
.macCam::after {
  content: ''; position: absolute; width: 2px; height: 2px;
  background: rgba(255,255,255,.4); border-radius: 50%; top: 12%; left: 18%;
}
.macScreen {
  background: #000; border-radius: 5px; overflow: hidden; height: 285px; position: relative;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.06), inset 0 3px 12px rgba(0,0,0,.65);
}
.macScreen::after {
  content: ''; position: absolute; inset: 0; border-radius: 5px;
  background: linear-gradient(148deg,rgba(255,255,255,.09) 0%,rgba(255,255,255,.02) 38%,transparent 65%);
  pointer-events: none; z-index: 200;
}
.macHinge {
  height: 8px;
  background: linear-gradient(180deg,#808082 0%,#606062 12%,#424244 35%,#2a2a2c 65%,#1c1c1e 100%);
  margin: 0 -1px; position: relative;
}
.macHinge::after {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2.5px;
  background: linear-gradient(90deg,transparent 0%,rgba(255,255,255,.28) 15%,rgba(255,255,255,.55) 50%,rgba(255,255,255,.28) 85%,transparent 100%);
}
.macBase {
  background: linear-gradient(180deg,#464648 0%,#363638 20%,#282828 48%,#202022 65%,#2c2c2e 82%,#383838 100%);
  border-radius: 0 0 12px 12px; height: 58px; display: flex; align-items: center; justify-content: center; position: relative;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.14), inset 1px 0 0 rgba(255,255,255,.07),
    inset -1px 0 0 rgba(255,255,255,.07), inset 0 -1px 0 rgba(255,255,255,.05);
}
.macBase::before {
  content: ''; position: absolute; top: 7px; left: 18px; right: 18px; height: 26px; border-radius: 3px;
  background:
    repeating-linear-gradient(90deg,transparent 0px,transparent 25px,rgba(0,0,0,.22) 25px,rgba(0,0,0,.22) 26px),
    repeating-linear-gradient(180deg,transparent 0px,transparent 16px,rgba(0,0,0,.22) 16px,rgba(0,0,0,.22) 17px);
  opacity: .4;
}
.macBase::after {
  content: ''; position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); width: 52%; height: 2px;
  background: linear-gradient(90deg,transparent,rgba(255,255,255,.09) 30%,rgba(255,255,255,.14) 50%,rgba(255,255,255,.09) 70%,transparent);
}
.macTrackpad {
  width: 76px; height: 28px;
  background: linear-gradient(165deg,rgba(255,255,255,.07),rgba(255,255,255,.02));
  border-radius: 6px; border: 1px solid rgba(255,255,255,.09);
  box-shadow: inset 0 1px 4px rgba(0,0,0,.55), 0 1px 0 rgba(255,255,255,.07);
  position: relative;
}
.macTrackpad::after {
  content: ''; position: absolute; inset: 0; border-radius: 5px;
  background: linear-gradient(145deg,rgba(255,255,255,.07) 0%,transparent 60%);
  pointer-events: none;
}

/* ══ iPad Pro 11" — Space Gray ══ */
.ipad {
  width: 264px; border-radius: 22px; padding: 14px 10px 10px; position: relative;
  background: linear-gradient(160deg,#4e4e50 0%,#3c3c3e 14%,#2e2e30 32%,#202022 52%,#2a2a2c 68%,#363638 84%,#444446 100%);
  box-shadow:
    inset 2px 2px 0 rgba(255,255,255,.18), inset -1.5px -1.5px 0 rgba(0,0,0,.55),
    inset 0 0 0 1.5px rgba(255,255,255,.07),
    0 0 0 1.5px #0a0a0c, 0 0 0 3px rgba(80,80,88,.35),
    0 6px 18px rgba(0,0,0,.6), 0 30px 80px rgba(0,0,0,.92), 0 60px 140px rgba(0,0,0,.7);
}
.ipad::after {
  content: ''; position: absolute; inset: 0; border-radius: 22px;
  background: linear-gradient(148deg,rgba(255,255,255,.13) 0%,rgba(255,255,255,.04) 28%,transparent 56%,rgba(0,0,0,.06) 100%);
  pointer-events: none; z-index: 20;
}
.ipadCam {
  width: 8px; height: 8px;
  background: radial-gradient(circle at 38% 32%,#242430 15%,#101016 55%,#000 100%);
  border-radius: 50%; border: 1px solid rgba(255,255,255,.08);
  position: absolute; top: 6px; left: 50%; transform: translateX(-50%);
  box-shadow: 0 0 0 2px rgba(0,0,0,.4);
}
.ipadCam::after {
  content: ''; position: absolute; width: 2.5px; height: 2.5px;
  background: rgba(255,255,255,.38); border-radius: 50%; top: 10%; left: 14%;
}
.ipadScreen {
  background: #000; border-radius: 12px; overflow: hidden; height: 368px; position: relative;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.05), inset 0 3px 12px rgba(0,0,0,.65);
}
.ipadScreen::after {
  content: ''; position: absolute; inset: 0; border-radius: 12px;
  background: linear-gradient(140deg,rgba(255,255,255,.1) 0%,rgba(255,255,255,.03) 35%,transparent 65%);
  pointer-events: none; z-index: 200;
}
.ipadHomeBar {
  width: 86px; height: 5px;
  background: linear-gradient(90deg,rgba(255,255,255,.12),rgba(255,255,255,.3),rgba(255,255,255,.12));
  border-radius: 3px; margin: 8px auto 0;
  box-shadow: 0 0 7px rgba(255,255,255,.07);
}
```

- [ ] **Step 2: Create AppContent**

Create `components/sections/devices/AppContent.tsx`:
```tsx
/**
 * Shared scaled app UI content rendered inside device screens.
 * `scale` controls how much the 480px-wide app is shrunk to fit the device screen.
 */
export default function AppContent({ scale }: { scale: number }) {
  return (
    <div style={{ transformOrigin: 'top left', transform: `scale(${scale})`, width: 480 }}>
      {/* Morning Brief */}
      <div style={{ background: '#04070f', padding: 12, minHeight: 900, fontFamily: "'IBM Plex Sans',sans-serif" }}>
        {/* Header */}
        <div style={{ background: 'rgba(0,212,240,.06)', border: '1px solid rgba(0,212,240,.12)', borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: '#6b7894', marginBottom: 4, fontFamily: "'IBM Plex Mono',monospace" }}>TUESDAY, 20 MAY 2025</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 2, color: '#f5f0e8' }}>3 ATHLETES CHECKED IN · SQUAD AVG <span style={{ color: '#00D4F0' }}>68</span></div>
          <div style={{ fontSize: 11, color: '#6b7894', marginTop: 4 }}>Marcus needs a rest day. Priya is peaking — push hard. Jake trains as normal.</div>
        </div>

        {/* Alert */}
        <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: '#ef4444' }}>38</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', fontFamily: "'IBM Plex Mono',monospace", letterSpacing: 1 }}>MARCUS — REST DAY</div>
            <div style={{ fontSize: 11, color: '#6b7894' }}>Low sleep, high fatigue reported. Do not train at intensity today.</div>
          </div>
        </div>

        {/* Readiness scores */}
        <div style={{ fontSize: 9, letterSpacing: 3, color: '#6b7894', fontFamily: "'IBM Plex Mono',monospace", marginBottom: 8 }}>SQUAD READINESS SCORES</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
          {[{n:'PRIYA',s:91,c:'#10b981'},{n:'JAKE',s:74,c:'#c8892a'},{n:'MARCUS',s:38,c:'#ef4444'}].map(a => (
            <div key={a.n} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: '#6b7894', fontFamily: "'IBM Plex Mono',monospace", marginBottom: 6 }}>{a.n}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: a.c }}>{a.s}<span style={{ fontSize: 12, color: '#6b7894' }}>/100</span></div>
              <div style={{ height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 2, marginTop: 6 }}>
                <div style={{ height: '100%', background: a.c, width: `${a.s}%`, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Fight camp section */}
        <div style={{ background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 2 }}>MARCUS "EL TORO" MENDEZ</div>
              <div style={{ fontSize: 11, color: '#6b7894' }}>Fight Night London · Welterweight (77kg)</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: '#ef4444' }}>21</div>
              <div style={{ fontSize: 9, color: '#6b7894', fontFamily: "'IBM Plex Mono',monospace", letterSpacing: 1 }}>DAYS</div>
            </div>
          </div>
          {[{l:'Base Fitness',p:100,c:'#10b981',s:'Complete'},{l:'Sparring Block',p:78,c:'#10b981',s:'Complete'},{l:'Peak Week',p:45,c:'#c8892a',s:'In Progress'},{l:'Weight Cut',p:12,c:'#6b7894',s:'Upcoming'}].map(ph => (
            <div key={ph.l} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <div style={{ fontSize:10, width:90, flexShrink:0, color:'#f5f0e8' }}>{ph.l}</div>
              <div style={{ flex:1, height:4, background:'rgba(255,255,255,.06)', borderRadius:2 }}>
                <div style={{ height:'100%', background:ph.c, width:`${ph.p}%`, borderRadius:2 }} />
              </div>
              <div style={{ fontSize:9, color:ph.c, width:64, textAlign:'right', fontFamily:"'IBM Plex Mono',monospace" }}>{ph.s}</div>
            </div>
          ))}
        </div>

        {/* AI Generator */}
        <div style={{ background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: 2, color: '#8b5cf6' }}>AI SESSION GENERATOR</div>
            <div style={{ fontSize: 11, color: '#6b7894', marginTop: 2 }}>Generate Peak Week training plan</div>
          </div>
          <button style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 11, cursor: 'pointer' }}>Generate</button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create IPhone component**

Create `components/sections/devices/IPhone.tsx`:
```tsx
import styles from './devices.module.css'
import AppContent from './AppContent'

export default function IPhone() {
  return (
    <div className={styles.iphone}>
      <div className={`${styles.btn} ${styles.btnSilent}`} />
      <div className={`${styles.btn} ${styles.btnVolUp}`} />
      <div className={`${styles.btn} ${styles.btnVolDn}`} />
      <div className={styles.btnPower} />

      <div className={styles.iphoneScreen}>
        <div className={styles.island} />
        <div className={styles.statusBar}>
          <span className={styles.statusTime}>9:41</span>
          <div className={styles.statusBatt} />
        </div>
        <div className={styles.iphoneContent}>
          <AppContent scale={0.33} />
        </div>
        <div className={styles.homeBar} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create MacBook component**

Create `components/sections/devices/MacBook.tsx`:
```tsx
import styles from './devices.module.css'
import AppContent from './AppContent'

export default function MacBook() {
  return (
    <div className={styles.macbook}>
      <div className={styles.macLid}>
        <div className={styles.macCam} />
        <div className={styles.macScreen}>
          <AppContent scale={0.88} />
        </div>
      </div>
      <div className={styles.macHinge} />
      <div className={styles.macBase}>
        <div className={styles.macTrackpad} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create IPad component**

Create `components/sections/devices/IPad.tsx`:
```tsx
import styles from './devices.module.css'
import AppContent from './AppContent'

export default function IPad() {
  return (
    <div className={styles.ipad}>
      <div className={styles.ipadCam} />
      <div className={styles.ipadScreen}>
        <AppContent scale={0.50} />
      </div>
      <div className={styles.ipadHomeBar} />
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
cd C:/Users/steph/website-project
git add components/sections/devices/
git commit -m "feat: CSS device frames — iPhone 15 Pro, MacBook Pro 14, iPad Pro 11 with app content"
```

---

## Task 14: CrossPlatform Section

**Files:**
- Create: `components/sections/CrossPlatform.tsx`

- [ ] **Step 1: Create CrossPlatform**

Create `components/sections/CrossPlatform.tsx`:
```tsx
import IPhone from './devices/IPhone'
import MacBook from './devices/MacBook'
import IPad from './devices/IPad'

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
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', marginBottom: 64 }}>
          <div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12 }}>// CROSS-PLATFORM</div>
            <h2 style={{ fontFamily: 'var(--fh)', fontSize: 'clamp(56px,8vw,110px)', lineHeight: .92, letterSpacing: 2 }}>
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

        {/* Device row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 32, paddingBottom: 0 }}>
          {/* iPhone */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <IPhone />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase' }}>MOBILE</div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 3, color: 'var(--accent)', textTransform: 'uppercase' }}>ATHLETES</div>
            </div>
          </div>

          {/* MacBook — dominant center */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, flex: '0 0 auto', maxWidth: 580, width: '100%' }}>
            <MacBook />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase' }}>DESKTOP</div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 3, color: 'var(--accent)', textTransform: 'uppercase' }}>MORNING BRIEF</div>
            </div>
          </div>

          {/* iPad */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <IPad />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase' }}>TABLET</div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 3, color: 'var(--accent)', textTransform: 'uppercase' }}>FIGHT CAMP</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd C:/Users/steph/website-project
git add components/sections/CrossPlatform.tsx
git commit -m "feat: CrossPlatform section — CSS device frames, header, bullet grid"
```

---

## Task 15: Social + Pricing + Footer

**Files:**
- Create: `components/sections/Social.tsx`
- Create: `components/sections/Pricing.tsx`
- Create: `components/sections/Footer.tsx`

- [ ] **Step 1: Create Social**

Create `components/sections/Social.tsx`:
```tsx
export default function Social() {
  return (
    <section style={{ padding: 'clamp(80px,10vw,130px) clamp(20px,5vw,80px)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 40 }}>// WHAT COACHES SAY</div>
        <div style={{ background: 'rgba(8,14,26,.9)', border: '1px solid rgba(255,255,255,.07)', borderLeft: '3px solid var(--amber)', borderRadius: 16, padding: 40, textAlign: 'left' }}>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 'clamp(18px,2.5vw,24px)', lineHeight: 1.6, fontStyle: 'italic', color: 'var(--cream)', marginBottom: 28 }}>
            "Finally a tool built for combat sports, not ported from a generic fitness app. My fighters' readiness is up, weight cuts are smoother, and I spend less time on spreadsheets and more time coaching."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#c8892a,#e0a83a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--fh)', fontSize: 22, color: '#000' }}>R</div>
            <div>
              <div style={{ fontFamily: 'var(--fc)', fontWeight: 700, fontSize: 15 }}>Ray Torres</div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'var(--muted)' }}>HEAD COACH · 12 FIGHTERS</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create Pricing**

Create `components/sections/Pricing.tsx`:
```tsx
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
    <section id="pricing" style={{ padding: 'clamp(80px,10vw,130px) clamp(20px,5vw,80px)', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 4, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12 }}>// PRICING</div>
      <h2 style={{ fontFamily: 'var(--fh)', fontSize: 'clamp(36px,5vw,64px)', letterSpacing: 2, marginBottom: 56 }}>
        OLD SCHOOL GRIT.<br />NEW SCHOOL DATA.
      </h2>

      <div style={{ display: 'inline-block', background: 'linear-gradient(145deg,rgba(200,137,42,.12),rgba(200,137,42,.06))', border: '1px solid rgba(200,137,42,.3)', borderRadius: 24, padding: '48px 56px', maxWidth: 480, width: '100%', boxShadow: '0 0 80px rgba(200,137,42,.08)' }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--fb)', fontSize: 20, color: 'var(--muted)', textDecoration: 'line-through', marginRight: 12 }}>$149</span>
          <span style={{ fontFamily: 'var(--fh)', fontSize: 72, color: 'var(--amber)', letterSpacing: 2 }}>$99</span>
          <span style={{ fontFamily: 'var(--fb)', color: 'var(--muted)', fontSize: 16 }}>/mo</span>
        </div>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', marginBottom: 36 }}>EVERYTHING INCLUDED · CANCEL ANYTIME</div>

        <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {features.map((f) => (
            <li key={f} style={{ display: 'flex', gap: 12, alignItems: 'center', fontFamily: 'var(--fb)', fontSize: 15 }}>
              <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        <a href="https://strikepane.uk" style={{
          display: 'block', background: 'linear-gradient(135deg,#c8892a,#e0a83a)',
          color: '#000', fontWeight: 700, borderRadius: 100, padding: '16px 32px',
          fontSize: 16, boxShadow: '0 0 40px rgba(200,137,42,.45)', textAlign: 'center',
          letterSpacing: .5,
        }}>
          Start Your Free Trial
        </a>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create Footer**

Create `components/sections/Footer.tsx`:
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
          <div style={{ fontFamily: 'var(--fh)', fontSize: 22, letterSpacing: 4, marginBottom: 6 }}>
            STRIKE<span style={{ color: 'var(--accent)' }}>PANEL</span>™
          </div>
          <div style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--muted)' }}>Training intelligence for combat sports coaches.</div>
        </div>
        <nav style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {links.map((l) => (
            <a key={l.label} href={l.href} style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--cream)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
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

- [ ] **Step 4: Commit**

```bash
cd C:/Users/steph/website-project
git add components/sections/Social.tsx components/sections/Pricing.tsx components/sections/Footer.tsx
git commit -m "feat: Social proof, Pricing card, Footer"
```

---

## Task 16: Page Assembly

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Assemble all sections**

Replace `app/page.tsx`:
```tsx
import Nav from '@/components/nav/Nav'
import Hero from '@/components/hero/Hero'
import Ticker from '@/components/sections/Ticker'
import Stats from '@/components/sections/Stats'
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
        <Stats />
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

- [ ] **Step 2: Run all tests**

```bash
cd C:/Users/steph/website-project && npx vitest run 2>&1 | tail -10
```
Expected: all test files pass (nav, features, hero-widget, reveal-wrapper).

- [ ] **Step 3: Build for production**

```bash
cd C:/Users/steph/website-project && npm run build 2>&1 | tail -15
```
Expected: `✓ Compiled successfully` with no errors. If `useRef`/`useEffect` errors appear in server components, ensure those files have `'use client'` at the top.

- [ ] **Step 4: Smoke test dev server**

```bash
cd C:/Users/steph/website-project && npm run dev &
sleep 5 && curl -s http://localhost:3000 | grep -o 'StrikePanel' | head -1
pkill -f "next dev"
```
Expected: `StrikePanel`

- [ ] **Step 5: Final commit**

```bash
cd C:/Users/steph/website-project
git add app/page.tsx
git commit -m "feat: page assembly — all sections wired up"
```

---

## Self-Review Checklist

**Spec coverage audit:**

| Spec Section | Task Covered |
|---|---|
| 3.1 Nav — fixed, blur, amber CTA | Task 5 |
| 3.2 Hero — photo bg, orbs, grid, widget, R3F | Tasks 6, 7, 8 |
| 3.3 Ticker — infinite marquee | Task 9 |
| 3.4 Stats Bar — 4 stats | Task 9 |
| 3.5 Problem — two-column dark section | Task 10 |
| 3.6 Demo — iframe embed | Task 11 |
| 3.7 Features — 5 tabs, all panels | Task 12 |
| 3.8 CrossPlatform — CSS devices | Tasks 13, 14 |
| 3.9 Social Proof — coach quote | Task 15 |
| 3.10 Pricing — amber card, $99 | Task 15 |
| 3.11 Footer — links, amber border | Task 15 |
| Brand system — tokens, Tailwind | Task 2 |
| Animation variants | Task 3 |
| RevealWrapper — IntersectionObserver | Task 3 |
| Performance — lazy HeroCanvas | Task 8 (`dynamic`) |
| Tests — nav, features, widget, reveal | Tasks 3, 5, 6, 12 |

All 17 spec sections have corresponding tasks. No gaps found.

**Type consistency:** `AppContent` accepts `{ scale: number }` — used consistently as `scale={0.33}`, `scale={0.88}`, `scale={0.50}` in Tasks 13-14. ✓

**No placeholders:** All code blocks contain actual implementations. ✓
