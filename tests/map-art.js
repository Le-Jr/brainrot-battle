// Verify the shipped map assets, compositing and the missing-art fallback.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { T, main, createCanvas } from './harness.js';
import { artImage } from '../src/game/stages/art.js';
import { drawMapSaturn } from '../src/game/world/saturn.js';
import { LOC } from '../src/game/world/map.js';

const map = artImage('map', 'map');
const saturn = artImage('map', 'saturn');
assert.ok(map && saturn, 'both production assets must load through the manifest');
assert.equal(map.width, 1280);
assert.equal(map.height, 720);
assert.equal(saturn.width, 256);
assert.equal(saturn.height, 192);
const c = createCanvas(160, 120),
  g = c.getContext('2d');
function paint(image, t) {
  g.clearRect(0, 0, c.width, c.height);
  drawMapSaturn(g, 80, 60, t, image);
  const data = g.getImageData(0, 0, c.width, c.height).data;
  let opaque = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (!data[i]) continue;
    opaque++;
    const x = ((i - 3) / 4) % c.width,
      y = Math.floor((i - 3) / 4 / c.width);
    assert.ok(x > 45 && x < 115 && y > 25 && y < 85, 'transparent silhouette stays inside the emblem bounds');
  }
  assert.ok(opaque > 150, 'the icon must be visible');
  return crypto.createHash('sha256').update(data).digest('hex');
}
assert.notEqual(paint(saturn, 0), paint(saturn, 40), 'authored icon must animate');
assert.notEqual(paint(null, 0), paint(null, 40), 'fallback must render and animate without the asset');
const cg = main.getContext('2d');
T.S.p1 = 0;
T.S.ladder = [4, 1, 2, 3, 5, 6, 7];
for (let destination = 0; destination < LOC.length; destination++) {
  const scene = T.Travel(0, destination, () => {});
  T.S.li = destination === 9 ? 7 : 2;
  for (const t of [0, 100, 220]) {
    scene.t = t;
    cg.setTransform(2, 0, 0, 2, 0, 0);
    scene.draw();
  }
  assert.ok(LOC[destination].x > 0 && LOC[destination].x < 320);
  assert.ok(LOC[destination].y >= 30 && LOC[destination].y < 145);
}
console.log('ALL OK: HD world map, transparent Saturnita, animated fallback and 11 destinations');
