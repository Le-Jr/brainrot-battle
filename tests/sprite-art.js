// Animation integration: distinct authored phases, release timing, valid pivots and effect frames.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { ATLAS_ANIMATIONS } from '../src/game/data/atlas-animations.js';
import { PROJECTILE_ART } from '../src/game/data/projectile-art.js';
import { T, createCanvas } from './harness.js';
import { drawProjectileArt } from '../src/game/sprites/projectile-art.js';

const hash = (canvas) =>
  crypto
    .createHash('sha256')
    .update(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data)
    .digest('hex');
const roster = [...T.CH, T.BOSS];
assert.equal(Object.keys(ATLAS_ANIMATIONS).length, roster.length);
for (const ch of roster) {
  const walk = [0, 2, 4, 6].map((f) => hash(T.sprite(ch, 'walk', f, 0, false, '')));
  assert.equal(new Set(walk).size, 4, ch.id + ': walk phases must be different');
  for (const pose of ['punch', 'kick']) {
    const phases = [0.5, 1, 0.25].map((a) => hash(T.sprite(ch, pose, 0, a, false, '')));
    assert.equal(new Set(phases).size, 3, ch.id + ': ' + pose + ' phases');
  }
  assert.notEqual(
    hash(T.sprite(ch, 'crouch', 0, 0, false, '')),
    hash(T.sprite(ch, 'idle', 0, 0, false, '')),
    ch.id + ': authored crouch',
  );
  const fighter = new T.Fighter(ch, 0, false);
  for (const key of ['p', 'k', 'cp', 'ck', 'jp', 'jk']) {
    assert.ok(T.profile(ch)[key], ch.id + ': measured attack ' + key);
  }
  const standing = fighter.hurt();
  fighter.st = 'crouch';
  const crouching = fighter.hurt();
  assert.ok(standing.h > 20 && standing.h < 100, ch.id + ': standing hurtbox');
  assert.ok(crouching.h < standing.h, ch.id + ': crouch lowers hurtbox');
  fighter.st = 'special';
  fighter.spec = { type: ch.sp, t: 0 };
  assert.equal(fighter.poseInfo(0).a, 0.5);
  fighter.spec.t = 12;
  assert.equal(fighter.poseInfo(0).a, 1);
}
const canvas = createCanvas(128, 128),
  g = canvas.getContext('2d');
assert.equal(Object.keys(PROJECTILE_ART).length, 8);
for (const type of Object.keys(PROJECTILE_ART)) {
  const hashes = [0, 4, 8].map((t) => {
    g.clearRect(0, 0, 128, 128);
    assert.equal(drawProjectileArt(g, { type, t, dir: 1, w: 24 }, 64, 64, t), true);
    return hash(canvas);
  });
  assert.equal(new Set(hashes).size, 3, type + ': three effect phases');
}
assert.equal(drawProjectileArt(g, { type: 'missing', t: 0 }, 64, 64, 0), false);
console.log('ALL OK: 9 animated fighters, 8 animated projectile types');
