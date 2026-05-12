// scripts/screenshot-posts.js — screenshots all 30 Instagram post HTML files at 1080x1080
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const MARKETING = path.join(__dirname, '..', 'marketing');

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1080, height: 1080 });

  const files = fs.readdirSync(MARKETING)
    .filter(f => f.match(/^instagram-post-\d+\.html$/))
    .sort((a, b) => {
      const n = f => parseInt(f.match(/\d+/)[0]);
      return n(a) - n(b);
    });

  console.log(`Found ${files.length} HTML files. Taking screenshots...\n`);

  for (const file of files) {
    const htmlPath = path.join(MARKETING, file);
    const pngName = file.replace('.html', '.png');
    const pngPath = path.join(MARKETING, pngName);

    const url = 'file:///' + htmlPath.replace(/\\/g, '/');
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for Google Fonts and bar animations
    await page.waitForTimeout(1400);

    await page.screenshot({ path: pngPath, clip: { x: 0, y: 0, width: 1080, height: 1080 } });
    console.log(`✓ ${pngName}`);
  }

  await browser.close();
  console.log(`\n✅ Done — ${files.length} PNGs saved to marketing/`);
}

run().catch(err => {
  console.error('Screenshot failed:', err);
  process.exit(1);
});
