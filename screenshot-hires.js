const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const handler = require('serve-handler');

const SP_MEDIA = path.join(__dirname, 'sp-media');
const PORT = 4999;
const BASE = `http://localhost:${PORT}`;
const APP_URL = `${BASE}/index.html?demo=1`;

async function startServer() {
  const server = http.createServer((req, res) => handler(req, res, { public: __dirname }));
  await new Promise(resolve => server.listen(PORT, resolve));
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

  async function waitReady(page, extra = 2000) {
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

  async function shot(page, file, opts = {}) {
    await page.screenshot({ path: path.join(SP_MEDIA, file), type: 'png', ...opts });
    console.log('✓', file);
  }

  // Phone screenshots at 3x DPR — native ~390px wide but 3x pixels = 1170px actual
  const phoneVP = { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

  // Morning Brief
  {
    const page = await browser.newPage();
    await page.setViewport(phoneVP);
    await page.goto(APP_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitReady(page);
    await dismissModals(page);
    await page.evaluate(() => {
      document.querySelectorAll('.tab').forEach(t => { if (t.dataset.tab === 'brief') t.click(); });
    });
    await new Promise(r => setTimeout(r, 800));
    await shot(page, 'phone-morning-brief-3x.png');
    await page.close();
  }

  // Fight Dates
  {
    const page = await browser.newPage();
    await page.setViewport(phoneVP);
    await page.goto(APP_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitReady(page);
    await dismissModals(page);
    await page.evaluate(() => {
      document.querySelectorAll('.tab').forEach(t => { if (t.dataset.tab === 'fightdates') t.click(); });
    });
    await new Promise(r => setTimeout(r, 800));
    await shot(page, 'phone-fight-dates-3x.png');
    await page.close();
  }

  // Timer
  {
    const page = await browser.newPage();
    await page.setViewport(phoneVP);
    await page.goto(APP_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitReady(page);
    await dismissModals(page);
    await page.evaluate(() => {
      document.querySelectorAll('.tab').forEach(t => { if (t.dataset.tab === 'timer') t.click(); });
    });
    await new Promise(r => setTimeout(r, 800));
    await shot(page, 'phone-timer-3x.png');
    await page.close();
  }

  // Dashboard (default)
  {
    const page = await browser.newPage();
    await page.setViewport(phoneVP);
    await page.goto(APP_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await waitReady(page);
    await dismissModals(page);
    await new Promise(r => setTimeout(r, 800));
    await shot(page, 'phone-dashboard-3x.png');
    await page.close();
  }

  await browser.close();
  server.close();
  console.log('\nPhone screenshots saved to sp-media/');
})();
