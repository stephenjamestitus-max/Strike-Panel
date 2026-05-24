#!/usr/bin/env node
/**
 * StrikePanel Daily Automation — Series Rotation
 *
 * 3-post series, repeating every 9 days (3 posts × every 3 days):
 *   Post 1 — Black card. One brutal truth. Pure typography.
 *   Post 2 — Split screen. Chaos vs Clarity. Same coach, different tools.
 *   Post 3 — Scenario. Between rounds. Coach found out too late.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const fs = require('fs');
const path = require('path');
const https = require('https');

const { generateCarousel } = require('./carousel-generator');
const { getBackgroundPhoto } = require('./media-fetcher');
const zernio = require('./zernio-client');

const LOG_PATH = path.join(__dirname, 'posted_log.json');

const HASHTAGS = [
  '#boxingcoach #mmacoach #combatsportscoach #athletereadiness #fightcamp',
  '#strengthandconditioning #bjjcoach #muaythaicoach #combatsports #coachlife',
  '#periodization #athletemanagement #performancecoach #fightteam #coachingtools',
].join(' ');

function readLog() {
  if (!fs.existsSync(LOG_PATH)) return [];
  return JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'));
}

function writeLog(entry) {
  const log = readLog();
  log.push({ ...entry, timestamp: new Date().toISOString() });
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
}

function daysSinceLastPost() {
  const log = readLog();
  const last = [...log].reverse().find(e => e.status === 'posted');
  if (!last) return Infinity;
  return (Date.now() - new Date(last.timestamp).getTime()) / (1000 * 60 * 60 * 24);
}

// Returns 1, 2, or 3 — cycles through the series
function getNextSeriesType() {
  const log = readLog();
  const last = [...log].reverse().find(e => e.status === 'posted' && e.seriesType);
  if (!last) return 1;
  return (last.seriesType % 3) + 1;
}

// ── Groq content generation ───────────────────────────────────────

async function groq(prompt, maxTokens = 200) {
  if (!process.env.GROQ_API_KEY) return null;
  const body = JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.8,
  });
  return new Promise((resolve, reject) => {
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
        try { resolve(JSON.parse(data).choices[0].message.content.trim()); }
        catch (e) { reject(new Error('Groq parse error: ' + data.slice(0, 200))); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Post 1: Black Card ────────────────────────────────────────────

const BLACKCARD_FALLBACKS = [
  { line: 'FIGHTER LOST IN ROUND 3.\nCOACH HAD NO DATA.', sub: 'That is not bad luck. That is a missing system.', caption: `Fighter lost in round 3.\nCoach had no data.\n\nNo readiness score. No load tracking. No warning sign.\n\nJust a gut feeling that turned out to be wrong.\n\nEvery coach has been there. The ones who stay there are the ones who never build the system.\n\n${HASHTAGS}` },
  { line: 'YOU KNEW HE WAS TIRED.\nYOU PUSHED HIM ANYWAY.', sub: 'Without data, doubt is all you have.', caption: `You knew he was tired. You pushed him anyway.\n\nBecause you had no number to point to. No score to back the call.\n\nSo you guessed. And guessing against a tired athlete costs you more than a session.\n\nReadiness scoring removes the doubt before you even ask the question.\n\n${HASHTAGS}` },
  { line: 'TWO WEEKS OUT.\nATHLETE WAS ALREADY BROKEN.', sub: 'The data would have shown it 10 days earlier.', caption: `Two weeks out. Athlete was already broken.\n\nNot from one hard day. From seven consecutive days of no recovery and nobody watching the trend.\n\nBy the time the coach saw it, there was nothing left to manage.\n\nFight camp data does not just prepare athletes. It protects them.\n\n${HASHTAGS}` },
];

async function generatePost1() {
  const prompt = `You write brutal one-truth posts for StrikePanel — a coaching dashboard for combat sports coaches.\n\nGenerate a single black card post. Format:\nLINE: [one brutal truth about coaching without data, ALL CAPS, max 12 words, can be 2 short lines separated by \\n]\nSUB: [one quiet follow-up line, lowercase, max 12 words, adds weight not explanation]\nCAPTION: [Instagram caption, 60-90 words, coach-to-coach voice, short sentences, no emojis, no hyphens, second person only, end with a single insight not a CTA]\n\nThe truth should be specific to combat sports — a moment, a loss, an injury, a wrong call. Raw. Real. Coaches recognise it immediately.\n\nOutput only LINE:, SUB:, and CAPTION: labels with their content. Nothing else.`;

  try {
    const raw = await groq(prompt, 300);
    if (!raw) throw new Error('no key');
    const line = raw.match(/LINE:\s*(.+?)(?=\nSUB:|$)/s)?.[1]?.trim().replace(/\\n/g, '\n') || null;
    const sub = raw.match(/SUB:\s*(.+?)(?=\nCAPTION:|$)/s)?.[1]?.trim() || null;
    const caption = raw.match(/CAPTION:\s*([\s\S]+?)$/)?.[1]?.trim() || null;
    if (!line || !caption) throw new Error('parse failed');
    return { line, sub, caption: caption + `\n\n${HASHTAGS}` };
  } catch {
    const fb = BLACKCARD_FALLBACKS[new Date().getDate() % BLACKCARD_FALLBACKS.length];
    return fb;
  }
}

async function buildPost1() {
  const { line, sub, caption } = await generatePost1();
  const slides = [
    { type: 'blackcard', line, sub },
    { type: 'cta', stat: '$99', headline: 'ONE PAYMENT.', headlineCyan: 'NO SUBSCRIPTION.', body: 'Readiness scoring, fight camps, weight cuts, AI sessions. Up to 20 athletes. You own it forever.' },
  ];
  const date = new Date().toISOString().split('T')[0];
  const imagePaths = await generateCarousel(slides, `post1-${date}`);
  return { imagePaths, caption, seriesType: 1 };
}

// ── Post 2: Split Screen ──────────────────────────────────────────

const SPLITSCREEN_FALLBACKS = [
  {
    chaos: 'Napkin from last Tuesday. WhatsApp voice note at 11pm. Gut feeling walking in.',
    clarity: 'Eight scores on one screen. Who gets pushed. Who gets protected. Done before breakfast.',
    label: 'SAME COACH. DIFFERENT TOOLS.',
    caption: `Same coach. Different tools.\n\nLeft side is where most combat sports coaches still are.\n\nNot because they are bad coaches. Because nobody built them the right system.\n\nRight side is what changes when you stop guessing and start scoring.\n\nThe decisions do not get easier. They get faster. And faster decisions protect athletes.\n\n${HASHTAGS}`,
  },
  {
    chaos: 'Spreadsheet nobody updates. Three group chats. Whiteboard that got wiped.',
    clarity: 'Morning brief. One number per athlete. Session already adapted before they arrive.',
    label: 'THE GAP IS THE SYSTEM.',
    caption: `The gap between good coaches and great ones is not talent.\n\nIt is information.\n\nOne coach walks into the gym already knowing which athletes are ready to be pushed and which need protecting.\n\nThe other finds out mid-session.\n\nThe system is the difference.\n\n${HASHTAGS}`,
  },
];

async function generatePost2() {
  const prompt = `You write split-screen comparison posts for StrikePanel — a coaching dashboard for combat sports coaches.\n\nGenerate a single split-screen post comparing coaching without data (chaos) vs coaching with StrikePanel (clarity).\n\nFormat:\nCHAOS: [one vivid snapshot of coaching chaos, 15-20 words, specific to combat sports — napkins, WhatsApp, guessing, whiteboards]\nCLARITY: [one vivid snapshot of coaching clarity, 15-20 words, what the coach knows and does differently]\nLABEL: [short banner label, ALL CAPS, max 6 words, the core contrast]\nCAPTION: [Instagram caption, 60-90 words, coach-to-coach voice, short sentences, no emojis, no hyphens, second person, builds to a quiet insight]\n\nMake it specific. Not "better data" but "eight readiness scores before the session starts."\n\nOutput only CHAOS:, CLARITY:, LABEL:, CAPTION: labels. Nothing else.`;

  try {
    const raw = await groq(prompt, 350);
    if (!raw) throw new Error('no key');
    const chaos = raw.match(/CHAOS:\s*(.+?)(?=\nCLARITY:|$)/s)?.[1]?.trim() || null;
    const clarity = raw.match(/CLARITY:\s*(.+?)(?=\nLABEL:|$)/s)?.[1]?.trim() || null;
    const label = raw.match(/LABEL:\s*(.+?)(?=\nCAPTION:|$)/s)?.[1]?.trim() || null;
    const caption = raw.match(/CAPTION:\s*([\s\S]+?)$/)?.[1]?.trim() || null;
    if (!chaos || !clarity || !caption) throw new Error('parse failed');
    return { chaos, clarity, label, caption: caption + `\n\n${HASHTAGS}` };
  } catch {
    const fb = SPLITSCREEN_FALLBACKS[new Date().getDate() % SPLITSCREEN_FALLBACKS.length];
    return fb;
  }
}

async function buildPost2() {
  const { chaos, clarity, label, caption } = await generatePost2();
  const bgImage = await getBackgroundPhoto('Problem').catch(() => null);
  const slides = [
    { type: 'splitscreen', chaos, clarity, label },
    { type: 'cta', stat: '$99', headline: 'ONE PAYMENT.', headlineCyan: 'NO SUBSCRIPTION.', body: 'Readiness scoring, fight camps, weight cuts, AI sessions. Up to 20 athletes. You own it forever.' },
  ];
  const date = new Date().toISOString().split('T')[0];
  const imagePaths = await generateCarousel(slides, `post2-${date}`, bgImage);
  return { imagePaths, caption, seriesType: 2 };
}

// ── Post 3: Scenario ──────────────────────────────────────────────

const SCENARIO_FALLBACKS = [
  {
    scene: 'Between rounds. His fighter is on the stool. Breathing wrong. Eyes glazed. The coach is talking tactics but the fighter stopped hearing him two rounds ago.',
    truth: 'HE FOUND OUT TOO LATE.',
    kicker: 'FIGHT CAMP · CORNER MOMENT',
    bgPillar: 'Fight Camp',
    caption: `Between rounds. His fighter is on the stool.\n\nBreathing wrong. Eyes glazed. The coach is still calling combinations but the fighter stopped hearing him two rounds ago.\n\nHe was running on empty. Had been for three days.\n\nThe readiness score would have shown it on Monday. The coach would have changed Tuesday's session. Wednesday would have been different. The fighter would have arrived at fight night sharp.\n\nInstead he found out in round 4.\n\n${HASHTAGS}`,
  },
  {
    scene: 'Six weeks out. His best athlete asks for a lighter day. Coach says push through. Three days later the athlete pulls a hip flexor in sparring.',
    truth: 'THE DATA WOULD HAVE TOLD HIM.',
    kicker: 'FIGHT CAMP · THE CALL HE REGRETS',
    bgPillar: 'Readiness',
    caption: `Six weeks out. His best athlete asked for a lighter day.\n\nCoach said push through. Camp schedule said heavy week. Gut said the athlete was being soft.\n\nThree days later the athlete pulled a hip flexor in sparring.\n\nThe readiness score that morning was 31. A number the coach never had.\n\nOne number. One different decision. Six weeks of camp still intact.\n\n${HASHTAGS}`,
  },
];

async function generatePost3() {
  const prompt = `You write cinematic fight camp scenario posts for StrikePanel — a coaching dashboard for combat sports coaches.\n\nGenerate a between-rounds or camp scenario where a coach discovers too late that their fighter was struggling because they had no readiness data.\n\nFormat:\nSCENE: [2-3 sentences, cinematic and specific, corner of the ring or gym moment, no product mention, present tense]\nTRUTH: [one brutal conclusion line, ALL CAPS, max 8 words, what the lack of data cost]\nKICKER: [top label, ALL CAPS, format "FIGHT CAMP · [moment name]", max 5 words after the dot]\nCAPTION: [Instagram caption, 80-110 words, tells the full story, builds to the lesson, coach-to-coach, no emojis, no hyphens, no direct product sell — let the story do the work]\n\nMake it feel like it really happened. Specific details. A real coach would recognise this immediately.\n\nOutput only SCENE:, TRUTH:, KICKER:, CAPTION: labels. Nothing else.`;

  try {
    const raw = await groq(prompt, 400);
    if (!raw) throw new Error('no key');
    const scene = raw.match(/SCENE:\s*(.+?)(?=\nTRUTH:|$)/s)?.[1]?.trim() || null;
    const truth = raw.match(/TRUTH:\s*(.+?)(?=\nKICKER:|$)/s)?.[1]?.trim() || null;
    const kicker = raw.match(/KICKER:\s*(.+?)(?=\nCAPTION:|$)/s)?.[1]?.trim() || null;
    const caption = raw.match(/CAPTION:\s*([\s\S]+?)$/)?.[1]?.trim() || null;
    if (!scene || !truth || !caption) throw new Error('parse failed');
    return { scene, truth, kicker: kicker || 'FIGHT CAMP · CORNER MOMENT', bgPillar: 'Fight Camp', caption: caption + `\n\n${HASHTAGS}` };
  } catch {
    const fb = SCENARIO_FALLBACKS[new Date().getDate() % SCENARIO_FALLBACKS.length];
    return fb;
  }
}

async function buildPost3() {
  const { scene, truth, kicker, bgPillar, caption } = await generatePost3();
  const bgImage = await getBackgroundPhoto(bgPillar).catch(() => null);
  const slides = [
    { type: 'scenario', scene, truth, kicker, bgImage },
    { type: 'cta', stat: '$99', headline: 'ONE PAYMENT.', headlineCyan: 'NO SUBSCRIPTION.', body: 'Readiness scoring, fight camps, weight cuts, AI sessions. Up to 20 athletes. You own it forever.' },
  ];
  const date = new Date().toISOString().split('T')[0];
  const imagePaths = await generateCarousel(slides, `post3-${date}`);
  return { imagePaths, caption, seriesType: 3 };
}

// ── Main ──────────────────────────────────────────────────────────

async function run() {
  console.log('\n=== StrikePanel Post ===');
  console.log(new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dubai' }), '(Dubai)');

  const days = daysSinceLastPost();
  // 2.5 days allows same-calendar-day posting (3 calendar days = ~68h, not always 72h)
  if (days < 2.5) {
    const next = Math.ceil(3 - days);
    console.log(`Last post was ${days.toFixed(1)} days ago. Next post in ${next} day(s). Skipping.`);
    return;
  }

  const seriesType = getNextSeriesType();
  console.log(`\nSeries post type: ${seriesType}/3`);

  let result;
  try {
    if (seriesType === 1) {
      console.log('Building Post 1 — Black Card');
      result = await buildPost1();
    } else if (seriesType === 2) {
      console.log('Building Post 2 — Split Screen');
      result = await buildPost2();
    } else {
      console.log('Building Post 3 — Scenario');
      result = await buildPost3();
    }
  } catch (e) {
    console.error('Build failed:', e.message);
    writeLog({ seriesType, status: 'failed', error: e.message });
    return;
  }

  const { imagePaths, caption, seriesType: type } = result;
  console.log(`\n${imagePaths.length} slides built`);
  console.log('Caption preview:', caption.split('\n')[0]);

  if (!process.env.ZERNIO_API_KEY) {
    console.warn('\nZERNIO_API_KEY not set — skipping post');
    console.log('\nCaption:\n' + caption);
    writeLog({ seriesType: type, caption, status: 'skipped_no_key', slides: imagePaths.length });
    return;
  }

  console.log('\nUploading & posting via Zernio...');
  try {
    let publicUrls = [];
    if (imagePaths.length > 0) {
      if (process.env.IMGBB_API_KEY) {
        try {
          publicUrls = await zernio.uploadImages(imagePaths);
          console.log(`  ${publicUrls.length} slides uploaded to ImgBB`);
        } catch (uploadErr) {
          console.warn('  ImgBB upload failed, falling back to GitHub CDN:', uploadErr.message);
          const branch = process.env.GITHUB_REF_NAME || 'main';
          publicUrls = imagePaths.map(p => {
            const rel = path.relative(path.join(__dirname, '../..'), p).replace(/\\/g, '/');
            return `https://raw.githubusercontent.com/stephenjamestitus-max/Strike-Panel/${branch}/${rel}`;
          });
          console.log(`  ${publicUrls.length} slides using GitHub CDN`);
        }
      }
    }
    const post = await zernio.createPost({ content: caption, mediaUrls: publicUrls });
    console.log('  Posted:', post?._id || 'success');
    writeLog({ seriesType: type, caption, status: 'posted', slides: imagePaths.length, zernioId: post?._id });
  } catch (e) {
    console.error('  Post failed:', e.message);
    writeLog({ seriesType: type, caption, status: 'failed', error: e.message });
  }

  console.log('\n=== Done ===\n');
}

run().catch(e => { console.error('Fatal error:', e); process.exit(1); });
