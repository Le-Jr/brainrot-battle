// Regression net: hashes every sprite pose and seeded CPU-vs-CPU fights on all 13 stages, then compares
// them with tests/snapshots.json. An intended visual or gameplay change is accepted with:
//   node tests/visual-snapshot.js --update
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';

// Text depends on the fonts installed on each machine, so it is left out of the hashes
// (cutscene text has its own test in check-texts.js). Must happen before the stages are painted.
Object.getPrototypeOf(createCanvas(1, 1).getContext('2d')).fillText = () => {};
const { T, main } = await import('./harness.js');

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'snapshots.json');
const hash = (buf) => crypto.createHash('md5').update(Buffer.from(buf)).digest('hex').slice(0, 12);
const g = main.getContext('2d');
const result = {};

// Every character x pose x frame x attack phase
const POSES = ['idle', 'walk', 'crouch', 'cblock', 'block', 'punch', 'cpunch', 'kick', 'ckick', 'jump'];
POSES.push('jpunch', 'jkick', 'special', 'hit', 'fall', 'down', 'win');
for (const c of [...T.CH, T.BOSS]) {
  const parts = [];
  for (const p of POSES)
    for (let f = 0; f < 8; f++)
      for (const a of [0, 0.5, 1]) {
        const im = T.sprite(c, p, f, a, false, '');
        parts.push(hash(im.getContext('2d').getImageData(0, 0, im.width, im.height).data));
      }
  result['sprite:' + c.id] = hash(parts.join());
}

// Seeded fights: same randomness every run, so frames and health must match exactly
let seed = 7;
Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
T.STG().forEach((st, i) => {
  const F = new T.Fight(T.CH[i % 8], T.CH[(i + 3) % 8], i, { cpu: true, lvl: 2, quiet: true });
  F.ai[0] = new T.AI(2);
  const frames = [];
  for (let k = 0; k < 900; k++) {
    F.update();
    if (k % 60 === 0) {
      g.setTransform(2, 0, 0, 2, 0, 0);
      F.draw();
      frames.push(hash(g.getImageData(0, 0, 640, 360).data));
    }
  }
  result[`stage:${i}:${st.name}`] = `${F.f.map((f) => Math.round(f.hp)).join('/')} ${hash(frames.join())}`;
});

if (process.argv.includes('--update') || !fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, JSON.stringify(result, null, 2) + '\n');
  console.log('snapshots written:', Object.keys(result).length);
} else {
  const saved = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const diff = Object.keys({ ...saved, ...result }).filter((k) => saved[k] !== result[k]);
  for (const k of diff) console.log('CHANGED', k, saved[k], '->', result[k]);
  console.log(
    diff.length ? `${diff.length} snapshot(s) changed` : `ALL OK (${Object.keys(result).length} snapshots)`,
  );
  if (diff.length) process.exitCode = 1;
}
