# StrikePanel Landing Page Redesign — Design Spec

## Goal

Apply Jack's visual design language (Kanit font, gradient headings, Framer Motion FadeIn, Magnet CTAs, scroll-driven parallax) to the existing StrikePanel `/` landing page. All content (text, numbers, features, links) stays identical. Only UI/UX changes. Brand colours (amber `#c8892a`, cyan `#00D4F0`, dark navy `#04070f`) are preserved throughout.

## Design Decisions

- **Approach:** Hybrid — deep redesign on Hero, Problem, Pricing; light upgrade (font + animation) on all other sections
- **Hero video:** `public/training.mp4` (copy from `Downloads/277900_medium.mp4`) — full-bleed, B&W desaturated, film grain overlay, scanlines, parallax on scroll
- **Typography:** Kanit 900 replaces Bebas Neue on all headings; Kanit 400/700 on nav + buttons; IBM Plex Mono kept for data/label text
- **Animation system:** RevealWrapper removed everywhere; Framer Motion `FadeIn` (from `components/ui/`) used throughout
- **Stats section:** Absorbed into Hero frosted-glass bottom bar — removed from `page.tsx`
- **Problem section:** Becomes white-background section with rounded top, dark text — the contrast moment of the page
- **Pricing section:** Dark bg returns via rounded-top section transition, Jack-style card border

---

## Architecture

### Shared UI components relocated

`FadeIn` and `Magnet` currently live in `components/jack/ui/`. They will be **moved** to `components/ui/` so both `/jack` and `/` can import from the same place.

```
components/ui/
  FadeIn.tsx      (moved from components/jack/ui/FadeIn.tsx)
  Magnet.tsx      (moved from components/jack/ui/Magnet.tsx)
  RevealWrapper.tsx  (kept, not deleted — other code may reference it)
```

All Jack section files that import `../ui/FadeIn` or `../ui/Magnet` must be updated to `@/components/ui/FadeIn` etc. after the move.

### Files modified

```
app/globals.css                          Add Kanit font import + --fk variable
app/page.tsx                             Remove <Stats />, remove <RevealWrapper> wrappers
public/training.mp4                      Copy from Downloads

components/ui/FadeIn.tsx                 Moved from components/jack/ui/
components/ui/Magnet.tsx                 Moved from components/jack/ui/
components/jack/ui/FadeIn.tsx            Deleted (moved)
components/jack/ui/Magnet.tsx            Deleted (moved)
components/jack/sections/*.tsx           Update FadeIn/Magnet imports → @/components/ui/

components/nav/Nav.tsx                   Kanit logo, Kanit nav links, Magnet CTA
components/hero/Hero.tsx                 Full rewrite — video bg, grain, parallax, stats bar
components/hero/HeroWidget.tsx           Kept (untouched — used internally)
components/hero/HeroCanvas.tsx           Removed from Hero, no longer imported
components/sections/Stats.tsx            Untouched (just removed from page.tsx)
components/sections/Problem.tsx          Full rewrite — white bg, Kanit, FadeIn list
components/sections/Demo.tsx             Kanit heading, FadeIn wrapper
components/sections/Features.tsx         Kanit heading + tab labels, FadeIn wrapper
components/sections/CrossPlatform.tsx    Kanit heading, FadeIn wrapper
components/sections/Social.tsx           Kanit quote font, FadeIn wrapper
components/sections/Pricing.tsx          Full rewrite — dark rounded card, Kanit price, Magnet CTA
components/sections/Footer.tsx           Kanit logo
```

---

## Section Specs

### globals.css

Add Kanit to the existing Google Fonts `@import` URL:

```
family=Kanit:wght@300;400;700;900&
```

Add CSS variable after existing variables:

```css
--fk: 'Kanit', sans-serif;
```

### page.tsx

Remove `<Stats />` import and usage. Remove all `<RevealWrapper>` wrappers — sections animate themselves via FadeIn internally. Final structure:

```tsx
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
```

### Nav

**File:** `components/nav/Nav.tsx`

Keep: fixed positioning, blur backdrop, scroll border-bottom behaviour.

Changes:
- Logo `<a>`: `fontFamily: 'var(--fk)'`, `fontWeight: 900`, `fontSize: 22`, `letterSpacing: 4` — same text "STRIKE<span accent>PANEL</span>™"
- Nav links: `fontFamily: 'var(--fk)'`, `fontWeight: 400`, `fontSize: 12`, `letterSpacing: '2px'`
- CTA `<a href="#pricing">`: wrap in `<Magnet padding={100} strength={4}>`. Keep existing gradient, border-radius: 100, padding, boxShadow styles.
- Wrap entire nav content in `<FadeIn delay={0} y={-20}>` (slides down from top on mount)

### Hero

**File:** `components/hero/Hero.tsx` — **full rewrite**

Remove: HeroCanvas import, HeroWidget usage, background photo div, cyan/amber radial ambient divs, grid overlay div, static CSS animations (`fadeUp`).

Structure:

```
<section> h-screen flex flex-col relative overflow-hidden
  │
  ├── Framer Motion video parallax wrapper — position absolute, inset -10%, z-index 0
  │     useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  │     y = useTransform(scrollYProgress, [0,1], [0, 120])   ← video moves slower than page
  │     │
  │     └── <video> — fills the motion.div
  │           src="/training.mp4" autoPlay muted loop playsInline
  │           style: position absolute, inset 0, width/height 100%, object-fit cover,
  │                  object-position center 30%, filter: saturate(0.15) brightness(0.75)
  │
  ├── Grain overlay div — position absolute, inset 0, z-index 1, pointer-events none
  │     background: SVG data-URI fractal noise, opacity 0.06, mix-blend-mode overlay
  │
  ├── Scanlines div — position absolute, inset 0, z-index 1, pointer-events none
  │     background: repeating-linear-gradient(0deg, transparent 0px 2px, rgba(0,0,0,0.04) 2px 4px)
  │
  ├── Vignette + gradient overlay div — position absolute, inset 0, z-index 2
  │     background:
  │       radial-gradient(ellipse at 50% 50%, transparent 25%, rgba(4,7,15,0.75) 100%),
  │       linear-gradient(to right, rgba(4,7,15,0.92) 0%, rgba(4,7,15,0.65) 45%, rgba(4,7,15,0.25) 100%),
  │       linear-gradient(to top, rgba(4,7,15,1) 0%, transparent 55%)
  │
  ├── Content div — position relative, z-index 10, flex flex-col, flex 1, px clamp(20px→80px), pt 100px
  │   │
  │   ├── FadeIn delay=0 y=-20
  │   │     eyebrow: fontFamily var(--fm), fontSize 11, letterSpacing 4, color var(--accent)
  │   │     text: "// TRAINING INTELLIGENCE"
  │   │
  │   ├── FadeIn delay=0.15 y=40
  │   │     <h1> fontFamily var(--fk), fontWeight 900, fontSize clamp(72px,13vw,160px)
  │   │          lineHeight 0.88, textTransform uppercase, letterSpacing -1px
  │   │          background: linear-gradient(180deg, #646973 0%, #BBCCD7 100%)
  │   │          -webkit-background-clip text, color transparent
  │   │     text: "COACH\nSMARTER.\nWIN MORE."
  │   │     Note: remove the --accent stroke from "SMARTER." — gradient covers all three lines
  │   │
  │   ├── FadeIn delay=0.3 y=20
  │   │     <p> fontFamily var(--fb), fontSize 18, color rgba(245,240,232,.7), lineHeight 1.65
  │   │     text: "Morning briefs, fight camp timelines, AI session plans, and readiness scores — all in one dashboard built for combat sports."
  │   │
  │   ├── FadeIn delay=0.45 y=20
  │   │     Buttons row (flex gap-4)
  │   │     Primary: <Magnet> wrapping <a href="#pricing">
  │   │       background: linear-gradient(135deg,#c8892a,#e0a83a), color #000, fontWeight 700
  │   │       borderRadius 100px, padding 14px 32px, fontSize 15
  │   │       boxShadow: 0 0 32px rgba(200,137,42,.45)
  │   │       fontFamily var(--fk), letterSpacing 0.5px
  │   │       text: "Get Access — $99"
  │   │     Ghost: <Magnet> wrapping <a href="#demo">
  │   │       border: 1px solid rgba(255,255,255,.18), color var(--cream)
  │   │       borderRadius 100px, padding 14px 28px, fontSize 15
  │   │       background: rgba(255,255,255,.03), fontFamily var(--fk)
  │   │       text: "Watch Demo"
  │   │
  │   └── mt-auto (pushes stats bar to bottom)
  │
  └── Stats bar — position absolute, bottom 0, left 0, right 0, z-index 20
        background: rgba(4,7,15,0.55), backdropFilter blur(16px)
        borderTop: 1px solid rgba(255,255,255,0.07)
        display grid, grid-template-columns repeat(4,1fr)
        Stats: [500+ / Athletes Tracked], [$0 / Setup Cost], [14 / Sport Categories], [∞ / AI Sessions]
        Each cell: textAlign center, padding 20px 12px
        Value: fontFamily var(--fk), fontWeight 900, fontSize clamp(28px,4vw,48px), color var(--amber)
        Label: fontFamily var(--fm), fontSize 9, letterSpacing 3, color var(--muted), textTransform uppercase
```

### Problem

**File:** `components/sections/Problem.tsx` — **full rewrite**

White background section with rounded top corners — the contrast moment between dark Hero and dark Demo.

```
<section>
  borderRadius: '60px 60px 0 0'   ← rounded top only
  background: #ffffff
  padding: clamp(80px,10vw,140px) clamp(20px,5vw,80px)
  marginTop: -40px                ← overlaps bottom of Hero slightly for smooth flow
  position: relative, zIndex: 5

  ├── Section heading (centered, dark text)
  │     eyebrow: fontFamily var(--fm), fontSize 10, letterSpacing 4, color #c8892a, uppercase
  │     text: "// THE PROBLEM & THE FIX"
  │     <h2> fontFamily var(--fk), fontWeight 900, fontSize clamp(3rem,9vw,120px)
  │          color #0C0C0C, lineHeight 0.9, textTransform uppercase, textAlign center
  │          marginBottom clamp(48px,8vw,96px)
  │     text: "COACHING\nON SPREADSHEETS\nIS KILLING\nYOUR EDGE"
  │
  └── Two-column grid, maxWidth 1200, margin auto, gap 64px
        Left column — THE PROBLEM
          eyebrow: fontFamily var(--fm), fontSize 10, letterSpacing 4, color #ef4444, uppercase
          text: "// THE PROBLEM"
          Each problem item as a row (FadeIn delay staggered 0, 0.1, 0.2, 0.3s):
            paddingY 20px, borderBottom 1px solid rgba(12,12,12,0.1)
            ✕ icon: color #ef4444, fontFamily var(--fk), fontWeight 700, fontSize 20, flexShrink 0
            text: fontFamily var(--fb), fontSize clamp(15px,1.8vw,18px), color #0C0C0C
          Problems: (same array as before, all 4 items)

        Right column — THE FIX
          eyebrow: fontFamily var(--fm), fontSize 10, letterSpacing 4, color #10b981, uppercase
          text: "// THE FIX"
          Each fix item as a row (FadeIn delay staggered 0.1, 0.2, 0.3, 0.4s):
            paddingY 20px, borderBottom 1px solid rgba(12,12,12,0.1)
            ✓ icon: color #10b981, fontFamily var(--fk), fontWeight 700, fontSize 20, flexShrink 0
            text: fontFamily var(--fb), fontSize clamp(15px,1.8vw,18px), color #0C0C0C
          Fixes: (same array as before, all 4 items)
```

### Demo

**File:** `components/sections/Demo.tsx`

Changes only:
- Eyebrow `// LIVE DEMO`: add `fontFamily: 'var(--fk)'`
- `<h2>` "SEE IT IN ACTION": `fontFamily: 'var(--fk)'`, `fontWeight: 900`, add gradient text (same linear-gradient(180deg, #646973→#BBCCD7) with background-clip)
- Wrap the whole inner content div in `<FadeIn delay={0} y={40}>`
- Wrap the iframe div in `<FadeIn delay={0.15} y={20}>`
- Keep existing cyan ambient glow, border, boxShadow on iframe wrapper — untouched

### Features

**File:** `components/sections/Features.tsx`

Changes only:
- Section heading: `fontFamily: 'var(--fk)'`, `fontWeight: 900`, gradient text
- Tab button labels: `fontFamily: 'var(--fk)'`, `fontWeight: 700`
- Wrap section heading in `<FadeIn delay={0} y={40}>`
- Wrap tab container in `<FadeIn delay={0.15}>`
- AnimatePresence tab panel kept as-is

### CrossPlatform

**File:** `components/sections/CrossPlatform.tsx`

Changes only:
- Section heading: `fontFamily: 'var(--fk)'`, `fontWeight: 900`, gradient text
- Wrap heading in `<FadeIn delay={0} y={40}>`
- Wrap device row in `<FadeIn delay={0.15}>`
- DeviceParallax kept as-is

### Social

**File:** `components/sections/Social.tsx`

Changes only:
- Eyebrow `// WHAT COACHES SAY`: `fontFamily: 'var(--fk)'`
- Quote `<p>`: `fontFamily: 'var(--fk)'`, `fontWeight: 300` (light Kanit for italics feel)
- Name: `fontFamily: 'var(--fk)'`, `fontWeight: 700`
- Role: keep `var(--fm)` (mono label)
- Wrap whole inner div in `<FadeIn delay={0} y={40}>`
- Keep amber left border, dark card bg — untouched

### Pricing

**File:** `components/sections/Pricing.tsx` — **full rewrite**

Dark section returning after white Problem. Rounded top transitions back to dark.

```
<section id="pricing">
  background: var(--bg)  (#04070f)
  borderRadius: '60px 60px 0 0'
  marginTop: -40px
  position relative, zIndex 10
  padding: clamp(80px,10vw,130px) clamp(20px,5vw,80px)
  textAlign: center

  ├── FadeIn delay=0 y=40
  │     eyebrow: fontFamily var(--fm), fontSize 10, letterSpacing 4, color var(--accent), uppercase
  │     text: "// PRICING"
  │     <h2> fontFamily var(--fk), fontWeight 900, fontSize clamp(3rem,9vw,120px)
  │          lineHeight 0.9, textTransform uppercase, gradient text (#646973→#BBCCD7)
  │          marginBottom clamp(48px,8vw,80px)
  │     text: "OLD SCHOOL\nGRIT.\nNEW SCHOOL\nDATA."
  │
  └── FadeIn delay=0.2 y=30
        Card: inline-block, border: 2px solid rgba(215,226,234,0.25)
              borderRadius clamp(40px,5vw,60px), padding 48px 56px
              background rgba(12,12,12,0.6), backdropFilter blur(12px)
              maxWidth 480, width 100%
              boxShadow: 0 0 80px rgba(200,137,42,0.08)

              Price row:
                <span> "$149" — fontFamily var(--fb), fontSize 20, color var(--muted), textDecoration line-through
                <span> "$99"  — fontFamily var(--fk), fontWeight 900, fontSize clamp(72px,10vw,120px), color var(--amber)
                <span> "/mo"  — fontFamily var(--fb), color var(--muted), fontSize 16

              Subtitle: fontFamily var(--fm), fontSize 10, letterSpacing 3, color var(--muted)
              text: "EVERYTHING INCLUDED · CANCEL ANYTIME"

              Feature list: same 8 features, fontFamily var(--fb), fontSize 15
                ✓ icon: color var(--green)

              CTA: <Magnet padding={120} strength={3}>
                    <a href="https://strikepanel.uk">
                      background: linear-gradient(135deg,#c8892a,#e0a83a)
                      color #000, fontWeight 700, fontFamily var(--fk)
                      borderRadius 100px, padding 16px 32px, fontSize 16
                      boxShadow: 0 0 40px rgba(200,137,42,.45)
                      display block, textAlign center
                    text: "Start Your Free Trial"
```

### Footer

**File:** `components/sections/Footer.tsx`

Changes only:
- Logo: `fontFamily: 'var(--fk)'`, `fontWeight: 900` — same text, same letterSpacing
- Nav links: `fontFamily: 'var(--fk)'`, `fontWeight: 400`
- Keep amber top border, layout, copyright — untouched

---

## Video Setup

1. Copy `C:\Users\steph\Downloads\277900_medium.mp4` → `C:\Users\steph\website-project\public\training.mp4`
2. The `<video>` element in Hero:
   ```tsx
   <video
     src="/training.mp4"
     autoPlay muted loop playsInline
     style={{
       position: 'absolute', inset: 0,
       width: '100%', height: '100%',
       objectFit: 'cover', objectPosition: 'center 30%',
       filter: 'saturate(0.15) brightness(0.75)',
     }}
   />
   ```
3. The video lives inside a `motion.div` with `useScroll` parallax:
   ```tsx
   const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
   const y = useTransform(scrollYProgress, [0, 1], [0, 120])
   // motion.div style={{ y, position: 'absolute', inset: '-10%' }}
   ```

---

## CSS Grain Overlay

Applied as a `position: absolute` div above the video, `z-index: 1`:

```css
background-image: url("data:image/svg+xml,<svg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
background-size: 180px 180px;
opacity: 0.06;
mix-blend-mode: overlay;
pointer-events: none;
```

Scanlines div above that:

```css
background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px);
pointer-events: none;
```

---

## Constraints

- **No content changes** — all text, numbers, feature lists, links identical to current. Exception: Problem and Pricing section *headings* are redesigned (new larger Kanit h2s added above existing content) per the "improvise the flow" direction — individual items, prices, and features are unchanged
- **No route changes** — `/` page only
- **No new dependencies** — Framer Motion already installed; no new packages
- **HeroCanvas** — no longer imported in Hero; Three.js stays in package.json (used elsewhere or harmless)
- **HeroWidget** — no longer used in Hero (stats absorbed into bottom bar); file kept but not imported
- **RevealWrapper** — file kept (not deleted), just no longer used in page.tsx
- **Stats.tsx** — file kept (not deleted), just removed from page.tsx import and usage
