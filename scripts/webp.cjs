#!/usr/bin/env node
// Converts an image to WebP next to the original (requires ffmpeg on PATH).
//
//   node scripts/webp.cjs <image.png> [--width 800] [--quality 90]
//
// --width downsizes (never upsizes) while keeping the aspect ratio: use about twice the largest
// size the image is displayed at, so it stays sharp on 2x screens. Quality 90 keeps UI text
// visually identical to the PNG at a fraction of the size. Then point the page at the .webp.
const { execFileSync } = require('child_process');
const fs = require('fs');

function toWebp(input, { width, quality = 90 } = {}) {
  const output = input.replace(/\.(png|jpe?g)$/i, '.webp');
  const filters = width ? ['-vf', `scale='min(${width},iw)':-2:flags=lanczos`] : [];
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', input, ...filters, '-c:v', 'libwebp', '-quality', String(quality), '-compression_level', '6', output]);
  return { output, before: fs.statSync(input).size, after: fs.statSync(output).size };
}
module.exports = { toWebp };

if (require.main === module) {
  const [input, ...rest] = process.argv.slice(2);
  if (!input) { console.error('usage: node scripts/webp.cjs <image> [--width N] [--quality Q]'); process.exit(1); }
  const opt = (name) => { const i = rest.indexOf(`--${name}`); return i >= 0 ? Number(rest[i + 1]) : undefined; };
  const r = toWebp(input, { width: opt('width'), quality: opt('quality') });
  console.log(`${r.output}: ${(r.before / 1024).toFixed(0)} KB -> ${(r.after / 1024).toFixed(0)} KB`);
}
