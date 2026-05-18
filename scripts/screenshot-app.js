const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const OUT  = path.join(ROOT, 'marketing', 'ph-screenshots');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const DEMO = 'file://' + path.join(ROOT, 'demo.html');

const shots = [
  // [description, url, waitForSelector, extraSetup, filename]
  { name: 'morning-brief',  tab: 'brief',     label: 'Morning Brief — readiness scores' },
  { name: 'fight-dates',    tab: 'fightdates',label: 'Fight Camp — countdown & weight cut' },
  { name: 'athletes',       tab: 'athletes',  label: 'Members — athlete roster' },
  { name: 'workouts',       tab: 'workouts',  label: 'Sessions — training log' },
  { name: 'dashboard',      tab: 'dashboard', label: 'Dashboard — overview' },
];

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox','--disable-setuid-sandbox','--force-device-scale-factor=2'],
    defaultViewport: { width: 1270, height: 760, deviceScaleFactor: 2 }
  });
  const page = await browser.newPage();

  for (const shot of shots) {
    console.log(`Capturing: ${shot.name}...`);
    await page.goto(DEMO + '?tab=' + shot.tab, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));

    // Hide any modals, demo bars that might obstruct
    await page.evaluate(() => {
      const selectors = ['.modal-bg', '#demoBar', '.checkin-page', '.onboard-modal'];
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.style.display = 'none');
      });
      // Scroll to top
      window.scrollTo(0, 0);
    });

    await new Promise(r => setTimeout(r, 400));

    const outPath = path.join(OUT, `ph-${shot.name}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`✓ ph-${shot.name}.png`);
  }

  await browser.close();
  console.log('\nAll screenshots saved to marketing/ph-screenshots/');
})();
