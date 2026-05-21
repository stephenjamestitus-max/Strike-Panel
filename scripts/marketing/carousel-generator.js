const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '../../marketing/carousels');

// ── Brand tokens (matches existing instagram-post-*.html exactly) ──
const B = {
  bg:     '#04070f',
  cyan:   '#00D4F0',
  amber:  '#c8892a',
  purple: '#8b5cf6',
  green:  '#10b981',
  red:    '#ef4444',
  text:   '#f5f0e8',
  muted:  '#7a85a0',
  widget: 'rgba(10,18,34,0.88)',
};

// ── Shared CSS injected into every slide ──
const BASE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1080px;overflow:hidden;background:${B.bg};font-family:'DM Mono',monospace}
#canvas{position:relative;width:1080px;height:1080px;display:flex;align-items:center;justify-content:center;overflow:hidden}

/* Dot grid */
#dotgrid{position:absolute;inset:0;z-index:1;pointer-events:none;
  background-image:radial-gradient(circle,rgba(0,212,240,.04) 1.2px,transparent 1.2px);
  background-size:44px 44px}

/* Ambient blobs */
.blob{position:absolute;border-radius:50%;filter:blur(120px);pointer-events:none;z-index:0}
.blob-cyan{width:700px;height:700px;top:-220px;left:-220px;background:rgba(0,212,240,.07)}
.blob-amber{width:500px;height:500px;top:300px;right:-180px;background:rgba(200,137,42,.065)}
.blob-purple{width:550px;height:550px;bottom:-200px;left:50px;background:rgba(139,92,246,.07)}

/* Corner brackets */
.corner{position:absolute;width:28px;height:28px;z-index:10;opacity:.22}
.corner-tl{top:32px;left:32px;border-top:1.5px solid ${B.cyan};border-left:1.5px solid ${B.cyan}}
.corner-tr{top:32px;right:32px;border-top:1.5px solid ${B.cyan};border-right:1.5px solid ${B.cyan}}
.corner-bl{bottom:32px;left:32px;border-bottom:1.5px solid ${B.cyan};border-left:1.5px solid ${B.cyan}}
.corner-br{bottom:32px;right:32px;border-bottom:1.5px solid ${B.cyan};border-right:1.5px solid ${B.cyan}}

/* Grain */
#grain{position:absolute;inset:-50%;width:200%;height:200%;z-index:100;pointer-events:none;opacity:.035}

/* Divider */
.divider{width:100%;height:1px;background:linear-gradient(to right,transparent,rgba(0,212,240,.2),rgba(200,137,42,.15),transparent)}

/* Kicker pill */
.kicker{display:inline-flex;align-items:center;gap:9px;background:rgba(0,212,240,.07);
  border:1px solid rgba(0,212,240,.22);border-radius:100px;padding:9px 22px;
  font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:${B.cyan}}
.kdot{width:7px;height:7px;border-radius:50%;background:${B.cyan};flex-shrink:0}

/* Bebas headlines */
.bb{font-family:'Bebas Neue',sans-serif;letter-spacing:2px}

/* Logo bottom-right */
.logo-wrap{position:absolute;bottom:36px;right:44px;z-index:20;display:flex;align-items:center;gap:10px}
.logo-text{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:3px;color:${B.text}}
.logo-text span{color:${B.cyan}}
.logo-tm{font-size:8px;color:rgba(0,212,240,.6);vertical-align:super;letter-spacing:.5px;font-family:'DM Mono',monospace}

/* Slide counter top-right */
.counter{position:absolute;top:38px;right:44px;z-index:20;font-size:11px;letter-spacing:2px;color:${B.muted}}

/* Tagline bottom-left */
.tagline{position:absolute;bottom:40px;left:44px;z-index:20;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(122,133,160,.4)}

/* Glass widget */
.widget{width:100%;background:${B.widget};border:1px solid rgba(0,212,240,.2);border-radius:20px;
  padding:28px 32px;
  box-shadow:0 0 0 1px rgba(0,212,240,.05),0 0 60px rgba(0,212,240,.12),0 0 120px rgba(0,212,240,.05),0 32px 80px rgba(0,0,0,.7);
  backdrop-filter:blur(16px)}
.w-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.06)}
.w-title{font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:${B.muted}}
.live{display:flex;align-items:center;gap:6px;font-size:10px;letter-spacing:1.5px;color:${B.green}}
.ldot{width:6px;height:6px;border-radius:50%;background:${B.green}}

/* Athlete row */
.ath{margin-bottom:16px}.ath:last-of-type{margin-bottom:0}
.ath-row{display:flex;align-items:center;gap:10px;margin-bottom:6px}
.ath-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.ath-name{font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(245,240,232,.6);flex:1}
.ath-score{font-family:'Bebas Neue',sans-serif;font-size:34px;line-height:1;flex-shrink:0;letter-spacing:1px}
.ath-denom{font-size:10px;color:rgba(245,240,232,.28);margin-right:8px;align-self:flex-end;padding-bottom:3px}
.badge{font-size:9px;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;border-radius:5px;white-space:nowrap}
.bg-green{background:rgba(16,185,129,.12);color:${B.green};border:1px solid rgba(16,185,129,.22)}
.bg-cyan{background:rgba(0,212,240,.10);color:${B.cyan};border:1px solid rgba(0,212,240,.22)}
.bg-red{background:rgba(239,68,68,.10);color:${B.red};border:1px solid rgba(239,68,68,.22)}
.bg-amber{background:rgba(200,137,42,.10);color:${B.amber};border:1px solid rgba(200,137,42,.22)}
.ath-track{height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}
.ath-bar{height:100%;border-radius:3px}
.bar-g{background:linear-gradient(to right,${B.green},#34d399)}
.bar-c{background:linear-gradient(to right,${B.cyan},#67e8f9)}
.bar-r{background:linear-gradient(to right,${B.red},#f87171)}
.bar-a{background:linear-gradient(to right,${B.amber},#f59e0b)}
`;

const CHROME = '/root/.cache/puppeteer/chrome/linux-147.0.7727.57/chrome-linux64/chrome';

function grainSVG() {
  return `<svg id="grain" xmlns="http://www.w3.org/2000/svg">
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)"/>
  </svg>`;
}

function shell(inner, counter, total) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>${BASE_CSS}</style></head><body>
  <div id="canvas">
    ${grainSVG()}
    <div id="dotgrid"></div>
    <div class="blob blob-cyan"></div>
    <div class="blob blob-amber"></div>
    <div class="blob blob-purple"></div>
    <div class="corner corner-tl"></div><div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div><div class="corner corner-br"></div>
    <div class="counter">${counter} / ${total}</div>
    <div class="tagline">strikepanel.com</div>
    <div class="logo-wrap">
      <span class="logo-text">STRIKE<span>PANEL</span><sup class="logo-tm">™</sup></span>
    </div>
    ${inner}
  </div></body></html>`;
}

// ── Slide templates ───────────────────────────────────────────────

function coverSlide(s, i, total) {
  const { headline, headlineCyan, sub, kicker = 'STRIKEPANEL™ · COACHING INTEL' } = s;
  return shell(`
    <div style="position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;gap:24px;width:800px;text-align:center">
      <div class="kicker"><span class="kdot"></span>${kicker}</div>
      <div class="divider"></div>
      <div style="line-height:.88;margin-top:8px">
        <span class="bb" style="font-size:108px;color:${B.text};display:block">${headline}</span>
        ${headlineCyan ? `<span class="bb" style="font-size:108px;color:${B.cyan};display:block;text-shadow:0 0 60px rgba(0,212,240,.45)">${headlineCyan}</span>` : ''}
      </div>
      ${sub ? `<p style="font-size:16px;color:${B.muted};letter-spacing:.5px;max-width:600px;line-height:1.6;margin-top:8px">${sub}</p>` : ''}
    </div>`, i + 1, total);
}

function widgetSlide(s, i, total) {
  const { headline, headlineAmber, athletes = [] } = s;
  const rows = athletes.map(a => {
    const barClass = a.score >= 75 ? 'bar-g' : a.score >= 50 ? 'bar-c' : a.score >= 30 ? 'bar-a' : 'bar-r';
    const dotColor = a.score >= 75 ? B.green : a.score >= 50 ? B.cyan : a.score >= 30 ? B.amber : B.red;
    const badgeClass = a.score >= 75 ? 'bg-green' : a.score >= 50 ? 'bg-cyan' : a.score >= 30 ? 'bg-amber' : 'bg-red';
    const badgeText = a.score >= 75 ? 'PUSH' : a.score >= 50 ? 'MODERATE' : a.score >= 30 ? 'LIGHT DAY' : 'REST';
    return `<div class="ath">
      <div class="ath-row">
        <div class="ath-dot" style="background:${dotColor}"></div>
        <div class="ath-name">${a.name}</div>
        <div class="ath-score" style="color:${dotColor}">${a.score}</div>
        <div class="ath-denom">/100</div>
        <div class="badge ${badgeClass}">${badgeText}</div>
      </div>
      <div class="ath-track"><div class="ath-bar ${barClass}" style="width:${a.score}%"></div></div>
    </div>`;
  }).join('');

  return shell(`
    <div style="position:relative;z-index:10;width:860px;display:flex;flex-direction:column;gap:28px">
      <div class="widget">
        <div class="w-head">
          <span class="w-title">MORNING BRIEF · TODAY</span>
          <span class="live"><span class="ldot"></span>LIVE</span>
        </div>
        ${rows}
      </div>
      <div style="line-height:.88">
        <span class="bb" style="font-size:76px;color:${B.text}">${headline}</span>
        ${headlineAmber ? `<br><span class="bb" style="font-size:76px;color:${B.amber};text-shadow:0 0 40px rgba(200,137,42,.5)">${headlineAmber}</span>` : ''}
      </div>
    </div>`, i + 1, total);
}

function statSlide(s, i, total) {
  const { stat, statColor = B.cyan, statLabel, body, kicker } = s;
  const glow = statColor === B.cyan
    ? 'rgba(0,212,240,.35)' : statColor === B.amber
    ? 'rgba(200,137,42,.45)' : 'rgba(139,92,246,.35)';
  return shell(`
    <div style="position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;gap:20px;width:860px;text-align:center">
      ${kicker ? `<div class="kicker"><span class="kdot"></span>${kicker}</div>` : ''}
      <div class="bb" style="font-size:200px;line-height:1;color:${statColor};text-shadow:0 0 80px ${glow},0 0 160px ${glow};letter-spacing:-4px">${stat}</div>
      <div class="bb" style="font-size:44px;color:${B.text};letter-spacing:2px">${statLabel}</div>
      ${body ? `<div class="divider" style="margin:8px 0"></div><p style="font-size:22px;color:${B.muted};line-height:1.6;max-width:700px">${body}</p>` : ''}
    </div>`, i + 1, total);
}

function listSlide(s, i, total) {
  const { headline, headlineCyan, items = [], kicker } = s;
  const listItems = items.map((item, idx) => `
    <div style="display:flex;align-items:flex-start;gap:16px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.05)">
      <span class="bb" style="font-size:28px;color:rgba(0,212,240,.25);min-width:36px">${String(idx+1).padStart(2,'0')}</span>
      <span style="font-size:17px;color:${B.muted};line-height:1.5;padding-top:4px">${item}</span>
    </div>`).join('');

  return shell(`
    <div style="position:relative;z-index:10;width:860px;display:flex;flex-direction:column;gap:24px">
      ${kicker ? `<div class="kicker"><span class="kdot"></span>${kicker}</div>` : ''}
      <div style="line-height:.9">
        <span class="bb" style="font-size:72px;color:${B.text}">${headline}</span>
        ${headlineCyan ? `<br><span class="bb" style="font-size:72px;color:${B.cyan};text-shadow:0 0 50px rgba(0,212,240,.4)">${headlineCyan}</span>` : ''}
      </div>
      <div style="margin-top:4px">${listItems}</div>
    </div>`, i + 1, total);
}

function quoteSlide(s, i, total) {
  const { quote, attribution } = s;
  return shell(`
    <div style="position:relative;z-index:10;width:820px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:32px">
      <div class="bb" style="font-size:28px;color:rgba(0,212,240,.25);letter-spacing:6px">"</div>
      <div style="font-size:30px;color:${B.text};line-height:1.55;letter-spacing:.3px">${quote}</div>
      <div class="divider"></div>
      ${attribution ? `<div style="font-size:13px;letter-spacing:2.5px;text-transform:uppercase;color:${B.muted}">${attribution}</div>` : ''}
    </div>`, i + 1, total);
}

function ctaSlide(s, i, total) {
  const { headline = 'ONE PAYMENT.', headlineCyan = 'NO SUBSCRIPTION.', stat = '$99', body } = s;
  return shell(`
    <div style="position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;gap:28px;width:820px;text-align:center">
      <div class="bb" style="font-size:48px;color:${B.amber};letter-spacing:3px;text-shadow:0 0 60px rgba(200,137,42,.5)">${stat}</div>
      <div style="line-height:.88">
        <span class="bb" style="font-size:96px;color:${B.text}">${headline}</span><br>
        <span class="bb" style="font-size:96px;color:${B.cyan};text-shadow:0 0 60px rgba(0,212,240,.4)">${headlineCyan}</span>
      </div>
      <div class="divider"></div>
      ${body ? `<p style="font-size:20px;color:${B.muted};line-height:1.6;max-width:660px">${body}</p>` : ''}
      <div style="background:rgba(0,212,240,.08);border:1px solid rgba(0,212,240,.25);border-radius:12px;padding:14px 40px">
        <span style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:${B.cyan}">LINK IN BIO → strikepanel.com</span>
      </div>
    </div>`, i + 1, total);
}

// ── Renderer ──────────────────────────────────────────────────────

const TEMPLATES = { cover: coverSlide, widget: widgetSlide, stat: statSlide, list: listSlide, quote: quoteSlide, cta: ctaSlide };

async function generateCarousel(slides, outputName) {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const launchOpts = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  };
  if (fs.existsSync(CHROME)) launchOpts.executablePath = CHROME;

  const browser = await puppeteer.launch(launchOpts);
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

  const paths = [];
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const type = slide.type || 'list';
    const fn = TEMPLATES[type] || listSlide;
    const html = fn(slide, i, slides.length);
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() =>
      page.setContent(html, { waitUntil: 'domcontentloaded' })
    );
    const file = path.join(OUT_DIR, `${outputName}-${String(i + 1).padStart(2, '0')}.png`);
    await page.screenshot({ path: file, type: 'png' });
    paths.push(file);
    console.log(`  Slide ${i + 1}/${slides.length} → ${path.basename(file)}`);
  }

  await browser.close();
  return paths;
}

module.exports = { generateCarousel };

// ── Example: run directly to preview ──────────────────────────────
if (require.main === module) {
  const example = [
    {
      type: 'cover',
      kicker: 'STRIKEPANEL™ · READINESS',
      headline: 'STOP GUESSING',
      headlineCyan: 'WHO\'S READY.',
      sub: 'Every morning. One number per athlete. Coach to the data.',
    },
    {
      type: 'widget',
      athletes: [
        { name: 'REYES', score: 91 },
        { name: 'LAKE',  score: 74 },
        { name: 'MARCUS', score: 38 },
      ],
      headline: 'YOUR ATHLETES.',
      headlineAmber: 'SCORED. EVERY MORNING.',
    },
    {
      type: 'stat',
      stat: '80%',
      statColor: '#c8892a',
      statLabel: 'OF OVERTRAINING INJURIES ARE PREVENTABLE',
      body: 'If you know the readiness score before the session starts.',
    },
    {
      type: 'list',
      kicker: 'WHAT YOU GET',
      headline: 'ONE DASHBOARD.',
      headlineCyan: 'FULL CONTROL.',
      items: [
        'Morning Brief — readiness score for every athlete, every day',
        'Fight Camp countdown with athlete load monitoring',
        'Weight cut tracker from contract signing to weigh-in',
        'AI session builder that adapts to today\'s readiness data',
      ],
    },
    {
      type: 'quote',
      quote: 'I\'m basically guessing who\'s ready every single day. That\'s not coaching — that\'s gambling.',
      attribution: 'HOW COACHES DESCRIBED IT BEFORE STRIKEPANEL',
    },
    {
      type: 'cta',
      stat: '$99',
      headline: 'ONE PAYMENT.',
      headlineCyan: 'NO SUBSCRIPTION.',
      body: 'Readiness scoring for up to 20 athletes. Fight camps. Weight cuts. AI sessions. You own it.',
    },
  ];

  generateCarousel(example, 'preview')
    .then(paths => {
      console.log(`\nGenerated ${paths.length} slides → marketing/carousels/`);
    })
    .catch(console.error);
}
