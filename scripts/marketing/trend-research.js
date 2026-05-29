// Fetches trending topics in combat sports coaching for content ideas
const https = require('https');
const fs = require('fs');
const path = require('path');

const SOURCES = [
  {
    name: 'Reddit r/martialarts',
    url: 'https://www.reddit.com/r/martialarts/hot.json?limit=10',
    parse: (data) => data.data.children.map(p => ({
      title: p.data.title,
      score: p.data.score,
      url: `https://reddit.com${p.data.permalink}`,
    })),
  },
  {
    name: 'Reddit r/bjj',
    url: 'https://www.reddit.com/r/bjj/hot.json?limit=10',
    parse: (data) => data.data.children.map(p => ({
      title: p.data.title,
      score: p.data.score,
      url: `https://reddit.com${p.data.permalink}`,
    })),
  },
  {
    name: 'Reddit r/boxing',
    url: 'https://www.reddit.com/r/boxing/hot.json?limit=10',
    parse: (data) => data.data.children.map(p => ({
      title: p.data.title,
      score: p.data.score,
      url: `https://reddit.com${p.data.permalink}`,
    })),
  },
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'strikepane-TrendBot/1.0' },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function fetchTrends() {
  const results = [];

  for (const source of SOURCES) {
    try {
      const data = await fetchJson(source.url);
      const posts = source.parse(data);
      results.push({ source: source.name, posts });
      console.log(`Fetched ${posts.length} posts from ${source.name}`);
    } catch (e) {
      console.warn(`Failed to fetch ${source.name}: ${e.message}`);
    }
  }

  // Extract themes for content ideation
  const allTitles = results.flatMap(r => r.posts.map(p => p.title));
  const themes = extractThemes(allTitles);

  const output = {
    date: new Date().toISOString().split('T')[0],
    sources: results,
    themes,
  };

  const outPath = path.join(__dirname, '../../marketing/trends.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\nTrends saved to ${outPath}`);
  console.log('\nTop themes today:');
  themes.forEach(t => console.log(` - ${t}`));

  return output;
}

function extractThemes(titles) {
  const keywords = [
    'weight cut', 'fight camp', 'training', 'coach', 'conditioning',
    'strength', 'cardio', 'sparring', 'technique', 'injury', 'recovery',
    'diet', 'nutrition', 'mental', 'pressure', 'fight week', 'camp',
    'overtraining', 'readiness', 'performance', 'athlete',
  ];

  const counts = {};
  keywords.forEach(kw => {
    counts[kw] = titles.filter(t => t.toLowerCase().includes(kw)).length;
  });

  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([kw, count]) => `${kw} (${count} posts)`)
    .slice(0, 8);
}

module.exports = { fetchTrends };

if (require.main === module) {
  fetchTrends().catch(console.error);
}
