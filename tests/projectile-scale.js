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
