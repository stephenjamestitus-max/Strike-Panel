#!/usr/bin/env node
/**
 * strikepane Follow — Daily Account Identification
 * Run: node scripts/marketing/run-follow.js
 *
 * Identifies 5 combat sports coaching accounts to follow today.
 * Rotates through the master list and tracks followed accounts in
 * follow_log.json so it never repeats.
 *
 * Output: printed list for manual following + saved to follow_log.json.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const fs = require('fs');
const path = require('path');

const FOLLOW_LOG_PATH = path.join(__dirname, 'follow_log.json');
const FOLLOW_TXT_PATH = path.join(__dirname, 'follow_today.txt');

// Master list — US/UK coaching-focused accounts, 5k+ followers
const MASTER_LIST = [
  { handle: '@phil_daru_strength',        description: 'Strength & conditioning for fighters, 200k+ US, active poster' },
  { handle: '@jasonparillo',              description: 'Elite boxing and striking coach, pro corner work, US' },
  { handle: '@roufusport',               description: 'Kickboxing and MMA coaching, Roufusport gym, US' },
  { handle: '@gbteambjj',               description: 'BJJ competition coaching, Gracie Barra team, US' },
  { handle: '@coachnickmurphy',          description: 'Boxing technical coaching, athlete development, US' },
  { handle: '@fightiqcoaching',          description: 'Fight IQ development, tactical MMA coaching, US' },
  { handle: '@precisionstriking',        description: 'Striking precision coaching, technical content, US' },
  { handle: '@boxingscience_',           description: 'Evidence-based boxing science, applied sports science, UK' },
  { handle: '@mnbjj',                   description: 'BJJ competition coaching and team management, US' },
  { handle: '@firas_zahabi',            description: 'Scientific MMA training, Tristar gym head coach, US' },
  { handle: '@freddieroach',            description: 'Elite boxing coaching, Hall of Fame trainer, US' },
  { handle: '@boxing_science',          description: 'Sports science for boxing, UK-based, research-led' },
  { handle: '@scientificboxing',        description: 'Scientific boxing technique and training methodology, UK' },
  { handle: '@dingesonboxing',          description: 'UK boxing coaching, technical analysis and breakdowns' },
  { handle: '@thaiboxingassociation',   description: 'Muay Thai coaching standards and development, UK' },
  { handle: '@ufcpi',                   description: 'UFC Performance Institute, elite fighter science, UK/US' },
  { handle: '@mark_henry_mma',          description: 'Elite MMA striking coach, technical development, US' },
  { handle: '@expertboxing',            description: 'Online boxing coaching, fundamentals and technique, US' },
  { handle: '@combatstrengthcoaching',  description: 'Combat sports strength and conditioning, US' },
  { handle: '@coachfariasboxing',       description: 'Boxing skill development and coaching methodology, US' },
  { handle: '@striking_science',        description: 'Sports science applied to combat striking, UK' },
  { handle: '@thegravedigger_',         description: 'Combat sports coaching, fight team management, US' },
  { handle: '@boxingcoachusa',          description: 'US boxing coaching community, technique focus' },
  { handle: '@strengthboxing',          description: 'Strength training for boxers, US-based coach' },
  { handle: '@bjjstrengthandconditioning', description: 'BJJ-specific S&C programming, US' },
  { handle: '@mmastrengthcoach',        description: 'MMA strength coach, fight camp programming, US' },
  { handle: '@muaythaicoach',           description: 'Muay Thai coaching, technique and conditioning, US' },
  { handle: '@kickboxingcoach',         description: 'Kickboxing coaching and athlete development, US' },
  { handle: '@wrestlingstrengthcoach',  description: 'Wrestling-specific strength and conditioning, US' },
  { handle: '@sanda_coach',            description: 'Sanda/Chinese kickboxing coaching, technique focus' },
  { handle: '@combatsportsnutrition',   description: 'Nutrition coaching for combat athletes, UK/US' },
  { handle: '@fightcampcoach',          description: 'Fight camp management and coaching methodology' },
  { handle: '@eliteboxingcoach',        description: 'Elite boxing coaching, pro and amateur levels, UK' },
  { handle: '@ukboxingcoaches',         description: 'UK boxing coaching community, development focus' },
  { handle: '@britishboxingcouncil',    description: 'British boxing governing body, coach development, UK' },
  { handle: '@boxingscotland',          description: 'Scottish boxing federation, coaching and athlete dev, UK' },
  { handle: '@walesboxing',            description: 'Welsh boxing federation, coaching programmes, UK' },
  { handle: '@irishboxing',            description: 'Irish boxing coaching and athlete development, UK/Ireland' },
  { handle: '@englandboxing',          description: 'England Boxing national governing body, UK' },
  { handle: '@ababoxing',              description: 'Amateur Boxing Association, coaching development, UK' },
  { handle: '@usamuaythai',            description: 'USA Muay Thai national federation, coach network, US' },
  { handle: '@usaboxing',              description: 'USA Boxing national federation, coaching programmes, US' },
  { handle: '@usbjj',                  description: 'US BJJ community, competition coaching focus' },
  { handle: '@adccsubmission',         description: 'ADCC submission wrestling, elite grappling coaching' },
  { handle: '@grappling_industries',   description: 'Grappling competition circuit, coaching community' },
];

function readFollowLog() {
  if (!fs.existsSync(FOLLOW_LOG_PATH)) return [];
  try { return JSON.parse(fs.readFileSync(FOLLOW_LOG_PATH, 'utf8')); } catch { return []; }
}

function writeFollowLog(entries) {
  const existing = readFollowLog();
  const updated = [...existing, ...entries];
  fs.writeFileSync(FOLLOW_LOG_PATH, JSON.stringify(updated, null, 2));
}

/**
 * Picks 5 accounts that have not yet been followed.
 * Uses FIFO order through the master list so it's predictable and exhaustive.
 */
function pickAccounts() {
  const log = readFollowLog();
  const alreadyFollowed = new Set(log.map(e => e.handle));

  const remaining = MASTER_LIST.filter(a => !alreadyFollowed.has(a.handle));

  if (remaining.length === 0) {
    console.log('  All accounts in master list have been followed.');
    console.log('  Add more accounts to the master list to continue.');
    return [];
  }

  return remaining.slice(0, 5);
}

async function run() {
  console.log('\n=== strikepane Follow — Daily Account Targets ===');
  console.log(new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dubai' }), '(Dubai)');
  console.log('');

  const today = new Date().toISOString().split('T')[0];
  const selected = pickAccounts();

  if (selected.length === 0) {
    return;
  }

  // Save to follow_log.json
  const logEntries = selected.map(a => ({
    handle: a.handle,
    description: a.description,
    date: today,
    status: 'queued',
  }));
  writeFollowLog(logEntries);

  // Print formatted output
  console.log(`=== Follow These ${selected.length} Accounts Today ===\n`);
  selected.forEach((account, idx) => {
    console.log(`${idx + 1}. ${account.handle} — ${account.description}`);
  });

  // Save plain txt for easy mobile reading
  const dubaiDate = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Dubai', weekday: 'long', day: 'numeric', month: 'long' });
  const txtLines = [
    `STRIKEPANEL — FOLLOW LIST`,
    `${dubaiDate}`,
    ``,
    ...selected.map((a, i) => `${i + 1}. ${a.handle}\n   ${a.description}`),
    ``,
    `Search each handle on Instagram and hit Follow.`,
  ];
  fs.writeFileSync(FOLLOW_TXT_PATH, txtLines.join('\n'));
  console.log(`Saved plain text: ${FOLLOW_TXT_PATH}`);

  const total = readFollowLog().length;
  const remaining = MASTER_LIST.length - total;
  console.log(`Total followed: ${total} / ${MASTER_LIST.length} (${remaining} remaining in list)`);

  console.log('\n=== Done ===\n');
}

run().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
