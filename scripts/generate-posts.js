// scripts/generate-posts.js — generates all 30 Instagram post HTML files
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'marketing');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// ── Shared HTML pieces ────────────────────────────────────────────────────────

const BG = `
  <svg id="grain" xmlns="http://www.w3.org/2000/svg">
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)"/>
  </svg>
  <div id="dotgrid"></div>
  <div class="blob blob-cyan"></div><div class="blob blob-amber"></div><div class="blob blob-purple"></div>
  <div class="corner corner-tl"></div><div class="corner corner-tr"></div>
  <div class="corner corner-bl"></div><div class="corner corner-br"></div>`;

const LOGO_SVG = `<svg class="logo-svg" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="14" cy="14" r="12.5" stroke="#00D4F0" stroke-width="1.5"/>
          <circle cx="14" cy="14" r="3.5" fill="#00D4F0" opacity=".9"/>
          <line x1="14" y1="1.5" x2="14" y2="8" stroke="#00D4F0" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="14" y1="20" x2="14" y2="26.5" stroke="#00D4F0" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="1.5" y1="14" x2="8" y2="14" stroke="#00D4F0" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="20" y1="14" x2="26.5" y2="14" stroke="#00D4F0" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`;

function bottomRow(tagline = 'Training Intelligence for Combat Sports') {
  return `<div class="bottom-row">
      <div class="tagline-small">${tagline}</div>
      <div class="logo-wrap">${LOGO_SVG}<div class="logo-text">Strike<span>Panel</span><span class="logo-tm">™</span></div></div>
    </div>`;
}

function kickerHTML(parts) {
  const inner = parts.map((p, i) => i > 0 ? `<span class="ksep">·</span><span>${p}</span>` : `<span>${p}</span>`).join('');
  return `<div class="kicker"><div class="kdot"></div><div class="ktext">${inner}</div></div>`;
}

const DIVIDER = `<div class="divider"></div>`;

// ── Base CSS (shared by all templates) ────────────────────────────────────────

const BASE_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1080px;overflow:hidden;background:#04070f;font-family:'DM Mono',monospace}
#canvas{position:relative;width:1080px;height:1080px;display:flex;align-items:center;justify-content:center;overflow:hidden}
#grain{position:absolute;inset:-50%;width:200%;height:200%;z-index:100;pointer-events:none;opacity:.035;animation:grain .8s steps(1) infinite}
@keyframes grain{0%,100%{transform:translate(0,0)}10%{transform:translate(-2%,-3%)}20%{transform:translate(3%,2%)}30%{transform:translate(-3%,4%)}40%{transform:translate(2%,-2%)}50%{transform:translate(-4%,3%)}60%{transform:translate(3%,-4%)}70%{transform:translate(-2%,2%)}80%{transform:translate(4%,-3%)}90%{transform:translate(-3%,4%)}}
#dotgrid{position:absolute;inset:0;z-index:1;pointer-events:none;background-image:radial-gradient(circle,rgba(0,212,240,.038) 1.2px,transparent 1.2px);background-size:44px 44px}
.blob{position:absolute;border-radius:50%;filter:blur(120px);pointer-events:none;z-index:0}
.blob-cyan{width:700px;height:700px;top:-220px;left:-220px;background:rgba(0,212,240,.07)}
.blob-amber{width:500px;height:500px;top:300px;right:-180px;background:rgba(200,137,42,.065)}
.blob-purple{width:550px;height:550px;bottom:-200px;left:50px;background:rgba(139,92,246,.07)}
.corner{position:absolute;width:28px;height:28px;z-index:10;opacity:.22}
.corner-tl{top:32px;left:32px;border-top:1.5px solid #00D4F0;border-left:1.5px solid #00D4F0}
.corner-tr{top:32px;right:32px;border-top:1.5px solid #00D4F0;border-right:1.5px solid #00D4F0}
.corner-bl{bottom:32px;left:32px;border-bottom:1.5px solid #00D4F0;border-left:1.5px solid #00D4F0}
.corner-br{bottom:32px;right:32px;border-bottom:1.5px solid #00D4F0;border-right:1.5px solid #00D4F0}
#inner{position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;gap:26px;width:760px}
.kicker{display:inline-flex;align-items:center;gap:9px;background:rgba(0,212,240,.07);border:1px solid rgba(0,212,240,.22);border-radius:100px;padding:9px 22px;font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:#00D4F0}
.kdot{width:7px;height:7px;border-radius:50%;background:#00D4F0;flex-shrink:0;animation:pdot 2s ease-in-out infinite}
@keyframes pdot{0%,100%{box-shadow:0 0 0 0 rgba(0,212,240,.8)}50%{box-shadow:0 0 0 7px rgba(0,212,240,0)}}
.ktext{display:flex;align-items:center;gap:12px}
.ksep{opacity:.35;font-size:10px}
.divider{width:100%;height:1px;background:linear-gradient(to right,transparent,rgba(0,212,240,.2),rgba(200,137,42,.15),transparent)}
.bottom-row{width:100%;display:flex;align-items:center;justify-content:space-between;padding:0 2px}
.tagline-small{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(122,133,160,.5)}
.logo-wrap{display:flex;align-items:center;gap:10px}
.logo-svg{width:32px;height:32px;flex-shrink:0}
.logo-text{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:3px;text-transform:uppercase;color:#f5f0e8}
.logo-text span{color:#00D4F0}
.logo-tm{font-family:'DM Mono',monospace;font-size:9px;color:rgba(0,212,240,.6);vertical-align:super;letter-spacing:.5px}`;

function wrap(day, extraCSS, innerContent, script = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1080">
<title>strikepanel™ — Instagram Post ${day}</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
${BASE_CSS}
${extraCSS}
</style>
</head>
<body>
<div id="canvas">
  ${BG}
  <div id="inner">
    ${innerContent}
  </div>
</div>
${script ? `<script>\n${script}\n</script>` : ''}
</body>
</html>`;
}

// ── Template: Widget (Morning Brief) ─────────────────────────────────────────

const WIDGET_CSS = `
.widget{width:100%;background:rgba(10,18,34,.82);border:1px solid rgba(0,212,240,.22);border-radius:20px;padding:30px 34px;box-shadow:0 0 0 1px rgba(0,212,240,.05),0 0 60px rgba(0,212,240,.13),0 0 120px rgba(0,212,240,.06),0 32px 80px rgba(0,0,0,.75);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
.w-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,.06)}
.w-title{font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#7a85a0}
.wlive{display:flex;align-items:center;gap:6px;font-size:10px;letter-spacing:1.5px;color:#10b981}
.ldot{width:6px;height:6px;border-radius:50%;background:#10b981;animation:gdot 1.5s infinite}
@keyframes gdot{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.8)}50%{box-shadow:0 0 0 6px rgba(16,185,129,0)}}
.ath{margin-bottom:18px}.ath:last-of-type{margin-bottom:0}
.ath-row{display:flex;align-items:center;gap:10px;margin-bottom:7px}
.ath-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.ath-name{font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(245,240,232,.6);flex:1}
.ath-score{font-family:'Bebas Neue',sans-serif;font-size:36px;line-height:1;flex-shrink:0;margin-right:2px;letter-spacing:1px}
.ath-denom{font-size:10px;color:rgba(245,240,232,.28);margin-right:8px;align-self:flex-end;padding-bottom:4px;letter-spacing:.5px}
.badge{font-size:9px;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;border-radius:5px;white-space:nowrap;flex-shrink:0;font-weight:500}
.bg-green{background:rgba(16,185,129,.12);color:#10b981;border:1px solid rgba(16,185,129,.22)}
.bg-cyan{background:rgba(0,212,240,.1);color:#00D4F0;border:1px solid rgba(0,212,240,.22)}
.bg-red{background:rgba(239,68,68,.1);color:#ef4444;border:1px solid rgba(239,68,68,.22)}
.bg-amber{background:rgba(200,137,42,.1);color:#c8892a;border:1px solid rgba(200,137,42,.22)}
.ath-track{height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}
.ath-bar{height:100%;border-radius:3px;width:0;transition:width 1.2s cubic-bezier(.25,1,.5,1)}
.bar-g{background:linear-gradient(to right,#10b981,#34d399)}
.bar-c{background:linear-gradient(to right,#00D4F0,#67e8f9)}
.bar-r{background:linear-gradient(to right,#ef4444,#f87171)}
.bar-a{background:linear-gradient(to right,#c8892a,#f59e0b)}
.w-foot{display:flex;align-items:center;justify-content:space-between;margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,.06)}
.wavg{font-size:11px;color:#7a85a0;letter-spacing:.8px}
.wavg em{font-style:normal;color:#f5f0e8}
.headline{text-align:center;line-height:.9}
.hl-white{font-family:'Bebas Neue',sans-serif;font-size:88px;letter-spacing:3px;color:#fff;display:block}
.hl-amber{font-family:'Bebas Neue',sans-serif;font-size:88px;letter-spacing:3px;color:#c8892a;display:block;text-shadow:0 0 60px rgba(200,137,42,.55),0 0 120px rgba(200,137,42,.2)}
.hl-cyan{font-family:'Bebas Neue',sans-serif;font-size:88px;letter-spacing:3px;color:#00D4F0;display:block;text-shadow:0 0 60px rgba(0,212,240,.4)}`;

function athRow(a, idx) {
  const badgeClass = a.color === '#10b981' ? 'bg-green' : a.color === '#00D4F0' ? 'bg-cyan' : a.color === '#ef4444' ? 'bg-red' : 'bg-amber';
  const barClass = a.color === '#10b981' ? 'bar-g' : a.color === '#00D4F0' ? 'bar-c' : a.color === '#ef4444' ? 'bar-r' : 'bar-a';
  return `<div class="ath">
        <div class="ath-row">
          <div class="ath-dot" style="background:${a.color}"></div>
          <div class="ath-name">${a.name}</div>
          <div class="ath-score" style="color:${a.color}">${a.score}</div>
          <div class="ath-denom">/100</div>
          <div class="badge ${badgeClass}">${a.badge}</div>
        </div>
        <div class="ath-track"><div class="ath-bar ${barClass}" id="b${idx}"></div></div>
      </div>`;
}

function widgetPost(day, d) {
  const athletes = d.athletes;
  const rows = athletes.map((a, i) => athRow(a, i + 1)).join('\n');
  const avg = Math.round(athletes.reduce((s, a) => s + a.score, 0) / athletes.length);
  const barScript = athletes.map((a, i) => `document.getElementById('b${i+1}').style.width='${a.score}%';`).join('\n  ');
  const hl1Class = (d.headlineColors && d.headlineColors[0] === 'amber') ? 'hl-amber' : (d.headlineColors && d.headlineColors[0] === 'cyan') ? 'hl-cyan' : 'hl-white';
  const hl2Class = (d.headlineColors && d.headlineColors[1] === 'white') ? 'hl-white' : (d.headlineColors && d.headlineColors[1] === 'cyan') ? 'hl-cyan' : 'hl-amber';

  const inner = `
    ${kickerHTML(d.kicker || ['strikepanel™', 'Morning Brief', 'SYS.LIVE'])}
    <div class="widget">
      <div class="w-head">
        <div class="w-title">${d.widgetTitle || 'Morning Brief · Today'}</div>
        <div class="wlive"><div class="ldot"></div>LIVE</div>
      </div>
      ${rows}
      <div class="w-foot">
        <div class="wavg">Squad Avg: <em>${avg}</em> · Morning Brief</div>
        <div class="wlive"><div class="ldot"></div>SYS.LIVE</div>
      </div>
    </div>
    ${DIVIDER}
    <div class="headline">
      <span class="${hl1Class}">${d.headline[0]}</span>
      <span class="${hl2Class}">${d.headline[1]}</span>
    </div>
    ${bottomRow()}`;

  const script = `window.addEventListener('load',function(){setTimeout(function(){\n  ${barScript}\n},200)});`;
  return wrap(day, WIDGET_CSS, inner, script);
}

// ── Template: Score Drop Widget (Day 17) ──────────────────────────────────────

const SCOREDROP_CSS = `
${WIDGET_CSS}
.drop-card{width:100%;background:rgba(10,18,34,.82);border:1px solid rgba(239,68,68,.25);border-radius:20px;padding:30px 34px;box-shadow:0 0 60px rgba(239,68,68,.1),0 32px 80px rgba(0,0,0,.75);backdrop-filter:blur(16px)}
.drop-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,.06)}
.drop-athlete{display:flex;align-items:center;gap:16px;margin-bottom:20px}
.drop-name{font-size:13px;letter-spacing:3px;text-transform:uppercase;color:rgba(245,240,232,.5)}
.drop-scores{display:flex;align-items:center;gap:20px;flex:1;justify-content:flex-end}
.drop-score-block{text-align:center}
.drop-label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(122,133,160,.6);margin-bottom:4px}
.drop-num{font-family:'Bebas Neue',sans-serif;font-size:64px;line-height:1;letter-spacing:2px}
.drop-arrow{font-size:36px;color:#ef4444;align-self:center;padding-top:14px;opacity:.7}
.drop-delta{display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 0;border-top:1px solid rgba(255,255,255,.05)}
.drop-delta-num{font-family:'Bebas Neue',sans-serif;font-size:28px;color:#ef4444;letter-spacing:1px}
.drop-delta-text{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(239,68,68,.6)}`;

function scoreDropPost(day, d) {
  const inner = `
    ${kickerHTML(['strikepanel™', 'Morning Brief', 'SYS.LIVE'])}
    <div class="drop-card">
      <div class="drop-head">
        <div class="w-title">Morning Brief · Today</div>
        <div class="wlive"><div class="ldot"></div>LIVE</div>
      </div>
      <div class="drop-athlete">
        <div class="ath-dot" style="background:#ef4444;width:10px;height:10px;border-radius:50%"></div>
        <div class="drop-name">${d.name}</div>
        <div class="drop-scores">
          <div class="drop-score-block">
            <div class="drop-label">Yesterday</div>
            <div class="drop-num" style="color:rgba(245,240,232,.35)">${d.yesterday}</div>
          </div>
          <div class="drop-arrow">→</div>
          <div class="drop-score-block">
            <div class="drop-label">Today</div>
            <div class="drop-num" style="color:#ef4444">${d.today}</div>
          </div>
        </div>
      </div>
      <div class="ath-track" style="margin-bottom:16px"><div class="ath-bar bar-r" id="bd"></div></div>
      <div class="drop-delta">
        <div class="drop-delta-num">↓ ${d.yesterday - d.today} pts</div>
        <div class="drop-delta-text">dropped overnight · investigate before training</div>
      </div>
    </div>
    ${DIVIDER}
    <div class="headline">
      <span class="hl-white">${d.headline[0]}</span>
      <span class="hl-amber">${d.headline[1]}</span>
    </div>
    ${bottomRow()}`;

  const script = `window.addEventListener('load',function(){setTimeout(function(){document.getElementById('bd').style.width='${d.today}%';},200)});`;
  return wrap(day, SCOREDROP_CSS, inner, script);
}

// ── Template: Statement (pain points) ────────────────────────────────────────

const STATEMENT_CSS = `
.st-headline{text-align:center}
.st-line{font-family:'Bebas Neue',sans-serif;font-size:96px;letter-spacing:2px;line-height:.88;display:block;color:#fff}
.st-line-amber{font-family:'Bebas Neue',sans-serif;font-size:96px;letter-spacing:2px;line-height:.88;display:block;color:#c8892a;text-shadow:0 0 80px rgba(200,137,42,.5)}
.st-line-red{font-family:'Bebas Neue',sans-serif;font-size:96px;letter-spacing:2px;line-height:.88;display:block;color:#ef4444;text-shadow:0 0 80px rgba(239,68,68,.4)}
.st-line-sm{font-family:'Bebas Neue',sans-serif;font-size:72px;letter-spacing:2px;line-height:.88;display:block;color:#fff}
.st-sub{text-align:center;max-width:620px}
.st-sub p{font-size:16px;line-height:1.7;color:rgba(245,240,232,.45);letter-spacing:.3px;margin-bottom:4px}
.st-sub p:last-child{margin-bottom:0}
.st-cta{display:inline-flex;align-items:center;gap:10px;background:rgba(0,212,240,.08);border:1px solid rgba(0,212,240,.25);border-radius:100px;padding:12px 28px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#00D4F0}`;

function statementPost(day, d) {
  const lines = d.headlineLines.map((l, i) => {
    const cls = d.lineColors ? (d.lineColors[i] === 'amber' ? 'st-line-amber' : d.lineColors[i] === 'red' ? 'st-line-red' : d.lineColors[i] === 'sm' ? 'st-line-sm' : 'st-line') : 'st-line';
    return `<span class="${cls}">${l}</span>`;
  }).join('\n      ');

  const subHTML = d.subLines ? `<div class="st-sub">${d.subLines.map(l => `<p>${l}</p>`).join('\n      ')}</div>` : '';
  const ctaHTML = d.cta ? `<div class="st-cta">${d.cta}</div>` : '';

  const inner = `
    ${kickerHTML(d.kicker || ['strikepanel™', 'Reality Check', 'SYS.LIVE'])}
    <div class="st-headline">
      ${lines}
    </div>
    ${subHTML}
    ${ctaHTML ? ctaHTML + '\n    ' : ''}${DIVIDER}
    ${bottomRow()}`;

  return wrap(day, STATEMENT_CSS, inner);
}

// ── Template: Tip / Education ─────────────────────────────────────────────────

const TIP_CSS = `
.tip-headline{text-align:center;line-height:.88}
.tip-hl{font-family:'Bebas Neue',sans-serif;font-size:76px;letter-spacing:2px;color:#fff;display:block}
.tip-hl-amber{font-family:'Bebas Neue',sans-serif;font-size:76px;letter-spacing:2px;color:#c8892a;display:block;text-shadow:0 0 60px rgba(200,137,42,.5)}
.tip-card{width:100%;background:rgba(10,18,34,.82);border:1px solid rgba(0,212,240,.14);border-radius:20px;padding:28px 32px;box-shadow:0 0 60px rgba(0,212,240,.08),0 24px 60px rgba(0,0,0,.7);backdrop-filter:blur(12px)}
.tip-item{display:flex;align-items:flex-start;gap:18px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.tip-item:last-child{border-bottom:none;padding-bottom:0}
.tip-item:first-child{padding-top:0}
.tip-num{font-family:'Bebas Neue',sans-serif;font-size:28px;line-height:1;color:#c8892a;flex-shrink:0;width:28px;text-align:center;opacity:.9}
.tip-body{flex:1}
.tip-title{font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#f5f0e8;margin-bottom:3px}
.tip-text{font-size:13px;line-height:1.6;color:rgba(245,240,232,.45);letter-spacing:.2px}`;

function tipPost(day, d) {
  const hl1 = d.headlineColors && d.headlineColors[0] === 'amber' ? 'tip-hl-amber' : 'tip-hl';
  const hl2 = d.headlineColors && d.headlineColors[1] === 'amber' ? 'tip-hl-amber' : 'tip-hl';

  const tips = d.tips.map(t => `<div class="tip-item">
          <div class="tip-num">${t.num}</div>
          <div class="tip-body">
            <div class="tip-title">${t.title}</div>
            <div class="tip-text">${t.text}</div>
          </div>
        </div>`).join('\n        ');

  const inner = `
    ${kickerHTML(d.kicker || ['strikepanel™', 'Coach Intel', 'SYS.LIVE'])}
    <div class="tip-headline">
      <span class="${hl1}">${d.headline[0]}</span>
      <span class="${hl2}">${d.headline[1]}</span>
    </div>
    <div class="tip-card">
      ${tips}
    </div>
    ${DIVIDER}
    ${bottomRow()}`;

  return wrap(day, TIP_CSS, inner);
}

// ── Template: Blog Promo ──────────────────────────────────────────────────────

const BLOG_CSS = `
.blog-tag{display:inline-flex;align-items:center;gap:8px;background:rgba(200,137,42,.1);border:1px solid rgba(200,137,42,.3);border-radius:100px;padding:7px 18px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c8892a}
.blog-card{width:100%;background:rgba(10,18,34,.82);border:1px solid rgba(200,137,42,.18);border-radius:20px;padding:32px 36px;box-shadow:0 0 60px rgba(200,137,42,.08),0 32px 80px rgba(0,0,0,.75);backdrop-filter:blur(16px);border-left:3px solid rgba(200,137,42,.4)}
.blog-title{font-family:'Bebas Neue',sans-serif;font-size:64px;letter-spacing:2px;line-height:.9;color:#f5f0e8;margin-bottom:14px}
.blog-excerpt{font-size:14px;line-height:1.65;color:rgba(245,240,232,.4);letter-spacing:.2px;margin-bottom:20px}
.blog-url{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(0,212,240,.6)}
.blog-cta{display:inline-flex;align-items:center;gap:10px;background:rgba(200,137,42,.1);border:1px solid rgba(200,137,42,.3);border-radius:8px;padding:12px 22px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c8892a}`;

function blogPost(day, d) {
  const inner = `
    ${kickerHTML(d.kicker || ['strikepanel™', 'New on the Blog', 'SYS.LIVE'])}
    <div class="blog-tag">📖 New Post</div>
    <div class="blog-card">
      <div class="blog-title">${d.blogTitle}</div>
      <div class="blog-excerpt">${d.excerpt}</div>
      <div class="blog-url">↗ ${d.url || 'strikepanel.vercel.app/blog'}</div>
    </div>
    ${DIVIDER}
    ${bottomRow()}`;

  return wrap(day, BLOG_CSS, inner);
}

// ── Template: Quote / Testimonial ────────────────────────────────────────────

const QUOTE_CSS = `
.quote-mark{font-family:'Bebas Neue',sans-serif;font-size:140px;line-height:.7;color:#c8892a;opacity:.25;text-align:center;letter-spacing:-4px}
.quote-card{width:100%;background:rgba(10,18,34,.85);border:1px solid rgba(200,137,42,.2);border-radius:20px;padding:34px 38px;box-shadow:0 0 60px rgba(200,137,42,.07),0 32px 80px rgba(0,0,0,.75);backdrop-filter:blur(16px);position:relative;border-left:3px solid rgba(200,137,42,.35)}
.quote-text{font-size:19px;line-height:1.7;color:rgba(245,240,232,.82);letter-spacing:.2px;margin-bottom:20px;font-style:italic}
.quote-attr{font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#c8892a;opacity:.8}
.quote-rule{width:32px;height:2px;background:#c8892a;opacity:.35;margin-bottom:10px}`;

function quotePost(day, d) {
  const inner = `
    ${kickerHTML(d.kicker || ['strikepanel™', 'Coach Story', 'SYS.LIVE'])}
    <div class="quote-mark">"</div>
    <div class="quote-card">
      <div class="quote-text">${d.quoteText}</div>
      <div class="quote-rule"></div>
      <div class="quote-attr">${d.attribution}</div>
    </div>
    ${DIVIDER}
    ${bottomRow()}`;

  return wrap(day, QUOTE_CSS, inner);
}

// ── Template: Before/After Quote (Day 23) ────────────────────────────────────

const BEFOREAFTER_CSS = `
${QUOTE_CSS}
.ba-wrap{display:flex;gap:14px;width:100%}
.ba-col{flex:1;background:rgba(10,18,34,.82);border-radius:16px;padding:24px 22px}
.ba-before{border:1px solid rgba(239,68,68,.18);border-top:2px solid rgba(239,68,68,.45)}
.ba-after{border:1px solid rgba(16,185,129,.18);border-top:2px solid rgba(16,185,129,.45)}
.ba-label{font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px}
.ba-label-red{color:rgba(239,68,68,.6)}
.ba-label-green{color:rgba(16,185,129,.7)}
.ba-item{font-size:13px;line-height:1.65;color:rgba(245,240,232,.4);padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04);letter-spacing:.1px}
.ba-item:last-child{border-bottom:none}
.ba-tag{font-family:'Bebas Neue',sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;display:inline-block;padding:2px 8px;border-radius:4px;margin-right:6px;vertical-align:middle}
.ba-tag-red{background:rgba(239,68,68,.12);color:#ef4444}
.ba-tag-green{background:rgba(16,185,129,.12);color:#10b981}
.ba-quote-small{text-align:center;font-size:15px;color:rgba(245,240,232,.7);font-style:italic;letter-spacing:.2px}
.ba-attr{text-align:center;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#c8892a;opacity:.7;margin-top:6px}`;

function beforeAfterPost(day, d) {
  const beforeItems = d.before.map(b => `<div class="ba-item"><span class="ba-tag ba-tag-red">✕</span>${b}</div>`).join('\n          ');
  const afterItems = d.after.map(a => `<div class="ba-item"><span class="ba-tag ba-tag-green">✓</span>${a}</div>`).join('\n          ');

  const inner = `
    ${kickerHTML(['strikepanel™', 'Coach Story', 'SYS.LIVE'])}
    <div class="ba-wrap">
      <div class="ba-col ba-before">
        <div class="ba-label ba-label-red">Before strikepanel</div>
        ${beforeItems}
      </div>
      <div class="ba-col ba-after">
        <div class="ba-label ba-label-green">After strikepanel</div>
        ${afterItems}
      </div>
    </div>
    <div class="ba-quote-small">"Game changer."</div>
    <div class="ba-attr">— Combat Sports Coach, UK</div>
    ${DIVIDER}
    ${bottomRow()}`;

  return wrap(day, BEFOREAFTER_CSS, inner);
}

// ── Template: Feature Highlight ───────────────────────────────────────────────

const FEATURE_CSS = `
.feat-headline{text-align:center;line-height:.88;margin-bottom:2px}
.feat-hl-white{font-family:'Bebas Neue',sans-serif;font-size:92px;letter-spacing:2px;color:#fff;display:block}
.feat-hl-amber{font-family:'Bebas Neue',sans-serif;font-size:92px;letter-spacing:2px;color:#c8892a;display:block;text-shadow:0 0 60px rgba(200,137,42,.5)}
.feat-hl-cyan{font-family:'Bebas Neue',sans-serif;font-size:92px;letter-spacing:2px;color:#00D4F0;display:block;text-shadow:0 0 60px rgba(0,212,240,.4)}
.feat-card{width:100%;background:rgba(10,18,34,.82);border:1px solid rgba(0,212,240,.18);border-radius:20px;padding:28px 32px;box-shadow:0 0 60px rgba(0,212,240,.08),0 24px 60px rgba(0,0,0,.7);backdrop-filter:blur(12px)}
.feat-item{display:flex;align-items:flex-start;gap:14px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.feat-item:last-child{border-bottom:none;padding-bottom:0}
.feat-item:first-child{padding-top:0}
.feat-arrow{color:#00D4F0;font-size:14px;flex-shrink:0;margin-top:1px;opacity:.8}
.feat-text{font-size:14px;line-height:1.5;color:rgba(245,240,232,.6);letter-spacing:.2px}
.feat-cta{display:inline-flex;align-items:center;gap:10px;background:rgba(0,212,240,.08);border:1px solid rgba(0,212,240,.3);border-radius:100px;padding:12px 28px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#00D4F0}
.feat-price{font-size:11px;letter-spacing:1.5px;color:rgba(122,133,160,.55);text-align:center}`;

function featurePost(day, d) {
  const hl1cls = d.headlineColors && d.headlineColors[0] === 'amber' ? 'feat-hl-amber' : d.headlineColors && d.headlineColors[0] === 'cyan' ? 'feat-hl-cyan' : 'feat-hl-white';
  const hl2cls = d.headlineColors && d.headlineColors[1] === 'white' ? 'feat-hl-white' : d.headlineColors && d.headlineColors[1] === 'cyan' ? 'feat-hl-cyan' : 'feat-hl-amber';

  const items = d.features.map(f => `<div class="feat-item"><div class="feat-arrow">→</div><div class="feat-text">${f}</div></div>`).join('\n        ');

  const ctaHTML = d.cta ? `<div class="feat-cta">${d.cta}</div>` : '';
  const priceHTML = d.price ? `<div class="feat-price">${d.price}</div>` : '';

  const inner = `
    ${kickerHTML(d.kicker || ['strikepanel™', 'Feature', 'SYS.LIVE'])}
    <div class="feat-headline">
      <span class="${hl1cls}">${d.headline[0]}</span>
      <span class="${hl2cls}">${d.headline[1]}</span>
    </div>
    <div class="feat-card">
      ${items}
    </div>
    ${ctaHTML ? ctaHTML + '\n    ' : ''}${priceHTML ? priceHTML + '\n    ' : ''}${DIVIDER}
    ${bottomRow()}`;

  return wrap(day, FEATURE_CSS, inner);
}

// ── Template: Price Feature (Day 25) ─────────────────────────────────────────

const PRICE_CSS = `
.price-hero{text-align:center}
.price-big{font-family:'Bebas Neue',sans-serif;font-size:130px;letter-spacing:2px;color:#c8892a;line-height:.85;text-shadow:0 0 80px rgba(200,137,42,.55),0 0 160px rgba(200,137,42,.2)}
.price-once{font-family:'Bebas Neue',sans-serif;font-size:52px;letter-spacing:4px;color:rgba(245,240,232,.3);display:block;margin-top:4px}
.price-sub{font-family:'Bebas Neue',sans-serif;font-size:38px;letter-spacing:3px;color:rgba(245,240,232,.55);display:block}
.price-card{width:100%;background:rgba(10,18,34,.82);border:1px solid rgba(200,137,42,.18);border-radius:20px;padding:26px 30px;box-shadow:0 0 40px rgba(200,137,42,.06),0 24px 60px rgba(0,0,0,.7);backdrop-filter:blur(12px)}
.price-feature{display:flex;align-items:center;gap:14px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.price-feature:last-child{border-bottom:none;padding-bottom:0}
.price-feature:first-child{padding-top:0}
.price-check{color:#10b981;font-size:13px;flex-shrink:0}
.price-feat-text{font-size:13px;color:rgba(245,240,232,.55);letter-spacing:.3px}
.price-cta{display:flex;gap:12px;align-items:center;justify-content:center}
.price-cta-demo{display:inline-flex;align-items:center;background:rgba(0,212,240,.08);border:1px solid rgba(0,212,240,.3);border-radius:100px;padding:11px 24px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#00D4F0}
.price-cta-buy{display:inline-flex;align-items:center;background:rgba(200,137,42,.12);border:1px solid rgba(200,137,42,.35);border-radius:100px;padding:11px 24px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#c8892a}`;

function pricePost(day, d) {
  const items = d.features.map(f => `<div class="price-feature"><div class="price-check">✓</div><div class="price-feat-text">${f}</div></div>`).join('\n        ');

  const inner = `
    ${kickerHTML(['strikepanel™', 'Pricing', 'SYS.LIVE'])}
    <div class="price-hero">
      <div class="price-big">$99</div>
      <span class="price-once">ONCE</span>
      <span class="price-sub">YOURS FOREVER.</span>
    </div>
    <div class="price-card">
      ${items}
    </div>
    <div class="price-cta">
      <div class="price-cta-demo">Demo → strikepanel.vercel.app/demo</div>
      <div class="price-cta-buy">Buy → gumroad.com/l/strikepanel</div>
    </div>
    ${DIVIDER}
    ${bottomRow()}`;

  return wrap(day, PRICE_CSS, inner);
}

// ── Post Data (30 days) ───────────────────────────────────────────────────────

const POSTS = [

  // DAY 1 — Widget: Morning Brief
  { day: 1, fn: widgetPost, data: {
    athletes: [
      { name: 'Priya', score: 91, color: '#10b981', badge: 'Push Hard' },
      { name: 'Jake', score: 74, color: '#00D4F0', badge: 'Train Normal' },
      { name: 'Marcus', score: 38, color: '#ef4444', badge: 'Rest Day' },
    ],
    headline: ['KNOW WHO TO PUSH.', 'KNOW WHO TO PROTECT.'],
    headlineColors: ['white', 'amber'],
  }},

  // DAY 2 — Statement: WhatsApp Chaos
  { day: 2, fn: statementPost, data: {
    kicker: ['strikepanel™', 'Reality Check', 'SYS.LIVE'],
    headlineLines: ['DID EVERYONE', 'CHECK IN?'],
    lineColors: ['white', 'amber'],
    subLines: [
      'Three blue ticks. No reply. Messages buried under memes.',
      'You scroll up, you guess, you push the wrong fighter.',
      'This is not a coaching system. There\'s a better way.',
    ],
  }},

  // DAY 3 — Widget: Your Athletes Scored
  { day: 3, fn: widgetPost, data: {
    widgetTitle: 'Morning Brief · Today',
    athletes: [
      { name: 'Sofia', score: 87, color: '#10b981', badge: 'Push Hard' },
      { name: 'Alex', score: 71, color: '#00D4F0', badge: 'Train Normal' },
      { name: 'Kemi', score: 44, color: '#ef4444', badge: 'Rest Day' },
    ],
    headline: ['YOUR ATHLETES.', 'SCORED. EVERY MORNING.'],
    headlineColors: ['amber', 'white'],
  }},

  // DAY 4 — Tip: Fight Camp Phases
  { day: 4, fn: tipPost, data: {
    kicker: ['strikepanel™', 'Fight Camp', 'SYS.LIVE'],
    headline: ['FIGHT CAMP HAS', '3 PHASES.'],
    headlineColors: ['white', 'amber'],
    tips: [
      { num: '01', title: 'BASE', text: 'Volume high, intensity moderate. Building the engine.' },
      { num: '02', title: 'PEAK', text: 'Intensity spikes, volume drops. Sharpening the weapon.' },
      { num: '03', title: 'TAPER', text: 'Load off, skills sharp, weight managed. Arriving ready.' },
    ],
  }},

  // DAY 5 — Feature: Weight Cut Planner
  { day: 5, fn: featurePost, data: {
    kicker: ['strikepanel™', 'Feature', 'SYS.LIVE'],
    headline: ['WEIGHT CUT.', 'AUTOMATED.'],
    headlineColors: ['white', 'amber'],
    features: [
      'Daily weigh-in tracking for every fighter on your roster',
      'Cut timeline from current weight to fight weight — automated',
      'Alerts when a fighter is off track, before it becomes a crisis',
      'No spreadsheets. No guesswork. No Friday-before-weigh-ins panic.',
    ],
    cta: '→ strikepanel.vercel.app/demo',
    price: '$99 once. No subscription. No renewal.',
  }},

  // DAY 6 — Statement: Guessing Readiness
  { day: 6, fn: statementPost, data: {
    kicker: ['strikepanel™', 'Reality Check', 'SYS.LIVE'],
    headlineLines: ['YOU PUSHED HIM.', 'HE WASN\'T', 'READY.'],
    lineColors: ['white', 'amber', 'amber'],
    subLines: [
      'He said he was good. He looked flat. You pushed him anyway.',
      'Readiness data doesn\'t replace your instinct — it confirms it.',
    ],
  }},

  // DAY 7 — Blog: Fight Camp Guide
  { day: 7, fn: blogPost, data: {
    kicker: ['strikepanel™', 'Blog', 'SYS.LIVE'],
    blogTitle: 'HOW TO PLAN A FIGHT CAMP — WEEK BY WEEK',
    excerpt: 'Phases, load management, weight cut timing, sparring intensity. Written for combat sports coaches — not generic fitness trainers. Bookmark it.',
    url: 'strikepanel.vercel.app/blog',
  }},

  // DAY 8 — Widget: Squad View 7:14am
  { day: 8, fn: widgetPost, data: {
    widgetTitle: 'Morning Brief · 7:14 AM',
    athletes: [
      { name: 'Dev', score: 88, color: '#10b981', badge: 'Push Hard' },
      { name: 'Chloe', score: 63, color: '#c8892a', badge: 'Monitor' },
      { name: 'Ray', score: 42, color: '#ef4444', badge: 'Rest Day' },
    ],
    headline: ['7:14 AM.', 'YOU ALREADY KNOW.'],
    headlineColors: ['amber', 'white'],
  }},

  // DAY 9 — Tip: Weight Cut Timing
  { day: 9, fn: tipPost, data: {
    kicker: ['strikepanel™', 'Weight Cut', 'SYS.LIVE'],
    headline: ['THE CUT THAT FAILS', 'ON THURSDAY —'],
    headlineColors: ['white', 'amber'],
    tips: [
      { num: '01', title: 'START TRACKING WEEK 1', text: 'Within 3–4kg of fight weight by start of fight week. Build backwards.' },
      { num: '02', title: 'ACT ON THE TREND', text: 'One bad weigh-in is noise. Three in a row is a signal. Adjust then.' },
      { num: '03', title: 'WATER LAST, NOT FIRST', text: 'Water and timing at the end — not your primary cut strategy.' },
    ],
  }},

  // DAY 10 — Feature: AI Session Builder
  { day: 10, fn: featurePost, data: {
    kicker: ['strikepanel™', 'Feature', 'SYS.LIVE'],
    headline: ['TELL IT YOUR GOAL.', 'GET A SESSION.'],
    headlineColors: ['white', 'cyan'],
    features: [
      'Input your session goal — duration, fighters, focus area',
      'AI builds a full plan — rounds, rest, drills, intensity',
      'Powered by Gemini, calibrated for combat sports coaches',
      'Readiness-aware — adapts to your squad\'s morning scores',
    ],
    cta: '→ Free demo: strikepanel.vercel.app/demo',
  }},

  // DAY 11 — Statement: Spreadsheet Failure
  { day: 11, fn: statementPost, data: {
    kicker: ['strikepanel™', 'Reality Check', 'SYS.LIVE'],
    headlineLines: ['THE SPREADSHEET', 'BROKE. AGAIN.'],
    lineColors: ['white', 'red'],
    subLines: [
      'Not 8 weeks out. Not 4 weeks out.',
      'The week of the fight. The night before weigh-ins.',
      'This isn\'t a spreadsheet problem. It\'s a system problem.',
    ],
  }},

  // DAY 12 — Quote: Game Changer Testimonial
  { day: 12, fn: quotePost, data: {
    kicker: ['strikepanel™', 'Coach Story', 'SYS.LIVE'],
    quoteText: '"I used to track everything in a notes app and a WhatsApp group. Now I open strikepanel every morning, see who\'s ready, who\'s not, and exactly what to do."',
    attribution: '— Combat Sports Coach, UK',
  }},

  // DAY 13 — Tip: Overtraining Signs
  { day: 13, fn: tipPost, data: {
    kicker: ['strikepanel™', 'Coach Intel', 'SYS.LIVE'],
    headline: ['5 SIGNS YOUR FIGHTER', 'IS OVERTRAINED.'],
    headlineColors: ['white', 'amber'],
    tips: [
      { num: '01', title: 'ELEVATED RESTING HR', text: '3+ mornings in a row. Not a one-off — a pattern.' },
      { num: '02', title: 'SLEEP QUALITY DROPPING', text: 'Same bedtime, worse recovery. The body is struggling.' },
      { num: '03', title: 'MOOD SHIFT', text: 'Irritable, quiet, disengaged. Affects the whole session.' },
      { num: '04', title: 'TECHNICAL REGRESSION', text: 'Mistakes they stopped making months ago are back.' },
      { num: '05', title: 'APPETITE CHANGES', text: 'Eating significantly more or less than their normal.' },
    ],
  }},

  // DAY 14 — Blog: Overtraining Signs
  { day: 14, fn: blogPost, data: {
    kicker: ['strikepanel™', 'Blog', 'SYS.LIVE'],
    blogTitle: '5 SIGNS YOUR FIGHTER IS OVERTRAINED BEFORE FIGHT NIGHT',
    excerpt: 'You trained them hard. That\'s the job. But how do you know when hard became too hard? What each sign looks like in practice — and what to do before it costs you a performance.',
    url: 'strikepanel.vercel.app/blog',
  }},

  // DAY 15 — Feature: Check-In Links
  { day: 15, fn: featurePost, data: {
    kicker: ['strikepanel™', 'Feature', 'SYS.LIVE'],
    headline: ['60 SECONDS.', 'EVERY MORNING.'],
    headlineColors: ['white', 'cyan'],
    features: [
      'Share a link once — athletes open it on any device',
      'Sleep, energy, soreness, mood — submitted in under 60 seconds',
      'Readiness score generated automatically, no manual calculation',
      'No app download. No account creation. Zero friction.',
    ],
    cta: '→ strikepanel.vercel.app/demo',
    price: '$99 once. No subscription.',
  }},

  // DAY 16 — Statement: Fight Week Chaos
  { day: 16, fn: statementPost, data: {
    kicker: ['strikepanel™', 'Reality Check', 'SYS.LIVE'],
    headlineLines: ['FIGHT WEEK', 'SHOULD BE', 'CALM.'],
    lineColors: ['white', 'white', 'amber'],
    subLines: [
      '47 unread messages. Someone forgot to weigh in. The plan is unclear.',
      'Fight week chaos is built in training. Fix the system now.',
    ],
  }},

  // DAY 17 — Score Drop Widget
  { day: 17, fn: scoreDropPost, data: {
    name: 'Leon',
    yesterday: 84,
    today: 51,
    headline: ['SOMETHING CHANGED.', 'YOU\'LL KNOW BEFORE TRAINING.'],
  }},

  // DAY 18 — Tip: Sparring Load
  { day: 18, fn: tipPost, data: {
    kicker: ['strikepanel™', 'Fight Camp', 'SYS.LIVE'],
    headline: ['THE LAST 2 WEEKS', 'ARE THE RISKIEST.'],
    headlineColors: ['white', 'red'],
    tips: [
      { num: '01', title: 'REDUCE SPARRING VOLUME', text: 'Not intensity — volume. Keep the sharpness. Remove unnecessary exposure.' },
      { num: '02', title: 'TRACK READINESS DAILY', text: 'Fatigue masks technique. A tired fighter is a vulnerable fighter.' },
      { num: '03', title: 'ARRIVE HEALTHY', text: 'The fighter who walks in feeling 100% beats the one who trained hardest.' },
    ],
  }},

  // DAY 19 — Feature: Multi-Device / Cloud Sync
  { day: 19, fn: featurePost, data: {
    kicker: ['strikepanel™', 'Feature', 'SYS.LIVE'],
    headline: ['ONE TOOL.', 'EVERY DEVICE.'],
    headlineColors: ['white', 'cyan'],
    features: [
      'At the gym — phone. Building the plan at home — laptop. In camp — tablet.',
      'Syncs across everything automatically. No manual export needed.',
      'Offline ready — works without internet, syncs when back online.',
      'Install from the browser. No app store. No updates. No friction.',
    ],
    price: '$99 once. No subscription. No renewal.',
  }},

  // DAY 20 — Statement: Same Session for Everyone + Demo CTA
  { day: 20, fn: statementPost, data: {
    kicker: ['strikepanel™', 'Reality Check', 'SYS.LIVE'],
    headlineLines: ['SAME SESSION', 'FOR EVERYONE.'],
    lineColors: ['white', 'amber'],
    subLines: [
      'One of them shouldn\'t be here. Or not at this intensity.',
      'You didn\'t know which one. So everyone got the same session.',
      'That\'s an information failure — not a coaching failure.',
    ],
    cta: '→ strikepanel.vercel.app/demo',
  }},

  // DAY 21 — Blog: Replacing WhatsApp
  { day: 21, fn: blogPost, data: {
    kicker: ['strikepanel™', 'Blog', 'SYS.LIVE'],
    blogTitle: 'HOW COMBAT SPORTS COACHES ARE REPLACING WHATSAPP WITH DATA',
    excerpt: 'WhatsApp was never a coaching tool. It\'s a messaging app we retrofitted into one. What actually replacing it looks like — and what changes on the other side.',
    url: 'strikepanel.vercel.app/blog',
  }},

  // DAY 22 — Tip: How Readiness Scoring Works
  { day: 22, fn: tipPost, data: {
    kicker: ['strikepanel™', 'How It Works', 'SYS.LIVE'],
    headline: ['READINESS SCORING', 'ISN\'T MAGIC.'],
    headlineColors: ['white', 'cyan'],
    tips: [
      { num: '→', title: 'SLEEP QUALITY', text: 'How well did they recover overnight? The foundation of everything.' },
      { num: '→', title: 'ENERGY LEVEL', text: 'Subjective but consistent — trends matter more than single scores.' },
      { num: '→', title: 'PHYSICAL SORENESS', text: 'Muscle fatigue, stiffness, injury signals. Flags modification needs.' },
      { num: '→', title: 'MOOD', text: 'Affects technique, focus, and coachability. Often the first signal.' },
    ],
  }},

  // DAY 23 — Before/After Testimonial
  { day: 23, fn: beforeAfterPost, data: {
    before: ['Notes app for weight data', 'WhatsApp group for check-ins', 'Gut feeling for readiness', 'Memory for fight camp phases'],
    after: ['Morning Brief before leaving the house', 'Weight cut on track, automated', 'Every decision backed by data', 'Fight camp managed in one place'],
  }},

  // DAY 24 — Statement: Tired Fighter
  { day: 24, fn: statementPost, data: {
    kicker: ['strikepanel™', 'Reality Check', 'SYS.LIVE'],
    headlineLines: ['YOU SHOULD HAVE', 'KNOWN THREE', 'DAYS AGO.'],
    lineColors: ['white', 'amber', 'amber'],
    subLines: [
      'The trend was there. Sleep dropped. Energy came back low.',
      'With readiness data, you\'d have seen it before the damage was done.',
    ],
  }},

  // DAY 25 — Price Post + Demo
  { day: 25, fn: pricePost, data: {
    features: [
      'Morning Brief readiness scoring — all athletes, every morning',
      'Fight camp management — countdown, phases, milestones',
      'Weight cut planner — daily tracking, automated alerts',
      'AI session builder — powered by Gemini, combat-sports specific',
      'Athlete check-in links — 60 seconds, no app required',
      'Cloud sync — works offline, every device',
    ],
  }},

  // DAY 26 — Widget: All Green / Good Day
  { day: 26, fn: widgetPost, data: {
    widgetTitle: 'Morning Brief · Today',
    athletes: [
      { name: 'Jade', score: 92, color: '#10b981', badge: 'Push Hard' },
      { name: 'Omar', score: 88, color: '#10b981', badge: 'Push Hard' },
      { name: 'Priya', score: 81, color: '#10b981', badge: 'Push Hard' },
    ],
    headline: ['DAYS LIKE THIS EXIST.', 'BUILD THE SYSTEM.'],
    headlineColors: ['white', 'amber'],
  }},

  // DAY 27 — Tip: Managing Multiple Fighters
  { day: 27, fn: tipPost, data: {
    kicker: ['strikepanel™', 'Coach Intel', 'SYS.LIVE'],
    headline: ['MANAGING 8 FIGHTERS', 'IS DIFFERENT.'],
    headlineColors: ['white', 'amber'],
    tips: [
      { num: '01', title: 'INDIVIDUAL TIMELINES', text: 'Each fighter has their own fight date, camp length, and progression.' },
      { num: '02', title: 'INDIVIDUAL CUT PLANS', text: 'Different weight classes need different protocols. Not one template.' },
      { num: '03', title: 'INDIVIDUAL READINESS', text: 'One tired fighter in a group session becomes everyone\'s problem.' },
    ],
  }},

  // DAY 28 — Blog: Weight Cut Guide
  { day: 28, fn: blogPost, data: {
    kicker: ['strikepanel™', 'Blog', 'SYS.LIVE'],
    blogTitle: 'HOW TO MANAGE A WEIGHT CUT WITHOUT A SPREADSHEET',
    excerpt: 'The weight cut is the part of fight prep that breaks first. Not because coaches don\'t know what to do — because the tracking tools aren\'t built for it.',
    url: 'strikepanel.vercel.app/blog',
  }},

  // DAY 29 — Statement: No System
  { day: 29, fn: statementPost, data: {
    kicker: ['strikepanel™', 'Reality Check', 'SYS.LIVE'],
    headlineLines: ['MOST COACHES', 'DON\'T HAVE', 'A SYSTEM.'],
    lineColors: ['white', 'amber', 'white'],
    subLines: [
      'They have a habit of coping. And it works — until fight week.',
      'A system scales. A coping habit breaks at the worst moment.',
    ],
  }},

  // DAY 30 — Feature: Full Picture + Demo
  { day: 30, fn: featurePost, data: {
    kicker: ['strikepanel™', 'Full Platform', 'SYS.LIVE'],
    headline: ['EVERYTHING.', 'ONE PLACE.'],
    headlineColors: ['white', 'amber'],
    features: [
      'Morning Brief — every athlete scored, every morning',
      'Fight Camp — countdown, phases, milestones, automated',
      'Weight Cut — daily weigh-ins, cut timeline, alerts',
      'AI Sessions — tell it your goal, get a full plan instantly',
    ],
    cta: '→ Try free: strikepanel.vercel.app/demo',
    price: '500+ coaches. $99 once. Price increases with Phase 2.',
  }},
];

// ── Generate all files ────────────────────────────────────────────────────────

let count = 0;
for (const post of POSTS) {
  const html = post.fn(post.day, post.data);
  const file = path.join(OUT, `instagram-post-${post.day}.html`);
  fs.writeFileSync(file, html, 'utf8');
  count++;
  console.log(`✓ Post ${post.day} → instagram-post-${post.day}.html`);
}

console.log(`\n✅ Generated ${count} posts in ${OUT}`);
