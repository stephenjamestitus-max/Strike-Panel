import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const OUT = path.join(__dirname, '..', 'public', 'footage');

const CLIPS = [
  {
    name: 'boxer.mp4',
    // Pexels video 4761428 - boxer training
    urls: [
      'https://videos.pexels.com/video-files/4761428/4761428-hd_1280_720_25fps.mp4',
      'https://videos.pexels.com/video-files/4761428/4761428-sd_960_506_25fps.mp4',
      'https://www.mixkit.co/free-preview/5189/5189-720p.mp4',
    ],
  },
  {
    name: 'sparring.mp4',
    urls: [
      'https://videos.pexels.com/video-files/6765180/6765180-hd_1280_720_30fps.mp4',
      'https://videos.pexels.com/video-files/6765180/6765180-sd_960_506_30fps.mp4',
      'https://www.mixkit.co/free-preview/39578/39578-720p.mp4',
    ],
  },
  {
    name: 'training.mp4',
    urls: [
      'https://videos.pexels.com/video-files/5319895/5319895-hd_1280_720_25fps.mp4',
      'https://videos.pexels.com/video-files/5319895/5319895-sd_960_506_25fps.mp4',
      'https://www.mixkit.co/free-preview/31/31-720p.mp4',
    ],
  },
  {
    name: 'crowd.mp4',
    urls: [
      'https://videos.pexels.com/video-files/5319777/5319777-hd_1280_720_25fps.mp4',
      'https://videos.pexels.com/video-files/5319777/5319777-sd_960_506_25fps.mp4',
      'https://www.mixkit.co/free-preview/25/25-720p.mp4',
    ],
  },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const total = parseInt(res.headers['content-length'] || '0', 10);
      let received = 0;
      res.on('data', (chunk) => {
        received += chunk.length;
        if (total > 0) {
          const pct = ((received / total) * 100).toFixed(0).padStart(3);
          process.stdout.write(`\r   ${pct}% (${(received / 1e6).toFixed(1)}MB)`);
        }
      });
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', (err) => { file.close(); try { fs.unlinkSync(dest); } catch (_) {} reject(err); });
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function fetchClip(clip) {
  const dest = path.join(OUT, clip.name);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 100_000) {
    console.log(`  ✓ ${clip.name} already exists, skipping`);
    return true;
  }
  for (const url of clip.urls) {
    try {
      process.stdout.write(`  Trying ${new URL(url).hostname}/${clip.name}...`);
      await download(url, dest);
      const size = fs.statSync(dest).size;
      if (size < 50_000) { fs.unlinkSync(dest); throw new Error('file too small'); }
      console.log(`\n  ✅ ${clip.name} (${(size / 1e6).toFixed(1)}MB)`);
      return true;
    } catch (err) {
      console.log(`\n     ✗ ${err.message}`);
      try { fs.unlinkSync(dest); } catch (_) {}
    }
  }
  console.log(`  ⚠️  ${clip.name} — all sources failed, will use CSS fallback`);
  return false;
}

console.log('📥  Downloading stock footage...\n');
for (const clip of CLIPS) {
  console.log(`\n→ ${clip.name}`);
  await fetchClip(clip);
}
console.log('\n\n✅  Done. Videos saved to public/footage/');
