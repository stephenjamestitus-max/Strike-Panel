const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const jobs = [
  { svg: 'og.svg',      png: 'og.png' },
  { svg: 'og-blog.svg', png: 'og-blog.png' },
  { svg: 'og-demo.svg', png: 'og-demo.png' },
];

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

  for (const { svg, png } of jobs) {
    const svgPath = path.join(ROOT, svg);
    const pngPath = path.join(ROOT, png);
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>*{margin:0;padding:0;overflow:hidden}body{width:1200px;height:630px;background:#070910}</style></head><body>${svgContent}</body></html>`;
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.screenshot({ path: pngPath, type: 'png', clip: { x:0, y:0, width:1200, height:630 } });
    console.log(`✓ ${png}`);
  }

  await browser.close();
  console.log('All OG images generated.');
})();
