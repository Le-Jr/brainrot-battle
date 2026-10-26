/** Preserve cinematic masters and pack both 16-pose fighters. */
import fs from 'node:fs';
import { createCanvas, loadImage } from '@napi-rs/canvas';
fs.mkdirSync('public/stages/finale', { recursive: true });
for (const name of ['storm', 'hero', 'coalition']) {
  const image = await loadImage(`assets/finale-art/${name}.png`);
  const c = createCanvas(1280, 720),
    g = c.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(image, 0, 0, c.width, c.height);
  fs.writeFileSync(`public/stages/finale/${name}.png`, c.toBuffer('image/png'));
}
await import('./process-finale-fighters.js');
