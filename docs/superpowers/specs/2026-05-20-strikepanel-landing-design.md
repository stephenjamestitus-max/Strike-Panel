# StrikePanel™ Landing Page — Design Spec
**Date:** 2026-05-20  
**Stack:** Next.js 15 (App Router) · React Three Fiber · Framer Motion · Tailwind CSS  
**Target:** Production-quality marketing landing page for StrikePanel™ combat sports coaching SaaS

---

## 1. Brand System

| Token | Value |
|---|---|
| `--bg` | `#04070f` |
| `--surface` | `#0b1120` |
| `--card` | `#0f1828` |
| `--accent` | `#00D4F0` (cyan) |
| `--amber` | `#c8892a` |
| `--gold` | `#e0a83a` |
| `--green` | `#10b981` |
| `--red` | `#ef4444` |
| `--purple` | `#8b5cf6` |
| `--cream` | `#f5f0e8` |
| `--muted` | `#7a85a0` |
| Headline font | Bebas Neue (`--fh`) |
| Body font | IBM Plex Sans (`--fc`) / Barlow (`--fb`) |
| Data font | IBM Plex Mono (`--fm`) |

CTA buttons: amber-to-gold pill gradient, black text, `border-radius: 100px`, glow shadow `rgba(200,137,42,.4)`.  
Ghost buttons: `border: 1px solid rgba(255,255,255,.12)`, no fill.

---

## 2. Architecture

```
app/
  page.tsx              ← root landing page, assembles all sections
  layout.tsx            ← fonts, global meta, body bg

components/
  nav/
    Nav.tsx             ← fixed, blur backdrop, amber CTA pill
  hero/
    Hero.tsx            ← layout shell, parallax wrapper
    HeroCanvas.tsx      ← R3F scene (particles, floating orbs)
    HeroWidget.tsx      ← readiness widget, scanline, pulse-dot
  sections/
    Ticker.tsx          ← infinite CSS marquee
    Stats.tsx           ← 4-stat bar (500+, $0, 14, ∞)
    Problem.tsx         ← dark photo bg, problem/fix two-column
    Demo.tsx            ← iframe embed of strikepanel.uk/demo
    Features.tsx        ← 5-tab feature showcase with app UI mockups
    CrossPlatform.tsx   ← real Vercel marketing images
    Social.tsx          ← quote testimonial
    Pricing.tsx         ← amber card, "Old School Grit. New School Data."
    Footer.tsx          ← links, amber border-top
  ui/
    RevealWrapper.tsx   ← IntersectionObserver fade-up utility

lib/
  animations.ts         ← shared Framer Motion variants
  constants.ts          ← brand tokens as JS constants
```

All sections are React Server Components by default. Client components (`'use client'`) only where needed: Nav (scroll state), Hero (mouse parallax + R3F), Features (tab state), HeroWidget (CSS animations).

---

## 3. Section-by-Section Spec

### 3.1 Nav
- Fixed, `z-index: 200`, blur backdrop `blur(28px)`
- Left: `STRIKE<cyan>PANEL</cyan>™` in Bebas Neue, letter-spacing 4px
- Center links: `FEATURES · DEMO · PRICING` in IBM Plex Mono, 10px, 2.5px letter-spacing
- Right: amber pill CTA — "START FREE TRIAL"
- On scroll >40px: border-bottom `rgba(255,255,255,.05)` intensifies

### 3.2 Hero
- Full-viewport height, dark boxer photo bg (Unsplash), `brightness(.15) saturate(.45)`
- Three overlay layers: directional gradient (left opaque → right transparent), bottom fade, cyan grid (`64×64px`, `rgba(0,212,240,.032)`)
- Two ambient orbs: cyan 700px top-left, amber 500px bottom-right — `ambientPulse` animation
- **R3F canvas** (right 40% of hero): floating particle cluster (~400 particles), mouse-driven camera tilt, cyan glow point lights. Falls back to CSS orbs if WebGL unavailable.
- Left column: kicker line → H1 (Bebas Neue, `clamp(74px,9.5vw,120px)`, outline text in cyan) → subtext → amber CTA + ghost button
- Right column: **HeroWidget** — readiness summary card, 3 athletes (Priya 91 cyan, Jake 74 amber, Marcus 38 red), animated progress bars, scanline effect, floating glow animation
- Mouse parallax: `perspective(1200px) rotateX rotateY` on widget, ±6° max

### 3.3 Ticker
- Infinite horizontal marquee, 40s loop
- Items: `MORNING BRIEF · FIGHT CAMP · ATHLETE MANAGEMENT · AI SESSIONS · PROGRESS TRACKING · WEIGHT CUT TOOLS · FIGHT COUNTDOWN · READINESS SCORES`
- Separator: `·` in amber

### 3.4 Stats Bar
- 4 stats: `500+ Athletes Tracked` / `$0 Setup Cost` / `14 Sport Categories` / `∞ AI Sessions`
- Bebas Neue numbers, IBM Plex Mono labels
- Thin `1px solid rgba(255,255,255,.05)` separator between stats

### 3.5 Problem Section
- Background: dark combat sports photo, heavy overlay
- Two columns: **THE PROBLEM** (pain points, muted text) / **THE FIX** (StrikePanel solutions, cyan accents)
- Pain points: spreadsheets, no fight camp tools, guessing readiness, lost athlete history
- Fix points: one dashboard, fight camp timelines, readiness scores, AI session plans

### 3.6 Demo Section
- `<iframe src="https://strikepanel.uk/demo" />` — 820×580px, dark border, rounded corners
- Label above: "LIVE DEMO — No signup required"
- Subtle ambient glow behind iframe

### 3.7 Features — 5-Tab Showcase
Tab navigation: pill-shaped tabs, active = amber gradient, inactive = muted border. Tab panels use HTML mockups (not screenshots) styled to match actual app CSS.

**Tab 1: Morning Brief**
- `brief-hero` banner: "3 ATHLETES CHECKED IN · SQUAD AVG 68"
- Alert card: Marcus — rest day recommended (red `ef4444`)
- 3-column readiness grid: Priya 91 (green), Jake 74 (amber), Marcus 38 (red) — each with sport/weight-class label, color-coded score badge
- Activity timeline: check-in events
- Squad overview: 4-stat grid (Avg Readiness, Checked In, On Alert, Sessions Today)

**Tab 2: Fight Camp**
- Stats row: 21 days to fight / 79.2kg current / 77kg target
- Red `fight-card`: "MARCUS · EL TORO MENDEZ · FIGHT NIGHT LONDON" with Bebas Neue countdown `ef4444`
- Weight cut table: Wk 1–4, date/target/actual/status columns
- Phase progress bars: Base Building (100%) / Sparring (78%) / Peak Performance (45%) / Weight Cut (12%)

**Tab 3: Athletes**
- 3-stat summary: 12 Active / 3 On Alert / 2 In Camp
- Roster list: each row has avatar initials, name, sport/weight-class/record, score badge
  - Priya Sharma — Muay Thai · 52kg · 18-2 — score 91 (green)
  - Jake Thompson — Boxing · 67kg · 22-4 — score 74 (amber)
  - Marcus Mendez — MMA · 77kg · 15-3 — score 38 (red)
- Two expanded athlete detail cards with recent metrics

**Tab 4: AI Sessions**
- `ai-bar`: "AI SESSION GENERATOR" with purple gradient
- Generated plan: "Peak Week — Fight Prep" for Marcus
- 7 exercises listed with duration/intensity: Jump Rope (10min warm-up) → Shadow Boxing (3×3min) → Heavy Bag (5×3min) → Pad Work (4×3min) → Sprawl & Shoot (3×5min) → Core Circuit (15min) → Cool Down (10min)
- Save / Regenerate action buttons

**Tab 5: Progress**
- SVG polyline chart: 3 colored lines (Readiness cyan, Performance amber, Recovery green) over 14 days, subtle grid, axis labels
- 8-week performance table: W1–W8 rows, columns: Readiness / Performance / Recovery / Sessions, color-coded values, trend arrows (↗ → ↘)

### 3.8 Cross-Platform Section
- Heading: "RUNS ON EVERYTHING" (Bebas Neue, `clamp(56px,8vw,110px)`)
- Subtext: "Phone, tablet, laptop. Install from your browser — no app store, no update prompts, works offline. One license covers every device you own."
- Feature bullets (right column): WORKS OFFLINE · ONE LICENSE · HOME SCREEN INSTALL · YOUR DATA, NEVER OURS
- **Pure CSS device frames** (no images — eliminates bleed entirely):
  - **iPhone 15 Pro** (Natural Titanium): warm golden-brown multi-stop linear-gradient body, multi-layer `box-shadow` for chamfer highlights + cast shadow, Dynamic Island pill with camera lens + proximity sensor pseudo-elements, status bar showing "9:41" + green battery, side buttons, home bar pill, screen glare via `::after` diagonal gradient. Label: "MOBILE / ATHLETES"
  - **MacBook Pro 14"** (Space Gray): lid with cool mid-gray gradient + camera dot with green LED reflection, hinge with highlight stripe, base with CSS keyboard texture grid + centered trackpad, `filter: drop-shadow()` cast shadow. Label: "DESKTOP / MORNING BRIEF"
  - **iPad Pro 11"** (Space Gray): rounded-rect body with chamfer highlights, top camera dot, screen with glare overlay, home bar pill. Label: "FIGHT CAMP"
- Each device screen contains a scaled (`transform: scale()`) live HTML mockup of the actual app UI — no screenshots
- Device layout: iPhone left · MacBook center (dominant) · iPad right
- Framer Motion: subtle `useScroll` + `useTransform` vertical parallax on the device group (iPhone/iPad float slightly relative to MacBook)

### 3.9 Social Proof
- Single coach quote, dark card, amber left-border accent
- "Finally a tool built for combat sports, not ported from a generic fitness app."

### 3.10 Pricing
- Heading: "Old School Grit. New School Data."
- Was `$149` (struck through) → Now `$99/mo` in amber
- Feature list: All sport categories, unlimited athletes, AI sessions, fight camp tools, weight cut tracker
- Amber pill CTA: "Start Your Free Trial"

### 3.11 Footer
- `border-top: 2px solid rgba(200,137,42,.25)`
- Left: logo + tagline
- Right: links (Features, Demo, Pricing, Privacy, Terms)
- Bottom: "© 2025 StrikePanel™"

---

## 4. Animation System

| Element | Technique |
|---|---|
| Section entrances | Framer Motion `fadeUp` — `opacity 0→1`, `y 28→0`, `duration 0.65s`, staggered children |
| Hero H1 / kicker | CSS `fadeUp` keyframe on load, `animation-delay` per element |
| HeroWidget float | CSS `float` keyframe — `translateY(-10px) rotateX(1deg)`, 7s loop |
| Widget scanline | CSS `scanline` keyframe — vertical scan stripe, 4s linear loop |
| Widget glow | CSS `glow` keyframe — box-shadow pulse, 4s ease loop |
| Progress bars | CSS `drawBar` — `width: 0 → actual`, 0.9s ease, staggered delay |
| Live pulse dot | CSS `pulse-dot` — radial shadow expand/fade, 2s loop |
| Ticker | CSS `ticker` — `translateX(0 → -50%)`, 40s linear infinite |
| Ambient orbs | CSS `ambientPulse` — opacity `.04 → .09`, 7s ease loop |
| R3F particles | Three.js BufferGeometry points, `useFrame` rotation, mouse event listener |
| Cross-platform images | Framer Motion `useScroll` + `useTransform` — subtle Y offset parallax |
| Tab switch | Framer Motion `AnimatePresence` — fade + slight slide |

---

## 5. Performance Constraints

- R3F canvas is `lazy`-loaded; static placeholder shown until canvas ready
- All section images use `next/image` with `loading="lazy"` and explicit dimensions
- Fonts loaded via `next/font/google` (no FOUT)
- Ticker uses CSS-only animation (no JS)
- IntersectionObserver polyfilled for `.reveal` elements
- Target: LCP < 2.5s, CLS < 0.1, no layout shift from font load

---

## 6. File Deliverables (Implementation Order)

1. `app/layout.tsx` — fonts, meta, body styles
2. `lib/constants.ts` — brand tokens
3. `lib/animations.ts` — Framer Motion variants
4. `components/nav/Nav.tsx`
5. `components/hero/HeroWidget.tsx`
6. `components/hero/HeroCanvas.tsx` (R3F)
7. `components/hero/Hero.tsx`
8. `components/sections/Ticker.tsx`
9. `components/sections/Stats.tsx`
10. `components/sections/Problem.tsx`
11. `components/sections/Demo.tsx`
12. `components/sections/Features.tsx` (with all 5 tab panels)
13. `components/sections/CrossPlatform.tsx`
14. `components/sections/Social.tsx`
15. `components/sections/Pricing.tsx`
16. `components/sections/Footer.tsx`
17. `app/page.tsx` — assembles all sections
18. `tailwind.config.ts` — brand color extensions
