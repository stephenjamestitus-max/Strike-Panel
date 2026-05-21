/**
 * Free media fetcher for StrikePanel carousel visuals.
 * Sources (in priority order):
 *   1. Pexels   — photos + videos (PEXELS_API_KEY in .env, free at pexels.com/api)
 *   2. Pixabay  — photos + videos (PIXABAY_API_KEY in .env, free at pixabay.com/api/docs)
 *   3. Mixkit   — curated combat-sports video clips (no key, always works)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const https = require('https');
const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '../../marketing/media-cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

// ── Pillar → search keywords ──────────────────────────────────────
const PILLAR_QUERIES = {
  Readiness:           { photo: 'boxer training morning warmup athlete',   video: 'boxer warming up training gym' },
  'Fight Camp':        { photo: 'boxing fight camp sparring intense',       video: 'boxing sparring training camp' },
  'Weight Cut':        { photo: 'boxer weigh in scale discipline',          video: 'boxer weigh in weight cut' },
  'AI Sessions':       { photo: 'coach athlete data analysis training',     video: 'sports coach coaching athlete' },
  'Problem':          { photo: 'coach frustrated exhausted athlete training', video: 'combat sports coach training team' },
  'Frustration':      { photo: 'coach exhausted overworked planning',       video: 'boxing coach training team hard work' },
  'Social Proof':     { photo: 'boxing coach victory celebration win',      video: 'boxing champion victory celebration' },
  'Direct Offer':     { photo: 'boxing gym coach professional dashboard',   video: 'professional boxing training gym' },
};

function pillarKey(pillar) {
  return Object.keys(PILLAR_QUERIES).find(k => pillar.includes(k)) || 'Readiness';
}

// ── Mixkit curated combat-sports clips (CDN direct links, no key) ─
// Preview MP4s are ~5-10 seconds, 720p. Full downloads require free account.
const MIXKIT_CLIPS = {
  Readiness: [
    'https://assets.mixkit.co/videos/preview/mixkit-a-boxer-warming-up-hitting-a-punching-bag-40763-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-boxer-training-on-a-punching-bag-4487-large.mp4',
  ],
  'Fight Camp': [
    'https://assets.mixkit.co/videos/preview/mixkit-two-fighters-training-in-the-ring-4493-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-training-with-a-boxing-partner-40764-large.mp4',
  ],
  'Weight Cut': [
    'https://assets.mixkit.co/videos/preview/mixkit-boxer-on-a-scale-before-a-fight-40765-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-man-in-a-black-shirt-standing-on-a-scale-43700-large.mp4',
  ],
  'AI Sessions': [
    'https://assets.mixkit.co/videos/preview/mixkit-boxing-coach-giving-instructions-4491-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-a-coach-training-a-boxer-40762-large.mp4',
  ],
  'Problem': [
    'https://assets.mixkit.co/videos/preview/mixkit-boxer-training-in-the-gym-23212-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-intense-boxing-training-session-4490-large.mp4',
  ],
  'Social Proof': [
    'https://assets.mixkit.co/videos/preview/mixkit-boxer-celebrating-a-victory-in-the-ring-40761-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-winner-boxing-in-the-ring-4494-large.mp4',
  ],
  'Direct Offer': [
    'https://assets.mixkit.co/videos/preview/mixkit-professional-boxing-gym-training-session-4492-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-boxing-coach-giving-instructions-4491-large.mp4',
  ],
};

// ── HTTP helpers ──────────────────────────────────────────────────

function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const opts = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: { 'User-Agent': 'StrikePanel/1.0', ...headers },
    };
    https.get(opts, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location, headers).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function downloadFile(url, dest, headers = {}) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) return resolve(dest);
    const parsed = new URL(url);
    const opts = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': `https://${parsed.hostname}/`,
        ...headers,
      },
    };
    https.get(opts, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest, headers).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => resolve(dest));
      stream.on('error', reject);
    }).on('error', reject);
  });
}

// ── Pexels ────────────────────────────────────────────────────────

async function fetchPexelsPhoto(query) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return null;
  try {
    const raw = await httpGet(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=square`,
      { Authorization: key }
    );
    const json = JSON.parse(raw);
    const photo = json.photos?.[0];
    if (!photo) return null;
    const imgUrl = photo.src.large2x || photo.src.large;
    const slug = photo.id;
    const dest = path.join(CACHE_DIR, `pexels-${slug}.jpg`);
    return await downloadFile(imgUrl, dest);
  } catch (e) {
    console.warn('  Pexels photo failed:', e.message);
    return null;
  }
}

async function fetchPexelsVideo(query) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return null;
  try {
    const raw = await httpGet(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5&orientation=portrait&min_duration=5&max_duration=30`,
      { Authorization: key }
    );
    const json = JSON.parse(raw);
    const video = json.videos?.[0];
    if (!video) return null;
    // Prefer HD file, fallback to SD
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

async function fetchPixabayPhoto(query) {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return null;
  try {
    const raw = await httpGet(
      `https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&category=sports&per_page=5&safesearch=true`
    );
    const json = JSON.parse(raw);
    const hit = json.hits?.[0];
    if (!hit) return null;
    const imgUrl = hit.largeImageURL || hit.webformatURL;
    const dest = path.join(CACHE_DIR, `pixabay-${hit.id}.jpg`);
    return await downloadFile(imgUrl, dest);
  } catch (e) {
    console.warn('  Pixabay photo failed:', e.message);
    return null;
  }
}

async function fetchPixabayVideo(query) {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return null;
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

// ── Mixkit (no API key needed) ────────────────────────────────────

async function fetchMixkitVideo(pillar) {
  const key = pillarKey(pillar);
  const clips = MIXKIT_CLIPS[key] || MIXKIT_CLIPS['Readiness'];
  // Rotate by day so we don't always grab the same clip
  const dayIndex = new Date().getDate() % clips.length;
  const url = clips[dayIndex];
  const slug = url.split('/').pop().replace('.mp4', '');
  const dest = path.join(CACHE_DIR, `mixkit-${slug}.mp4`);
  try {
    return await downloadFile(url, dest);
  } catch (e) {
    console.warn('  Mixkit download failed:', e.message);
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────

/**
 * Returns a local path to a background photo for carousel slides.
 * Tries Pexels → Pixabay → null (caller falls back to solid bg).
 */
async function getBackgroundPhoto(pillar) {
  const key = pillarKey(pillar);
  const q = PILLAR_QUERIES[key]?.photo || 'boxing training gym athlete';
  console.log(`  Fetching background photo: "${q}"`);

  const result = await fetchPexelsPhoto(q) || await fetchPixabayPhoto(q);
  if (result) console.log(`  Photo: ${path.basename(result)}`);
  else console.warn('  No photo available — using brand bg');
  return result;
}

/**
 * Returns a local path to a video clip for the cover slide or video post.
 * Tries Pexels → Pixabay → Mixkit (always available).
 */
async function getVideoClip(pillar) {
  const key = pillarKey(pillar);
  const q = PILLAR_QUERIES[key]?.video || 'boxing training';
  console.log(`  Fetching video clip: "${q}"`);

  const result =
    await fetchPexelsVideo(q) ||
    await fetchPixabayVideo(q) ||
    await fetchMixkitVideo(pillar);

  if (result) console.log(`  Video: ${path.basename(result)}`);
  else console.warn('  No video available');
  return result;
}

module.exports = { getBackgroundPhoto, getVideoClip };
