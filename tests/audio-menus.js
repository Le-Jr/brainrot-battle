import assert from 'node:assert/strict';
import fs from 'node:fs';
import { T, main } from './harness.js';
import { Options } from '../src/game/scenes/options.js';
import { SET } from '../src/game/state.js';
import { AU } from '../src/game/audio/synth.js';
import { prepareFrame } from '../src/game/core/canvas.js';
import { Title } from '../src/game/scenes/title.js';
import { MUSIC_FILES } from '../src/game/audio/music-files.js';

fs.mkdirSync('output/music/menus', { recursive: true });
const capture = (name) => {
  prepareFrame();
  T.scene.draw();
  fs.writeFileSync(`output/music/menus/${name}.png`, main.toBuffer('image/png'));
};
const key = (code) => {
  T.pressedQ.add(code);
  T.step();
};
T.go(Options);
Options.change(1, 1);
assert.equal(Options.audio, true);
assert.deepEqual(
  Options.items()
    .slice(0, 3)
    .map(([name]) => name),
  ['MÚSICA', 'EFEITOS', 'VOZES'],
);
const music = SET.music;
key('ArrowLeft');
assert.ok(SET.music < music);
key('ArrowDown');
const effects = SET.effects;
key('ArrowLeft');
assert.ok(SET.effects < effects);
key('ArrowDown');
const voice = SET.voice;
key('ArrowLeft');
assert.ok(SET.voice < voice);
capture('options-audio');
key('Escape');
assert.equal(Options.audio, false);
assert.equal(Options.m, 1);

const f = new T.Fight(T.CH[0], T.CH[1], 0, { cpu: true });
const scene = T.FightScene(f, () => {});
T.go(scene);
scene.open();
scene.pt = 9;
key('ArrowDown');
key('ArrowDown');
key('Enter');
assert.equal(scene.audio, true);
assert.equal(scene.pause, true);
const state = { phase: f.phase, timer: f.timer, round: f.round };
key('ArrowLeft');
assert.equal(AU.ducking, 0.35);
capture('pause-audio');
key('Escape');
assert.equal(scene.audio, false);
assert.equal(scene.pause, true, 'back returns to pause, not to combat');
capture('pause');
key('Escape');
assert.equal(scene.pause, false);
assert.equal(AU.ducking, 1);
assert.deepEqual(
  { phase: f.phase, timer: f.timer, round: f.round },
  state,
  'audio menu never advances combat',
);
console.log(
  'ALL OK: Options and Pause share saved mixer controls; back navigation and frozen combat; screenshots rendered',
);
// Opening, main menu and character selection use the intended imported cues.
Title.back = false;
T.go(Title);
assert.equal(AU.pending, 'title');
assert.ok(MUSIC_FILES.title.includes('imported-title-'));
Title.phase = 'attract';
key('Enter');
assert.equal(Title.phase, 'menu');
assert.equal(AU.pending, 'select');
assert.ok(MUSIC_FILES.select.includes('imported-select-'));
key('Escape');
assert.equal(AU.pending, 'title');
Title.back = true;
T.go(Title);
assert.equal(AU.pending, 'select', 'returning from Options resumes menu music');
console.log('ALL OK: imported opening and menu cues switch on Start, Back and scene return');
