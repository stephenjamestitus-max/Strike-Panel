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

function imageToDataUrl(imgPath) {
  if (!imgPath || !fs.existsSync(imgPath)) return null;
  const ext  = path.extname(imgPath).replace('.', '') || 'jpeg';
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  const b64  = fs.readFileSync(imgPath).toString('base64');
  return `data:${mime};base64,${b64}`;
}

// ── SVG elements ──────────────────────────────────────────────────

// Concentric ring target — techy/editorial background texture
function svgRings(cx = 540, cy = 540, color = '0,212,240', opacity = 0.04) {
  const radii = [160, 240, 320, 400, 480, 560, 640, 740];
  const circles = radii.map(r =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="rgba(${color},${opacity})" stroke-width="1" fill="none"/>`
  ).join('');
  return `<svg style="position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none" xmlns="http://www.w3.org/2000/svg">${circles}</svg>`;
}

// Topographic wavy lines — like the boxing zine reference
function svgTopoLines(color = '255,255,255', opacity = 0.03) {
  // Two offset ellipse sets create an organic topo map feel
  const lines = [];
  for (let i = 0; i < 9; i++) {
    const r1 = 120 + i * 75;
    const r2 = 80 + i * 48;
    lines.push(`<ellipse cx="300" cy="700" rx="${r1}" ry="${r2}" stroke="rgba(${color},${opacity})" stroke-width="1" fill="none"/>`);
    lines.push(`<ellipse cx="800" cy="300" rx="${r1 * 0.7}" ry="${r2 * 0.9}" stroke="rgba(${color},${opacity * 0.7})" stroke-width="1" fill="none"/>`);
  }
  return `<svg style="position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;overflow:visible" xmlns="http://www.w3.org/2000/svg">${lines.join('')}</svg>`;
}

// Crosshair mark
function crosshair(x, y, size = 16, color = '#00D4F0', opacity = 0.3) {
  return `<svg style="position:absolute;left:${x - size}px;top:${y - size}px;width:${size * 2}px;height:${size * 2}px;z-index:15;pointer-events:none;opacity:${opacity}" xmlns="http://www.w3.org/2000/svg">
    <line x1="${size}" y1="0" x2="${size}" y2="${size * 0.35}" stroke="${color}" stroke-width="1.5"/>
    <line x1="${size}" y1="${size * 1.65}" x2="${size}" y2="${size * 2}" stroke="${color}" stroke-width="1.5"/>
    <line x1="0" y1="${size}" x2="${size * 0.35}" y2="${size}" stroke="${color}" stroke-width="1.5"/>
    <line x1="${size * 1.65}" y1="${size}" x2="${size * 2}" y2="${size}" stroke="${color}" stroke-width="1.5"/>
    <circle cx="${size}" cy="${size}" r="3" stroke="${color}" stroke-width="1" fill="none"/>
  </svg>`;
}

// Fake barcode strip (editorial detail)
function barcode(opacity = 0.18) {
  const bars = Array.from({ length: 42 }, (_, i) => {
    const w = [1, 1, 2, 1, 3, 1, 2, 1, 1, 2][i % 10];
    const x = i * 4.2;
    return `<rect x="${x}" y="0" width="${w}" height="28" fill="white"/>`;
  }).join('');
  return `<svg style="opacity:${opacity};display:inline-block;vertical-align:middle" width="180" height="28" xmlns="http://www.w3.org/2000/svg">${bars}</svg>`;
}

// ── Base shells ───────────────────────────────────────────────────

function shell(inner, slideNum, total) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1080px;overflow:hidden;background:${B.bg}}
#canvas{position:relative;width:1080px;height:1080px;display:flex;flex-direction:column;background:${B.bg};font-family:'DM Mono',monospace;overflow:hidden}
#grain{position:absolute;inset:-50%;width:200%;height:200%;pointer-events:none;opacity:.03;z-index:2}
#content{position:relative;z-index:10;flex:1;display:flex;flex-direction:column;padding:52px 64px 48px}
#topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:44px}
#logo{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:3px;color:${B.text}}
#logo span{color:${B.cyan}}
#counter{font-size:10px;letter-spacing:2px;color:${B.muted};text-transform:uppercase}
.tagline{position:absolute;bottom:20px;left:64px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(122,133,160,.3);z-index:20}
.progress{position:absolute;bottom:0;left:0;height:2px;background:linear-gradient(to right,transparent,${B.cyan},transparent);width:${Math.round((slideNum/total)*100)}%;opacity:.4;z-index:20}
</style></head><body>
<div id="canvas">
  <svg id="grain" xmlns="http://www.w3.org/2000/svg"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#noise)"/></svg>
  <div id="content">
    <div id="topbar"><div id="logo">STRIKE<span>PANEL</span></div><div id="counter">${slideNum} / ${total}</div></div>
    ${inner}
  </div>
  <div class="tagline">strikepanel.uk</div>
  <div class="progress"></div>
</div></body></html>`;
}

function imageShell(inner, slideNum, total, dataUrl) {
  const bgCSS = dataUrl
    ? `background-image:url('${dataUrl}');background-size:cover;background-position:center`
    : `background:${B.bg}`;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1080px;overflow:hidden;background:${B.bg}}
#canvas{position:relative;width:1080px;height:1080px;overflow:hidden;font-family:'DM Mono',monospace;${bgCSS}}
#img-grade{position:absolute;inset:0;background:rgba(4,7,30,.25);mix-blend-mode:multiply;z-index:1}
#vignette{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 25%,rgba(4,7,15,.7) 100%);z-index:2}
#bottom-fade{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(4,7,15,.05) 0%,rgba(4,7,15,.15) 40%,rgba(4,7,15,.80) 72%,rgba(4,7,15,.97) 100%);z-index:3}
#grain{position:absolute;inset:-50%;width:200%;height:200%;pointer-events:none;opacity:.035;z-index:4}
#content{position:absolute;inset:0;z-index:10;display:flex;flex-direction:column;padding:52px 64px 48px}
#topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:auto}
#logo{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:3px;color:rgba(245,240,232,.9)}
#logo span{color:${B.cyan}}
#counter{font-size:10px;letter-spacing:2px;color:rgba(122,133,160,.55);text-transform:uppercase}
.tagline{position:absolute;bottom:20px;left:64px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(122,133,160,.35);z-index:20}
.progress{position:absolute;bottom:0;left:0;height:2px;background:linear-gradient(to right,transparent,${B.cyan},transparent);width:${Math.round((slideNum/total)*100)}%;opacity:.5;z-index:20}
</style></head><body>
<div id="canvas">
  <div id="img-grade"></div><div id="vignette"></div><div id="bottom-fade"></div>
  <svg id="grain" xmlns="http://www.w3.org/2000/svg"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#noise)"/></svg>
  <div id="content">
    <div id="topbar"><div id="logo">STRIKE<span>PANEL</span></div><div id="counter">${slideNum} / ${total}</div></div>
    ${inner}
  </div>
  <div class="tagline">strikepanel.uk</div>
  <div class="progress"></div>
</div></body></html>`;
}

// ── Slide templates ───────────────────────────────────────────────

// ── BLACKCARD — Zine/editorial + cinematic image version ──────────
// Dark: concentric rings + editorial frame + bold type bottom-left
// Image: cinematic full-bleed + editorial overlays

function blackcardSlide(s, i, total, bgImg) {
  const dataUrl = imageToDataUrl(bgImg);
  const lines = (s.line || '').split('\n');
  const maxLen = Math.max(...lines.map(l => l.length));
  const fontSize = s.fontSize || (maxLen <= 12 ? 104 : maxLen <= 18 ? 88 : 74);

  if (dataUrl) {
    // ── CINEMATIC IMAGE VERSION ─────────────────────────────────
    const inner = `
      <div style="display:flex;flex-direction:column;justify-content:flex-end;flex:1;gap:16px;padding-bottom:4px">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:4px">
          <div style="width:48px;height:2px;background:${B.cyan}"></div>
          ${s.tag ? `<div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:${B.cyan};opacity:.8">${s.tag}</div>` : ''}
        </div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:${fontSize}px;line-height:.98;letter-spacing:1px;color:${B.text};text-shadow:0 4px 48px rgba(0,0,0,.8)">
          ${lines.map(l => `<div>${l}</div>`).join('')}
        </div>
        ${s.sub ? `<div style="font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(245,240,232,.5);margin-top:4px">${s.sub}</div>` : ''}
      </div>`;
    const html = imageShell(inner, i, total, dataUrl);
    // Inject crosshair + topo rings on top of image
    return html.replace('</div></body></html>',
      `${svgRings(900, 150, '0,212,240', 0.035)}${crosshair(72, 72, 14, B.cyan, 0.25)}</div></body></html>`);
  }

  // ── DARK ZINE VERSION (no image) ───────────────────────────────
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1080px;overflow:hidden;background:#04070f}
#canvas{position:relative;width:1080px;height:1080px;overflow:hidden;background:#04070f;font-family:'DM Mono',monospace}
#grain{position:absolute;inset:-50%;width:200%;height:200%;pointer-events:none;opacity:.03;z-index:3}
#content{position:absolute;inset:0;z-index:10;display:flex;flex-direction:column;padding:52px 64px 48px}
#topbar{display:flex;justify-content:space-between;align-items:center}
#logo{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:3px;color:${B.text}}
#logo span{color:${B.cyan}}
#counter{font-size:10px;letter-spacing:2px;color:${B.muted};text-transform:uppercase}
.tagline{position:absolute;bottom:20px;left:64px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(122,133,160,.3);z-index:20}
.progress{position:absolute;bottom:0;left:0;height:2px;background:linear-gradient(to right,transparent,${B.cyan},transparent);width:${Math.round((i/total)*100)}%;opacity:.4;z-index:20}
/* Top editorial rule */
.rule-top{position:absolute;top:88px;left:0;right:0;height:1px;background:linear-gradient(to right,transparent,rgba(0,212,240,.2),transparent)}
/* Bottom editorial rule */
.rule-bottom{position:absolute;bottom:44px;left:64px;right:64px;height:1px;background:rgba(122,133,160,.12)}
</style></head><body>
<div id="canvas">
  ${svgTopoLines('0,212,240', 0.035)}
  ${svgRings(1000, 80, '0,212,240', 0.04)}
  <svg id="grain" xmlns="http://www.w3.org/2000/svg"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#noise)"/></svg>
  <div class="rule-top"></div>
  <div class="rule-bottom"></div>
  ${crosshair(1040, 40, 12, B.cyan, 0.2)}
  <div id="content">
    <div id="topbar" style="margin-bottom:auto"><div id="logo">STRIKE<span style="color:${B.cyan}">PANEL</span></div><div id="counter">${i} / ${total}</div></div>
    <div style="display:flex;flex-direction:column;justify-content:flex-end;flex:1;gap:20px;padding-bottom:36px">
      <div style="width:56px;height:2px;background:${B.cyan};opacity:.9"></div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:${fontSize}px;line-height:.97;letter-spacing:1px;color:${B.text}">
        ${lines.map(l => `<div>${l}</div>`).join('')}
      </div>
      ${s.sub ? `<div style="font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:${B.muted}">${s.sub}</div>` : ''}
      <div style="display:flex;align-items:center;gap:20px;margin-top:8px">
        ${barcode(0.15)}
        <div style="font-size:9px;letter-spacing:2px;color:rgba(122,133,160,.25);text-transform:uppercase">SP-${new Date().getFullYear()}</div>
      </div>
    </div>
  </div>
  <div class="tagline">strikepanel.uk</div>
  <div class="progress"></div>
</div></body></html>`;
}

// ── SPLITSCREEN — Diagonal world-tear inspired by the fish poster ─
// Two realities divided by a diagonal slice, not a straight line

function splitscreenSlide(s, i, total, bgImg) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1080px;overflow:hidden;background:#04070f}
#canvas{position:relative;width:1080px;height:1080px;overflow:hidden;font-family:'DM Mono',monospace;background:#04070f}
#grain{position:absolute;inset:-50%;width:200%;height:200%;pointer-events:none;opacity:.04;z-index:8}
/* Diagonal left world — chaos — warm dark red */
#world-left{
  position:absolute;inset:0;
  clip-path:polygon(0 0, 56% 0, 44% 100%, 0 100%);
  background:linear-gradient(135deg, #1c0808 0%, #0d0404 100%);
  z-index:1
}
/* Diagonal right world — clarity — cool dark cyan */
#world-right{
  position:absolute;inset:0;
  clip-path:polygon(56% 0, 100% 0, 100% 100%, 44% 100%);
  background:linear-gradient(135deg, #001a1f 0%, #04070f 100%);
  z-index:1
}
/* Subtle noise texture on each side */
#noise-left{
  position:absolute;inset:0;
  clip-path:polygon(0 0, 56% 0, 44% 100%, 0 100%);
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='rgba(248,113,113,0.03)'/%3E%3C/svg%3E");
  z-index:2;opacity:.6
}
/* Diagonal tear line — glowing seam */
#tear{
  position:absolute;
  top:0;bottom:0;
  left:calc(50% - 1px);
  width:2px;
  background:linear-gradient(to bottom, transparent 0%, rgba(0,212,240,.5) 20%, rgba(0,212,240,.8) 50%, rgba(0,212,240,.5) 80%, transparent 100%);
  transform:rotate(-8deg) scaleY(1.2);
  z-index:6;
  filter:blur(.5px)
}
/* Glow behind the tear */
#tear-glow{
  position:absolute;
  top:0;bottom:0;
  left:calc(50% - 20px);
  width:40px;
  background:radial-gradient(ellipse at center, rgba(0,212,240,.06) 0%, transparent 70%);
  transform:rotate(-8deg) scaleY(1.2);
  z-index:5
}
/* Logo + counter bar */
#topbar{
  position:absolute;top:0;left:0;right:0;
  display:flex;justify-content:space-between;align-items:center;
  padding:52px 64px 0;z-index:20
}
#logo{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:3px;color:${B.text}}
#logo span{color:${B.cyan}}
#counter{font-size:10px;letter-spacing:2px;color:${B.muted};text-transform:uppercase}
/* Label strip at bottom */
#label-strip{
  position:absolute;bottom:52px;left:0;right:0;
  display:flex;justify-content:center;z-index:20
}
#label-text{
  font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:5px;
  color:rgba(245,240,232,.35);text-transform:uppercase;
  border-top:1px solid rgba(122,133,160,.15);
  padding-top:12px
}
.tagline{position:absolute;bottom:20px;left:64px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(122,133,160,.25);z-index:20}
.progress{position:absolute;bottom:0;left:0;height:2px;background:linear-gradient(to right,transparent,${B.cyan},transparent);width:${Math.round((i/total)*100)}%;opacity:.4;z-index:20}
/* Content panels */
#left-content{
  position:absolute;
  top:140px;bottom:120px;left:44px;
  width:420px;z-index:10;
  display:flex;flex-direction:column;gap:20px
}
#right-content{
  position:absolute;
  top:140px;bottom:120px;right:44px;
  width:420px;z-index:10;
  display:flex;flex-direction:column;gap:20px
}
.world-label{font-size:9px;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px}
.world-text{font-size:15px;line-height:1.65;font-family:'DM Mono',monospace}
</style></head><body>
<div id="canvas">
  ${svgTopoLines('248,113,113', 0.025)}
  <div id="world-left"></div>
  <div id="world-right"></div>
  ${svgRings(820, 820, '0,212,240', 0.06)}
  <div id="tear-glow"></div>
  <div id="tear"></div>
  <svg id="grain" xmlns="http://www.w3.org/2000/svg"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#noise)"/></svg>
  ${crosshair(540, 540, 10, B.cyan, 0.2)}
  <div id="topbar">
    <div id="logo">STRIKE<span>PANEL</span></div>
    <div id="counter">${i} / ${total}</div>
  </div>
  <div id="left-content">
    <div class="world-label" style="color:${B.red}">WITHOUT A SYSTEM</div>
    <div style="width:32px;height:1px;background:${B.red};opacity:.5"></div>
    <div class="world-text" style="color:rgba(245,240,232,.55)">${s.chaos||''}</div>
  </div>
  <div id="right-content" style="text-align:right">
    <div class="world-label" style="color:${B.cyan}">WITH STRIKEPANEL</div>
    <div style="width:32px;height:1px;background:${B.cyan};opacity:.5;margin-left:auto"></div>
    <div class="world-text" style="color:${B.text}">${s.clarity||''}</div>
  </div>
  <div id="label-strip">
    <div id="label-text">${s.label||'SAME COACH. DIFFERENT SYSTEM.'}</div>
  </div>
  <div class="tagline">strikepanel.uk</div>
  <div class="progress"></div>
</div></body></html>`;
}

// ── SCENARIO — Cinematic + editorial (story pillar) ───────────────

function scenarioSlide(s, i, total, bgImg) {
  const dataUrl = imageToDataUrl(bgImg || s.bgImage);
  const truthLines = (s.truth || '').split('\n');
  const fontSize = s.fontSize || (Math.max(...truthLines.map(l=>l.length)) <= 16 ? 80 : 66);

  const inner = `
    <div style="display:flex;flex-direction:column;justify-content:flex-end;flex:1;gap:14px;padding-bottom:4px">
      <div style="font-size:9px;letter-spacing:4px;text-transform:uppercase;color:${B.amber};opacity:.9">${s.kicker||'FIGHT CAMP'}</div>
      <div style="width:40px;height:2px;background:${B.amber};opacity:.7"></div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:${fontSize}px;line-height:.97;color:${B.text};text-shadow:0 4px 48px rgba(0,0,0,.8)">
        ${truthLines.map(l=>`<div>${l}</div>`).join('')}
      </div>
      ${s.scene ? `<div style="font-size:13px;line-height:1.65;color:rgba(245,240,232,.55);max-width:820px;margin-top:6px;text-shadow:0 2px 12px rgba(0,0,0,.9)">${s.scene}</div>` : ''}
    </div>`;

  const html = dataUrl ? imageShell(inner, i, total, dataUrl) : shell(`
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:20px">
      <div style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${B.amber}">${s.kicker||'SCENARIO'}</div>
      <div style="width:48px;height:2px;background:${B.amber};opacity:.7"></div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:${fontSize}px;line-height:.97;color:${B.text}">
        ${truthLines.map(l=>`<div>${l}</div>`).join('')}
      </div>
      ${s.scene ? `<div style="font-size:15px;line-height:1.7;color:${B.muted};max-width:720px">${s.scene}</div>` : ''}
    </div>`, i, total);

  // Inject rings overlay for editorial detail
  return html.replace('</div></body></html>',
    `${svgRings(100, 950, '200,137,42', 0.05)}${crosshair(1036, 44, 12, B.amber, 0.2)}</div></body></html>`);
}

// ── WIDGET — Morning brief dashboard ─────────────────────────────

function widgetSlide(s, i, total, bgImg) {
  const athletes = s.athletes || [];
  return shell(`
    <div style="flex:1;display:flex;flex-direction:column;gap:14px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:2px;line-height:1;margin-bottom:8px">
        <span style="color:${B.text}">${s.headline||'THIS IS YOUR'}</span>
        <span style="color:${B.cyan}"> ${s.headlineAmber||'MORNING BRIEF.'}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;flex:1">
        ${athletes.map(a => {
          const score = a.score || 0;
          const col   = score >= 80 ? B.green : score >= 50 ? B.amber : B.red;
          const label = score >= 80 ? 'PUSH' : score >= 50 ? 'MONITOR' : 'PROTECT';
          const bar   = Math.round(score);
          return `<div style="display:flex;align-items:center;gap:16px;padding:16px 20px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05);position:relative;overflow:hidden">
            <div style="position:absolute;bottom:0;left:0;height:2px;width:${bar}%;background:${col};opacity:.4"></div>
            <div style="font-family:'Bebas Neue',sans-serif;font-size:48px;color:${col};min-width:72px;text-align:right;line-height:1">${score}</div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:600;color:${B.text};letter-spacing:1.5px">${a.name}</div>
              <div style="font-size:10px;color:${B.muted};letter-spacing:1px;text-transform:uppercase;margin-top:3px">${a.note||''}</div>
            </div>
            <div style="font-size:9px;letter-spacing:3px;font-weight:600;color:${col};border:1px solid ${col};padding:4px 10px;opacity:.8">${label}</div>
          </div>`;
        }).join('')}
      </div>
    </div>`, i, total);
}

// ── SOLUTION ──────────────────────────────────────────────────────

function solutionSlide(s, i, total, bgImg) {
  return shell(`
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:24px">
      <div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:58px;line-height:.97;color:${B.text}">${s.headline||''}</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:58px;line-height:.97;color:${B.cyan}">${s.headlineCyan||s.subheadline||''}</div>
      </div>
      <div style="width:64px;height:2px;background:${B.cyan};opacity:.8"></div>
      <div style="display:flex;flex-direction:column;gap:16px">
        ${(s.points||[]).map(p => `
          <div style="display:flex;gap:16px;align-items:flex-start;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.04)">
            <div style="width:6px;height:6px;border-radius:50%;background:${B.cyan};margin-top:7px;flex-shrink:0;opacity:.8"></div>
            <div style="font-size:15px;line-height:1.6;color:${B.text}">${p}</div>
          </div>`).join('')}
      </div>
    </div>`, i, total);
}

// ── CTA ───────────────────────────────────────────────────────────

function ctaSlide(s, i, total, bgImg) {
  return shell(`
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:28px">
      ${svgRings(540, 540, '0,212,240', 0.055).replace('position:absolute', 'position:absolute')}
      <div style="position:relative;z-index:2">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:80px;line-height:.97;color:${B.text}">${s.headline||'ONE PAYMENT.'}</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:80px;line-height:.97;color:${B.cyan}">${s.headlineCyan||'NO SUBSCRIPTION.'}</div>
      </div>
      <div style="font-size:14px;line-height:1.7;color:${B.muted};max-width:560px;position:relative;z-index:2">${s.body||'$99. One-time.'}</div>
      <div style="position:relative;z-index:2;padding:18px 48px;border:1px solid rgba(0,212,240,.25);background:rgba(0,212,240,.04)">
        <div style="font-size:12px;letter-spacing:4px;text-transform:uppercase;color:${B.cyan}">strikepanel.uk</div>
      </div>
      <div style="position:relative;z-index:2">${barcode(0.12)}</div>
    </div>`, i, total);
}

// ── Remaining templates (unchanged) ──────────────────────────────

function coverSlide(s, i, total, bgImg) {
  return shell(`
    <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end">
      <div style="font-size:13px;letter-spacing:4px;text-transform:uppercase;color:${B.cyan};margin-bottom:16px">${s.eyebrow||''}</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:${s.titleSize||88}px;line-height:1;color:${B.text};margin-bottom:20px">${s.title}</div>
      <div style="font-size:15px;line-height:1.6;color:${B.muted};max-width:640px">${s.sub||''}</div>
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
          <div style="display:flex;gap:20px;align-items:flex-start;padding:16px 20px;background:rgba(255,255,255,.025);border-left:2px solid ${B.cyan}">
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

const TEMPLATES = {
  cover: coverSlide, widget: widgetSlide, stat: statSlide, list: listSlide,
  quote: quoteSlide, cta: ctaSlide, blackcard: blackcardSlide,
  splitscreen: splitscreenSlide, scenario: scenarioSlide, solution: solutionSlide,
};

async function generateCarousel(slides, prefix, bgImage) {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const chrome = findChrome();
  const launchOpts = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] };
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
    // Images go to blackcard (slide 1 hero) and scenario slides only
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
