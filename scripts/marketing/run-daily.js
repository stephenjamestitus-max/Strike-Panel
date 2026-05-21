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
const https = require('https');

const { fetchTrends } = require('./trend-research');
const { generateCarousel } = require('./carousel-generator');
const { getBackgroundPhoto, getVideoClip } = require('./media-fetcher');
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

// Rotating caption pool — 2 per pillar, cycles through without any API cost
const CAPTION_POOL = {
  'Readiness': [
    `Monday morning. You have eight athletes walking in.\nWhich ones are ready to go hard? Which ones need protecting?\nIf you are guessing, you are gambling.\nReadiness scoring gives you the answer before the session starts. Sleep, soreness, stress, HRV trend pulled into one number.\nYou coach to that number.\nThe athletes who needed protecting do not get broken down. The ones who are peaking get pushed.\nThat is the difference between a coach and a guessing machine.`,
    `Eight athletes. Eight different days.\nOne of them is running on four hours of sleep. One is three days into fight camp. One is carrying a shoulder he has not told you about.\nYou cannot see any of that without data.\nReadiness scoring surfaces it every morning before you touch a session plan.\nKnow your athletes before they walk through the door.`,
  ],
  'Fight Camp': [
    `Six weeks out. This is where camps get won or lost.\nNot fight night. Six weeks out.\nThis is when athletes start to crack under volume. When the coach who is not watching loses an athlete to overtraining. When the smart coach pulls back at exactly the right moment.\nCountdown is on. Every session from here matters.\nCoach the camp. Not just the fight.`,
    `The overtraining does not happen on the hardest day.\nIt happens on the day after the hardest day, when nobody pulled back.\nFight camp management is daily monitoring. It is knowing when to push and when to protect. The coaches who arrive at fight week with sharp athletes are the ones who watched the data the whole way through.`,
  ],
  'Weight Cut': [
    `The weight cut does not start fight week.\nIt starts the day they sign the contract.\nIf you are not tracking daily weight from week one of camp, you are guessing on the cut. And when you guess on cuts, athletes show up drained, slow, and already beaten before the first round.\nSafe cuts are planned cuts. Planned cuts start now.`,
    `Too many coaches are reactive with weight cuts.\nBy the time they see the problem the athlete is already behind.\nDaily trend weight from contract signing is the only way to manage it properly. You need to know where they are every day leading up to weigh-in. Track the trend. Adjust the protocol. Protect the performance.`,
  ],
  'AI Sessions': [
    `Eight athletes. Eight different readiness scores.\nThat used to mean eight separate session plans written by hand.\nNow it means one input, eight tailored outputs.\nYou tell the system who is in camp, who is peaking, who is beat up. It builds the session around that. You review it. You own it. You coach it.\nThe AI does the calculation. You do the coaching.`,
    `The session that works for your 91 is not the session that works for your 38.\nGiving both athletes the same training day is not a programme. It is a guess with a structure around it.\nReadiness-aware session building adapts to where each athlete actually is. That is not technology replacing the coach. That is technology giving the coach what they actually need.`,
  ],
  'Problem/Frustration': [
    `Be honest.\nHow are you managing your athletes right now?\nWhatsApp voice notes at midnight. A spreadsheet nobody updates. Gut feeling on who is cooked and who is fresh.\nThat is not a system. That is chaos with a coaching badge.\nYou have fighters entering camp, athletes cutting weight, and sessions to plan all running at the same time.\nOther coaches are still doing it the old way. Some of them will wreck an athlete two weeks before the fight because they did not see the signs.`,
    `You trained for years to coach at this level.\nYou did not train to manage seventeen WhatsApp threads and a spreadsheet that is three days out of date.\nThe admin is not the job. The coaching is the job.\nEvery hour you spend guessing readiness and chasing check-ins is an hour you are not coaching. That is the real cost.`,
  ],
  'Social Proof': [
    `Coaches using StrikePanel stopped guessing.\nThey know which athlete needs a light day before the athlete does.\nThey walk into the gym with a session already built to each athlete score.\nThey arrive at fight week with athletes who are sharp, not empty.\nThat is not a feature. That is an outcome.\nBetter decisions win fights.`,
    `The coaches who perform consistently are not more talented.\nThey are more informed.\nThey walk into every session knowing which athletes are ready to be pushed and which need protecting. They do not find out mid-session when something breaks.\nInformation is the advantage. The coaches who have it make better calls.`,
  ],
  'Direct Offer': [
    `One payment. No subscription. No monthly bill sitting on your account.\nStrikePanel is $99.\nYou get readiness scoring for up to 20 athletes. Fight camp countdowns. Weight cut tracking. AI session generation.\nEverything a serious coach needs to run a serious programme.\nNinety-nine dollars. You own it.\nLink in bio.`,
    `Independent coaches should not be paying SaaS prices for tools they use every day.\nStrikePanel is $99 one-time. No subscription. No renewal. No bill in six months.\nReadiness scoring, fight camps, weight cuts, AI sessions for up to 20 athletes.\nOne purchase. Yours permanently.\nLink in bio.`,
  ],
};

function getPoolCaption(pillar) {
  const key = Object.keys(CAPTION_POOL).find(k => pillar.includes(k)) || 'Problem/Frustration';
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return CAPTION_POOL[key][week % CAPTION_POOL[key].length];
}

async function generateCaption(pillar, trends) {
  if (!process.env.GROQ_API_KEY) {
    console.log('  No GROQ_API_KEY — using caption pool');
    return getPoolCaption(pillar);
  }

  const trendContext = trends?.themes?.slice(0, 3).join(', ') || '';

  // Pick the two most relevant example captions based on the pillar.
  // Example 1: matching pillar if available. Example 2: closest alternate.
  const pillarKey = Object.keys(CAPTION_POOL).find(k => pillar.includes(k)) || 'Problem/Frustration';

  // Primary example: exact pillar match
  const primaryExample = CAPTION_POOL[pillarKey][0];

  // Secondary example: closest thematically related pillar (not the same one)
  const SECONDARY_MAP = {
    'Readiness':          'Problem/Frustration',
    'Fight Camp':         'Readiness',
    'Weight Cut':         'Fight Camp',
    'AI Sessions':        'Readiness',
    'Problem/Frustration':'Readiness',
    'Social Proof':       'Problem/Frustration',
    'Direct Offer':       'Social Proof',
  };
  const secondaryKey = SECONDARY_MAP[pillarKey] || 'Readiness';
  const secondaryExample = CAPTION_POOL[secondaryKey][0];

  const prompt = `You write Instagram captions for StrikePanel — a coaching dashboard for independent combat sports coaches (boxing, MMA, Muay Thai, BJJ).

Here are two GOOD captions. Study the voice, rhythm, and structure exactly.

--- EXAMPLE 1 (${pillarKey}) ---
${primaryExample}

--- EXAMPLE 2 (${secondaryKey}) ---
${secondaryExample}

---

Write in exactly this style. Short sentences. Sometimes sentence fragments. Raw, direct, coach-to-coach. No corporate language. No AI phrases. Never first person.

Content pillar today: ${pillar}
${trendContext ? `What coaches are talking about right now: ${trendContext}` : ''}

Additional rules:
- Second person only ("you", "your fighters") — never "I", "I'm", "my"
- No hashtags (added separately)
- No emojis
- No hyphens
- 80-120 words total
- No quotes around the output, no intro text, no "Caption:" label
- If pillar is Direct Offer: end with "Link in bio."
- If pillar is Social Proof: describe a real coaching outcome, not a testimonial

Output the caption only.`;


  try {
    const body = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.8,
    });

    const caption = await new Promise((resolve, reject) => {
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

    return caption;
  } catch (e) {
    console.warn('  Groq failed:', e.message, '— falling back to caption pool');
    return getPoolCaption(pillar);
  }
}

async function buildCarouselSlides(pillar, caption) {
  const sentences = caption.split(/\.\s+/).filter(Boolean);
  const pillarName = pillar.split('—')[0].trim();

  // Fetch a real sport photo from Pexels/Pixabay for the background
  const bgImage = await getBackgroundPhoto(pillar).catch(() => null);

  const slides = [
    {
      type: 'cover',
      kicker: `STRIKEPANEL™ · ${pillarName.toUpperCase()}`,
      headline: sentences[0]?.length > 50
        ? sentences[0].substring(0, 47).toUpperCase() + '...'
        : (sentences[0] || pillarName).toUpperCase(),
      sub: sentences[1] || 'A note for combat sports coaches',
    },
  ];

  // Middle slides — one sentence per slide, larger and more impactful
  for (let i = 2; i < Math.min(sentences.length, 5); i++) {
    slides.push({
      type: 'quote',
      quote: sentences[i],
      attribution: 'STRIKEPANEL™',
    });
  }

  // Closing CTA slide
  slides.push({
    type: 'cta',
    stat: '$99',
    headline: 'ONE PAYMENT.',
    headlineCyan: 'NO SUBSCRIPTION.',
    body: 'Readiness scoring, fight camps, weight cuts, AI sessions. Up to 20 athletes. You own it forever.',
  });

  const date = new Date().toISOString().split('T')[0];
  const name = `daily-${date}`;
  const imagePaths = await generateCarousel(slides, name, bgImage);
  return { imagePaths, bgImage };
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

  const caption = await generateCaption(pillar, trends);
  const fullCaption = `${caption}\n\n${HASHTAGS}`;
  console.log('\n  Caption preview:');
  console.log('  ' + caption.split('\n')[0].substring(0, 80) + '...');

  // Step 3: Visuals — background photo + video clip (run in parallel)
  console.log('\n3. Fetching visuals...');
  const [carouselResult, videoClip] = await Promise.all([
    buildCarouselSlides(pillar, caption).catch(e => {
      console.warn('  Carousel failed:', e.message, '— will post without slides');
      return { imagePaths: [], bgImage: null };
    }),
    getVideoClip(pillar).catch(() => null),
  ]);

  const { imagePaths } = carouselResult;
  if (videoClip) console.log(`  Video ready: ${path.basename(videoClip)}`);
  console.log(`  ${imagePaths.length} carousel slides built`);

  // Step 4: Post via Zernio
  if (!process.env.ZERNIO_API_KEY) {
    console.warn('\n4. ZERNIO_API_KEY not set — skipping post');
    console.log('   Caption ready to copy:\n');
    console.log(fullCaption);
    writeLog({ pillar, caption: fullCaption, status: 'skipped_no_key', slides: imagePaths.length });
    return;
  }

  console.log('\n4. Uploading & posting to Instagram via Zernio...');
  try {
    let publicUrls = [];
    if (imagePaths.length > 0) {
      if (!process.env.IMGBB_API_KEY) {
        console.warn('  IMGBB_API_KEY not set — posting without carousel images');
      } else {
        console.log('  Uploading slides to CDN...');
        publicUrls = await zernio.uploadImages(imagePaths);
        console.log(`  ${publicUrls.length} slides uploaded`);
      }
    }

    const result = await zernio.createPost({
      content: fullCaption,
      mediaUrls: publicUrls,
    });
    console.log('  Posted:', result?._id || 'success');
    writeLog({
      pillar, caption: fullCaption, status: 'posted',
      slides: imagePaths.length, videoClip: videoClip ? path.basename(videoClip) : null,
      zernioId: result?._id,
    });
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
