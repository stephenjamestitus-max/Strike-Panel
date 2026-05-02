const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const handler = require('serve-handler');

const OUT = path.join(__dirname, 'marketing');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

const PORT = 4999;
const BASE = `http://localhost:${PORT}`;
const APP_URL = `${BASE}/index.html?demo=1`;
const LANDING_URL = `${BASE}/landing.html`;
const CHECKIN_URL = `${BASE}/index.html?checkin=1`;

async function startServer() {
  const server = http.createServer((req, res) => handler(req, res, { public: __dirname }));
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Local server on ${BASE}`);
  return server;
}

(async () => {
  const server = await startServer();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
           '--font-render-hinting=none', '--disable-lcd-text'],
    defaultViewport: null
  });

  async function shot(page, file, opts = {}) {
    await page.screenshot({ path: path.join(OUT, file), type: 'png', ...opts });
    console.log('✓', file);
  }

  async function waitReady(page, extra = 2800) {
    await page.waitForSelector('body', { timeout: 15000 });
    await new Promise(r => setTimeout(r, extra));
  }

  async function dismissModals(page) {
    await page.evaluate(() => {
      document.querySelectorAll('.modal-bg.active, #licenseGate, #pwaBanner, #demoOnboard')
        .forEach(el => el.remove());
      document.body.style.overflow = 'auto';
    });
  }

  // ── 1. GUMROAD COVER  1200×630 — landing hero ─────────────
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
    await page.goto(LANDING_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitReady(page);
    await page.evaluate(() => {
      document.querySelector('.urgency-bar')?.remove();
      document.querySelector('nav')?.remove();
      window.scrollTo(0, 0);
    });
    await new Promise(r => setTimeout(r, 400));
    await shot(page, 'gumroad-cover-1200x630.png', { clip: { x: 0, y: 0, width: 1200, height: 630 } });
    await page.close();
  }

  // ── 2. MORNING BRIEF — phone screenshot  390×844 ──────────
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await page.goto(APP_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitReady(page, 1500);
    await dismissModals(page);
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.tab');
      tabs.forEach(t => { if (t.dataset.tab === 'brief') t.click(); });
    });
    await new Promise(r => setTimeout(r, 800));
    await shot(page, 'phone-morning-brief.png');
    await page.close();
  }

  // ── 3. FIGHT DATES — phone screenshot ────────────────────
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await page.goto(APP_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitReady(page, 1500);
    await dismissModals(page);
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.tab');
      tabs.forEach(t => { if (t.dataset.tab === 'fightdates') t.click(); });
    });
    await new Promise(r => setTimeout(r, 800));
    await shot(page, 'phone-fight-dates.png');
    await page.close();
  }

  // ── 4. TIMER — phone screenshot ───────────────────────────
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await page.goto(APP_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitReady(page, 1500);
    await dismissModals(page);
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.tab');
      tabs.forEach(t => { if (t.dataset.tab === 'timer') t.click(); });
    });
    await new Promise(r => setTimeout(r, 800));
    await shot(page, 'phone-timer.png');
    await page.close();
  }

  // ── 5. DASHBOARD — phone screenshot ──────────────────────
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await page.goto(APP_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitReady(page, 1500);
    await dismissModals(page);
    await new Promise(r => setTimeout(r, 800));
    await shot(page, 'phone-dashboard.png');
    await page.close();
  }

  // ── 6. ATHLETE CHECK-IN — phone screenshot ───────────────
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await page.goto(CHECKIN_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitReady(page, 1500);
    await shot(page, 'phone-athlete-checkin.png');
    await page.close();
  }

  // ── 7. LANDING — full desktop 1440×900 ───────────────────
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto(LANDING_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitReady(page);
    await shot(page, 'landing-desktop-full.png', { fullPage: true });
    await page.close();
  }

  // ── 8. INSTAGRAM SQUARE — Morning Brief ──────────────────
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
    await page.goto(APP_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitReady(page, 1500);
    await dismissModals(page);
    await page.evaluate(() => {
      document.body.style.overflow = 'hidden';
      const tabs = document.querySelectorAll('.tab');
      tabs.forEach(t => { if (t.dataset.tab === 'brief') t.click(); });
    });
    await new Promise(r => setTimeout(r, 800));
    await shot(page, 'instagram-square-1080x1080.png', { clip: { x: 0, y: 0, width: 1080, height: 1080 } });
    await page.close();
  }

  await browser.close();
  server.close();
  console.log('\nAll screenshots done → marketing/');
})();
