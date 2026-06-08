/**
 * Free media fetcher for strikepanel carousel visuals.
 * Sources (in priority order):
 *   1. Gemini 2.0 Flash — AI-generated combat sports imagery (FREE, GEMINI_API_KEY, high quality)
 *   2. Pexels          — real sport photos (PEXELS_API_KEY in .env, free at pexels.com/api)
 *   3. Pixabay         — real sport photos (PIXABAY_API_KEY in .env, free at pixabay.com/api/docs)
 *   4. Mixkit          — curated combat-sports video clips (no key, always works)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '../../marketing/media-cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

// ── Per-pillar AI image prompts (Gemini image generation) ────────
// Inspired by: underwater editorial fashion, aerial top-down surreal,
// diagonal split-world cinematography, gritty boxing zine B&W collage.
// Key principles: unusual perspective, specific lighting, explicit color palette, no text.

const PILLAR_AI_PROMPTS = {

  Readiness: `aerial top-down view of a lone boxer lying flat on a dark boxing ring canvas, arms spread wide, shot from directly overhead, single shaft of light from above illuminating only the figure, deep black shadows at the edges, teal and black color palette, cinematic editorial sports photography, surreal scale, no text, no watermarks, photorealistic`,

  'Fight Camp': `underwater photograph of a boxer in training shorts floating suspended in deep teal water, light refracting dramatically from the surface above, bubbles rising, arms outstretched, shot from slightly below looking up, deep cyan and black atmosphere, cinematic editorial fashion meets sports, dreamlike surreal, ultra detailed, no text, no watermarks, photorealistic`,

  'Weight Cut': `extreme close-up silhouette of a boxer's face in profile against a single harsh backlight, sweat drops suspended in the air catching the light like crystals, deep black background, high contrast black and white with faint warm rim light, grain texture, cinematic portrait photography, editorial, no text, no watermarks, photorealistic`,

  'AI Sessions': `dark cinematic boxing gym interior at night, lone figure of a coach standing small in the frame, floor-to-ceiling cyan data visualization light projections covering the walls, fog in the air, deep shadows, volumetric light beams, teal and navy blue color palette, architectural editorial photography, dramatic scale, no text, no watermarks, photorealistic`,

  'Problem': `gritty high-contrast black and white close-up of worn leather boxing gloves hanging from a hook in a dark empty gym, single overhead spotlight casting hard shadows, grain texture, scratches, dust particles in light beam, editorial sports photography, film noir atmosphere, no text, no watermarks, photorealistic`,

  'Frustration': `aerial top-down perspective of an empty boxing ring at night seen from directly above, single dramatic spotlight illuminating the canvas, ropes casting sharp diagonal shadows, deep black void at the edges, teal and white, cinematic, architectural, silent and ominous, no text, no watermarks, photorealistic`,

  'Social Proof': `cinematic moment of a boxer's gloved fist raised in victory in a dark arena, golden spotlights from above, crowd completely blurred in background, motion blur on the arm, dramatic shallow depth of field, warm gold and deep shadow, editorial sports photography, peak emotion, no text, no watermarks, photorealistic`,

  'Direct Offer': `fog-filled professional boxing gym at night, empty ring with single dramatic spotlight, rows of heavy bags hanging in deep shadow, teal light bleeding through a distant window, dark atmospheric interior, architectural editorial photography, moody and powerful, no text, no watermarks, photorealistic`,

};

// ── Pexels fallback queries — cinematic/editorial mood ────────────
const PILLAR_PEXELS = {
  Readiness:      'boxer dark gym moody dramatic shadow overhead light',
  'Fight Camp':   'boxing ring dark dramatic spotlight cinematic training',
  'Weight Cut':   'boxer silhouette dark dramatic portrait backlight',
  'AI Sessions':  'dark gym night fog dramatic light boxing',
  'Problem':      'boxing gloves dark shadow close up dramatic',
  'Frustration':  'empty boxing ring night spotlight dark dramatic',
  'Social Proof': 'boxer victory raised fist arena dramatic light',
  'Direct Offer': 'boxing gym fog night atmospheric dark moody',
};

const PILLAR_PIXABAY = {
  Readiness:      'boxer training fitness gym',
  'Fight Camp':   'boxing sparring fight training',
  'Weight Cut':   'martial arts athlete running discipline',
  'AI Sessions':  'mma coach training professional',
  'Problem':      'boxing training coach athlete',
  'Frustration':  'martial arts training exhausted athlete',
  'Social Proof': 'martial arts champion victory',
  'Direct Offer': 'boxing gym dark professional',
};

// ── Mixkit curated combat-sports clips ───────────────────────────
const MIXKIT_CLIPS = {
  Readiness:      ['https://assets.mixkit.co/videos/preview/mixkit-boxer-training-on-a-punching-bag-4487-large.mp4'],
  'Fight Camp':   ['https://assets.mixkit.co/videos/preview/mixkit-two-fighters-training-in-the-ring-4493-large.mp4'],
  'Weight Cut':   ['https://assets.mixkit.co/videos/preview/mixkit-man-training-in-the-gym-4488-large.mp4'],
  'AI Sessions':  ['https://assets.mixkit.co/videos/preview/mixkit-boxing-coach-giving-instructions-4491-large.mp4'],
  'Problem':      ['https://assets.mixkit.co/videos/preview/mixkit-boxer-training-in-the-gym-23212-large.mp4'],
  'Social Proof': ['https://assets.mixkit.co/videos/preview/mixkit-two-fighters-training-in-the-ring-4493-large.mp4'],
  'Direct Offer': ['https://assets.mixkit.co/videos/preview/mixkit-boxing-coach-giving-instructions-4491-large.mp4'],
};

function pillarKey(pillar) {
  return Object.keys(PILLAR_AI_PROMPTS).find(k => pillar.includes(k)) || 'Readiness';
}

// ── HTTP helpers ──────────────────────────────────────────────────

function downloadFile(url, dest, headers = {}) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) return resolve(dest);
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    const opts = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': `https://${parsed.hostname}/`,
        ...headers,
      },
      timeout: 30000,
    };
    lib.get(opts, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest, headers).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => resolve(dest));
      stream.on('error', reject);
    }).on('error', reject).on('timeout', () => reject(new Error('Download timeout')));
  });
}

function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const opts = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: { 'User-Agent': 'strikepane/1.0', ...headers },
      timeout: 15000,
    };
    https.get(opts, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location, headers).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve(data));
    }).on('error', reject).on('timeout', () => reject(new Error('Request timeout')));
  });
}

// ── Gemini image generation — free tier (daily quota resets at midnight PT) ──
// Models tried in order: highest quality first, fallback on 429
const GEMINI_IMAGE_MODELS = [
  'nano-banana-pro-preview',   // Nano Banana Pro — best quality, free tier
  'gemini-3-pro-image',        // Gemini 3 Pro Image — high quality
  'gemini-3.1-flash-image',    // Gemini 3.1 Flash Image
  'gemini-2.5-flash-image',    // Gemini 2.5 Flash Image — last resort
];

async function callGeminiImage(model, prompt, apiKey) {
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
  });
  return new Promise((resolve, reject) => {
    const req = require('https').request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/${model}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function fetchGeminiImage(pillar) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const key = pillarKey(pillar);
  const prompt = PILLAR_AI_PROMPTS[key];
  if (!prompt) return null;

  const dateKey = new Date().toISOString().slice(0, 10);
  const slug = `gemini-${key.replace(/\W+/g, '_')}-${dateKey}`;
  const dest = path.join(CACHE_DIR, `${slug}.png`);
  if (fs.existsSync(dest)) { console.log(`  Gemini cache hit: ${path.basename(dest)}`); return dest; }

  console.log(`  Generating Gemini image for: ${key}`);
  for (const model of GEMINI_IMAGE_MODELS) {
    try {
      const json = await callGeminiImage(model, prompt, apiKey);
      if (json?.error) {
        if (json.error.code === 429) {
          console.warn(`  ${model} quota exceeded — trying next model`);
          continue;
        }
        console.warn(`  ${model} error:`, json.error.message?.slice(0, 100));
        continue;
      }
      const parts = json?.candidates?.[0]?.content?.parts || [];
      const imgPart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));
      if (!imgPart) { console.warn(`  ${model} returned no image`); continue; }
      fs.writeFileSync(dest, Buffer.from(imgPart.inlineData.data, 'base64'));
      console.log(`  Gemini image saved via ${model}: ${path.basename(dest)}`);
      return dest;
    } catch (e) {
      console.warn(`  ${model} failed:`, e.message);
    }
  }
  console.warn('  All Gemini models exhausted — falling back to Pexels');
  return null;
}

// ── Pexels ────────────────────────────────────────────────────────

async function fetchPexelsPhoto(pillar) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return null;
  const query = PILLAR_PEXELS[pillarKey(pillar)] || 'boxing training gym';
  try {
    const raw = await httpGet(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10&orientation=square`,
      { Authorization: key }
    );
    const json = JSON.parse(raw);
    // Pick a photo that rotates daily
    const photos = json.photos || [];
    if (!photos.length) return null;
    const photo = photos[new Date().getDate() % photos.length];
    const imgUrl = photo.src.large2x || photo.src.large;
    const dest = path.join(CACHE_DIR, `pexels-${photo.id}.jpg`);
    return await downloadFile(imgUrl, dest);
  } catch (e) {
    console.warn('  Pexels photo failed:', e.message);
    return null;
  }
}

async function fetchPexelsVideo(pillar) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return null;
  const query = PILLAR_PEXELS[pillarKey(pillar)] || 'boxing training';
  try {
    const raw = await httpGet(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5&orientation=portrait&min_duration=5&max_duration=30`,
      { Authorization: key }
    );
    const json = JSON.parse(raw);
    const video = json.videos?.[0];
    if (!video) return null;
    const files = (video.video_files || []).sort((a, b) => (b.width || 0) - (a.width || 0));
    const file = files.find(f => f.width <= 1920) || files[0];
    if (!file?.link) return null;
    const dest = path.join(CACHE_DIR, `pexels-vid-${video.id}.mp4`);
    return await downloadFile(file.link, dest);
  } catch (e) {
    console.warn('  Pexels video failed:', e.message);
    return null;
  }
}

// ── Pixabay ───────────────────────────────────────────────────────

async function fetchPixabayPhoto(pillar) {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return null;
  const query = PILLAR_PIXABAY[pillarKey(pillar)] || 'boxing gym training';
  try {
    const raw = await httpGet(
      `https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&category=sports&per_page=10&safesearch=true`
    );
    const json = JSON.parse(raw);
    const hits = json.hits || [];
    if (!hits.length) return null;
    const hit = hits[new Date().getDate() % hits.length];
    const dest = path.join(CACHE_DIR, `pixabay-${hit.id}.jpg`);
    return await downloadFile(hit.largeImageURL || hit.webformatURL, dest);
  } catch (e) {
    console.warn('  Pixabay photo failed:', e.message);
    return null;
  }
}

async function fetchPixabayVideo(pillar) {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return null;
  const query = PILLAR_PIXABAY[pillarKey(pillar)] || 'boxing training';
  try {
    const raw = await httpGet(
      `https://pixabay.com/api/videos/?key=${key}&q=${encodeURIComponent(query)}&per_page=5&safesearch=true`
    );
    const json = JSON.parse(raw);
    const hit = json.hits?.[0];
    if (!hit) return null;
    const videoUrl = hit.videos?.large?.url || hit.videos?.medium?.url;
    if (!videoUrl) return null;
    const dest = path.join(CACHE_DIR, `pixabay-vid-${hit.id}.mp4`);
    return await downloadFile(videoUrl, dest);
  } catch (e) {
    console.warn('  Pixabay video failed:', e.message);
    return null;
  }
}

// ── Mixkit ────────────────────────────────────────────────────────

async function fetchMixkitVideo(pillar) {
  const key = pillarKey(pillar);
  const clips = MIXKIT_CLIPS[key] || MIXKIT_CLIPS['Readiness'];
  const url = clips[new Date().getDate() % clips.length];
  const slug = url.split('/').pop().replace('.mp4', '');
  const dest = path.join(CACHE_DIR, `mixkit-${slug}.mp4`);
  try {
    return await downloadFile(url, dest);
  } catch (e) {
    console.warn('  Mixkit failed:', e.message);
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────

/**
 * Returns a local path to a background photo for carousel slides.
 * Priority: Pexels (real cinematic photos) → Pixabay → Gemini (if billing enabled)
 */
async function getBackgroundPhoto(pillar) {
  const result =
    await fetchGeminiImage(pillar) ||
    await fetchPexelsPhoto(pillar) ||
    await fetchPixabayPhoto(pillar);

  if (result) console.log(`  Photo ready: ${path.basename(result)}`);
  else console.warn('  No photo available — using brand bg');
  return result;
}

/**
 * Returns a local path to a video clip.
 * Priority: Pexels → Pixabay → Mixkit (always available)
 */
async function getVideoClip(pillar) {
  console.log(`  Fetching video clip for: ${pillarKey(pillar)}`);
  const result =
    await fetchPexelsVideo(pillar) ||
    await fetchPixabayVideo(pillar) ||
    await fetchMixkitVideo(pillar);

  if (result) console.log(`  Video ready: ${path.basename(result)}`);
  else console.warn('  No video available');
  return result;
}

module.exports = { getBackgroundPhoto, getVideoClip };
