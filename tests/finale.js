import { BRIBRI } from '../src/game/characters/fighters/bribri.js';
import { PLAYABLE, availableRoster } from '../src/game/characters/roster.js';
import { UNLOCKS } from '../src/game/progression/unlocks.js';
import assert from 'node:assert/strict';
import { T } from './harness.js';
import { FinalFight } from '../src/game/combat/final-fight.js';
import { MEGA_BOSS } from '../src/game/characters/fighters/saturnita-mega.js';
import { Finale } from '../src/game/scenes/finale.js';
import { ASCENSION, FINAL_VICTORY } from '../src/game/story/finale.js';
import { onMatch } from '../src/game/scenes/flow.js';
import { VO } from '../src/game/audio/voice.js';
import { VOICE_CLIPS } from '../src/game/data/voice-clips.js';
import { voiceKey } from '../src/game/audio/voice-key.js';
import { TRACKS, noteMidi, chordInfo } from '../src/game/audio/tracks.js';
import { NOINP } from '../src/game/combat/constants.js';
VO.on = false;
const press = (key) => {
  T.pressedQ.add(key);
  T.step();
};
Object.assign(T.S, {
  mode: 'arcade',
  diff: 1,
  p1: 0,
  li: 7,
  ladder: [4, 1, 2, 3, 5, 6, 7],
  bdone: { nonno: 1, cyber: 1, byd: 1 },
});
function result(fight, winner) {
  fight.done = winner;
  fight.wins = winner ? [0, 2] : [2, 0];
  onMatch(fight, fight.opts);
  T.scene.t = 51;
  press('Enter');
}
result(new T.Fight(T.CH[0], T.BOSS, 9, { cpu: true, lvl: 1 }), 0);
assert.equal(T.S.li, 8);
assert.equal(T.scene.id, 'finale', 'first form must lead to ascension, never ending');
assert.equal(T.scene.panels, ASCENSION);
T.scene.elapsed = 25;
press('Escape');
assert.equal(T.scene.id, 'vs', 'skipping cinematic still starts the second battle');
T.scene.t = 191;
T.step();
assert.ok(T.scene.F instanceof FinalFight);
const f = T.scene.F;
assert.equal(f.f[0].ch, BRIBRI, 'Bri Bri takes control in the final duel');
assert.equal(T.S.p1, 0, 'original hero remains selected for the personal ending');
assert.equal(UNLOCKS.has('bribri'), false, 'phase one never unlocks Bri Bri');
assert.equal(availableRoster().length, 8);
assert.equal(f.f[1].ch, MEGA_BOSS);
assert.equal(f.f[0].meter, 100);
assert.equal(f.stage.music, 'laststand');
const p = T.profile(MEGA_BOSS);
assert.ok(p.t < -50 && p.t > -90 && p.r - p.l < 90, 'measured final-form collision profile');
for (const name of ['p', 'k', 'cp', 'ck'])
  assert.ok(p[name], 'new form must have a real attack profile: ' + name);
// All cinematic lines are locally voiced, and every track token can be scheduled.
for (const panel of [...ASCENSION, ...FINAL_VICTORY]) {
  assert.ok(VOICE_CLIPS[voiceKey(panel.text, 'pt')]);
  assert.ok(panel.text.length <= 96, 'subtitle fits two lines');
}
for (const name of ['ascension', 'laststand']) {
  const tr = TRACKS[name];
  assert.equal(tr.lead.length, tr.chords.length);
  for (const chord of tr.chords) assert.ok(chordInfo(chord).tones.length);
  for (const bar of tr.lead) {
    const tokens = bar.split(' ');
    assert.equal(tokens.length, 8);
    for (const token of tokens) if (!['-', '.'].includes(token)) assert.notEqual(noteMidi(token), null);
  }
  for (const lane of Object.values(tr.dr)) assert.equal(lane.length, 16);
}
// The marked column stays fixed, gives warning, falls, and never reverses input.
f.phase = 'fight';
f.ai = [null, null];
f.stormClock = 209;
f.f[0].x = 110;
f.f[1].x = 390;
f.update();
assert.ok(f.warning);
const target = f.warning.x;
f.f[0].x = 50;
for (let i = 0; i < 71; i++) f.update();
assert.equal(f.warning, null);
assert.equal(f.projs.filter((p) => p.finalStorm).length, 3);
assert.ok(f.projs.every((p) => p.x === target));
const y = f.projs[0].y;
f.core([NOINP, NOINP]);
assert.ok(f.projs[0].y > y);
assert.ok(f.projs.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)));
f.startRound();
assert.equal(f.warning, null);
assert.equal(f.projs.length, 0);
assert.equal(f.f[0].meter, 100);
// Defeat and Continue resume phase two without replaying the entire campaign.
result(f, 1);
assert.equal(T.S.li, 8);
assert.equal(T.scene.id, 'continue');
press('Enter');
for (let i = 0; i < 34; i++) T.step();
assert.equal(T.scene.id, 'vs');
T.scene.t = 191;
T.step();
assert.ok(T.scene.F instanceof FinalFight);
result(T.scene.F, 0);
assert.equal(T.S.li, 9);
assert.equal(T.scene.victory, true);
assert.notEqual(T.scene, T.Ending);
T.scene.elapsed = 25;
press('Escape');
assert.equal(T.scene.id, 'cutscene');
const epilogues = [];
while (T.scene.id === 'cutscene') {
  epilogues.push(T.scene.player.id);
  press('Escape');
}
assert.deepEqual(
  epilogues,
  PLAYABLE.map((ch) => ch.id),
  'each character receives a separate personal ending',
);
assert.equal(T.scene, T.Ending, 'saving the world requires the second victory');
assert.equal(UNLOCKS.has('bribri'), true);
UNLOCKS.load();
assert.equal(UNLOCKS.has('bribri'), true, 'unlock survives reload');
assert.equal(availableRoster().length, 9);
// Cinematic auto-advances when muted, and finish is idempotent.
let finished = 0;
const s = Finale(ASCENSION, () => finished++);
s.enter();
for (let i = 0; i < ASCENSION.reduce((n, p) => n + p.frames, 0) + 1; i++) s.update();
assert.equal(finished, 1);
s.finish();
assert.equal(finished, 1);
console.log(
  'ALL OK: two boss fights, Continue, victory gate, storm warning, sprite profiles, score and dialogue',
);
