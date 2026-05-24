#!/usr/bin/env node
/**
 * StrikePanel Daily Story
 * Run: node scripts/marketing/run-story.js
 *
 * Pipeline:
 *   1. Pull today's caption from posted_log.json (or generate fresh story text)
 *   2. Generate a 9:16 story slide (1080x1920) via Puppeteer
 *   3. Upload slide to ImgBB
 *   4. Post to Instagram as a story via Zernio
 *   5. Log result to posted_log.json
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const fs = require('fs');
const path = require('path');
const https = require('https');
const puppeteer = require('puppeteer');

const zernio = require('./zernio-client');

const LOG_PATH = path.join(__dirname, 'posted_log.json');
const OUT_DIR = path.join(__dirname, '../../marketing/carousels');
const CHROME = '/root/.cache/puppeteer/chrome/linux-147.0.7727.57/chrome-linux64/chrome';

const INSTAGRAM_ACCOUNT_ID = '6a0e0f75520992756d8bcdcf';

function readLog() {
  if (!fs.existsSync(LOG_PATH)) return [];
  return JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'));
}

function writeLog(entry) {
  const log = readLog();
  log.push({ ...entry, timestamp: new Date().toISOString() });
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
}

/**
 * Get the most recent caption from today's posted_log entries.
 * Falls back to null if nothing found.
 */
function getTodayCaption() {
  const log = readLog();
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = log.filter(e => e.timestamp && e.timestamp.startsWith(today) && e.caption);
  if (todayEntries.length === 0) return null;
  return todayEntries[todayEntries.length - 1].caption;
}

/**
 * Ask Groq to pick the boldest single line from a caption.
 */
async function extractBoldLine(caption) {
  if (!process.env.GROQ_API_KEY) {
    // Fallback: take the first non-empty line
    const lines = caption.split('\n').map(l => l.trim()).filter(Boolean);
    return lines[0] || 'Know before the session starts.';
  }

  const prompt = `From the caption below, extract the single boldest, most punchy line. Return only that line — no quotes, no explanation, no extra text.

Caption:
${caption}`;

  const body = JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 60,
    temperature: 0.3,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.groq.com',
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      res => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.choices[0].message.content.trim());
          } catch (e) {
            reject(new Error('Groq parse error: ' + data.slice(0, 200)));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Generate a 9:16 (1080x1920) story slide as PNG.
 * Returns the file path.
 */
async function generateStorySlide(boldLine) {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const date = new Date().toISOString().split('T')[0];
  const outFile = path.join(OUT_DIR, `story-${date}.png`);

  // Sanitise text for HTML
  const safeText = boldLine
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1920px;overflow:hidden;background:#04070f;font-family:'DM Mono',monospace}
#canvas{
  position:relative;width:1080px;height:1920px;
  display:flex;align-items:center;justify-content:center;
  background:#04070f;overflow:hidden
}
/* Ambient blobs */
.blob{position:absolute;border-radius:50%;filter:blur(180px);pointer-events:none}
.blob-cyan{width:900px;height:900px;top:-200px;left:-300px;background:rgba(0,212,240,.09)}
.blob-amber{width:700px;height:700px;bottom:200px;right:-250px;background:rgba(200,137,42,.07)}
.blob-purple{width:800px;height:800px;bottom:-300px;left:-100px;background:rgba(139,92,246,.08)}
/* Dot grid */
#dotgrid{position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(circle,rgba(0,212,240,.045) 1.2px,transparent 1.2px);
  background-size:48px 48px}
/* Corner brackets */
.corner{position:absolute;width:40px;height:40px;opacity:.22}
.corner-tl{top:48px;left:48px;border-top:2px solid #00D4F0;border-left:2px solid #00D4F0}
.corner-tr{top:48px;right:48px;border-top:2px solid #00D4F0;border-right:2px solid #00D4F0}
.corner-bl{bottom:48px;left:48px;border-bottom:2px solid #00D4F0;border-left:2px solid #00D4F0}
.corner-br{bottom:48px;right:48px;border-bottom:2px solid #00D4F0;border-right:2px solid #00D4F0}
/* Grain */
#grain{position:absolute;inset:-50%;width:200%;height:200%;pointer-events:none;opacity:.03}
/* Main text */
#main-text{
  position:relative;z-index:10;
  width:900px;text-align:center;
  font-family:'Bebas Neue',sans-serif;
  font-size:112px;line-height:1.05;
  letter-spacing:3px;
  color:#f5f0e8;
  text-shadow:0 0 120px rgba(0,212,240,.2)
}
/* Accent line */
#accent-line{
  position:absolute;
  top:50%;left:50%;
  transform:translate(-50%,-50%) translateY(200px);
  z-index:10;
  width:200px;height:2px;
  background:linear-gradient(to right,transparent,#00D4F0,transparent)
}
/* Logo bottom right */
#logo{
  position:absolute;bottom:56px;right:56px;z-index:20;
  font-family:'Bebas Neue',sans-serif;font-size:22px;
  letter-spacing:3.5px;color:#f5f0e8
}
#logo span{color:#00D4F0}
/* URL bottom left */
#url{
  position:absolute;bottom:60px;left:56px;z-index:20;
  font-size:12px;letter-spacing:2px;text-transform:uppercase;
  color:rgba(122,133,160,.5)
}
</style>
</head>
<body>
<div id="canvas">
  <svg id="grain" xmlns="http://www.w3.org/2000/svg">
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)"/>
  </svg>
  <div id="dotgrid"></div>
  <div class="blob blob-cyan"></div>
  <div class="blob blob-amber"></div>
  <div class="blob blob-purple"></div>
  <div class="corner corner-tl"></div>
  <div class="corner corner-tr"></div>
  <div class="corner corner-bl"></div>
  <div class="corner corner-br"></div>
  <div id="main-text">${safeText}</div>
  <div id="accent-line"></div>
  <div id="logo">STRIKE<span>PANEL</span><sup style="font-size:9px;color:rgba(0,212,240,.6);vertical-align:super;letter-spacing:.5px;font-family:'DM Mono',monospace">™</sup></div>
  <div id="url">strikepanel.vercel.app</div>
</div>
</body>
</html>`;

  const launchOpts = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  };
  if (fs.existsSync(CHROME)) launchOpts.executablePath = CHROME;

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

function daysSinceLastStory() {
  const log = readLog();
  const last = [...log].reverse().find(e => e.status === 'story_posted');
  if (!last) return Infinity;
  return (Date.now() - new Date(last.timestamp).getTime()) / (1000 * 60 * 60 * 24);
}

async function run() {
  console.log('\n=== StrikePanel Story ===');
  console.log(new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dubai' }), '(Dubai)');
  console.log('');

  // Enforce 3-day cadence (same as post)
  const days = daysSinceLastStory();
  if (days < 3) {
    console.log(`Last story was ${days.toFixed(1)} days ago. Skipping — cadence is every 3 days.`);
    return;
  }

  // Step 1: Get today's caption
  console.log('1. Getting today\'s caption...');
  const caption = getTodayCaption();
  if (!caption) {
    console.warn('  No caption found in posted_log.json for today.');
    console.warn('  Run run-daily.js first.');
    writeLog({ status: 'story_skipped', reason: 'no_caption_today' });
    return;
  }
  console.log('  Caption found:', caption.split('\n')[0].substring(0, 60) + '...');

  // Step 2: Extract boldest line
  console.log('\n2. Extracting boldest line for story...');
  let boldLine;
  try {
    boldLine = await extractBoldLine(caption);
    console.log('  Bold line:', boldLine.substring(0, 80));
  } catch (e) {
    console.warn('  Bold line extraction failed:', e.message, '— using first line');
    boldLine = caption.split('\n').map(l => l.trim()).filter(Boolean)[0] || 'Know before the session starts.';
  }

  // Step 3: Generate story slide
  console.log('\n3. Generating story slide (1080x1920)...');
  let slidePath;
  try {
    slidePath = await generateStorySlide(boldLine);
  } catch (e) {
    console.error('  Story slide generation failed:', e.message);
    writeLog({ status: 'story_failed', reason: 'slide_generation', error: e.message });
    return;
  }

  // Step 4: Upload to ImgBB
  if (!process.env.IMGBB_API_KEY) {
    console.warn('\n4. IMGBB_API_KEY not set — cannot upload story slide');
    writeLog({ status: 'story_skipped', reason: 'no_imgbb_key', slide: slidePath });
    return;
  }

  console.log('\n4. Uploading story slide to CDN...');
  let publicUrl;
  try {
    publicUrl = await zernio.uploadImage(slidePath);
    console.log('  Uploaded:', publicUrl);
  } catch (e) {
    console.error('  Upload failed:', e.message);
    writeLog({ status: 'story_failed', reason: 'upload', error: e.message, slide: slidePath });
    return;
  }

  // Step 5: Post as Instagram story via Zernio
  if (!process.env.ZERNIO_API_KEY) {
    console.warn('\n5. ZERNIO_API_KEY not set — skipping story post');
    writeLog({ status: 'story_skipped', reason: 'no_zernio_key', slide: slidePath, url: publicUrl });
    return;
  }

  console.log('\n5. Posting story to Instagram via Zernio...');
  try {
    const { Zernio } = require('@zernio/node');
    const zClient = new Zernio({ apiKey: process.env.ZERNIO_API_KEY });

    const body = {
      content: ' ',
      publishNow: true,
      platforms: [{
        platform: 'instagram',
        accountId: INSTAGRAM_ACCOUNT_ID,
        platformSpecificData: { postType: 'story' },
      }],
      mediaItems: [{ type: 'image', url: publicUrl }],
    };

    const res = await zClient.posts.createPost({ body });
    const result = res.data?.post || res.data;
    console.log('  Story posted:', result?._id || 'success');
    writeLog({
      status: 'story_posted',
      boldLine,
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
