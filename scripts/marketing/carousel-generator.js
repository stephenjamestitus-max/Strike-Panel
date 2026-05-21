const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '../../marketing/carousels');

const BRAND = {
  bg: '#0a0a0a',
  accent: '#c8102e',
  text: '#ffffff',
  muted: '#888888',
  font: 'system-ui, -apple-system, sans-serif',
};

function slideHTML(slide, index, total) {
  const { headline, body, type = 'content', stat, statLabel } = slide;

  if (type === 'cover') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1080px; height: 1080px;
        background: ${BRAND.bg};
        font-family: ${BRAND.font};
        display: flex; flex-direction: column;
        justify-content: center; align-items: flex-start;
        padding: 80px;
        position: relative; overflow: hidden;
      }
      .grid {
        position: absolute; inset: 0;
        background-image:
          linear-gradient(rgba(200,16,46,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(200,16,46,0.06) 1px, transparent 1px);
        background-size: 60px 60px;
      }
      .accent-bar { width: 64px; height: 4px; background: ${BRAND.accent}; margin-bottom: 40px; }
      .headline {
        font-size: 72px; font-weight: 800; color: ${BRAND.text};
        line-height: 1.1; letter-spacing: -2px;
        max-width: 900px; position: relative; z-index: 1;
      }
      .sub {
        font-size: 28px; color: ${BRAND.muted};
        margin-top: 32px; position: relative; z-index: 1;
        font-weight: 400; letter-spacing: 0.5px;
      }
      .logo {
        position: absolute; bottom: 60px; right: 60px;
        font-size: 22px; font-weight: 700; color: ${BRAND.accent};
        letter-spacing: 2px; text-transform: uppercase;
      }
      .counter {
        position: absolute; top: 60px; right: 60px;
        font-size: 18px; color: ${BRAND.muted};
        font-weight: 500;
      }
    </style></head><body>
    <div class="grid"></div>
    <div class="accent-bar"></div>
    <div class="headline">${headline}</div>
    ${body ? `<div class="sub">${body}</div>` : ''}
    <div class="logo">StrikePanel</div>
    <div class="counter">1 / ${total}</div>
    </body></html>`;
  }

  if (type === 'stat') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1080px; height: 1080px;
        background: ${BRAND.bg};
        font-family: ${BRAND.font};
        display: flex; flex-direction: column;
        justify-content: center; align-items: center;
        padding: 80px; position: relative; overflow: hidden;
      }
      .grid {
        position: absolute; inset: 0;
        background-image:
          linear-gradient(rgba(200,16,46,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(200,16,46,0.04) 1px, transparent 1px);
        background-size: 60px 60px;
      }
      .stat-num {
        font-size: 180px; font-weight: 900; color: ${BRAND.accent};
        line-height: 1; position: relative; z-index: 1;
        letter-spacing: -6px;
      }
      .stat-label {
        font-size: 36px; color: ${BRAND.text}; margin-top: 16px;
        text-align: center; font-weight: 600; position: relative; z-index: 1;
        max-width: 700px;
      }
      .body {
        font-size: 26px; color: ${BRAND.muted}; margin-top: 32px;
        text-align: center; position: relative; z-index: 1;
        max-width: 800px; line-height: 1.5;
      }
      .logo {
        position: absolute; bottom: 60px; right: 60px;
        font-size: 20px; font-weight: 700; color: ${BRAND.accent};
        letter-spacing: 2px; text-transform: uppercase;
      }
      .counter {
        position: absolute; top: 60px; right: 60px;
        font-size: 18px; color: ${BRAND.muted}; font-weight: 500;
      }
    </style></head><body>
    <div class="grid"></div>
    <div class="stat-num">${stat}</div>
    <div class="stat-label">${statLabel}</div>
    ${body ? `<div class="body">${body}</div>` : ''}
    <div class="logo">StrikePanel</div>
    <div class="counter">${index + 1} / ${total}</div>
    </body></html>`;
  }

  // default content slide
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1080px;
      background: ${BRAND.bg};
      font-family: ${BRAND.font};
      display: flex; flex-direction: column;
      justify-content: center; align-items: flex-start;
      padding: 90px; position: relative; overflow: hidden;
    }
    .grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(200,16,46,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(200,16,46,0.04) 1px, transparent 1px);
      background-size: 60px 60px;
    }
    .num {
      font-size: 120px; font-weight: 900;
      color: rgba(200,16,46,0.15);
      position: absolute; top: 40px; left: 70px;
      line-height: 1; letter-spacing: -4px;
    }
    .headline {
      font-size: 58px; font-weight: 800; color: ${BRAND.text};
      line-height: 1.15; letter-spacing: -1.5px;
      max-width: 900px; position: relative; z-index: 1;
      margin-top: 80px;
    }
    .accent { color: ${BRAND.accent}; }
    .body {
      font-size: 30px; color: ${BRAND.muted};
      margin-top: 36px; position: relative; z-index: 1;
      max-width: 860px; line-height: 1.6; font-weight: 400;
    }
    .logo {
      position: absolute; bottom: 60px; right: 60px;
      font-size: 20px; font-weight: 700; color: ${BRAND.accent};
      letter-spacing: 2px; text-transform: uppercase;
    }
    .counter {
      position: absolute; top: 60px; right: 60px;
      font-size: 18px; color: ${BRAND.muted}; font-weight: 500;
    }
  </style></head><body>
  <div class="grid"></div>
  <div class="num">${String(index).padStart(2, '0')}</div>
  <div class="headline">${headline}</div>
  ${body ? `<div class="body">${body}</div>` : ''}
  <div class="logo">StrikePanel</div>
  <div class="counter">${index + 1} / ${total}</div>
  </body></html>`;
}

async function generateCarousel(slides, outputName) {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

  const paths = [];
  for (let i = 0; i < slides.length; i++) {
    const html = slideHTML(slides[i], i, slides.length);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const file = path.join(OUT_DIR, `${outputName}-${String(i + 1).padStart(2, '0')}.png`);
    await page.screenshot({ path: file, type: 'png' });
    paths.push(file);
    console.log(`  Slide ${i + 1}/${slides.length} → ${path.basename(file)}`);
  }

  await browser.close();
  return paths;
}

module.exports = { generateCarousel };

// Run directly: node carousel-generator.js
if (require.main === module) {
  const example = [
    {
      type: 'cover',
      headline: 'Stop Guessing Which Athletes Are Ready',
      body: 'A framework for combat sports coaches',
    },
    {
      headline: 'The Problem',
      body: 'Every morning you walk into the gym and pick sessions based on gut feel. Some athletes get pushed too hard. Others don\'t get pushed enough. You have no data.',
    },
    {
      type: 'stat',
      stat: '80%',
      statLabel: 'of overtraining injuries are preventable',
      body: 'If you know the readiness score before the session starts.',
    },
    {
      headline: 'What Readiness Scoring Gives You',
      body: 'Sleep quality, soreness, stress, HRV trend — pulled into one number per athlete every morning. You coach to that number. Not to a guess.',
    },
    {
      headline: 'The Result',
      body: 'Athletes who need protecting don\'t get broken down. Athletes who are peaking get pushed. Fight camp arrivals are weapons, not wrecks.',
    },
    {
      type: 'stat',
      stat: '$99',
      statLabel: 'One-time. No subscription.',
      body: 'StrikePanel — readiness scoring for up to 20 athletes. Link in bio.',
    },
  ];

  generateCarousel(example, 'readiness-framework')
    .then(paths => {
      console.log(`\nGenerated ${paths.length} slides:`);
      paths.forEach(p => console.log(' ', p));
    })
    .catch(console.error);
}
