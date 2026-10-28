import assert from 'node:assert/strict';
import { PROJECTILE_ART } from '../src/game/data/projectile-art.js';
import { projectileArtBounds } from '../src/game/sprites/projectile-layout.js';

const sizes = {
  wave: [18, 18],
  bomb: [8, 8],
  boom: [36, 34],
  banana: [12, 12],
  clock: [14, 14],
  ring: [30, 16],
  meteor: [12, 12],
  quake: [20, 14],
};
for (const [type, [w, h]] of Object.entries(sizes)) {
  const p = { type, w, h };
  for (let frame = 0; frame < 3; frame++) {
    const normal = projectileArtBounds(p, PROJECTILE_ART[type], frame);
    assert.deepEqual(
      projectileArtBounds({ ...p, sup: true }, PROJECTILE_ART[type], frame),
      normal,
      `${type}: power alone must not inflate the sprite`,
    );
    const { source, width, height, left, top } = normal;
    assert.ok(
      Math.abs(width / source[2] - height / source[3]) <= 0.5 / Math.min(source[2], source[3]),
      `${type}: preserve aspect ratio`,
    );
    assert.equal(width / source[2], height / source[3], `${type}: uniform source-pixel scale`);
    assert.equal(
      (width / source[2]) * 2,
      Math.round((width / source[2]) * 2),
      `${type}: source pixels must cover whole backbuffer pixels`,
    );
    for (const value of [width, height, left, top])
      assert.equal(value * 2, Math.round(value * 2), `${type}: align with physical pixels`);
  }
}
for (const w of [20, 28]) {
  const p = { type: 'quake', w, h: 14 };
  for (let frame = 0; frame < 3; frame++) {
    const bounds = projectileArtBounds(p, PROJECTILE_ART.quake, frame);
    assert.equal(164 - 7 + bounds.top + bounds.height, 164, 'quake must end at the floor');
  }
}
for (const [type, w, h] of [
  ['wave', 26, 32],
  ['banana', 16, 16],
  ['clock', 22, 22],
]) {
  const normal = projectileArtBounds({ type, w: sizes[type][0], h: sizes[type][1] }, PROJECTILE_ART[type], 0);
  const superMove = projectileArtBounds({ type, w, h }, PROJECTILE_ART[type], 0);
  assert.ok(
    superMove.width > normal.width && superMove.height > normal.height,
    `${type}: larger hitbox gets larger art`,
  );
}
console.log('ALL OK: projectile proportions, EX sizes, floor anchors and pixel alignment');

// Measure the actual painted result beside each caster: prevent a return to tiny props.
const { T, createCanvas } = await import('./harness.js');
const { drawProjectileArt } = await import('../src/game/sprites/projectile-art.js');
const caster = {
  wave: T.CH[0],
  bomb: T.CH[2],
  boom: T.CH[2],
  banana: T.CH[5],
  clock: T.CH[7],
  ring: T.BOSS,
  meteor: T.BOSS,
  quake: T.CH[4],
};
const relativeWidth = {
  wave: 1,
  bomb: 0.5,
  boom: 0.45,
  banana: 0.85,
  clock: 0.8,
  ring: 1,
  meteor: 0.55,
  quake: 1,
};
const canvas = createCanvas(256, 256),
  g = canvas.getContext('2d');
for (const [type, ch] of Object.entries(caster)) {
  const profile = T.profile(ch),
    bodyWidth = profile.r - profile.l;
  for (const t of [0, 4, 8]) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, 256, 256);
    g.scale(2, 2);
    const p = { type, w: sizes[type][0], h: sizes[type][1], dir: 1, t };
    const unchanged = JSON.stringify(p);
    drawProjectileArt(g, p, 64, 64, t);
    const data = g.getImageData(0, 0, 256, 256).data;
    let left = 256,
      right = -1;
    for (let i = 3; i < data.length; i += 4)
      if (data[i] > 127) {
        const x = ((i - 3) / 4) % 256;
        left = Math.min(left, x);
        right = Math.max(right, x);
      }
    assert.ok(
      (right - left + 1) / 2 >= bodyWidth * relativeWidth[type],
      type + ': projectile must read clearly beside its caster',
    );
    assert.equal(JSON.stringify(p), unchanged, type + ': visual scaling never mutates the hitbox');
  }
}
console.log('ALL OK: painted projectile scale relative to all casters, without changing combat');

// Higher-density sampling must not change the established on-screen sizes.
for (const type of Object.keys(sizes)) {
  const p = { type, w: sizes[type][0], h: sizes[type][1], dir: 1, t: 0 };
  const bounds = projectileArtBounds(p, PROJECTILE_ART[type], 0);
  let sampled = false;
  const recorder = {
    save() {},
    restore() {},
    translate() {},
    scale() {},
    drawImage(image, sx, sy, sw, sh, left, top, width, height) {
      sampled = true;
      assert.equal(image.width, 96 * 3 * 4, type + ': four-times-denser atlas');
      assert.deepEqual(
        [sx, sy, sw, sh],
        bounds.source.map((value) => value * 4),
      );
      assert.deepEqual(
        [left, top, width, height],
        [bounds.left, bounds.top, bounds.width, bounds.height],
        type + ': higher resolution preserves placement and size',
      );
    },
  };
  assert.equal(drawProjectileArt(recorder, p, 64, 64, 0), true);
  assert.ok(sampled);
  assert.equal(recorder.imageSmoothingEnabled, true);
}
console.log('ALL OK: dense projectile sampling preserves all display sizes and anchors');
