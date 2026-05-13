import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname  = fileURLToPath(new URL('.', import.meta.url));
const root       = path.join(__dirname, '..');
const entryPoint = path.join(root, 'remotion', 'trailer-root.jsx');
const outputFile = path.join(root, 'marketing', 'trailer.mp4');
const publicDir  = path.join(root, 'public');

async function render() {
  console.log('📦  Bundling...');
  const serveUrl = await bundle({ entryPoint, publicDir, webpackOverride: (c) => c });

  console.log('🎬  Loading composition...');
  const composition = await selectComposition({ serveUrl, id: 'Trailer', inputProps: {} });

  const secs = (composition.durationInFrames / composition.fps).toFixed(0);
  console.log(`⚙️   Rendering ${composition.durationInFrames} frames @ ${composition.fps}fps (${secs}s)...\n`);

  await renderMedia({
    composition, serveUrl, codec: 'h264', outputLocation: outputFile,
    onProgress: ({ progress, renderedFrames, encodedFrames }) => {
      const pct = (progress * 100).toFixed(0).padStart(3);
      process.stdout.write(`\r   rendered ${String(renderedFrames).padStart(4)} / encoded ${String(encodedFrames).padStart(4)}  [${pct}%]`);
    },
  });

  console.log(`\n\n✅  Saved → marketing/trailer.mp4`);
}

render().catch(err => {
  console.error('\n❌  Render failed:', err.message);
  process.exit(1);
});
