#!/usr/bin/env node
/**
 * StrikePanel Daily Automation
 * Run: node scripts/marketing/run-daily.js
 * Or via cron / Task Scheduler
 *
 * Pipeline:
 *   1. Fetch today's trends from combat sports Reddit
 *   2. Generate today's Instagram post caption using Claude API
 *   3. Build carousel slides (HTML → PNG via Puppeteer)
 *   4. Post to Instagram via Zernio
 *   5. Log result to posted_log.json
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const { fetchTrends } = require('./trend-research');
const { generateCarousel } = require('./carousel-generator');
const zernio = require('./zernio-client');

const LOG_PATH = path.join(__dirname, 'posted_log.json');
const CONTENT_PATH = path.join(__dirname, 'content_batch.json');

const PILLARS = [
  'Readiness — who to push vs protect, morning brief scores',
  'Fight Camp — managing athletes through camp, countdown pressure',
  'Weight Cut — daily tracking, safe cuts, fight night performance',
  'AI Sessions — building sessions based on readiness data',
  'Problem/Frustration — coaches guessing, spreadsheet chaos, WhatsApp overload',
  'Social Proof — what coaches actually get from StrikePanel',
  'Direct Offer — $99 one-time, no subscription, link in bio',
];

const HASHTAGS = [
  '#boxingcoach #mmacoach #combatsportscoach #athletereadiness #fightcamp',
  '#strengthandconditioning #bjjcoach #muaythaicoach #combatsports #coachlife',
  '#periodization #athletemanagement #performancecoach #fightteam #coachingtools',
  '#highperformancecoaching #sportsscience #trainingload #elitecoaching #independentcoach',
].join(' ');

function getTodayPillar() {
  const day = new Date().getDay(); // 0=Sun
  return PILLARS[day % PILLARS.length];
}

function readLog() {
  if (!fs.existsSync(LOG_PATH)) return [];
  return JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'));
}

function writeLog(entry) {
  const log = readLog();
  log.push({ ...entry, timestamp: new Date().toISOString() });
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
}

async function generateCaption(pillar, trends) {
  const client = new Anthropic();
  const trendSummary = trends.themes?.slice(0, 4).join(', ') || 'fight camp, weight cuts, coaching';

  const prompt = `You are writing an Instagram post for @strikepanel — a coaching dashboard for combat sports coaches.

Brand voice: Direct, confident, no-nonsense. "Old school grit, new school data."
Short sentences. Active voice. Combat-sports-native language. No emojis. No hyphens.
Sound like a coach talking to a coach. Never generic.

Today's content pillar: ${pillar}
Today's trending topics in combat sports: ${trendSummary}

Write ONE Instagram post:
- Caption: 80-120 words max. Punchy opening line. Real insight coaches actually feel.
  End with a hook to check the link in bio (only on offer pillar).
- Do NOT add hashtags (added separately).
- Output ONLY the caption text, nothing else.`;

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  });

  return msg.content[0].text.trim();
}

async function buildCarouselSlides(pillar, caption) {
  // Parse caption into slide structure
  const sentences = caption.split(/\.\s+/).filter(Boolean);

  const slides = [
    {
      type: 'cover',
      headline: sentences[0] || pillar.split('—')[0].trim(),
      body: 'A note for combat sports coaches',
    },
  ];

  // Middle slides from caption body
  for (let i = 1; i < Math.min(sentences.length, 4); i++) {
    slides.push({
      headline: sentences[i].length > 60
        ? sentences[i].substring(0, 57) + '...'
        : sentences[i],
      body: sentences[i + 1] || '',
    });
    i++; // pair sentences
  }

  // Closing CTA slide
  slides.push({
    type: 'stat',
    stat: '$99',
    statLabel: 'One-time. No subscription.',
    body: 'StrikePanel — readiness dashboard for up to 20 athletes. Link in bio.',
  });

  const date = new Date().toISOString().split('T')[0];
  const name = `daily-${date}`;
  const imagePaths = await generateCarousel(slides, name);
  return imagePaths;
}

async function run() {
  console.log('\n=== StrikePanel Daily Automation ===');
  console.log(new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dubai' }), '(Dubai)');
  console.log('');

  // Step 1: Trends
  console.log('1. Fetching trends...');
  const trends = await fetchTrends().catch(e => {
    console.warn('  Trends failed:', e.message, '— continuing with defaults');
    return { themes: [] };
  });

  // Step 2: Caption
  const pillar = getTodayPillar();
  console.log(`\n2. Generating caption for pillar: ${pillar.split('—')[0].trim()}`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('  ANTHROPIC_API_KEY not set — skipping AI generation');
    console.log('  Set it in .env and re-run');
    return;
  }

  const caption = await generateCaption(pillar, trends);
  const fullCaption = `${caption}\n\n${HASHTAGS}`;
  console.log('\n  Caption preview:');
  console.log('  ' + caption.split('\n')[0].substring(0, 80) + '...');

  // Step 3: Carousel
  console.log('\n3. Building carousel slides...');
  const imagePaths = await buildCarouselSlides(pillar, caption).catch(e => {
    console.warn('  Carousel failed:', e.message, '— will post text-only');
    return [];
  });
  console.log(`  ${imagePaths.length} slides generated`);

  // Step 4: Post via Zernio
  if (!process.env.ZERNIO_API_KEY) {
    console.warn('\n4. ZERNIO_API_KEY not set — skipping post');
    console.log('   Caption ready to copy:\n');
    console.log(fullCaption);
    writeLog({ pillar, caption: fullCaption, status: 'skipped_no_key', slides: imagePaths.length });
    return;
  }

  console.log('\n4. Posting to Instagram via Zernio...');
  try {
    const result = await zernio.createPost({
      platform: 'instagram',
      content: fullCaption,
      mediaUrls: imagePaths,
    });
    console.log('  Posted:', result?.id || 'success');
    writeLog({ pillar, caption: fullCaption, status: 'posted', slides: imagePaths.length, zernioId: result?.id });
  } catch (e) {
    console.error('  Post failed:', e.message);
    console.log('\n  Manual fallback — copy this caption:\n');
    console.log(fullCaption);
    writeLog({ pillar, caption: fullCaption, status: 'failed', error: e.message, slides: imagePaths.length });
  }

  console.log('\n=== Done ===\n');
}

run().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
