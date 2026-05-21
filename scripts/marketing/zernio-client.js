const API_KEY = process.env.ZERNIO_API_KEY;

const BASES = [
  'https://api.zernio.com/v1',
  'https://zernio.com/api/v1',
  'https://zernio.com/api',
];

async function request(path, method = 'GET', body = null) {
  if (!API_KEY) throw new Error('ZERNIO_API_KEY not set');

  for (const base of BASES) {
    try {
      const opts = {
        method,
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json',
        },
      };
      if (body) opts.body = JSON.stringify(body);

      const res = await fetch(`${base}${path}`, opts);
      const text = await res.text();

      if (res.ok) {
        try { return JSON.parse(text); } catch { return text; }
      }

      if (res.status === 401) throw new Error('Invalid API key');
      if (res.status === 404) continue; // try next base
      throw new Error(`Zernio API ${res.status}: ${text}`);
    } catch (e) {
      if (e.message.includes('Invalid API key') || e.message.includes('Zernio API')) throw e;
      continue;
    }
  }
  throw new Error('Could not reach Zernio API — check your internet connection');
}

async function getConnections() {
  return request('/connections');
}

async function createPost({ platform = 'instagram', content, mediaUrls = [], scheduleAt = null }) {
  return request('/posts', 'POST', {
    platform,
    content,
    media_urls: mediaUrls,
    schedule_at: scheduleAt,
    status: scheduleAt ? 'scheduled' : 'published',
  });
}

async function schedulePost({ platform = 'instagram', content, mediaUrls = [], scheduleAt }) {
  return createPost({ platform, content, mediaUrls, scheduleAt });
}

async function getAnalytics({ platform = 'instagram', days = 7 }) {
  return request(`/analytics?platform=${platform}&days=${days}`);
}

async function getPosts({ platform = 'instagram', limit = 20 }) {
  return request(`/posts?platform=${platform}&limit=${limit}`);
}

async function searchAccounts({ platform = 'instagram', query, minFollowers = 5000 }) {
  return request(`/search/accounts?platform=${platform}&q=${encodeURIComponent(query)}&min_followers=${minFollowers}`);
}

async function followAccount({ platform = 'instagram', accountId }) {
  return request('/social/follow', 'POST', { platform, account_id: accountId });
}

async function commentOnPost({ platform = 'instagram', postId, comment }) {
  return request('/social/comment', 'POST', { platform, post_id: postId, comment });
}

async function searchPosts({ platform = 'instagram', keywords, minFollowers = 5000 }) {
  return request(`/search/posts?platform=${platform}&keywords=${encodeURIComponent(keywords)}&min_followers=${minFollowers}`);
}

module.exports = {
  getConnections,
  createPost,
  schedulePost,
  getAnalytics,
  getPosts,
  searchAccounts,
  followAccount,
  commentOnPost,
  searchPosts,
};
