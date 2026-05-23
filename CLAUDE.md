# strikepanel — Claude Code Project Context

## What This Product Is
strikepanel is a coaching dashboard PWA for combat sports coaches. It scores athlete
readiness daily, manages fight camps and weight cuts, generates AI training sessions,
and replaces spreadsheets and WhatsApp chaos with one unified system.

- Price: $99 one-time, no subscription
- Stack: Vanilla JS PWA, Gumroad licensing, Vercel hosting
- Live: strikepanel.com
- Instagram: @strikepanel

## Target Audience
Independent and gym-based coaches (boxing, MMA, Muay Thai, BJJ, kickboxing) managing
5-20 athletes. Sole decision-maker. Primary motivation: knowing which athletes to push
hard and which to protect before each session.

## Brand Voice
Direct, confident, no-nonsense. "Old school grit, new school data." Short sentences,
active voice, combat-sports-native language. No emojis unless explicitly requested.
No hyphens. Tone: gym aesthetics — raw, purposeful, results-focused.

## Content Pillars (rotate weekly)
1. Readiness — morning brief, who to push vs protect
2. Fight Camp — managing athletes in camp, countdown
3. Weight Cut — safe cuts, daily tracking, fight night
4. AI Sessions — session generation based on readiness data
5. Problem/Frustration — coaches guessing, spreadsheet chaos, WhatsApp mess
6. Social Proof — what coaches get from using strikepanel
7. Direct Offer — the tool, $99 one-time, no subscription

## Key Customer Language
- "I'm basically guessing who's ready every single day."
- "It just tells me what I need to know."

## Social Media Goals
- Platform: Instagram @strikepanel (primary)
- Goal: Follow 20+ combat sports coaching accounts per week
- Engage: Comment on 10+ relevant posts per week (never mention strikepanel)
- Post: 1 per day, 7 days per week
- Format mix: single image, carousel (3-7 slides), reels caption

## Instagram Target Accounts to Engage
Coaching-focused accounts (not fighter-focused) with 5000+ followers:
- @firas_zahabi, @phil_daru_strength, @ufcpi, @mark_henry_mma
- @boxingscience_, @scientificboxing, @jasonparillo, @roufusport
- @gbteambjj, @thaiboxingassociation, @precisestrikingboxing
- @dingesonboxing, @coachnickmurphy, @striking_science
- @coachfariasboxing, @fightiqcoaching, @mnbjj

## Available Skills (type these in Claude Code)
- /daily     — run full daily automation (trend → content → carousel → post)
- /post      — draft and publish one post to Instagram via Zernio
- /schedule  — generate and schedule full week of content
- /carousel  — generate a carousel post (HTML → PNG slides → Zernio)
- /engage    — find and comment on 10 combat sports coaching posts
- /follow    — find and follow 20 coaching accounts
- /analytics — pull Instagram performance data
- /report    — weekly performance summary
- /spy       — scrape competitor Meta ads intelligence
- /bleed-check — detect zero-conversion Meta ad spend and pause

## Environment Variables Required
ZERNIO_API_KEY     — from zernio.com dashboard → API Keys
ANTHROPIC_API_KEY  — from console.anthropic.com
META_ACCESS_TOKEN  — from Meta Business Suite (for ads skills)
META_ACCOUNT_ID    — Meta ad account ID

## File Structure
scripts/marketing/
  zernio-client.js      — Zernio REST API wrapper
  carousel-generator.js — HTML → PNG carousel slides via Puppeteer
  trend-research.js     — daily trend fetching for content ideas
  run-daily.js          — full daily automation pipeline
  posted_log.json       — log of all posts sent
  content_batch.json    — queued content for the week
  insights_log.json     — analytics snapshots

.claude/skills/         — all slash command skill files
.claude/prompts/        — scheduled automation prompts
