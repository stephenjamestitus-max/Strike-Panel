# /carousel — Generate Instagram Carousel Post

## Usage
```
/carousel "Stop guessing which athletes are ready"
/carousel --pillar=weightcut --slides=6
/carousel --topic="fight camp overtraining"
```

## What This Does
Generates a branded 6-slide Instagram carousel (1080x1080 PNG @2x retina)
using HTML/CSS templates rendered via Puppeteer. Outputs to marketing/carousels/.
Optionally posts to Instagram via Zernio.

## Slide Structure
1. Cover slide — bold headline, subtitle, strikepanel logo
2-5. Content slides — insight per slide, numbered, dark grid background
6. CTA slide — $99 stat, "One-time. No subscription.", link in bio

## Instructions

1. Ask user for topic or infer from current content pillar (see CLAUDE.md).

2. Plan the 6 slides:
   - Slide 1 (cover): hook headline that stops the scroll
   - Slide 2: name the problem coaches face
   - Slide 3: stat or insight (use type: 'stat' for big number impact)
   - Slide 4: the solution / what changes
   - Slide 5: the outcome / result coaches get
   - Slide 6 (CTA): $99, no subscription, link in bio

3. Build slide data array following this schema:
   ```js
   [
     { type: 'cover', headline: '...', body: '...' },
     { headline: '...', body: '...' },
     { type: 'stat', stat: '80%', statLabel: '...', body: '...' },
     { headline: '...', body: '...' },
     { headline: '...', body: '...' },
     { type: 'stat', stat: '$99', statLabel: 'One-time. No subscription.', body: '...' },
   ]
   ```

4. Run carousel generator:
   ```
   node scripts/marketing/carousel-generator.js
   ```
   Or write a small inline script calling generateCarousel(slides, 'name').

5. Show user the output paths.

6. Ask: "Post this to Instagram now via Zernio?" If yes, use Zernio MCP
   or run node scripts/marketing/run-daily.js with the carousel paths.

## Brand Rules
- Background: #0a0a0a (near black)
- Accent: #c8102e (strikepanel red)
- Text: #ffffff
- No emojis on slides
- Always end with strikepanel logo bottom-right
- Slide counter top-right (e.g. 2 / 6)
