require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Zernio } = require('@zernio/node');

let _client = null;
function client() {
  if (!_client) {
    if (!process.env.ZERNIO_API_KEY) throw new Error('ZERNIO_API_KEY not set in .env');
    _client = new Zernio({ apiKey: process.env.ZERNIO_API_KEY });
  }
  return _client;
}

// List all connected social accounts
async function listAccounts() {
  const { accounts } = await client().accounts.listAccounts();
  return accounts;
}

// Get the Instagram account ID (needed for posting)
async function getInstagramAccountId() {
  const accounts = await listAccounts();
  const ig = accounts.find(a => a.platform === 'instagram');
  if (!ig) throw new Error('No Instagram account connected in Zernio. Go to zernio.com/dashboard/connections');
  return ig._id;
}

// Post immediately to Instagram
async function createPost({ content, mediaUrls = [], accountId = null }) {
  const igId = accountId || await getInstagramAccountId();
  const { post } = await client().posts.createPost({
    content,
    publishNow: true,
    platforms: [{ platform: 'instagram', accountId: igId }],
    ...(mediaUrls.length > 0 ? { media: mediaUrls } : {}),
  });
  return post;
}

// Schedule a post at a specific time
async function schedulePost({ content, scheduledFor, timezone = 'America/New_York', mediaUrls = [], accountId = null }) {
  const igId = accountId || await getInstagramAccountId();
  const { post } = await client().posts.createPost({
    content,
    scheduledFor,
    timezone,
    platforms: [{ platform: 'instagram', accountId: igId }],
    ...(mediaUrls.length > 0 ? { media: mediaUrls } : {}),
  });
  return post;
}

// Save as draft
async function createDraft({ content, accountId = null }) {
  const igId = accountId || await getInstagramAccountId();
  const { post } = await client().posts.createPost({
    content,
    platforms: [{ platform: 'instagram', accountId: igId }],
  });
  return post;
}

// List scheduled/published posts
async function getPosts() {
  return client().posts.listPosts();
}

// Get analytics (if available on plan)
async function getAnalytics() {
  try {
    return await client().analytics?.getAnalytics?.() || null;
  } catch {
    return null;
  }
}

module.exports = {
  listAccounts,
  getInstagramAccountId,
  createPost,
  schedulePost,
  createDraft,
  getPosts,
  getAnalytics,
};
