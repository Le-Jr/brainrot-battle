import assert from 'node:assert/strict';
import { T } from './harness.js';
import { NOINP } from '../src/game/combat/constants.js';
import { PLAYABLE } from '../src/game/characters/roster.js';
import { FLOOR } from '../src/game/config.js';
import { readPad } from '../src/game/core/input.js';

function setup(ch = T.CH[0], side = 0) {
  const g = new T.Fight(ch, T.CH[1], 0, { quiet: true });
  const f = g.f[side],
    o = g.f[1 - side];
  const step = (input = {}) => f.update({ ...NOINP, ...input }, o, g);
  return { g, f, o, step };
}

// Both directions and both sides: a release between taps is required.
for (const side of [0, 1])
  for (const dir of ['left', 'right']) {
    const { f, step } = setup(undefined, side);
    step({ [dir]: true });
    for (let i = 0; i < 4; i++) step({ [dir]: true });
    assert.equal(f.st, 'walk', 'holding never dashes');
    step();
    step({ [dir]: true });
    assert.equal(f.st, 'dash');
    assert.equal(Math.sign(f.vx), dir === 'left' ? -1 : 1);
    assert.ok(Math.abs(f.vx) > f.spd * 2);
    for (let i = 0; i < 12; i++) step();
    assert.equal(f.st, 'idle');
    assert.equal(f.vx, 0);
  }
for (const mode of ['late', 'opposite', 'stunned', 'air']) {
  const { f, step } = setup();
  step({ right: true });
  step();
  if (mode === 'late') for (let i = 0; i < 13; i++) step();
  if (mode === 'opposite') {
    step({ left: true });
    step();
  }
  if (mode === 'stunned') {
    f.st = 'hitstun';
    f.stunT = 5;
  }
  if (mode === 'air') {
    f.st = 'jump';
    f.y -= 20;
  }
  step({ right: true });
  assert.notEqual(f.st, 'dash', mode);
}
// Physical keys and the touch D-pad feed the same movement edges.
for (const [pad, key] of [
  ['p1', 'KeyD'],
  ['p2', 'ArrowLeft'],
  ['p1', 'T_right'],
]) {
  const { f, o, g } = setup();
  T.keys.add(key);
  f.update(readPad(pad), o, g);
  T.keys.clear();
  f.update(readPad(pad), o, g);
  T.keys.add(key);
  f.update(readPad(pad), o, g);
  T.keys.clear();
  assert.equal(f.st, 'dash', key);
}
for (const [input, name] of [
  [{ pp: true }, 'p'],
  [{ pk: true }, 'k'],
  [{ up: true, pp: true }, 'up'],
  [{ up: true, pk: true }, 'uk'],
  [{ down: true, pp: true }, 'cp'],
  [{ down: true, pk: true }, 'ck'],
]) {
  const { f, step } = setup();
  step(input);
  assert.equal(f.atk.n, name);
  assert.equal(f.st, 'attack');
  if (input.up) {
    for (let i = 0; i < 8; i++) step();
    assert.ok(f.y < FLOOR);
  }
  assert.ok(f.poseInfo(0).pose);
}
// Every fighter has three specials, with real hitboxes, recovery and meter costs.
for (const ch of [...PLAYABLE, T.BOSS])
  for (const variant of ['forward', 'up', 'down']) {
    const { f, o, step } = setup(ch);
    step({ ps: true, up: variant === 'up', down: variant === 'down' });
    assert.equal(f.spec.variant, variant);
    let box = false,
      rose = false,
      low = false;
    for (let i = 0; i < 80 && f.spec; i++) {
      step();
      if (f.spec?.box) {
        box = true;
        low ||= f.spec.data.lvl === 'low';
      }
      rose ||= f.y < FLOOR;
      assert.ok(f.poseInfo(i).pose);
    }
    assert.equal(f.spec, null, `${ch.id} ${variant}: recovery`);
    if (variant !== 'forward') assert.ok(box);
    if (variant === 'up') assert.ok(rose);
    if (variant === 'down') assert.ok(low);
    assert.equal(f.y, FLOOR);
    f.reset();
    f.meter = 50;
    f.trySpecial(
      o,
      { projs: [], exFlash() {} },
      { qcf: true, down: variant === 'down', up: variant === 'up' },
    );
    assert.equal(f.meter, 0);
    assert.ok(f.spec.ex);
    f.reset();
    f.meter = 100;
    f.trySpecial(o, { projs: [], superFlash() {} }, { down: variant === 'down', up: variant === 'up' });
    assert.equal(f.meter, 0);
    assert.ok(f.spec.sup);
  }
// Cancels retain direction even when the buttons were buffered before impact.
for (const direction of ['up', 'down']) {
  const { f, step } = setup();
  step({ pp: true });
  step({ ps: true, [direction]: true });
  f.atk.conn = true;
  step();
  assert.equal(f.spec.variant, direction);
}
// Low specials require crouching guard and launchers actually launch on contact.
for (const down of [false, true]) {
  const { f, o, g, step } = setup();
  step({ down: true, ps: true });
  for (let i = 0; i < 9; i++) step();
  o.inBack = true;
  o.inDown = down;
  o.st = down ? 'crouch' : 'idle';
  assert.equal(g.applyHit(f, o, f.spec.data, f.x), down ? 'block' : 'hit');
}
{
  const { f, o, g, step } = setup();
  step({ up: true, ps: true });
  for (let i = 0; i < 6; i++) step();
  assert.equal(g.applyHit(f, o, f.spec.data, f.x), 'hit');
  assert.ok(o.vy < 0);
  assert.equal(o.st, 'down');
  f.reset();
  assert.equal(f.tap, null);
  assert.equal(f.bb, null);
}
// Exercise collision resolution rather than only passing attack data directly.
for (const side of [0, 1])
  for (const up of [false, true]) {
    const { f, o, g } = setup(undefined, side);
    f.x = 250;
    o.x = f.x + f.dir * 42;
    const inputs = [NOINP, NOINP];
    inputs[side] = { ...NOINP, ps: true, up, down: !up };
    g.core(inputs);
    for (let i = 0; i < 18; i++) {
      g.tick++;
      g.core([NOINP, NOINP]);
    }
    assert.ok(o.hp < 100, `collision: side ${side}, rising ${up}`);
    assert.equal(f.spec.hits, 1, 'directional special hits once per activation');
  }
console.log(
  'ALL OK: double taps, keyboard/touch, directional normals and specials, cancels, guards and meter',
);
