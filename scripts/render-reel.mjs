import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname  = fileURLToPath(new URL('.', import.meta.url));
const root       = path.join(__dirname, '..');
const entryPoint = path.join(root, 'remotion', 'index.jsx');
const outputFile = path.join(root, 'marketing', 'reel-morning-brief.mp4');

async function render() {
  console.log('📦  Bundling composition...');
  const serveUrl = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  console.log('🎬  Loading composition...');
  const composition = await selectComposition({
    serveUrl,
    id: 'MorningBrief',
    inputProps: {},
  });

  console.log(`⚙️   Rendering ${composition.durationInFrames} frames @ ${composition.fps}fps (${composition.durationInFrames / composition.fps}s)...\n`);

  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation: outputFile,
    onProgress: ({ progress, renderedFrames, encodedFrames }) => {
      const pct = (progress * 100).toFixed(0).padStart(3);
      process.stdout.write(`\r   rendered ${String(renderedFrames).padStart(3)} / encoded ${String(encodedFrames).padStart(3)} frames  [${pct}%]`);
    },
  });

  console.log(`\n\n✅  Saved → marketing/reel-morning-brief.mp4`);
}

render().catch((err) => {
  console.error('\n❌  Render failed:', err.message);
  process.exit(1);
});
