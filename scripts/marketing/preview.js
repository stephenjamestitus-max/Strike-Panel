#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const path = require('path');
const { generateCarousel } = require('./carousel-generator');

async function main() {
  const date = new Date().toISOString().split('T')[0];
  const bgImage = path.join(__dirname, '../../marketing/boxing.jpg');

  console.log('\n=== Preview: Pain post (blackcard with image) ===');
  await generateCarousel([
    { type: 'blackcard', line: 'HE PEAKED ON WEDNESDAY.\nSATURDAY NEVER CAME.', sub: 'His readiness was 31 on Monday. You ran him anyway.' },
    { type: 'solution', headline: 'ONE SCORE.', headlineCyan: 'DIFFERENT DAYS.', points: [
      'Readiness score per athlete every morning. Push Reyes. Protect Marcus.',
      'No more same session for everyone. No more guessing who is already broken.',
      'Fight camp, weight cuts, AI sessions — one place, ninety-nine dollars.',
    ]},
    { type: 'cta', headline: 'ONE PAYMENT.', headlineCyan: 'NO SUBSCRIPTION.', body: 'Readiness scoring, fight camps, weight cuts, AI sessions. Up to 20 athletes. You own it forever.' },
  ], `preview-pain-${date}`, bgImage);

  console.log('\n=== Preview: Identity post (diagonal world-tear) ===');
  await generateCarousel([
    { type: 'splitscreen',
      chaos: 'WhatsApp group sent at 7am. Same session for twelve athletes. Whiteboard rubbed out three times. A gut feeling dressed up as a plan.',
      clarity: 'Eight scores before 8am. Reyes at 91 — pushed hard. Marcus at 34 — protected. Session written in four minutes. No apologies on Saturday.',
      label: 'SAME COACH. DIFFERENT SYSTEM.' },
    { type: 'solution', headline: 'STOP GUESSING.', headlineCyan: 'START COACHING.', points: [
      'Every athlete scored every morning before the session starts.',
      'Different bodies, different loads — the system shows you who needs protecting.',
      'The coaches protecting careers are the ones who had the number first.',
    ]},
    { type: 'cta', headline: 'ONE PAYMENT.', headlineCyan: 'NO SUBSCRIPTION.', body: 'Readiness scoring, fight camps, weight cuts, AI sessions. Up to 20 athletes. You own it forever.' },
  ], `preview-identity-${date}`);

  console.log('\n=== Preview: Dark blackcard (no image — zine style) ===');
  await generateCarousel([
    { type: 'blackcard', line: '12 ATHLETES.\nONE SESSION.\nTHREE WERE EMPTY.', sub: 'You will never know which three.' },
    { type: 'solution', headline: 'ONE SCORE.', headlineCyan: 'DIFFERENT DAYS.', points: [
      'Readiness score per athlete every morning. Push Reyes. Protect Marcus.',
      'No more same session for everyone. No more guessing who is already broken.',
      'Fight camp, weight cuts, AI sessions — one place, ninety-nine dollars.',
    ]},
    { type: 'cta', headline: 'ONE PAYMENT.', headlineCyan: 'NO SUBSCRIPTION.', body: 'Readiness scoring, fight camps, weight cuts, AI sessions. Up to 20 athletes. You own it forever.' },
  ], `preview-zine-${date}`);

  console.log('\nDone.');
}

main().catch(e => { console.error(e.message); process.exit(1); });
