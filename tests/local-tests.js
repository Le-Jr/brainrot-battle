import { BRIBRI } from '../src/game/characters/fighters/bribri.js';
import { UNLOCKS } from '../src/game/progression/unlocks.js';
import assert from 'node:assert/strict';
import { T } from './harness.js';
import { DEBUG } from '../src/game/state.js';
import { XP } from '../src/game/progression/xp.js';
import { VO } from '../src/game/audio/voice.js';
import { isLocalHost } from '../src/game/dev/local.js';
import { installLocalInspector } from '../src/game/dev/inspector.js';
import { FinalFight } from '../src/game/combat/final-fight.js';
import { NOINP } from '../src/game/combat/constants.js';
import { drawScene } from '../src/game/core/scene.js';
VO.on = false;
for (const host of ['localhost', '127.0.0.1', '::1', '[::1]']) assert.equal(isLocalHost(host), true);
for (const host of ['example.com', 'localhost.example.com', '192.168.1.5', undefined, '']) {
  assert.equal(isLocalHost(host), false);
  assert.equal(installLocalInspector({ hostname: host }), null);
}
const savedXP = { ...XP.data },
  savedRun = JSON.stringify(T.S);
const unlockedBefore = localStorage.getItem('brb_unlocks_v1');
const persisted = localStorage.getItem('brf_xp_v1');
const ui = installLocalInspector({ hostname: 'localhost' });
const press = (key) => {
  T.pressedQ.add(key);
  T.step();
};
press('F2');
assert.equal(ui.open, true);
const time = T.scene.t;
for (let i = 0; i < 5; i++) T.step();
assert.equal(T.scene.t, time, 'overlay pauses the underlying scene');
drawScene();
press('Enter');
assert.ok(T.scene.F instanceof FinalFight, 'first item opens final fight immediately');
assert.equal(T.S.li, 8);
assert.equal(T.scene.F.f[0].ch, BRIBRI);
assert.equal(DEBUG.god, true);
assert.equal(DEBUG.infiniteMeter, true);
assert.equal(DEBUG.freezeTimer, true);
const f = T.scene.F,
  player = f.f[0],
  opponent = f.f[1];
const hit = { dmg: 20, stun: 12, push: 2, lvl: 'mid', chip: 5, heavy: true };
const health = player.hp;
assert.equal(f.applyHit(opponent, player, hit, player.x + 10), false);
assert.equal(player.hp, health, 'God Mode prevents damage and KO');
DEBUG.god = false;
f.applyHit(opponent, player, hit, player.x + 10);
assert.ok(player.hp < health, 'turning God Mode off restores real damage');
DEBUG.god = true;
player.meter = 0;
f.phase = 'fight';
f.timer = 50;
f.timerT = 59;
T.step();
assert.equal(player.meter, 100);
assert.equal(f.timer, 50);
DEBUG.freezeCpu = true;
assert.equal(f.input(1), NOINP);
DEBUG.freezeCpu = false;
XP.add(player.ch.id, 1000);
assert.equal(localStorage.getItem('brf_xp_v1'), persisted, 'test XP never reaches browser storage');
// Opening and closing never calls enter() again or resets the match.
f.tick = 123;
press('F2');
assert.equal(ui.open, true);
press('F2');
assert.equal(f.tick, 123);
T.step();
ui.toggle();
ui.launch('lose');
for (let i = 0; i < 21; i++) T.step();
assert.equal(T.scene.id, 'result');
T.scene.t = 51;
press('Enter');
assert.equal(T.scene.id, 'continue');
press('Enter');
for (let i = 0; i < 34; i++) T.step();
assert.equal(T.scene.id, 'vs');
T.scene.t = 191;
T.step();
assert.ok(T.scene.F instanceof FinalFight);
for (const [destination, id] of [
  ['ascension', 'finale'],
  ['victory', 'finale'],
  ['map', 'travel'],
  ['prologue', 'cutscene'],
  ['credits', 'ending'],
  ['intro', 'intro'],
]) {
  ui.launch(destination);
  assert.equal(T.scene.id, id, destination + ': direct access');
}
for (const type of ['cyber', 'nonno', 'byd']) {
  ui.launch(type);
  assert.equal(T.scene.F.type, type);
}
ui.launch('fight');
assert.equal(T.S.mode, 'versus');
ui.launch('training');
assert.equal(T.scene.F.opts.dummy, true);
UNLOCKS.unlock('bribri');
assert.equal(localStorage.getItem('brb_unlocks_v1'), unlockedBefore, 'test unlock is never persisted');
ui.exit();
assert.equal(JSON.stringify(T.S), savedRun, 'closing the test session restores the run');
assert.deepEqual(XP.data, savedXP, 'sandbox XP is discarded');
assert.equal(DEBUG.testing, false);
assert.equal(DEBUG.god, false);
ui.destroy();
assert.equal(DEBUG.local, false);
console.log(
  'ALL OK: localhost guard, F2, final-phase access, God Mode, resource cheats, Continue and XP isolation',
);
