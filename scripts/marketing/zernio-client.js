require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
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
  if (mediaUrls.length > 0) body.media = mediaUrls.map(url => ({ url }));
  const res = await client().posts.createPost(body);
  return res.data?.post || res.data;
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
  const res = await client().posts.createPost(body);
  return res.data?.post || res.data;
}

// Save as draft (no publish date)
async function createDraft({ content }) {
  const res = await client().posts.createPost({
    content,
    platforms: [{ platform: 'instagram', accountId: INSTAGRAM_ACCOUNT_ID }],
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

module.exports = {
  INSTAGRAM_ACCOUNT_ID,
  PROFILE_ID,
  listAccounts,
  createPost,
  schedulePost,
  createDraft,
  listPosts,
  getAnalytics,
};
