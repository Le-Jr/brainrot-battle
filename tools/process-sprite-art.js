// Generated single-pose images -> consistently sized, anchored game atlases.
// Run: node tools/process-sprite-art.js [character id ...]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { ATLAS_FRAMES } from '../src/game/data/atlas-frames.js';
import { ATLAS_ANIMATIONS } from '../src/game/data/atlas-animations.js';
import { mapLayer, stagePalette } from '../src/game/stages/pixelize.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'assets/sprite-art');
const config = JSON.parse(fs.readFileSync(path.join(SRC, 'prompts.json'), 'utf8'));
// Keep the original 12 pose indices so legacy tooling can still read the atlas.
const order = [
  'idle',
  'win',
  'walk-contact',
  'walk-pass',
  'jump',
  'punch-windup',
  'punch-hit',
  'kick-hit',
  'block',
  'special-release',
  'hit',
  'down',
  'walk-down',
  'walk-up',
  'punch-recover',
  'kick-windup',
  'kick-recover',
  'crouch',
  'special-prep',
];
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(config.characters);
const frames = { ...ATLAS_FRAMES },
  animations = { ...ATLAS_ANIMATIONS };
fs.mkdirSync(path.join(ROOT, 'output/sprite-art'), { recursive: true });

function bounds(g, w, h) {
  const image = g.getImageData(0, 0, w, h),
    d = image.data;
  let left = w,
    top = h,
    right = -1,
    bottom = -1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] < 128) {
        d[i + 3] = 0;
        continue;
      }
      d[i + 3] = 255;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  if (right < left) throw new Error('Empty sprite image');
  g.putImageData(image, 0, 0);
  return [left, top, right - left + 1, bottom - top + 1];
}

for (const id of ids) {
  if (!config.characters[id]) throw new Error('Unknown character: ' + id);
  const missing = order.filter((pose) => !fs.existsSync(path.join(SRC, id, pose + '.png')));
  if (missing.length) throw new Error(`${id}: missing ${missing.join(', ')}`);
  // reference.png is a crop of the original atlas and defines the established game scale.
  const reference = await loadImage(path.join(SRC, id, 'reference.png'));
  const targetH = reference.height,
    targetW = reference.width;
  const sheet = createCanvas(256 * 5, 208 * 4),
    sg = sheet.getContext('2d');
  sg.imageSmoothingEnabled = false;
  const atlas = createCanvas(256 * order.length, 208),
    ag = atlas.getContext('2d');
  ag.imageSmoothingEnabled = false;
  const meta = [];
  for (const [index, pose] of order.entries()) {
    const image = await loadImage(path.join(SRC, id, pose + '.png'));
    const source = createCanvas(image.width, image.height),
      g = source.getContext('2d');
    g.drawImage(image, 0, 0);
    const [x, y, w, h] = bounds(g, source.width, source.height);
    let ratio = 1;
    if (pose === 'win') ratio = 1.18;
    if (['tung', 'assassino'].includes(id) && ['punch-windup', 'special-prep'].includes(pose)) ratio = 1.18;
    if (pose === 'crouch') ratio = ['tralalero', 'bombardiro', 'saturnita'].includes(id) ? 0.82 : 0.68;
    if (pose === 'jump') ratio = 0.9;
    if (pose === 'walk-down') ratio = 0.97;
    if (pose === 'walk-up') ratio = 1.02;
    if (pose === 'kick-windup' || pose === 'kick-recover') ratio = 0.96;
    const attack = /^(punch|kick|special)/.test(pose);
    const maxWidth = attack ? 120 + targetW * 0.5 : 240;
    const scale =
      pose === 'down'
        ? Math.min(Math.max(targetW * 1.2, targetH * 1.3) / w, (targetH * 0.75) / h)
        : Math.min((targetH * ratio) / h, maxWidth / w);
    const widthScale = id === 'bombardiro' && pose === 'kick-hit' ? 1.3 : 1;
    const dw = Math.max(1, Math.round(w * scale * widthScale)),
      dh = Math.max(1, Math.round(h * scale));
    // Attack silhouettes extend forward; keep their body rooted to the idle's rear edge.
    const ax = attack ? Math.min(dw - 8, targetW * 0.5) : dw * 0.5;
    const dx = Math.round(128 - ax),
      dy = 200 - dh;
    ag.drawImage(source, x, y, w, h, index * 256 + dx, dy, dw, dh);
    sg.drawImage(source, x, y, w, h, (index % 5) * 256 + dx, Math.floor(index / 5) * 208 + dy, dw, dh);
    // Uniform cells preserve a fixed foot pivot and avoid jitter between frames.
    meta.push([index * 256, 0, 256, 208, 128, 199]);
  }
  frames[id] = meta;
  animations[id] = Object.fromEntries(order.map((pose, i) => [pose, i]));
  const palette = stagePalette([atlas], 64, 8);
  mapLayer(atlas, palette, { cut: true, outline: 0 });
  mapLayer(sheet, palette, { cut: true, outline: 0 });
  fs.writeFileSync(path.join(ROOT, 'public/atlases', id + '.png'), atlas.toBuffer('image/png'));
  fs.writeFileSync(path.join(ROOT, 'assets/sprite-sheets', id + '.png'), sheet.toBuffer('image/png'));
  const preview = createCanvas(sheet.width, sheet.height + 20),
    pg = preview.getContext('2d');
  pg.fillStyle = '#32283f';
  pg.fillRect(0, 0, preview.width, preview.height);
  pg.drawImage(sheet, 0, 20);
  pg.fillStyle = '#ffffff';
  pg.fillText(id + ': 19 frames', 10, 14);
  fs.writeFileSync(path.join(ROOT, 'output/sprite-art', id + '-sheet.png'), preview.toBuffer('image/png'));
  console.log(id, order.length + ' frames');
}
fs.writeFileSync(
  path.join(ROOT, 'src/game/data/atlas-frames.js'),
  '/* Generated by tools/process-sprite-art.js. Atlas cells: [x,y,w,h,anchorX,anchorY]. */\nconst ATLAS_FRAMES = ' +
    JSON.stringify(frames, null, 2) +
    ';\nexport { ATLAS_FRAMES };\n',
);
fs.writeFileSync(
  path.join(ROOT, 'src/game/data/atlas-animations.js'),
  '/* Generated by tools/process-sprite-art.js. Named animation frames. */\nconst ATLAS_ANIMATIONS = ' +
    JSON.stringify(animations, null, 2) +
    ';\nexport { ATLAS_ANIMATIONS };\n',
);
