const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '../../marketing/carousels');

const B = {
  bg:     '#04070f',
  text:   '#f5f0e8',
  cyan:   '#00D4F0',
  amber:  '#C8892A',
  muted:  'rgba(122,133,160,0.55)',
  green:  '#4ade80',
  red:    '#f87171',
};

function findChrome() {
  const base = '/root/.cache/puppeteer/chrome';
  if (!fs.existsSync(base)) return null;
  const versions = fs.readdirSync(base).sort().reverse();
  for (const v of versions) {
    const p = path.join(base, v, 'chrome-linux64', 'chrome');
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// Encode local image file as base64 data URL for reliable Puppeteer loading
function imageToDataUrl(imgPath) {
  if (!imgPath || !fs.existsSync(imgPath)) return null;
  const ext  = path.extname(imgPath).replace('.', '') || 'jpeg';
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  const b64  = fs.readFileSync(imgPath).toString('base64');
  return `data:${mime};base64,${b64}`;
}

// ── Shell — flat dark background for content-heavy slides ─────────

function shell(inner, slideNum, total) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1080px;overflow:hidden;background:${B.bg}}
#canvas{
  position:relative;width:1080px;height:1080px;
  display:flex;flex-direction:column;
  background:${B.bg};font-family:'DM Mono',monospace;
  overflow:hidden
}
.blob{position:absolute;border-radius:50%;filter:blur(160px);pointer-events:none}
.blob-cyan{width:800px;height:800px;top:-200px;left:-200px;background:rgba(0,212,240,.07)}
.blob-amber{width:600px;height:600px;bottom:100px;right:-200px;background:rgba(200,137,42,.06)}
.blob-purple{width:700px;height:700px;bottom:-250px;left:-100px;background:rgba(139,92,246,.07)}
#dotgrid{position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(circle,rgba(0,212,240,.04) 1.2px,transparent 1.2px);
  background-size:44px 44px}
#grain{position:absolute;inset:-50%;width:200%;height:200%;pointer-events:none;opacity:.025}
#content{position:relative;z-index:10;flex:1;display:flex;flex-direction:column;
  padding:56px 64px 52px}
#topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:48px}
#logo{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:3px;color:${B.text}}
#logo span{color:${B.cyan}}
#counter{font-size:10px;letter-spacing:2px;color:${B.muted};text-transform:uppercase}
.tagline{position:absolute;bottom:22px;left:64px;font-size:10px;letter-spacing:2px;
  text-transform:uppercase;color:rgba(122,133,160,.35);z-index:20}
.progress{position:absolute;bottom:0;left:0;height:2px;
  background:linear-gradient(to right,transparent,${B.cyan},transparent);
  width:${Math.round((slideNum/total)*100)}%;opacity:.4}
</style>
</head>
<body>
<div id="canvas">
  <svg id="grain" xmlns="http://www.w3.org/2000/svg">
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)"/>
  </svg>
  <div id="dotgrid"></div>
  <div class="blob blob-cyan"></div>
  <div class="blob blob-amber"></div>
  <div class="blob blob-purple"></div>
  <div id="content">
    <div id="topbar">
      <div id="logo">STRIKE<span>PANEL</span></div>
      <div id="counter">${slideNum} / ${total}</div>
    </div>
    ${inner}
  </div>
  <div class="tagline">strikepanel.uk</div>
  <div class="progress"></div>
</div>
</body>
</html>`;
}

// ── Image shell — cinematic full-bleed for visual slides ──────────
// Used by blackcard (slide 1) and scenario slides.

function imageShell(inner, slideNum, total, dataUrl) {
  const bgCSS = dataUrl
    ? `background-image:url('${dataUrl}');background-size:cover;background-position:center`
    : `background:${B.bg}`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1080px;overflow:hidden;background:${B.bg}}
#canvas{
  position:relative;width:1080px;height:1080px;overflow:hidden;
  font-family:'DM Mono',monospace;
  ${bgCSS}
}
/* darken + cool colour grade on the photo */
#img-grade{
  position:absolute;inset:0;
  background:rgba(4,7,30,.22);
  mix-blend-mode:multiply;z-index:1
}
/* vignette overlay — dark edges, lighter centre */
#vignette{
  position:absolute;inset:0;
  background:radial-gradient(ellipse at center, transparent 30%, rgba(4,7,15,.65) 100%);
  z-index:2
}
/* bottom gradient so text reads cleanly */
#bottom-fade{
  position:absolute;inset:0;
  background:linear-gradient(to bottom, rgba(4,7,15,.05) 0%, rgba(4,7,15,.20) 45%, rgba(4,7,15,.82) 78%, rgba(4,7,15,.97) 100%);
  z-index:3
}
#grain{position:absolute;inset:-50%;width:200%;height:200%;pointer-events:none;opacity:.035;z-index:4}
#content{position:absolute;inset:0;z-index:10;display:flex;flex-direction:column;padding:48px 64px 44px}
#topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:auto}
#logo{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:3px;color:rgba(245,240,232,.9)}
#logo span{color:${B.cyan}}
#counter{font-size:10px;letter-spacing:2px;color:rgba(122,133,160,.6);text-transform:uppercase}
.tagline{position:absolute;bottom:22px;left:64px;font-size:10px;letter-spacing:2px;
  text-transform:uppercase;color:rgba(122,133,160,.4);z-index:20}
.progress{position:absolute;bottom:0;left:0;height:2px;
  background:linear-gradient(to right,transparent,${B.cyan},transparent);
  width:${Math.round((slideNum/total)*100)}%;opacity:.5;z-index:20}
</style>
</head>
<body>
<div id="canvas">
  <div id="img-grade"></div>
  <div id="vignette"></div>
  <div id="bottom-fade"></div>
  <svg id="grain" xmlns="http://www.w3.org/2000/svg">
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)"/>
  </svg>
  <div id="content">
    <div id="topbar">
      <div id="logo">STRIKE<span>PANEL</span></div>
      <div id="counter">${slideNum} / ${total}</div>
    </div>
    ${inner}
  </div>
  <div class="tagline">strikepanel.uk</div>
  <div class="progress"></div>
</div>
</body>
</html>`;
}

// ── Slide templates ───────────────────────────────────────────────

function coverSlide(s, i, total, bgImg) {
  return shell(`
    <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end">
      <div style="font-size:13px;letter-spacing:4px;text-transform:uppercase;color:${B.cyan};margin-bottom:16px">${s.eyebrow||''}</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:${s.titleSize||88}px;line-height:1;color:${B.text};margin-bottom:20px">${s.title}</div>
      <div style="font-size:15px;line-height:1.6;color:${B.muted};max-width:640px">${s.sub||''}</div>
    </div>`, i, total);
}

// Slide 1 for Pain/Education/Proof/Identity posts — uses full-bleed image
function blackcardSlide(s, i, total, bgImg) {
  const dataUrl = imageToDataUrl(bgImg);
  const lines = (s.line || '').split('\n');
  const maxLen = Math.max(...lines.map(l => l.length));
  const fontSize = s.fontSize || (maxLen <= 14 ? 98 : maxLen <= 20 ? 84 : 72);

  const inner = `
    <div style="display:flex;flex-direction:column;justify-content:flex-end;flex:1;gap:20px;padding-bottom:8px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:${fontSize}px;line-height:1.0;letter-spacing:2px;color:${B.text};text-shadow:0 4px 32px rgba(0,0,0,.7)">
        ${lines.map(l => `<div>${l}</div>`).join('')}
      </div>
      ${s.sub ? `<div style="font-size:13px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(245,240,232,.55);text-shadow:0 2px 12px rgba(0,0,0,.8)">${s.sub}</div>` : ''}
      <div style="width:80px;height:2px;background:${B.cyan};opacity:.8"></div>
    </div>`;

  return dataUrl ? imageShell(inner, i, total, dataUrl) : shell(`
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:28px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:${fontSize}px;line-height:1.0;letter-spacing:2px;color:${B.text}">
        ${lines.map(l => `<div>${l}</div>`).join('')}
      </div>
      ${s.sub ? `<div style="font-size:14px;letter-spacing:2px;text-transform:uppercase;color:${B.muted}">${s.sub}</div>` : ''}
      <div style="width:120px;height:1px;background:linear-gradient(to right,transparent,${B.cyan},transparent);opacity:.5"></div>
    </div>`, i, total);
}

function widgetSlide(s, i, total, bgImg) {
  const athletes = s.athletes || [];
  return shell(`
    <div style="flex:1;display:flex;flex-direction:column;gap:16px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:2px;color:${B.text};margin-bottom:4px">${s.headline||'MORNING BRIEF'} <span style="color:${B.cyan}">${s.headlineAmber||''}</span></div>
      <div style="display:flex;flex-direction:column;gap:12px;flex:1">
        ${athletes.map(a => {
          const score = a.score || 0;
          const col   = score >= 80 ? B.green : score >= 50 ? B.amber : B.red;
          const label = score >= 80 ? 'PUSH' : score >= 50 ? 'MONITOR' : 'PROTECT';
          return `<div style="display:flex;align-items:center;gap:20px;padding:18px 24px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:4px">
            <div style="font-family:'Bebas Neue',sans-serif;font-size:42px;color:${col};min-width:72px;text-align:right">${score}</div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:600;color:${B.text};letter-spacing:1px">${a.name}</div>
              <div style="font-size:10px;color:${B.muted};letter-spacing:1px;text-transform:uppercase;margin-top:3px">${a.note||''}</div>
            </div>
            <div style="font-size:10px;letter-spacing:2px;font-weight:600;color:${col}">${label}</div>
          </div>`;
        }).join('')}
      </div>
      ${s.caption ? `<div style="font-size:12px;color:${B.muted};letter-spacing:1px;padding-top:8px">${s.caption}</div>` : ''}
    </div>`, i, total);
}

function statSlide(s, i, total, bgImg) {
  return shell(`
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:32px">
      <div style="display:flex;gap:40px;flex-wrap:wrap">
        ${(s.stats||[]).map(st => `
          <div style="display:flex;flex-direction:column;gap:8px">
            <div style="font-family:'Bebas Neue',sans-serif;font-size:80px;line-height:1;color:${B.cyan}">${st.value}</div>
            <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${B.muted}">${st.label}</div>
          </div>`).join('')}
      </div>
      ${s.body ? `<div style="font-size:15px;line-height:1.7;color:${B.muted};max-width:680px">${s.body}</div>` : ''}
    </div>`, i, total);
}

function listSlide(s, i, total, bgImg) {
  return shell(`
    <div style="flex:1;display:flex;flex-direction:column;gap:20px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:42px;letter-spacing:2px;color:${B.text};line-height:1.1">${s.title||''}</div>
      <div style="display:flex;flex-direction:column;gap:14px;flex:1;justify-content:center">
        ${(s.items||[]).map((item,idx) => `
          <div style="display:flex;gap:20px;align-items:flex-start;padding:16px 20px;background:rgba(255,255,255,.025);border-left:2px solid ${B.cyan};">
            <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:${B.cyan};min-width:28px;line-height:1.3">${idx+1}</div>
            <div style="font-size:14px;line-height:1.5;color:${B.text}">${item}</div>
          </div>`).join('')}
      </div>
    </div>`, i, total);
}

function quoteSlide(s, i, total, bgImg) {
  return shell(`
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:32px">
      <div style="width:48px;height:3px;background:${B.cyan}"></div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:${s.fontSize||52}px;line-height:1.2;color:${B.text}">${s.quote||''}</div>
      ${s.attr ? `<div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:${B.muted}">${s.attr}</div>` : ''}
    </div>`, i, total);
}

function splitscreenSlide(s, i, total, bgImg) {
  return shell(`
    <div style="flex:1;display:flex;flex-direction:column;gap:12px;justify-content:center">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:3px;color:${B.muted};margin-bottom:4px">${s.label||''}</div>
      <div style="display:flex;gap:16px;flex:1;max-height:700px">
        <div style="flex:1;padding:24px 20px;background:rgba(248,113,113,.05);border:1px solid rgba(248,113,113,.18);display:flex;flex-direction:column;gap:14px;border-radius:2px">
          <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${B.red};margin-bottom:4px">WITHOUT</div>
          <div style="font-size:15px;line-height:1.6;color:rgba(245,240,232,.65)">${s.chaos||''}</div>
        </div>
        <div style="flex:1;padding:24px 20px;background:rgba(0,212,240,.04);border:1px solid rgba(0,212,240,.15);display:flex;flex-direction:column;gap:14px;border-radius:2px">
          <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${B.cyan};margin-bottom:4px">WITH STRIKEPANEL</div>
          <div style="font-size:15px;line-height:1.6;color:${B.text}">${s.clarity||''}</div>
        </div>
      </div>
    </div>`, i, total);
}

// Scenario slide — cinematic full-bleed image (story pillar)
function scenarioSlide(s, i, total, bgImg) {
  const dataUrl = imageToDataUrl(bgImg || s.bgImage);

  const inner = `
    <div style="display:flex;flex-direction:column;justify-content:flex-end;flex:1;gap:18px;padding-bottom:8px">
      <div style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${B.amber};text-shadow:0 2px 12px rgba(0,0,0,.8)">${s.kicker||'FIGHT CAMP'}</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:${s.fontSize||72}px;line-height:1.0;color:${B.text};text-shadow:0 4px 32px rgba(0,0,0,.7)">
        ${(s.truth||'').split('\n').map(l=>`<div>${l}</div>`).join('')}
      </div>
      <div style="width:64px;height:2px;background:${B.amber};opacity:.8"></div>
      <div style="font-size:13px;line-height:1.7;color:rgba(245,240,232,.65);max-width:800px;text-shadow:0 2px 8px rgba(0,0,0,.9)">${s.scene||''}</div>
    </div>`;

  return dataUrl ? imageShell(inner, i, total, dataUrl) : shell(`
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:24px">
      <div style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${B.amber}">${s.kicker||'SCENARIO'}</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:${s.fontSize||60}px;line-height:1.1;color:${B.text}">
        ${(s.truth||'').split('\n').map(l=>`<div>${l}</div>`).join('')}
      </div>
      <div style="width:80px;height:2px;background:linear-gradient(to right,${B.amber},transparent)"></div>
      <div style="font-size:15px;line-height:1.7;color:${B.muted};max-width:720px">${s.scene||''}</div>
    </div>`, i, total);
}

function solutionSlide(s, i, total, bgImg) {
  return shell(`
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:28px">
      <div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:52px;line-height:1;color:${B.text}">${s.headline||''}</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:52px;line-height:1;color:${B.cyan}">${s.headlineCyan||s.subheadline||''}</div>
      </div>
      <div style="width:80px;height:2px;background:linear-gradient(to right,${B.cyan},transparent);margin:4px 0"></div>
      <div style="display:flex;flex-direction:column;gap:18px">
        ${(s.points||[]).map(p => `
          <div style="display:flex;gap:18px;align-items:flex-start">
            <div style="width:8px;height:8px;border-radius:50%;background:${B.cyan};margin-top:6px;flex-shrink:0"></div>
            <div style="font-size:15px;line-height:1.6;color:${B.text}">${p}</div>
          </div>`).join('')}
      </div>
    </div>`, i, total);
}

function ctaSlide(s, i, total, bgImg) {
  return shell(`
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:32px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:72px;line-height:1;color:${B.text}">${s.headline||'ONE DECISION.'}</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:72px;line-height:1;color:${B.cyan};margin-top:-24px">${s.headlineCyan||''}</div>
      <div style="font-size:15px;line-height:1.7;color:${B.muted};max-width:600px">${s.body||'$99. One-time. No subscription.'}</div>
      <div style="padding:20px 40px;border:1px solid rgba(0,212,240,.3);background:rgba(0,212,240,.05)">
        <span style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:${B.cyan}">strikepanel.uk</span>
      </div>
    </div>`, i, total);
}

const TEMPLATES = {
  cover: coverSlide, widget: widgetSlide, stat: statSlide, list: listSlide,
  quote: quoteSlide, cta: ctaSlide, blackcard: blackcardSlide,
  splitscreen: splitscreenSlide, scenario: scenarioSlide, solution: solutionSlide,
};

async function generateCarousel(slides, prefix, bgImage) {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const chrome = findChrome();
  const launchOpts = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  };
  if (chrome) launchOpts.executablePath = chrome;

  const browser = await puppeteer.launch(launchOpts);
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

  const slug  = prefix ? `${prefix}-` : '';
  const paths = [];
  const total = slides.length;

  for (let idx = 0; idx < slides.length; idx++) {
    const s  = slides[idx];
    const fn = TEMPLATES[s.type] || listSlide;
    // Pass bgImage only to slides that can use it (blackcard = slide 1, scenario)
    const slideImg = (s.type === 'blackcard' || s.type === 'scenario') ? bgImage : null;
    const html = fn(s, idx + 1, total, slideImg);

    const outFile = path.join(OUT_DIR, `${slug}slide-${idx + 1}.png`);
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() =>
      page.setContent(html, { waitUntil: 'domcontentloaded' })
    );
    await page.screenshot({ path: outFile, type: 'png' });
    paths.push(outFile);
    console.log(`  Slide ${idx + 1}/${total} → ${path.basename(outFile)}`);
  }

  await browser.close();
  return paths;
}

module.exports = { generateCarousel };
