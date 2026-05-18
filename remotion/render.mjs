import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

console.log('Bundling composition...');

const bundled = await bundle({
  entryPoint: path.join(__dirname, 'src/index.tsx'),
  onProgress: (p) => process.stdout.write(`\rBundling: ${p}%   `),
  publicDir: ROOT,
});

console.log('\nSelecting composition...');

const CHROME = '/root/.cache/puppeteer/chrome/linux-147.0.7727.57/chrome-linux64/chrome';

const onBrowserDownload = () => ({
  browserExecutable: CHROME,
});

const composition = await selectComposition({
  serveUrl: bundled,
  id: 'StrikePanelPromo',
  chromiumOptions: { executablePath: CHROME },
  onBrowserDownload,
});

const outPath = path.join(ROOT, 'marketing', 'strikepanel-promo.mp4');

console.log('Rendering video...');

await renderMedia({
  composition,
  serveUrl: bundled,
  codec: 'h264',
  outputLocation: outPath,
  onProgress: ({ progress }) => process.stdout.write(`\rRendering: ${Math.round(progress * 100)}%   `),
  imageFormat: 'jpeg',
  jpegQuality: 90,
  videoBitrate: '4M',
  fps: 30,
  chromiumOptions: { executablePath: CHROME },
  onBrowserDownload,
});

console.log(`\n✓ Video saved to: marketing/strikepanel-promo.mp4`);
