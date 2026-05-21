/**
 * Free media fetcher for StrikePanel carousel visuals.
 * Sources (in priority order):
 *   1. Pollinations.ai — AI-generated combat sports imagery (FREE, no key, Flux model)
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

// ── Per-pillar AI image prompts (Pollinations / Flux) ─────────────
// Style: cinematic, dark, moody, dramatic sports photography — matches brand
const BASE_STYLE = 'cinematic sports photography, dramatic moody lighting, dark atmosphere, high contrast, professional, no text, no watermarks';

const PILLAR_AI_PROMPTS = {
  Readiness: `boxing coach studying athlete readiness data early morning gym, coach reviewing clipboard scores, focused determined expression, ${BASE_STYLE}`,
  'Fight Camp': `two combat sports athletes sparring intensely in boxing ring, fight camp training, sweat, focus, coaches watching, ${BASE_STYLE}`,
  'Weight Cut': `boxer cutting weight, athlete in sauna suit running with discipline and intensity, shadows, sweat, sacrifice, ${BASE_STYLE}`,
  'AI Sessions': `combat sports coach using tablet analyzing athlete performance data in a dark professional gym, modern coaching technology, ${BASE_STYLE}`,
  'Problem': `boxing coach looking frustrated at messy spreadsheets and notes on clipboard, overworked, chaotic training room background, ${BASE_STYLE}`,
  'Frustration': `boxing coach holding head in hands surrounded by whiteboards and scattered notes, overwhelmed, dark gym, ${BASE_STYLE}`,
  'Social Proof': `boxing coach and athlete celebrating after a fight victory, proud coach moment, training paid off, raw emotion, ${BASE_STYLE}`,
  'Direct Offer': `empty professional boxing gym at night, heavy bags hanging, ring in background, dramatic single spotlight, minimalist powerful, ${BASE_STYLE}`,
};

// ── Pexels queries — combat sports specific, no generic sports ────
const PILLAR_PEXELS = {
  Readiness:      'boxing athlete training warm up gym',
  'Fight Camp':   'boxing sparring fighters ring training',
  'Weight Cut':   'boxer running weight training discipline',
  'AI Sessions':  'boxing coach trainer athlete gym professional',
  'Problem':      'boxing coach training team frustrated',
  'Frustration':  'boxer training exhausted overworked gym',
  'Social Proof': 'boxing victory fighter champion celebration',
  'Direct Offer': 'professional boxing gym ring equipment dark',
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
      headers: { 'User-Agent': 'StrikePanel/1.0', ...headers },
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

// ── Pollinations.ai — free AI image generation ────────────────────

async function fetchPollinationsImage(pillar) {
  const key = pillarKey(pillar);
  const prompt = PILLAR_AI_PROMPTS[key];

  // Use day-of-month as seed so same day always gets same image, but varies daily
  const seed = new Date().getDate() + new Date().getMonth() * 31;
  const encodedPrompt = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1080&seed=${seed}&model=flux&nologo=true&enhance=true`;

  const slug = `pollinations-${key.replace(/\W+/g, '_')}-${seed}`;
  const dest = path.join(CACHE_DIR, `${slug}.jpg`);

  console.log(`  Generating AI image for: ${key}`);
  for (let attempt = 1; attempt <= 3; attempt++) {
    const s = seed + (attempt - 1) * 7;
    const attemptUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1080&seed=${s}&model=flux&nologo=true&enhance=true`;
    const attemptDest = path.join(CACHE_DIR, `pollinations-${key.replace(/\W+/g, '_')}-${s}.jpg`);
    try {
      return await downloadFile(attemptUrl, attemptDest);
    } catch (e) {
      if (fs.existsSync(attemptDest)) fs.unlinkSync(attemptDest);
      if (attempt < 3) {
        console.warn(`  Pollinations attempt ${attempt} failed, retrying...`);
        await new Promise(r => setTimeout(r, 2000 * attempt));
      } else {
        console.warn('  Pollinations failed — falling back to Pexels');
      }
    }
  }
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
 * Priority: Pollinations AI (on-brand generated) → Pexels → Pixabay
 */
async function getBackgroundPhoto(pillar) {
  const result =
    await fetchPollinationsImage(pillar) ||
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
