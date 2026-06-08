#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { generateCarousel } = require('./carousel-generator');
const { getBackgroundPhoto } = require('./media-fetcher');

async function main() {
  const date = new Date().toISOString().split('T')[0];

  console.log('\n=== Sample Post — Pillar 1 (Pain) with background image ===');
  const bgImage = require("path").join(__dirname, "../../marketing/boxing.jpg");
  console.log('Background:', bgImage ? require('path').basename(bgImage) : 'none');

  const slides = [
    { type: 'blackcard',
      line: 'HE PEAKED ON WEDNESDAY.\nSATURDAY NEVER CAME.',
      sub: 'His readiness was 31 on Monday. You ran him anyway.' },
    { type: 'solution',
      headline: 'ONE SCORE.',
      headlineCyan: 'DIFFERENT DAYS.',
      points: [
        'Readiness score per athlete every morning. Push Reyes. Protect Marcus.',
        'No more same session for everyone. No more guessing who is already broken.',
        'Fight camp, weight cuts, and AI sessions — one place, ninety-nine dollars.',
      ] },
    { type: 'cta',
      stat: '$99',
      headline: 'ONE PAYMENT.',
      headlineCyan: 'NO SUBSCRIPTION.',
      body: 'Readiness scoring, fight camps, weight cuts, AI sessions. Up to 20 athletes. You own it forever.' },
  ];
  const paths = await generateCarousel(slides, `preview-post-${date}`, bgImage);
  console.log('Saved:', paths);
  return paths;
}

main().catch(e => { console.error(e.message); process.exit(1); });
