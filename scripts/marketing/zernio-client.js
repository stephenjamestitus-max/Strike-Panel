require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const https = require('https');
const fs = require('fs');
const path = require('path');
const { Zernio } = require('@zernio/node');

const INSTAGRAM_ACCOUNT_ID = '6a0e0f75520992756d8bcdcf';
const PROFILE_ID = '6a0dd67d3c136d00b69d9b7e';

let _client = null;
function client() {
  if (!_client) {
    if (!process.env.ZERNIO_API_KEY) throw new Error('ZERNIO_API_KEY not set in .env');
    _client = new Zernio({ apiKey: process.env.ZERNIO_API_KEY });
  }
  return _client;
}

// List all connected accounts
async function listAccounts() {
  const res = await client().accounts.listAccounts();
  return res.data.accounts;
}

// Post immediately to Instagram
async function createPost({ content, mediaUrls = [] }) {
  const body = {
    content,
    publishNow: true,
    platforms: [{ platform: 'instagram', accountId: INSTAGRAM_ACCOUNT_ID }],
  };
  if (mediaUrls.length > 0) {
    // Log URLs so we can debug what's being sent
    console.log('  Media URLs being sent to Zernio:');
    mediaUrls.forEach((u, i) => console.log(`    [${i + 1}] ${u}`));
    // Try both field names the Zernio API might expect
    body.mediaUrls = mediaUrls;
    body.media = mediaUrls.map(url => ({ url, type: 'image' }));
  }
  try {
    const res = await client().posts.createPost({ body });
    return res.data?.post || res.data;
  } catch (e) {
    // Surface the full API error body for debugging
    const detail = e?.response?.data || e?.body || '';
    if (detail) console.error('  Zernio error detail:', JSON.stringify(detail));
    throw e;
  }
}

// Schedule a post at a specific time (ISO string, Dubai = UTC+4)
async function schedulePost({ content, scheduledFor, mediaUrls = [] }) {
  const body = {
    content,
    scheduledFor,
    timezone: 'Asia/Dubai',
    platforms: [{ platform: 'instagram', accountId: INSTAGRAM_ACCOUNT_ID }],
  };
  if (mediaUrls.length > 0) body.media = mediaUrls.map(url => ({ url }));
  const res = await client().posts.createPost({ body });
  return res.data?.post || res.data;
}

// Save as draft (no publish date)
async function createDraft({ content }) {
  const res = await client().posts.createPost({
    body: {
      content,
      platforms: [{ platform: 'instagram', accountId: INSTAGRAM_ACCOUNT_ID }],
    },
  });
  return res.data?.post || res.data;
}

// List recent posts
async function listPosts() {
  const res = await client().posts.listPosts();
  return res.data?.posts || res.data || [];
}

// Get analytics
async function getAnalytics() {
  const res = await client().analytics?.getAnalytics?.({ accountId: INSTAGRAM_ACCOUNT_ID });
  return res?.data || null;
}

// Upload a local image file to ImgBB and return its public URL.
// Requires IMGBB_API_KEY in .env — free at https://api.imgbb.com
async function uploadImage(filePath) {
  const key = process.env.IMGBB_API_KEY;
  if (!key) throw new Error('IMGBB_API_KEY not set in .env');

  const imageData = fs.readFileSync(filePath);
  const base64 = imageData.toString('base64');
  const name = encodeURIComponent(path.basename(filePath, path.extname(filePath)));
  const body = `key=${encodeURIComponent(key)}&name=${name}&image=${encodeURIComponent(base64)}`;

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.imgbb.com',
        path: '/1/upload',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      res => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (!json.success) return reject(new Error(`ImgBB error: ${json.error?.message || data}`));
            const imgUrl = json.data.display_url || json.data.url;
            console.log(`    Uploaded → ${imgUrl}`);
            resolve(imgUrl);
          } catch (e) {
            reject(new Error('ImgBB parse error: ' + data.slice(0, 200)));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Upload multiple local image paths to ImgBB, return array of public URLs.
async function uploadImages(filePaths) {
  const results = [];
  for (const fp of filePaths) {
    const url = await uploadImage(fp);
    results.push(url);
  }
  return results;
}

module.exports = {
  INSTAGRAM_ACCOUNT_ID,
  PROFILE_ID,
  listAccounts,
  createPost,
  schedulePost,
  createDraft,
  listPosts,
  getAnalytics,
  uploadImage,
  uploadImages,
};
