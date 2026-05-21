# Terminal Setup — StrikePanel Automation

## Step 1 — Install Claude Code (one time)

Open terminal (Mac/Linux) or PowerShell (Windows):

```bash
npm install -g @anthropic-ai/claude-code
```

If npm not installed: https://nodejs.org — download LTS and install first.

---

## Step 2 — Clone or open the repo

```bash
cd ~/Strike-Panel
```

(or wherever you cloned it from GitHub)

---

## Step 3 — Set your API keys

Edit the `.env` file in the project root:

```
ZERNIO_API_KEY=sk_bd639b5353f3b8410fcaed10a28db190e25fc2d348b84f55b12e5241c134fb7a
ANTHROPIC_API_KEY=your_anthropic_key_here
```

Get your Anthropic key: https://console.anthropic.com → API Keys

---

## Step 4 — Install dependencies

```bash
npm install
```

---

## Step 5 — Start Claude Code

```bash
claude
```

That's it. Claude Code reads CLAUDE.md automatically and knows everything
about StrikePanel, your brand voice, content pillars, and available skills.

---

## Step 6 — Run your first skill

Once Claude Code is running, type:

```
/daily
```

This runs the full pipeline:
→ fetches today's trends
→ generates caption (rotates through 7 content pillars)
→ builds carousel (6 slides, branded)
→ posts to @strikepanel via Zernio

---

## Step 7 — Set up scheduled automation (optional, Mac/Linux)

```bash
bash scripts/marketing/setup-cron.sh
```

This adds a cron job that runs `/daily` automatically at 8am Dubai time, every day.

### Windows alternative (Task Scheduler):
1. Open Task Scheduler
2. Create Basic Task → "StrikePanel Daily"
3. Trigger: Daily at 8:00 AM
4. Action: Start a program
5. Program: `node`
6. Arguments: `C:\path\to\Strike-Panel\scripts\marketing\run-daily.js`
7. Start in: `C:\path\to\Strike-Panel`

---

## Daily Skills Reference

| Command | What it does |
|---------|-------------|
| `/daily` | Full pipeline: trends → caption → carousel → post |
| `/carousel "topic"` | Build a carousel for a specific topic |
| `/post` | Draft and post a single image post |
| `/schedule` | Generate and schedule full week of content |
| `/engage instagram 10` | Comment on 10 combat sports coaching posts |
| `/follow instagram 20` | Follow 20 coaching accounts |
| `/analytics` | Pull @strikepanel performance data |
| `/report` | Weekly performance summary |
| `/spy` | Scrape competitor Meta ads |

---

## Troubleshooting

**"ZERNIO_API_KEY not set"** → check your .env file has the key

**"Cannot find module puppeteer"** → run `npm install`

**Carousel fails** → run `node scripts/marketing/carousel-generator.js` to test

**Zernio post fails** → caption is printed to console, copy-paste into
zernio.com/dashboard manually as fallback

---

## What runs automatically (if cron is set)
- 8am Dubai daily → `/daily` → trend research + caption + carousel + post
- Logs saved to: `marketing/automation.log`
- Post history: `scripts/marketing/posted_log.json`
