import { FinalFight } from '../src/game/combat/final-fight.js';
/** The secret fighter is actually playable, animated, persistent, and never leaks through tests. */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { T } from './harness.js';
import { BRIBRI } from '../src/game/characters/fighters/bribri.js';
import { MEGA_BOSS } from '../src/game/characters/fighters/saturnita-mega.js';
import { PLAYABLE, availableRoster } from '../src/game/characters/roster.js';
import { UNLOCKS } from '../src/game/progression/unlocks.js';
import { XP } from '../src/game/progression/xp.js';
import { SPEC } from '../src/game/combat/specials.js';
import { VO } from '../src/game/audio/voice.js';
VO.on = false;
const hash = (c) =>
  crypto
    .createHash('sha256')
    .update(c.getContext('2d').getImageData(0, 0, c.width, c.height).data)
    .digest('hex');
assert.equal(availableRoster().length, 8);
T.S.mode = 'versus';
T.go(T.Select);
T.Select.cur[0] = 7;
T.pressedQ.add('KeyD');
T.step();
assert.equal(T.Select.cur[0], 0, 'locked hero cannot be selected');
UNLOCKS.unlock('bribri');
UNLOCKS.load();
assert.equal(availableRoster().at(-1), BRIBRI);
for (const ch of [BRIBRI, MEGA_BOSS]) {
  const phases = (pose) => [0.5, 1, 0.25].map((a) => hash(T.sprite(ch, pose, 0, a, false, '')));
  for (const pose of ['punch', 'kick'])
    assert.equal(new Set(phases(pose)).size, 3, ch.id + ': distinct anticipation/contact/recovery');
  assert.notEqual(
    hash(T.sprite(ch, 'punch', 0, 1, false, '')),
    hash(T.sprite(ch, 'kick', 0, 1, false, '')),
    ch.id + ': kick is not a reused punch',
  );
  const profile = T.profile(ch);
  assert.ok(profile.p && profile.k && profile.cp && profile.ck, ch.id + ': all measured attack profiles');
  assert.ok(profile.ct < -30 && profile.ct > profile.t, ch.id + ': actual authored crouch');
  assert.notEqual(
    hash(T.sprite(ch, 'special', 0, 0.5, false, '')),
    hash(T.sprite(ch, 'special', 0, 1, false, '')),
  );
}
// Every mode accepts the unlocked fighter, including the original 7-rival campaign.
for (const mode of ['arcade', 'training', 'bonus', 'versus']) {
  T.S.mode = mode;
  T.S.vsCpu = true;
  T.go(T.Select);
  T.Select.cur = [8, 0];
  T.Select.next();
  assert.equal(PLAYABLE[T.S.p1], BRIBRI);
  T.scene.draw();
  if (mode === 'arcade') {
    assert.equal(T.S.ladder.length, 7);
    assert.ok(T.S.ladder.every((i) => i < 8));
  }
  if (mode === 'training') assert.equal(T.scene.F.f[0].ch, BRIBRI);
}
const fight = new T.Fight(BRIBRI, MEGA_BOSS, 9, { cpu: true, lvl: 1, quiet: true });
const [hero, boss] = fight.f;
hero.startSpecial(boss, fight, 'super');
let shieldFrames = 0;
for (let i = 0; i < 48; i++) {
  SPEC.aegis(hero, boss, fight);
  if (hero.spec?.box) shieldFrames++;
}
assert.ok(shieldFrames > 20, 'Bri Bri has a multi-hit shield super');
const patterns = [];
for (let mode = 0; mode < 3; mode++) {
  fight.projs = [];
  boss.startSpecial(hero, fight, '');
  let rush = false;
  for (let i = 0; i < 42; i++) {
    SPEC.cosmos(boss, hero, fight);
    rush ||= !!boss.spec?.box;
  }
  patterns.push({ rush, types: fight.projs.map((p) => p.type) });
}
assert.ok(patterns[0].types.includes('ring'));
assert.equal(patterns[1].rush, true);
assert.ok(patterns[2].types.includes('meteor'));
// Test sessions can preview the unlock without changing the persisted flag.
const persisted = localStorage.getItem('brb_unlocks_v1');
UNLOCKS.beginSandbox();
UNLOCKS.data.bribri = false;
UNLOCKS.unlock('bribri');
assert.equal(localStorage.getItem('brb_unlocks_v1'), persisted);
UNLOCKS.endSandbox();
const actualXP = { ...XP.data };
XP.beginSandbox();
XP.add(BRIBRI.id, 100);
XP.endSandbox();
assert.deepEqual(XP.data, actualXP);
// Exercise the new move set through complete real matches at all three difficulty settings.
let seed = 137;
Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
for (const difficulty of [0, 1, 2]) {
  const match = new FinalFight(T.CH[0], {
    cpu: true,
    lvl: difficulty,
    lv: [5, 3 + difficulty * 3],
    quiet: true,
  });
  match.ai[0] = new T.AI(2);
  for (let tick = 0; tick < 35000 && match.done === undefined; tick++) {
    match.update();
    if (tick % 300 === 0) {
      match.draw();
      for (const f of match.f)
        assert.ok([f.x, f.y, f.hp, f.meter].every(Number.isFinite), 'finite fighter state');
      for (const p of match.projs)
        assert.ok([p.x, p.y, p.vx, p.vy].every(Number.isFinite), 'finite projectile state');
    }
  }
  assert.ok([0, 1].includes(match.done), 'real final match terminates at difficulty ' + difficulty);
  console.log('Final duel', difficulty, 'winner', match.done, 'rounds', match.round);
}
console.log(
  'ALL OK: 16-pose fighters, secret roster slot, all game modes, shield super, three cosmic moves and unlock persistence',
);
