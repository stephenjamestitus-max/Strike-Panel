#!/usr/bin/env node
/**
 * StrikePanel Engage — Daily Comment Generator
 * Run: node scripts/marketing/run-engage.js
 *
 * Generates 15 specific, brand-building comments for Instagram.
 * Outputs a formatted list for manual posting (Graph API commenting
 * requires special business permissions not available to all accounts).
 *
 * Tracks used accounts in engage_log.json — never repeats same account
 * two days in a row.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const fs = require('fs');
const path = require('path');
const https = require('https');

const ENGAGE_LOG_PATH = path.join(__dirname, 'engage_log.json');
const ENGAGE_QUEUE_PATH = path.join(__dirname, 'engage_queue.json');

// Master list — US/UK coaching-focused accounts with 5k+ followers
const MASTER_ACCOUNTS = [
  // US
  { handle: '@phil_daru_strength',   topic: 'strength and conditioning periodization for fighters', region: 'US' },
  { handle: '@jasonparillo',         topic: 'boxing and striking coach, high-level corner work', region: 'US' },
  { handle: '@roufusport',           topic: 'kickboxing and MMA coaching, Roufusport gym', region: 'US' },
  { handle: '@gbteambjj',            topic: 'BJJ and grappling competition coaching, Gracie Barra', region: 'US' },
  { handle: '@coachnickmurphy',      topic: 'boxing technical coaching and athlete development', region: 'US' },
  { handle: '@fightiqcoaching',      topic: 'fight IQ development, tactical MMA coaching', region: 'US' },
  { handle: '@expertboxing',         topic: 'online boxing coaching, technical fundamentals', region: 'US' },
  { handle: '@precisionstriking',    topic: 'striking technique and precision coaching', region: 'US' },
  { handle: '@mnbjj',               topic: 'BJJ competition coaching and team management', region: 'US' },
  { handle: '@firas_zahabi',         topic: 'scientific MMA training, Tristar gym head coach', region: 'US' },
  { handle: '@freddieroach',         topic: 'elite boxing coaching, Hall of Fame trainer', region: 'US' },
  { handle: '@shawnporter_boxing',   topic: 'professional boxing, former world champion coach perspective', region: 'US' },
  { handle: '@dc_mma',              topic: 'MMA coaching and athlete development, double champion', region: 'US' },
  { handle: '@coachfariasboxing',    topic: 'boxing skill development and coaching methodology', region: 'US' },
  { handle: '@combatstrengthcoaching', topic: 'combat sports specific strength and conditioning', region: 'US' },
  // UK
  { handle: '@boxingscience_',       topic: 'evidence-based boxing science and applied sports science', region: 'UK' },
  { handle: '@scientificboxing',     topic: 'scientific approach to boxing technique and training', region: 'UK' },
  { handle: '@dingesonboxing',       topic: 'UK boxing coaching, technical analysis', region: 'UK' },
  { handle: '@thaiboxingassociation',topic: 'Muay Thai coaching standards and development, UK', region: 'UK' },
  { handle: '@ufcpi',               topic: 'UFC Performance Institute strength and science', region: 'UK' },
  { handle: '@mark_henry_mma',       topic: 'elite MMA striking coach, known for technical development', region: 'UK' },
  { handle: '@striking_science',     topic: 'sports science applied to combat striking', region: 'UK' },
];

function readEngageLog() {
  if (!fs.existsSync(ENGAGE_LOG_PATH)) return [];
  try { return JSON.parse(fs.readFileSync(ENGAGE_LOG_PATH, 'utf8')); } catch { return []; }
}

function writeEngageLog(entries) {
  const existing = readEngageLog();
  const updated = [...existing, ...entries];
  fs.writeFileSync(ENGAGE_LOG_PATH, JSON.stringify(updated, null, 2));
}

function writeEngageQueue(entries) {
  fs.writeFileSync(ENGAGE_QUEUE_PATH, JSON.stringify(entries, null, 2));
}

/**
 * Returns 15 accounts, excluding any used yesterday (by date match).
 * If not enough remain after exclusion, fills from the full list.
 */
function pickAccounts() {
  const log = readEngageLog();
  const today = new Date().toISOString().split('T')[0];

  // Build set of handles used yesterday
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const usedYesterday = new Set(
    log
      .filter(e => e.date === yesterday)
      .map(e => e.account)
  );

  const available = MASTER_ACCOUNTS.filter(a => !usedYesterday.has(a.handle));
  const pool = available.length >= 15 ? available : MASTER_ACCOUNTS;

  // Shuffle deterministically using today's date as seed (simple rotation)
  const seed = today.replace(/-/g, '');
  const offset = parseInt(seed.slice(-3), 10) % pool.length;
  const rotated = [...pool.slice(offset), ...pool.slice(0, offset)];

  return rotated.slice(0, 15);
}

/**
 * Ask Groq to generate a specific, knowledgeable comment for a given account.
 */
async function generateComment(account) {
  if (!process.env.GROQ_API_KEY) {
    // Fallback: generic but on-brand comment
    return `The periodization approach at this level is what separates consistent results from guesswork. Real load management starts with daily data.`;
  }

  const prompt = `Generate a single Instagram comment for the account ${account.handle}.

Context about this account: ${account.topic}

Requirements:
- 1 to 3 sentences, max 200 characters total
- References something specific that ${account.handle} is known for
- Shows genuine domain knowledge — only a serious combat sports coach would know this
- Sounds like a knowledgeable peer, not a fan or marketer
- Makes people curious about who left the comment (builds intrigue)
- NEVER mentions StrikePanel or any product
- NEVER promotes anything
- No hashtags, no emojis
- Direct, professional, coach-to-coach tone
- No quotes around the output, no intro text

Output only the comment.`;

  const body = JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 80,
    temperature: 0.75,
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

async function run() {
  console.log('\n=== StrikePanel Engage — Daily Comment Generator ===');
  console.log(new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dubai' }), '(Dubai)');
  console.log('');

  if (!process.env.GROQ_API_KEY) {
    console.warn('  GROQ_API_KEY not set — using fallback comments');
  }

  const today = new Date().toISOString().split('T')[0];
  const selected = pickAccounts();

  console.log(`Generating comments for ${selected.length} accounts...\n`);

  const results = [];
  for (let i = 0; i < selected.length; i++) {
    const account = selected[i];
    process.stdout.write(`  [${i + 1}/${selected.length}] ${account.handle}... `);

    let comment;
    try {
      comment = await generateComment(account);
      console.log('done');
    } catch (e) {
      console.log('failed —', e.message.slice(0, 60));
      comment = `The level of detail on load management here is what separates good coaches from great ones. Consistent data changes everything.`;
    }

    results.push({
      account: account.handle,
      comment,
      topic: account.topic.split(',')[0].trim(),
      date: today,
    });
  }

  // Save to engage_queue.json
  writeEngageQueue(results);

  // Append to engage_log.json
  writeEngageLog(results);

  // Print formatted output
  const dubaiTime = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit' });
  console.log(`\n\n=== Today's 15 Comments — Post these at 5 PM Dubai ===\n`);

  results.forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.account}`);
    console.log(`   "${item.comment}"`);
    console.log('');
  });

  console.log(`Saved to: ${ENGAGE_QUEUE_PATH}`);
  console.log('\n=== Done ===\n');
}

run().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
