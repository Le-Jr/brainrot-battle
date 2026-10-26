import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { T, createCanvas } from './harness.js';
import { Car } from '../src/game/combat/car.js';
import { drawBonusArt, hasBonusArt } from '../src/game/sprites/bonus-art.js';

const hash = (canvas) => crypto.createHash('sha256').update(canvas.toBuffer('image/png')).digest('hex');
for (const ch of Object.values(T.CARS)) {
  assert.ok(hasBonusArt(ch.id), ch.id + ': loaded atlas');
  const car = new Car(ch),
    original = car.hurt();
  const hashes = [];
  assert.equal(car.bodyW(), ch.hurt.w * 1.55);
  assert.equal(original.h, ch.hurt.h * 1.55);
  for (const [i, ratio] of [1, 0.75, 0.5, 0.25, 0].entries()) {
    car.hp = car.maxhp * ratio;
    car.dead = i === 4;
    assert.equal(car.poseInfo().pose, 'd' + i);
    assert.deepEqual(car.hurt(), original, 'damage preserves collision box');
    const sprite = T.sprite(ch, car.poseInfo().pose, 0, 0, false, '');
    assert.equal(sprite.hd, true);
    hashes.push(hash(sprite));
  }
  assert.equal(new Set(hashes).size, 5, ch.id + ': five distinct damage states');
}
const canvas = createCanvas(100, 100),
  g = canvas.getContext('2d');
const poses = [0, 1, 2, 3, 4].map((frame) => {
  g.clearRect(0, 0, 100, 100);
  assert.equal(drawBonusArt(g, 'parrot', frame, 50, 90, 0.5), true);
  return hash(canvas);
});
assert.equal(new Set(poses).size, 5);
assert.equal(drawBonusArt(g, 'missing', 0, 0, 0), false);
console.log('ALL OK: bonus damage states, fixed collisions and parrot expressions');
