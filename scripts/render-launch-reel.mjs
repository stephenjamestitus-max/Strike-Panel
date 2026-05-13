import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname  = fileURLToPath(new URL('.', import.meta.url));
const root       = path.join(__dirname, '..');
const entryPoint = path.join(root, 'remotion', 'cinematic-root.jsx');
const outputFile = path.join(root, 'marketing', 'launch-reel.mp4');
const publicDir  = path.join(root, 'public');

async function render() {
  console.log('📦  Bundling composition...');
  const serveUrl = await bundle({
    entryPoint,
    publicDir,
    webpackOverride: (config) => config,
  });

  console.log('🎬  Loading composition...');
  const composition = await selectComposition({
    serveUrl,
    id: 'CinematicAd',
    inputProps: {},
  });

  const totalFrames = composition.durationInFrames;
  const totalSec    = (totalFrames / composition.fps).toFixed(0);
  console.log(`⚙️   Rendering ${totalFrames} frames @ ${composition.fps}fps (${totalSec}s)...\n`);

  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation: outputFile,
    onProgress: ({ progress, renderedFrames, encodedFrames }) => {
      const pct = (progress * 100).toFixed(0).padStart(3);
      process.stdout.write(
        `\r   rendered ${String(renderedFrames).padStart(3)} / encoded ${String(encodedFrames).padStart(3)}  [${pct}%]`
      );
    },
  });

  console.log(`\n\n✅  Saved → marketing/launch-reel.mp4`);
}

render().catch((err) => {
  console.error('\n❌  Render failed:', err.message);
  process.exit(1);
});
