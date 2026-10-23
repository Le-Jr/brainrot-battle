import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const t0 = Date.now();
const { T, main, createCanvas } = await import('./harness.js');
console.log('boot ms', Date.now() - t0);
const g = main.getContext('2d');
g.setTransform(2, 0, 0, 2, 0, 0);
const out = createCanvas(1280, 360 * 7),
  o = out.getContext('2d');
const ST = T.STG();
ST.forEach((st, i) => {
  const F = new T.Fight(T.CH[i % 9 === 8 ? 0 : i % 8], T.CH[(i + 3) % 8], i, { cpu: true, lvl: 1 });
  F.ai[0] = new T.AI(1);
  F.tick = 120;
  for (let k = 0; k < 150; k++) F.update();
  F.draw();
  o.drawImage(main, (i % 2) * 640, Math.floor(i / 2) * 360);
});
fs.writeFileSync(path.join(DIR, 'out-stages.png'), out.toBuffer('image/png'));
console.log('ok');
