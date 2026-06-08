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

const VOICE = `BRAND VOICE — READ THIS BEFORE WRITING ANYTHING:

PRODUCT: strikepanel — $99 one-time coaching dashboard for combat sports coaches. Readiness scores, fight camps, weight cuts, AI sessions. Up to 20 athletes.

AUDIENCE: Combat sports coaches (boxing, MMA, BJJ, Muay Thai). They coach 5-20 athletes. They are knowledgeable but disorganised. They care deeply but operate on gut feeling. They are proud and slightly defensive about their methods.

JOB-TO-BE-DONE: Coaches do not want "data." They want to stop ruining athletes and start winning fights. Every line should speak to that job — not to features.

TONE: Confrontational but not cruel. Specific and embarrassing but true. Make them wince, then nod. They should feel seen, then shown a way out.

FIRST LINE IS EVERYTHING: The first line of every caption must be a scroll stopper. If a coach reads it and doesn't feel immediately called out or curious, it fails. Test the first line independently.

HOOK TYPES TO USE:
- Contrarian: "The readiness check is not kindness. It is self-defence."
- Story: "His fighter sat on the stool between rounds. The coach was shouting combinations the fighter stopped hearing in round two."
- Loss aversion (most powerful): "He pushed a 31 into sparring. Found out in round two."
- Specific embarrassment: "You texted twelve athletes the same plan this morning. Three of them were already broken."

LOSS AVERSION IS YOUR WEAPON: Coaches fear ruining careers and losing fighters far more than they want efficiency gains. Lead with what they stand to lose. End with what they could protect.

SPECIFICITY RULES — NO EXCEPTIONS:
- BAD: "You feel overwhelmed and wish things were different."
- BAD: "Data helps coaches make better decisions."
- BAD: "Your athletes deserve better."
- GOOD: "You sent twelve athletes the same session. Three were running on empty. You will never know which three."
- GOOD: "His readiness was 31 on Monday. You ran him through full sparring. He peaked on Wednesday and had nothing left for Saturday."
- GOOD: "The napkin was not a fight camp. The WhatsApp group is not a coaching system."
- GOOD: "He told you he was fine. His body said a 29. You saw neither."

CAPTION STRUCTURE (always follow this):
1. First line = scroll stopper (specific moment, specific failure, specific embarrassment)
2. Short paragraph = what it cost (career, fight, reputation, relationship with fighter)
3. Short paragraph = what the data would have shown (specific score, specific decision)
4. Final line = quiet lesson, no hard sell, one sentence

WRITING RULES:
- Short declarative sentences. One idea per sentence.
- Active voice. No passive constructions.
- No emojis. No exclamation marks. No rhetorical questions.
- Every sentence starts with a capital. Ends with a full stop.
- No comma-separated clauses. No hyphens as dashes.
- No weak qualifiers: "almost," "very," "really," "perhaps," "might"
- Specificity over vagueness. Numbers over adjectives.`;

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

async function groq(prompt, maxTokens = 700) {
  if (!process.env.GROQ_API_KEY) return null;
  const body = JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.9,
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
  line: 'YOU SENT 12 ATHLETES\nTHE SAME SESSION TODAY.',
  sub: 'Three of them were running on empty. You will never know which three.',
  solHeadline: 'ONE SCORE.', solCyan: 'DIFFERENT DAYS.',
  solPoints: [
    'Readiness score per athlete every morning. Push Reyes. Protect Marcus. Simple.',
    'No more same-session-for-everyone. No more guessing who is already broken.',
    'Fight camp load, weight cuts, and AI sessions — all in one place for ninety-nine dollars.',
  ],
  caption: `You sent twelve athletes the same session plan today.\n\nThree of them were running on empty. One was fighting a cold you did not know about. Two had not slept properly in four days.\n\nYou will never know which three. Because you had no system.\n\nThe coach down the road did. He scored every athlete this morning before he even touched the whiteboard. He already knew who needed protecting today.\n\nThat gap is not talent. It is a tool you have not bought yet.`,
};

async function buildPillar1() {
  const prompt = `You write Instagram posts for strikepanel — a $99 coaching dashboard for combat sports coaches.

${VOICE}

Generate a PAIN post using LOSS AVERSION. The coach must feel the specific thing they already lost or are about to lose — not a future benefit they might gain.

The loss could be: a fighter peaking too early, a career-ending overtraining injury, a corner decision made on a gut that was wrong, a camp that built nothing because the load never changed, a fight lost because the weight cut destroyed him three days out.

Pick ONE specific scenario. Make it uncomfortably recognisable. Coaches should wince because they did exactly this.

OBJECTS TO NAME (use at least two): napkin notes, WhatsApp group, same session for everyone, gut feeling, whiteboard rubbed out, a number he told you verbally, a fight camp with no structure.

Output format (exact labels, nothing else):
LINE: [loss aversion trigger, ALL CAPS, max 10 words, can split 2 lines with \\n — the specific thing that already happened or is about to]
SUB: [quiet devastator, sentence case, max 12 words — the cost, not the feature]
SOL_HEADLINE: [3-5 words, ALL CAPS — what protects against this]
SOL_CYAN: [2-4 words, ALL CAPS — completion phrase]
SOL_1: [12-16 words — specific protection this gives coaches, number included]
SOL_2: [12-16 words — second protection, specific decision it enables]
SOL_3: [12-16 words — third point, ends with what the coach with a system already knew]
CAPTION: [3 paragraphs, 75-95 words total.
Para 1: The specific moment — 2 sentences, present tense, specific objects.
Para 2: What it cost — 2 sentences, name the exact consequence (career, fight, relationship with fighter).
Para 3: What a score of [number] on [day] would have changed. Final line: one quiet lesson, no pitch, no product name.]

Example LINE: HE PEAKED ON WEDNESDAY.\\nSATURDAY NEVER CAME.
Example SUB: His readiness was 31 on Monday. You ran him anyway.
Example CAPTION opening: He sits on the stool between rounds. Breathing wrong. Eyes already gone.`;

  try {
    const raw = await groq(prompt, 700);
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
  const bgImage = await getBackgroundPhoto('Frustration').catch(() => null);
  const slides = [
    { type: 'blackcard', line: d.line, sub: d.sub },
    { type: 'solution', headline: d.solHeadline, headlineCyan: d.solCyan, points: d.solPoints },
    { type: 'cta', stat: '$99', headline: 'ONE PAYMENT.', headlineCyan: 'NO SUBSCRIPTION.', body: 'Readiness scoring, fight camps, weight cuts, AI sessions. Up to 20 athletes. You own it forever.' },
  ];
  const imagePaths = await generateCarousel(slides, `post1-${date}`, bgImage);
  return { imagePaths, caption: d.caption + `\n\n${HASHTAGS}`, pillarNum: 1, pillarName: 'Pain' };
}

// ── Pillar 2: EDUCATION ───────────────────────────────────────────

const EDU_TOPICS = [
  { topic: 'the 3 phases of fight camp', hook: 'YOU HAVE BEEN RUNNING\nONE LONG GRIND.' },
  { topic: 'how to read a readiness score', hook: 'A NUMBER BELOW 40\nIS NOT LAZINESS.' },
  { topic: 'why weight cuts fail in the last 48 hours', hook: 'THE SCALE SAID READY.\nHIS BODY SAID OTHERWISE.' },
  { topic: 'what load management actually means for combat sports', hook: 'VOLUME IS NOT THE PROBLEM.\nTIMING IS.' },
  { topic: 'how overtraining shows up before the coach notices', hook: 'HE TOLD YOU HE WAS FINE.\nHIS BODY DID NOT AGREE.' },
];

async function buildPost2() {
  const topic = EDU_TOPICS[new Date().getDate() % EDU_TOPICS.length];
  const prompt = `You write Instagram posts for strikepanel — a $99 coaching dashboard for combat sports coaches.

${VOICE}

Generate an EDUCATION post. Topic: "${topic.topic}"

Use a CONTRARIAN hook — open by calling out the wrong assumption coaches have been running on for years. The hook should make coaches feel mildly defensive, then immediately correct. Coach-to-coach tone: peer teaching peer, not brand selling product.

Output format (exact labels, nothing else):
HOOK: [contrarian opener, ALL CAPS, max 10 words, split 2 lines with \\n — names the wrong assumption coaches hold — use this as the base: ${topic.hook}]
SOL_HEADLINE: [what the real lesson is, 3-5 words, ALL CAPS]
SOL_CYAN: [complementary phrase, 2-4 words, ALL CAPS]
SOL_1: [first teaching point, 12-16 words — the wrong assumption spelled out with a specific number or scenario]
SOL_2: [second teaching point, 12-16 words — the correct understanding, specific]
SOL_3: [third teaching point, 12-16 words — what changes in practice when you apply this correctly, concrete example]
CAPTION: [3 paragraphs, 75-95 words.
Para 1: The wrong assumption — 2 sentences. Name exactly what coaches get wrong and why it made sense to believe it.
Para 2: The real science — 2 sentences. Specific. A number, a phase name, a physiological fact. Coach-to-coach, no jargon.
Para 3: What to do instead — 1-2 sentences. Practical. Specific day or decision. Final line: one quiet observation, not a sales line.]

Example HOOK: VOLUME IS NOT THE PROBLEM.\\nYOU PEAKED THEM IN WEEK THREE.
Example SOL_1: Most coaches run full load through week three of a six-week camp. Peak hits on day twenty-one, not fight night.`;

  try {
    const raw = await groq(prompt, 700);
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
    const bgImage = await getBackgroundPhoto('Fight Camp').catch(() => null);
    const slides = [
      { type: 'blackcard', line: hook, sub: `Understanding ${topic.topic}.` },
      { type: 'solution', headline: solHeadline, headlineCyan: solCyan, points: [sol1, sol2, sol3].filter(Boolean) },
      { type: 'cta', stat: '$99', headline: 'ONE PAYMENT.', headlineCyan: 'NO SUBSCRIPTION.', body: 'strikepanel tracks readiness, fight camps, weight cuts, and generates AI sessions. You own it forever.' },
    ];
    const imagePaths = await generateCarousel(slides, `post2-${date}`, bgImage);
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
  const caption = `Three athletes walked in this morning. One ready to be pushed. One needing technical work. One needing protection.\n\nYou have thirty seconds to know which is which. Or you treat all three the same and hope the one who is broken does not break further.\n\nReyes is at 91. Full sparring. Lake is at 67. Technical rounds at seventy percent. Marcus is at 34. Active recovery. No contact today.\n\nEvery decision made before the warm-up starts. No gut feeling. No guessing. No apologies on Saturday.\n\nThe coaches who protect careers are the ones who had the number before anyone walked through the door.\n\n${HASHTAGS}`;
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
  const bgImage = await getBackgroundPhoto('Social Proof').catch(() => null);
  const imagePaths = await generateCarousel(slides, `post3-${date}`, bgImage);
  return { imagePaths, caption, pillarNum: 3, pillarName: 'Proof' };
}

// ── Pillar 4: IDENTITY ────────────────────────────────────────────

const IDENTITY_FALLBACK = {
  chaos: 'WhatsApp group. Napkin notes. A hunch. Same plan for everyone. Eyes open, flying blind.',
  clarity: 'Eight scores before 8am. Reyes pushed hard. Marcus protected. Zero guessing. Zero apologies.',
  label: 'SAME COACH. DIFFERENT SYSTEM.',
  solHeadline: 'STOP GUESSING.', solCyan: 'START COACHING.',
  solPoints: [
    'Every athlete scored every morning. You know who to push before they arrive.',
    'Stop sending the same plan to twelve different bodies in twelve different states.',
    'The coaches who protect careers are the ones who had the number before the session.',
  ],
  caption: `Same coach. Different system.\n\nLeft side is where most combat sports coaches still are. Not because they are bad. Because nobody told them the gut feeling has a three percent failure rate that shows up in round four.\n\nRight side is what changes when every athlete has a score before you write the session plan.\n\nThe decisions do not get easier. They get faster. And in combat sports, faster protects careers.`,
};

async function buildPost4() {
  const prompt = `You write Instagram posts for strikepanel — a $99 coaching dashboard for combat sports coaches.

${VOICE}

Generate an IDENTITY post. Split screen: chaos (left) vs clarity (right). The identity the coach wants is not "tech-savvy." It is: the coach who protects careers. The coach fighters trust with their bodies.

The CHAOS side must name specific physical objects coaches will recognise from their own sessions this week. Do not be abstract. Name the napkin, the WhatsApp thread, the whiteboard rubbed out, the gut feeling that turned out to be wrong.

The CLARITY side must name specific decisions the data-driven coach already made before anyone walked in. Not features. Decisions. Outcomes.

Output format (exact labels, nothing else):
CHAOS: [12-18 words, brutally specific — at least 2 real objects: napkin, WhatsApp, same session for everyone, gut feeling, whiteboard rubbed out three times, verbal check-in he said was fine]
CLARITY: [12-18 words, specific decisions already made — names, numbers, actions taken before gym opens]
LABEL: [ALL CAPS, max 7 words — the identity contrast, punchy]
SOL_HEADLINE: [2-4 words, ALL CAPS — the identity these coaches claim]
SOL_CYAN: [2-4 words, ALL CAPS — what that identity does for fighters]
SOL_1: [12-16 words — specific behaviour: what data-driven coaches know before the session starts, with a number]
SOL_2: [12-16 words — specific protection: what they stop doing that chaotic coaches still do]
SOL_3: [12-16 words — specific outcome: what fight night looks like for their fighters versus the others]
CAPTION: [3 paragraphs, 75-95 words.
Para 1: Name the chaos side with specific objects. Two sentences. Coaches wince because they recognise it.
Para 2: What shifts when you have a score. Two sentences. Specific decisions, not abstract benefits.
Para 3: One quiet observation about identity — the coach who protects careers versus the one who hopes for the best. No product pitch. No questions.]

Example CHAOS: WhatsApp group plan sent at 7am. Same session for twelve athletes. Gut feeling said they were ready.
Example CLARITY: Eight scores before 8am. Reyes pushed. Marcus protected. Session written in four minutes.
Example LABEL: SAME GYM. DIFFERENT COACH.`;

  try {
    const raw = await groq(prompt, 700);
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
  scene: 'Between rounds. His fighter is on the stool. Breathing wrong. Eyes glazed. The coach is calling combinations and the fighter is nodding but nothing is going in.',
  truth: 'HE KNEW IN ROUND 2.\nHE HAD NOTHING LEFT.',
  kicker: 'FIGHT CAMP · DAY 23',
  solHeadline: 'THE SCORE', solCyan: 'WOULD HAVE SHOWN IT.',
  solPoints: [
    'Readiness score on Monday: 31. Trend down four days running. Red flag on paper.',
    'One adjusted session Tuesday. Load reduced Wednesday. Fighter protected going in.',
    'He arrives at fight night at 89. Sharp. Not empty. Not nodding at combinations he cannot hear.',
  ],
  caption: `Between rounds. His fighter is on the stool.\n\nBreathing wrong. Eyes glazed. The coach is calling combinations he practiced a hundred times in camp but the fighter stopped hearing him in round two.\n\nHe had been running on empty since Monday. The coach knew something felt off. He pushed anyway because camp was camp and there was no number to point at.\n\nA readiness score of 31 on Monday would have changed Tuesday. Tuesday would have changed fight night.\n\nInstead he found out in round two. In front of everyone.`,
};

async function buildPost5() {
  const prompt = `You write Instagram posts for strikepanel — a $99 coaching dashboard for combat sports coaches.

${VOICE}

Generate a STORY post. This is cinematic and uses the PEAK-END RULE: the reader must feel the peak moment of dread (the coach realising too late), then the quiet end (what would have been different with one number).

The story must be a single, specific moment. Not a summary. Not a lesson. A scene. Present tense. The coach is in it right now.

Choose one of these moments:
- Between rounds. Fighter on the stool. Eyes already gone. Coach still calling combinations.
- Weigh-in morning. Fighter three kilos over with six hours left. The cut destroyed him twelve days ago.
- Final sparring before fight night. The coach watching his fighter not move like himself. Not sharp. Flat.
- The morning after a loss. Replaying every session in his head. Finding the one that broke it.

Output format (exact labels, nothing else):
SCENE: [3 short present-tense sentences. Hyper specific. Round number or day of camp. Name what the coach sees on the fighter's face or body. No product mention. No explanation. Just the moment.]
TRUTH: [ALL CAPS, max 8 words, split 1-2 lines with \\n — the exact realisation, blunt and quiet]
KICKER: [ALL CAPS, format: FIGHT CAMP · [SPECIFIC MOMENT], e.g. FIGHT CAMP · ROUND FIVE or FIGHT CAMP · DAY 23]
SOL_HEADLINE: [3-5 words, ALL CAPS — what the data would have shown]
SOL_CYAN: [3-5 words, ALL CAPS — what would have been different]
SOL_1: [12-16 words — the specific score on the specific day, and what it would have triggered, include a number]
SOL_2: [12-16 words — the specific adjusted session on the day after, concrete]
SOL_3: [12-16 words — what fight night looked like instead — fighter arriving with something left]
CAPTION: [4 paragraphs, 90-115 words.
Para 1 (SCENE): 2 sentences. Present tense. The exact moment. Specific body language, corner detail, round.
Para 2 (COST): 2 sentences. What this cost. Name it — the fight, the camp, the relationship with the fighter.
Para 3 (DATA): 2 sentences. What a score of [number] on [day] would have changed. Specific. One adjusted session. One protected morning.
Para 4 (END): 1-2 sentences. Quiet. The lesson. No product name. No pitch. The kind of line a coach reads and sits with.]

Example SCENE: Round four. His fighter hits the ropes and does not come off them. The coach is shouting and the fighter is nodding but nothing is going in.
Example TRUTH: HE WAS EMPTY\\nBEFORE ROUND ONE.
Example CAPTION end: The number was there. The coach just did not have a place to look.`;

  try {
    const raw = await groq(prompt, 700);
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
  if (days < 1.5) {
    const next = Math.ceil(2 - days);
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
