#!/usr/bin/env node
/**
 * strikepanel Daily Automation — 5-Pillar Rotation
 *
 * Every post = 3 slides: Problem → Solution → CTA
 *
 * Pillar 1 — PAIN       Black card. One brutal truth.
 * Pillar 2 — EDUCATION  Teach something. Fight camp / readiness science.
 * Pillar 3 — PROOF      Dashboard widget. Scores. Morning brief.
 * Pillar 4 — IDENTITY   Split screen. Chaos vs Clarity. Who they want to be.
 * Pillar 5 — STORY      Cinematic scenario. Coach found out too late.
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

const VOICE = `BRAND VOICE (follow exactly):
- Every sentence starts with a capital letter and ends with a full stop.
- Short declarative sentences. One idea per sentence. No comma-separated clauses.
- Active voice. Direct. Second person (you/your) where natural.
- No emojis. No hyphens. No exclamation marks. No questions.
- Tone: a respected senior coach speaking to a peer. Confident, not salesy.
- BAD: "you feel helpless and wonder if things could be different"
- GOOD: "You had no number. No score. No system. Just a gut feeling that cost you the fight."`;

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

// Cycles through pillars 1-5
function getNextPillar() {
  const log = readLog();
  const last = [...log].reverse().find(e => e.status === 'posted' && e.pillarNum);
  if (!last) return 1;
  return (last.pillarNum % 5) + 1;
}

// ── Groq ───────────────────────────────────────────────────────────

async function groq(prompt, maxTokens = 300) {
  if (!process.env.GROQ_API_KEY) return null;
  const body = JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.7,
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

// ── Pillar 1: PAIN ──────────────────────────────────────────────────

const PAIN_FALLBACK = {
  line: 'FIGHTER LOST IN ROUND 3.\nCOACH HAD NO DATA.',
  sub: 'That is not bad luck. That is a missing system.',
  solHeadline: 'ONE NUMBER.', solCyan: 'EVERYTHING CHANGES.',
  solPoints: [
    'Readiness score per athlete. Every morning. Before the session starts.',
    'Know who to push hard and who to protect. No more gut calls.',
    'Fight camps, weight cuts, and load tracked in a single dashboard.',
  ],
  caption: `Fighter lost in round 3. Coach had no data.\n\nNo readiness score. No load tracking. No warning sign.\n\nJust a gut feeling that turned out to be wrong.\n\nEvery coach has been there. The ones who stay there are the ones who never build the system.`,
};

async function buildPillar1() {
  const prompt = `You write Instagram posts for strikepanel — a $99 coaching dashboard for combat sports coaches.\n\n${VOICE}\n\nGenerate a PAIN post. One brutal truth a combat sports coach lives with when they have no data system.\n\nOutput format (exact labels, nothing else):\nLINE: [brutal truth, ALL CAPS, max 10 words, can split into 2 lines with \\n]\nSUB: [quiet follow-up, sentence case, max 12 words]\nSOL_HEADLINE: [solution concept, 3-5 words, ALL CAPS]\nSOL_CYAN: [complementary phrase, 2-4 words, ALL CAPS]\nSOL_1: [first benefit point, 12-16 words, specific]\nSOL_2: [second benefit point, 12-16 words, specific]\nSOL_3: [third benefit point, 12-16 words, specific]\nCAPTION: [4-6 short sentences in 2-3 paragraphs, 60-80 words. Specific combat sports moment. Ends with quiet insight.]\n\nExample LINE: FIGHTER LOST IN ROUND 3.\\nCOACH HAD NO DATA.\nExample CAPTION paragraph: Fighter lost in round 3. Coach had no data.\n\nNo readiness score. No load tracking. No warning sign. Just a gut feeling that turned out to be wrong.`;

  try {
    const raw = await groq(prompt, 420);
    if (!raw) throw new Error('no key');
    const g = (label, next) => raw.match(new RegExp(`${label}:\\s*(.+?)(?=\\n${next}:|$)`, 's'))?.[1]?.trim() || null;
    const line = g('LINE', 'SUB')?.replace(/\\n/g, '\n');
    const sub = g('SUB', 'SOL_HEADLINE');
    const solHeadline = g('SOL_HEADLINE', 'SOL_CYAN');
    const solCyan = g('SOL_CYAN', 'SOL_1');
    const sol1 = g('SOL_1', 'SOL_2');
    const sol2 = g('SOL_2', 'SOL_3');
    const sol3 = g('SOL_3', 'CAPTION');
    const caption = raw.match(/CAPTION:\s*([\s\S]+?)$/)?.[1]?.trim();
    if (!line || !caption || !sol1) throw new Error('parse failed');
    return { line, sub, solHeadline: solHeadline || 'ONE NUMBER.', solCyan: solCyan || 'EVERYTHING CHANGES.', solPoints: [sol1, sol2 || '', sol3 || ''].filter(Boolean), caption };
  } catch {
    return PAIN_FALLBACK;
  }
}

async function buildPost1() {
  const d = await buildPillar1();
  const date = new Date().toISOString().split('T')[0];
  const slides = [
    { type: 'blackcard', line: d.line, sub: d.sub },
    { type: 'solution', headline: d.solHeadline, headlineCyan: d.solCyan, points: d.solPoints },
    { type: 'cta', stat: '$99', headline: 'ONE PAYMENT.', headlineCyan: 'NO SUBSCRIPTION.', body: 'Readiness scoring, fight camps, weight cuts, AI sessions. Up to 20 athletes. You own it forever.' },
  ];
  const imagePaths = await generateCarousel(slides, `post1-${date}`);
  return { imagePaths, caption: d.caption + `\n\n${HASHTAGS}`, pillarNum: 1, pillarName: 'Pain' };
}

// ── Pillar 2: EDUCATION ───────────────────────────────────────────

const EDU_TOPICS = [
  { topic: 'the 3 phases of fight camp', hook: 'MOST COACHES TREAT\nCAMP AS ONE PHASE.' },
  { topic: 'how to read a readiness score', hook: 'A NUMBER BELOW 40\nIS NOT LAZINESS.' },
  { topic: 'why weight cuts fail in the last 48 hours', hook: 'THE SCALE SAYS READY.\nTHE BODY DOES NOT.' },
  { topic: 'what load management actually means for combat sports', hook: 'VOLUME IS NOT THE PROBLEM.\nTIMING IS.' },
];

async function buildPost2() {
  const topic = EDU_TOPICS[new Date().getDate() % EDU_TOPICS.length];
  const prompt = `You write Instagram posts for strikepanel — a $99 coaching dashboard for combat sports coaches.\n\n${VOICE}\n\nGenerate an EDUCATION post teaching coaches about: "${topic.topic}"\n\nOutput format (exact labels, nothing else):\nHOOK: [striking opener, ALL CAPS, max 10 words, can split 2 lines with \\n — use: ${topic.hook}]\nSOL_HEADLINE: [what the lesson covers, 3-5 words, ALL CAPS]\nSOL_CYAN: [complementary phrase, 2-4 words, ALL CAPS]\nSOL_1: [first teaching point, 12-16 words]\nSOL_2: [second teaching point, 12-16 words]\nSOL_3: [third teaching point, 12-16 words]\nCAPTION: [5-7 sentences in 3 paragraphs, 70-90 words. Teach the concept clearly. Coach-to-coach. No product mention until the final line which can say strikepanel tracks this.]`;

  try {
    const raw = await groq(prompt, 450);
    if (!raw) throw new Error('no key');
    const g = (label, next) => raw.match(new RegExp(`${label}:\\s*(.+?)(?=\\n${next}:|$)`, 's'))?.[1]?.trim() || null;
    const hook = (g('HOOK', 'SOL_HEADLINE') || topic.hook).replace(/\\n/g, '\n');
    const solHeadline = g('SOL_HEADLINE', 'SOL_CYAN') || 'WHAT TO KNOW.';
    const solCyan = g('SOL_CYAN', 'SOL_1') || 'EVERY COACH NEEDS THIS.';
    const sol1 = g('SOL_1', 'SOL_2');
    const sol2 = g('SOL_2', 'SOL_3');
    const sol3 = g('SOL_3', 'CAPTION');
    const caption = raw.match(/CAPTION:\s*([\s\S]+?)$/)?.[1]?.trim();
    if (!caption || !sol1) throw new Error('parse failed');
    const date = new Date().toISOString().split('T')[0];
    const slides = [
      { type: 'blackcard', line: hook, sub: `Understanding ${topic.topic}.` },
      { type: 'solution', headline: solHeadline, headlineCyan: solCyan, points: [sol1, sol2, sol3].filter(Boolean) },
      { type: 'cta', stat: '$99', headline: 'ONE PAYMENT.', headlineCyan: 'NO SUBSCRIPTION.', body: 'strikepanel tracks readiness, fight camps, weight cuts, and generates AI sessions. You own it forever.' },
    ];
    const imagePaths = await generateCarousel(slides, `post2-${date}`);
    return { imagePaths, caption: caption + `\n\n${HASHTAGS}`, pillarNum: 2, pillarName: 'Education' };
  } catch {
    return buildPost1().then(r => ({ ...r, pillarNum: 2, pillarName: 'Education (fallback)' }));
  }
}

// ── Pillar 3: PROOF ────────────────────────────────────────────────

async function buildPost3() {
  const athletes = [
    { name: 'REYES', score: 91 }, { name: 'LAKE', score: 67 }, { name: 'MARCUS', score: 34 },
  ];
  const caption = `This is the morning brief.\n\nThree athletes. Three completely different days.\n\nReyes gets a hard sparring session. Lake gets technical work at 70 percent. Marcus gets active recovery and a conversation.\n\nOne screen. Thirty seconds. Every coach in your gym knows what today looks like before anyone walks through the door.\n\nThis is not guesswork. This is strikepanel.\n\n${HASHTAGS}`;
  const date = new Date().toISOString().split('T')[0];
  const slides = [
    { type: 'widget', athletes, headline: 'THIS IS YOUR', headlineAmber: 'MORNING BRIEF.' },
    { type: 'solution', headline: 'ONE SCREEN.', headlineCyan: 'THREE DECISIONS MADE.',
      points: [
        'Reyes at 91 — push hard. Full sparring session.',
        'Lake at 67 — technical work at 70 percent load.',
        'Marcus at 34 — active recovery. No sparring today.',
      ] },
    { type: 'cta', stat: '$99', headline: 'ONE PAYMENT.', headlineCyan: 'NO SUBSCRIPTION.', body: 'Up to 20 athletes. Readiness scored daily. Fight camps and weight cuts built in.' },
  ];
  const imagePaths = await generateCarousel(slides, `post3-${date}`);
  return { imagePaths, caption, pillarNum: 3, pillarName: 'Proof' };
}

// ── Pillar 4: IDENTITY ────────────────────────────────────────────

const IDENTITY_FALLBACK = {
  chaos: 'Napkin from last Tuesday. WhatsApp voice note at 11pm. Gut feeling walking in.',
  clarity: 'Eight scores on one screen. Who to push. Who to protect. Decided before breakfast.',
  label: 'SAME COACH. DIFFERENT TOOLS.',
  solHeadline: 'DATA-DRIVEN', solCyan: 'COACHING.',
  solPoints: [
    'Elite coaches do not guess. They score. Every athlete. Every morning.',
    'The gap between good and great is not talent. It is information.',
    'Your system is what separates you when your gut is wrong.',
  ],
  caption: `Same coach. Different tools.\n\nLeft side is where most combat sports coaches still are. Not because they are bad coaches. Because nobody built them the right system.\n\nRight side is what changes when you stop guessing and start scoring.\n\nThe decisions do not get easier. They get faster. And faster decisions protect athletes.`,
};

async function buildPost4() {
  const prompt = `You write Instagram posts for strikepanel — a $99 coaching dashboard for combat sports coaches.\n\n${VOICE}\n\nGenerate an IDENTITY post. The theme is: elite combat sports coaches use data. Non-elite coaches guess.\n\nOutput format (exact labels, nothing else):\nCHAOS: [coaching chaos, 12-18 words, vivid — napkins, WhatsApp, guesswork, whiteboards]\nCLARITY: [coaching clarity, 12-18 words, specific — what the elite coach already knows before the session]\nLABEL: [banner contrast, ALL CAPS, max 6 words]\nSOL_HEADLINE: [identity statement, 2-4 words, ALL CAPS]\nSOL_CYAN: [complementary phrase, 2-4 words, ALL CAPS]\nSOL_1: [identity point 1, 12-16 words, what elite coaches do differently]\nSOL_2: [identity point 2, 12-16 words]\nSOL_3: [identity point 3, 12-16 words]\nCAPTION: [5-7 sentences in 3 paragraphs, 65-85 words. Coach-to-coach. Ends with quiet insight about professional identity.]`;

  try {
    const raw = await groq(prompt, 480);
    if (!raw) throw new Error('no key');
    const g = (label, next) => raw.match(new RegExp(`${label}:\\s*(.+?)(?=\\n${next}:|$)`, 's'))?.[1]?.trim() || null;
    const chaos = g('CHAOS', 'CLARITY');
    const clarity = g('CLARITY', 'LABEL');
    const label = g('LABEL', 'SOL_HEADLINE');
    const solHeadline = g('SOL_HEADLINE', 'SOL_CYAN') || 'DATA-DRIVEN';
    const solCyan = g('SOL_CYAN', 'SOL_1') || 'COACHING.';
    const sol1 = g('SOL_1', 'SOL_2');
    const sol2 = g('SOL_2', 'SOL_3');
    const sol3 = g('SOL_3', 'CAPTION');
    const caption = raw.match(/CAPTION:\s*([\s\S]+?)$/)?.[1]?.trim();
    if (!chaos || !clarity || !caption) throw new Error('parse failed');
    const date = new Date().toISOString().split('T')[0];
    const bgImage = await getBackgroundPhoto('Problem').catch(() => null);
    const slides = [
      { type: 'splitscreen', chaos, clarity, label: label || 'SAME COACH. DIFFERENT TOOLS.' },
      { type: 'solution', headline: solHeadline, headlineCyan: solCyan, points: [sol1, sol2, sol3].filter(Boolean) },
      { type: 'cta', stat: '$99', headline: 'ONE PAYMENT.', headlineCyan: 'NO SUBSCRIPTION.', body: 'Readiness scoring, fight camps, weight cuts, AI sessions. Up to 20 athletes. You own it forever.' },
    ];
    const imagePaths = await generateCarousel(slides, `post4-${date}`, bgImage);
    return { imagePaths, caption: caption + `\n\n${HASHTAGS}`, pillarNum: 4, pillarName: 'Identity' };
  } catch {
    const d = IDENTITY_FALLBACK;
    const date = new Date().toISOString().split('T')[0];
    const bgImage = await getBackgroundPhoto('Problem').catch(() => null);
    const slides = [
      { type: 'splitscreen', chaos: d.chaos, clarity: d.clarity, label: d.label },
      { type: 'solution', headline: d.solHeadline, headlineCyan: d.solCyan, points: d.solPoints },
      { type: 'cta', stat: '$99', headline: 'ONE PAYMENT.', headlineCyan: 'NO SUBSCRIPTION.', body: 'Readiness scoring, fight camps, weight cuts, AI sessions. Up to 20 athletes. You own it forever.' },
    ];
    const imagePaths = await generateCarousel(slides, `post4-${date}`, bgImage);
    return { imagePaths, caption: d.caption + `\n\n${HASHTAGS}`, pillarNum: 4, pillarName: 'Identity (fallback)' };
  }
}

// ── Pillar 5: STORY ──────────────────────────────────────────────

const STORY_FALLBACK = {
  scene: 'Between rounds. His fighter is on the stool. Breathing wrong. Eyes glazed. The coach is talking tactics but the fighter stopped hearing him two rounds ago.',
  truth: 'HE FOUND OUT TOO LATE.',
  kicker: 'FIGHT CAMP · CORNER MOMENT',
  solHeadline: 'THE DATA', solCyan: 'WOULD HAVE SHOWN IT.',
  solPoints: [
    'Readiness score on Monday. Trend down three days in a row.',
    'Tuesday session adjusted. Wednesday load protected.',
    'Fighter arrives at fight night sharp. Not empty.',
  ],
  caption: `Between rounds. His fighter is on the stool.\n\nBreathing wrong. Eyes glazed. The coach is still calling combinations but the fighter stopped hearing him two rounds ago.\n\nHe was running on empty. Had been for three days.\n\nThe readiness score would have shown it on Monday. One adjusted session on Tuesday. The fighter would have arrived at fight night sharp.\n\nInstead he found out in round 4.`,
};

async function buildPost5() {
  const prompt = `You write Instagram posts for strikepanel — a $99 coaching dashboard for combat sports coaches.\n\n${VOICE}\n\nGenerate a STORY post. A cinematic moment where a coach discovers too late that their fighter was already broken — because they had no readiness data.\n\nOutput format (exact labels, nothing else):\nSCENE: [2-3 short sentences, present tense, cinematic. Corner or gym. No product mention.]\nTRUTH: [ALL CAPS, max 8 words. What the missing data cost.]\nKICKER: [ALL CAPS, exactly: FIGHT CAMP · [MOMENT NAME], max 5 words after dot]\nSOL_HEADLINE: [what the data would have done, 3-5 words, ALL CAPS]\nSOL_CYAN: [completion phrase, 3-5 words, ALL CAPS]\nSOL_1: [what data would have shown, 12-16 words]\nSOL_2: [what decision would have changed, 12-16 words]\nSOL_3: [the outcome that would have been different, 12-16 words]\nCAPTION: [6-8 sentences in 4 paragraphs, 85-110 words. Full story. Real details. Ends with the lesson.]`;

  try {
    const raw = await groq(prompt, 500);
    if (!raw) throw new Error('no key');
    const g = (label, next) => raw.match(new RegExp(`${label}:\\s*(.+?)(?=\\n${next}:|$)`, 's'))?.[1]?.trim() || null;
    const scene = g('SCENE', 'TRUTH');
    const truth = g('TRUTH', 'KICKER');
    const kicker = g('KICKER', 'SOL_HEADLINE') || 'FIGHT CAMP · CORNER MOMENT';
    const solHeadline = g('SOL_HEADLINE', 'SOL_CYAN') || 'THE DATA';
    const solCyan = g('SOL_CYAN', 'SOL_1') || 'WOULD HAVE SHOWN IT.';
    const sol1 = g('SOL_1', 'SOL_2');
    const sol2 = g('SOL_2', 'SOL_3');
    const sol3 = g('SOL_3', 'CAPTION');
    const caption = raw.match(/CAPTION:\s*([\s\S]+?)$/)?.[1]?.trim();
    if (!scene || !truth || !caption) throw new Error('parse failed');
    const bgImage = await getBackgroundPhoto('Fight Camp').catch(() => null);
    const date = new Date().toISOString().split('T')[0];
    const slides = [
      { type: 'scenario', scene, truth, kicker, bgImage },
      { type: 'solution', headline: solHeadline, headlineCyan: solCyan, points: [sol1, sol2, sol3].filter(Boolean) },
      { type: 'cta', stat: '$99', headline: 'ONE PAYMENT.', headlineCyan: 'NO SUBSCRIPTION.', body: 'Readiness scoring, fight camps, weight cuts, AI sessions. Up to 20 athletes. You own it forever.' },
    ];
    const imagePaths = await generateCarousel(slides, `post5-${date}`, bgImage);
    return { imagePaths, caption: caption + `\n\n${HASHTAGS}`, pillarNum: 5, pillarName: 'Story' };
  } catch {
    const d = STORY_FALLBACK;
    const bgImage = await getBackgroundPhoto('Fight Camp').catch(() => null);
    const date = new Date().toISOString().split('T')[0];
    const slides = [
      { type: 'scenario', scene: d.scene, truth: d.truth, kicker: d.kicker, bgImage },
      { type: 'solution', headline: d.solHeadline, headlineCyan: d.solCyan, points: d.solPoints },
      { type: 'cta', stat: '$99', headline: 'ONE PAYMENT.', headlineCyan: 'NO SUBSCRIPTION.', body: 'Readiness scoring, fight camps, weight cuts, AI sessions. Up to 20 athletes. You own it forever.' },
    ];
    const imagePaths = await generateCarousel(slides, `post5-${date}`, bgImage);
    return { imagePaths, caption: d.caption + `\n\n${HASHTAGS}`, pillarNum: 5, pillarName: 'Story (fallback)' };
  }
}

// ── Main ──────────────────────────────────────────────────────────

async function run() {
  console.log('\n=== strikepanel Post ===');
  console.log(new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dubai' }), '(Dubai)');

  const days = daysSinceLastPost();
  if (days < 2.5) {
    const next = Math.ceil(3 - days);
    console.log(`Last post was ${days.toFixed(1)} days ago. Next post in ${next} day(s). Skipping.`);
    return;
  }

  const pillar = getNextPillar();
  const pillarNames = { 1: 'Pain', 2: 'Education', 3: 'Proof', 4: 'Identity', 5: 'Story' };
  console.log(`\nPillar ${pillar}/5 — ${pillarNames[pillar]}`);

  let result;
  try {
    if (pillar === 1) result = await buildPost1();
    else if (pillar === 2) result = await buildPost2();
    else if (pillar === 3) result = await buildPost3();
    else if (pillar === 4) result = await buildPost4();
    else result = await buildPost5();
  } catch (e) {
    console.error('Build failed:', e.message);
    writeLog({ pillarNum: pillar, status: 'failed', error: e.message });
    return;
  }

  const { imagePaths, caption, pillarNum, pillarName } = result;
  console.log(`\n${imagePaths.length} slides built (${pillarName})`);
  console.log('Caption preview:', caption.split('\n')[0]);

  if (!process.env.ZERNIO_API_KEY) {
    console.warn('\nZERNIO_API_KEY not set — skipping post');
    console.log('\nCaption:\n' + caption);
    writeLog({ pillarNum, pillarName, caption, status: 'skipped_no_key', slides: imagePaths.length });
    return;
  }

  console.log('\nUploading & posting via Zernio...');
  try {
    let publicUrls = [];
    if (imagePaths.length > 0 && process.env.IMGBB_API_KEY) {
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
    const post = await zernio.createPost({ content: caption, mediaUrls: publicUrls });
    console.log('  Posted:', post?._id || 'success');
    writeLog({ pillarNum, pillarName, caption, status: 'posted', slides: imagePaths.length, zernioId: post?._id });
  } catch (e) {
    console.error('  Post failed:', e.message);
    writeLog({ pillarNum, pillarName, caption, status: 'failed', error: e.message });
  }

  console.log('\n=== Done ===\n');
}

run().catch(e => { console.error('Fatal error:', e); process.exit(1); });
