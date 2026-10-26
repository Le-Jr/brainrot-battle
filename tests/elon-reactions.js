import assert from 'node:assert/strict';
import { T } from './harness.js';
import { VO } from '../src/game/audio/voice.js';
import { ELON_LINES } from '../src/game/audio/elon-lines.js';

const spoken = [];
VO.clip = (id) => spoken.push(id);
const bonus = new T.Bonus(T.CH[0], 1, 'cyber');
bonus.phase = 'fight';
bonus.core = () => {};
const car = bonus.f[1];
bonus.update();
for (const [level, ratio] of [
  [1, 0.75],
  [2, 0.5],
  [3, 0.25],
]) {
  car.hp = car.maxhp * ratio;
  bonus.update();
  assert.equal(bonus.elonDamage, level);
  assert.equal(bonus.bub.who, 'elon');
  assert.equal(bonus.bub.text, ELON_LINES[level].text);
  bonus.update();
}
bonus.onKO(bonus.f[0], car);
bonus.update();
assert.equal(bonus.elonDamage, 4);
assert.deepEqual(spoken, [1, 2, 3, 4]);
bonus.drawExtra(bonus.cam);
bonus.startRound();
assert.equal(bonus.elonDamage, 0);
assert.equal(bonus.bub, null);
console.log('ALL OK: Elon damage reactions, KO, drawing and round reset');
