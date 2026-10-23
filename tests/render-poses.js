import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
import { T, main, createCanvas } from './harness.js';
const g = main.getContext('2d');
g.setTransform(1, 0, 0, 1, 0, 0);
const poses = [
  ['idle', 4, 0],
  ['walk', 2, 0],
  ['crouch', 0, 0],
  ['cblock', 0, 0],
  ['cpunch', 0, 1],
  ['ckick', 0, 1],
  ['jump', 0, 0],
  ['jump', 2, 0],
  ['punch', 0, 1],
  ['kick', 0, 1],
  ['fall', 2, 0],
  ['fall', 4, 0],
  ['win', 6, 0],
];
const all = [...T.CH, T.BOSS];
const out = createCanvas(13 * 100, all.length * 110),
  o = out.getContext('2d');
o.fillStyle = '#556';
o.fillRect(0, 0, out.width, out.height);
o.imageSmoothingEnabled = false;
all.forEach((c, r) =>
  poses.forEach(([p, f, a], k) => {
    const im = T.sprite(c, p, f, a, false, '');
    o.drawImage(im, k * 100 + 50 - 64, r * 110 + 105 - 100, 128, 104);
    o.fillStyle = '#0f0';
    o.fillRect(k * 100, r * 110 + 105, 100, 1);
  }),
);
fs.writeFileSync(path.join(DIR, 'out-poses.png'), out.toBuffer('image/png'));
console.log('ok');
