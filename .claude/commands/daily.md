# /daily — Full Daily Instagram Automation

## Usage
```
/daily
/daily --skip-post
/daily --carousel-only
```

## What This Does
Runs the full daily pipeline:
1. Fetch today's trending topics from combat sports Reddit
2. Generate today's caption using Claude (pillar rotates Mon-Sun)
3. Build carousel slides (HTML → PNG via Puppeteer, 1080x1080 @2x)
4. Post carousel + caption to @strikepane via Zernio
5. Log to scripts/marketing/posted_log.json

## Instructions

### Step 1 — Fetch Trends
Run: `node scripts/marketing/trend-research.js`
Read the output themes. Note any combat sports topics spiking today.
These inform the caption angle.

### Step 2 — Generate Caption
Read CLAUDE.md for brand voice and today's content pillar.
Today's pillar = day of week (Mon=Readiness, Tue=Problem, Wed=WeightCut,
Thu=AI Sessions, Fri=FightCamp, Sat=SocialProof, Sun=Offer).
Use trend themes to make it timely. 80-120 words. No emojis. No hyphens.
Sound like a coach talking to a coach.

### Step 3 — Build Carousel
Run: `node scripts/marketing/carousel-generator.js`
Or call generateCarousel() with slide data matching the caption structure.
Output: marketing/carousels/daily-{date}-01.png through -0N.png

### Step 4 — Post via Zernio
Use Zernio MCP tools to post the carousel images + caption to Instagram.
If Zernio MCP unavailable, run: `node scripts/marketing/run-daily.js`
This handles the full pipeline automatically.

### Step 5 — Log
Append to scripts/marketing/posted_log.json:
{timestamp, pillar, caption_preview, slides, status}

## Fallback
If Zernio is unavailable, print the caption to console so user can
copy-paste into Instagram manually or via the Zernio dashboard.

## Required Env Vars
ANTHROPIC_API_KEY — for caption generation
ZERNIO_API_KEY    — for posting

## Run Fully Automatically
```
node scripts/marketing/run-daily.js
```
