require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const { Zernio } = require('@zernio/node');

const ACCOUNT_ID = '6a0e0f75520992756d8bcdcf';

const client = new Zernio({ apiKey: process.env.ZERNIO_API_KEY });

async function safe(label, fn) {
  try {
    const res = await fn();
    return res?.data ?? res ?? null;
  } catch (e) {
    console.warn(`${label} failed:`, e.message);
    return { error: e.message };
  }
}

(async () => {
  console.log('Fetching Instagram analytics...');

  const [accounts, followerStats, insights, followerHistory, demographics, posts, bestTime, dailyMetrics] = await Promise.all([
    safe('accounts',        () => client.accounts.listAccounts()),
    safe('followerStats',   () => client.accounts.getFollowerStats({ query: { accountId: ACCOUNT_ID } })),
    safe('insights',        () => client.analytics.getInstagramAccountInsights({ query: { accountId: ACCOUNT_ID } })),
    safe('followerHistory', () => client.analytics.getInstagramFollowerHistory({ query: { accountId: ACCOUNT_ID } })),
    safe('demographics',    () => client.analytics.getInstagramDemographics({ query: { accountId: ACCOUNT_ID } })),
    safe('posts',           () => client.posts.listPosts({ query: { accountId: ACCOUNT_ID } })),
    safe('bestTime',        () => client.analytics.getBestTimeToPost({ query: { accountId: ACCOUNT_ID } })),
    safe('dailyMetrics',    () => client.analytics.getDailyMetrics({ query: { accountId: ACCOUNT_ID } })),
  ]);

  const report = {
    generatedAt: new Date().toISOString(),
    accounts,
    followerStats,
    insights,
    followerHistory,
    demographics,
    posts,
    bestTime,
    dailyMetrics,
  };

  fs.writeFileSync('analytics-report.json', JSON.stringify(report, null, 2));
  console.log('Done — analytics-report.json written.');
})();
