#!/usr/bin/env node
/**
 * strikepanel Daily Story
 * Full-bleed cinematic image + standalone hook.
 * No caption extraction — every story works without context.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const fs = require('fs');
const path = require('path');
const https = require('https');
const puppeteer = require('puppeteer');

const zernio = require('./zernio-client');
const { getBackgroundPhoto } = require('./media-fetcher');

const LOG_PATH = path.join(__dirname, 'posted_log.json');
const OUT_DIR  = path.join(__dirname, '../../marketing/carousels');

const INSTAGRAM_ACCOUNT_ID = '6a0e0f75520992756d8bcdcf';

// ── Chrome finder (picks latest installed version) ────────────────

function findChrome() {
  const base = '/root/.cache/puppeteer/chrome';
  if (!fs.existsSync(base)) return null;
  const versions = fs.readdirSync(base).sort().reverse();
  for (const v of versions) {
    const p = path.join(base, v, 'chrome-linux64', 'chrome');
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// ── Log helpers ───────────────────────────────────────────────────

function readLog() {
  if (!fs.existsSync(LOG_PATH)) return [];
  return JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'));
}

function writeLog(entry) {
  const log = readLog();
  log.push({ ...entry, timestamp: new Date().toISOString() });
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
}

function daysSinceLastStory() {
  const log = readLog();
  const last = [...log].reverse().find(e => e.status === 'story_posted');
  if (!last) return Infinity;
  return (Date.now() - new Date(last.timestamp).getTime()) / (1000 * 60 * 60 * 24);
}

// Pillar rotates with the post pillar so theme is consistent
function getNextPillar() {
  const log = readLog();
  const last = [...log].reverse().find(e => e.status === 'posted' && e.pillarNum);
  if (!last) return 1;
  return last.pillarNum;
}

// ── Standalone hooks — immediately understandable, no context needed ──
// Rotates so each story day gets a different one

const FALLBACK_HOOKS = [
  { line: '12 ATHLETES.\nONE SESSION.\nTHREE WERE EMPTY.', pillar: 'Problem' },
  { line: 'THE GUT FEELING\nHAS A FAILURE RATE.', pillar: 'Fight Camp' },
  { line: 'HE PEAKED ON\nDAY 23.\nFIGHT NIGHT WAS\nDAY 28.', pillar: 'Fight Camp' },
  { line: 'KNOW WHO TO\nPROTECT BEFORE\nTHEY WALK IN.', pillar: 'Readiness' },
  { line: 'THE NAPKIN\nWAS NOT\nA FIGHT CAMP.', pillar: 'Problem' },
  { line: 'HE TOLD YOU\nHE WAS FINE.\nHIS BODY SAID 29.', pillar: 'Readiness' },
  { line: 'SAME SESSION.\nDIFFERENT BODIES.\nDIFFERENT COSTS.', pillar: 'AI Sessions' },
];

async function generateStoryHook() {
  if (!process.env.GROQ_API_KEY) return null;

  const prompt = `Write ONE powerful line for a boxing/MMA coaching Instagram story.

RULES — NO EXCEPTIONS:
- Must make IMMEDIATE sense to a combat sports coach who has NEVER seen your brand before.
- Must describe something they have personally experienced in the gym this week.
- Specific objects only: napkin, WhatsApp group, same session for everyone, gut feeling, whiteboard, a fighter who peaked too early, a weight cut that went wrong.
- ALL CAPS. Under 12 words. Can split into 2-3 short lines with \\n.
- No product names. No brand names. No questions. No exclamation marks.
- Think: what would a coach read on a dark billboard and immediately feel in their chest?

GOOD examples:
HE PEAKED ON DAY 23.\\nFIGHT NIGHT WAS DAY 28.
12 ATHLETES.\\nONE SESSION.\\nTHREE WERE RUNNING ON EMPTY.
THE GUT FEELING\\nHAS A FAILURE RATE.
THE NAPKIN WAS NOT\\nA FIGHT CAMP.

BAD examples (do not write these):
- "Know your athlete's readiness" (too generic, brand-speak)
- "Data-driven coaching" (jargon, no emotion)
- "Are you making this mistake?" (question, weak)

Return ONLY the hook line. Nothing else. No explanation.`;

  const body = JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 60,
    temperature: 0.95,
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try {
          const raw = JSON.parse(data).choices[0].message.content.trim()
            .replace(/^["']|["']$/g, '').trim();
          if (raw.length > 5 && raw.length < 120) resolve(raw.replace(/\\n/g, '\n'));
          else resolve(null);
        } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.write(body);
    req.end();
  });
}

// ── Story slide generator ─────────────────────────────────────────

async function generateStorySlide(hookLine, bgImagePath) {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const date  = new Date().toISOString().split('T')[0];
  const outFile = path.join(OUT_DIR, `story-${date}.png`);

  // Encode background image as base64 so Puppeteer loads it reliably
  let bgCSS = 'background:#04070f';
  if (bgImagePath && fs.existsSync(bgImagePath)) {
    const ext  = path.extname(bgImagePath).replace('.', '') || 'jpeg';
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
    const b64  = fs.readFileSync(bgImagePath).toString('base64');
    bgCSS = `background-image:url('data:${mime};base64,${b64}');background-size:cover;background-position:center top`;
  }

  // Split into lines for sizing — shorter lines get bigger font
  const lines = hookLine.split('\n').map(l => l.trim()).filter(Boolean);
  const maxLen = Math.max(...lines.map(l => l.length));
  const fontSize = maxLen <= 12 ? 128 : maxLen <= 18 ? 108 : 88;

  const linesHtml = lines.map(l =>
    `<div style="display:block">${l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`
  ).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1920px;overflow:hidden;background:#04070f}

#canvas{
  position:relative;width:1080px;height:1920px;overflow:hidden;
  ${bgCSS}
}

/* Cinematic dark gradient — transparent top, heavy dark bottom */
#overlay{
  position:absolute;inset:0;
  background:linear-gradient(
    to bottom,
    rgba(4,7,15,0.08) 0%,
    rgba(4,7,15,0.15) 35%,
    rgba(4,7,15,0.60) 58%,
    rgba(4,7,15,0.88) 72%,
    rgba(4,7,15,0.97) 100%
  );
  z-index:1
}

/* Colour grade: darken + cool slightly */
#grade{
  position:absolute;inset:0;
  background:rgba(4,7,30,0.18);
  mix-blend-mode:multiply;
  z-index:2
}

/* Grain texture */
#grain{position:absolute;inset:-50%;width:200%;height:200%;pointer-events:none;opacity:.04;z-index:3}

/* Cyan accent bar above text */
#bar{
  position:absolute;
  bottom:340px;left:64px;
  width:64px;height:3px;
  background:#00D4F0;
  z-index:10
}

/* Main hook text */
#hook{
  position:absolute;
  bottom:160px;left:64px;right:64px;
  z-index:10;
  font-family:'Bebas Neue',sans-serif;
  font-size:${fontSize}px;
  line-height:1.0;
  letter-spacing:2px;
  color:#f5f0e8;
  text-shadow:0 4px 40px rgba(0,0,0,0.6)
}

/* Brand bottom */
#brand{
  position:absolute;bottom:56px;right:56px;z-index:10;
  font-family:'Bebas Neue',sans-serif;font-size:20px;
  letter-spacing:3px;color:rgba(245,240,232,0.8)
}
#brand span{color:#00D4F0}

#url{
  position:absolute;bottom:60px;left:56px;z-index:10;
  font-size:11px;letter-spacing:2.5px;text-transform:uppercase;
  color:rgba(122,133,160,0.45)
}
</style>
</head>
<body>
<div id="canvas">
  <svg id="grain" xmlns="http://www.w3.org/2000/svg">
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)"/>
  </svg>
  <div id="overlay"></div>
  <div id="grade"></div>
  <div id="bar"></div>
  <div id="hook">${linesHtml}</div>
  <div id="brand">STRIKE<span>PANEL</span><sup style="font-size:8px;color:rgba(0,212,240,0.55);vertical-align:super;letter-spacing:.5px;font-family:'DM Mono',monospace">™</sup></div>
  <div id="url">strikepanel.uk</div>
</div>
</body>
</html>`;

  const chrome = findChrome();
  const launchOpts = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  };
  if (chrome) launchOpts.executablePath = chrome;

  const browser = await puppeteer.launch(launchOpts);
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() =>
    page.setContent(html, { waitUntil: 'domcontentloaded' })
  );
  await page.screenshot({ path: outFile, type: 'png' });
  await browser.close();

  console.log(`  Story slide saved → ${path.basename(outFile)}`);
  return outFile;
}

// ── Main ──────────────────────────────────────────────────────────

async function run() {
  console.log('\n=== strikepanel Story ===');
  console.log(new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dubai' }), '(Dubai)');

  const days = daysSinceLastStory();
  if (days < 1.5) {
    console.log(`Last story was ${days.toFixed(1)} days ago. Skipping.`);
    return;
  }

  // 1. Get standalone hook
  console.log('\n1. Generating story hook...');
  let hookLine;
  try {
    hookLine = await generateStoryHook();
    if (hookLine) {
      console.log('  Groq hook:', hookLine.replace(/\n/g, ' / '));
    } else {
      throw new Error('empty');
    }
  } catch {
    const fallback = FALLBACK_HOOKS[new Date().getDate() % FALLBACK_HOOKS.length];
    hookLine = fallback.line;
    console.log('  Using fallback hook:', hookLine.replace(/\n/g, ' / '));
  }

  // 2. Get background image
  console.log('\n2. Fetching background image...');
  const pillar = getNextPillar();
  const pillarThemes = { 1: 'Problem', 2: 'Fight Camp', 3: 'Social Proof', 4: 'Frustration', 5: 'Fight Camp' };
  const theme = pillarThemes[pillar] || 'Fight Camp';
  const bgImage = await getBackgroundPhoto(theme).catch(() => null);
  if (bgImage) console.log('  Background:', path.basename(bgImage));
  else console.log('  No background image — using dark gradient only');

  // 3. Generate story slide
  console.log('\n3. Rendering story slide (1080×1920)...');
  let slidePath;
  try {
    slidePath = await generateStorySlide(hookLine, bgImage);
  } catch (e) {
    console.error('  Slide generation failed:', e.message);
    writeLog({ status: 'story_failed', reason: 'slide_generation', error: e.message });
    return;
  }

  if (!process.env.IMGBB_API_KEY) {
    console.warn('\n4. IMGBB_API_KEY not set — cannot upload');
    writeLog({ status: 'story_skipped', reason: 'no_imgbb_key', hook: hookLine });
    return;
  }

  // 4. Upload
  console.log('\n4. Uploading to CDN...');
  let publicUrl;
  try {
    publicUrl = await zernio.uploadImage(slidePath);
    console.log('  Uploaded:', publicUrl);
  } catch (e) {
    console.error('  Upload failed:', e.message);
    writeLog({ status: 'story_failed', reason: 'upload', error: e.message });
    return;
  }

  if (!process.env.ZERNIO_API_KEY) {
    console.warn('\n5. ZERNIO_API_KEY not set — skipping post');
    writeLog({ status: 'story_skipped', reason: 'no_zernio_key', url: publicUrl });
    return;
  }

  // 5. Post to Instagram
  console.log('\n5. Posting story to Instagram via Zernio...');
  try {
    const { Zernio } = require('@zernio/node');
    const zClient = new Zernio({ apiKey: process.env.ZERNIO_API_KEY });

    const res = await zClient.posts.createPost({
      body: {
        content: ' ',
        publishNow: true,
        platforms: [{
          platform: 'instagram',
          accountId: INSTAGRAM_ACCOUNT_ID,
          platformSpecificData: { contentType: 'story' },
        }],
        mediaItems: [{ type: 'image', url: publicUrl }],
      },
    });
    const result = res.data?.post || res.data;
    console.log('  Story posted:', result?._id || 'success');
    writeLog({
      status: 'story_posted',
      hook: hookLine,
      slide: path.basename(slidePath),
      url: publicUrl,
      zernioId: result?._id,
    });
  } catch (e) {
    const detail = e?.response?.data || e?.body || '';
    if (detail) console.error('  Zernio error detail:', JSON.stringify(detail));
    console.error('  Story post failed:', e.message);
    writeLog({ status: 'story_failed', reason: 'zernio_post', error: e.message, url: publicUrl });
  }

  console.log('\n=== Story Done ===\n');
}

run().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
