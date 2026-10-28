import assert from 'node:assert/strict';
import fs from 'node:fs';
import { T, main } from './harness.js';
import { VO } from '../src/game/audio/voice.js';
import { SET } from '../src/game/state.js';
import { prepareFrame } from '../src/game/core/canvas.js';
const played = [];
globalThis.Audio = class {
  constructor(src) {
    this.src = src;
  }
  play() {
    played.push(this);
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
};
const bonus = new T.Bonus(T.CH[0], 1, 'byd');
bonus.phase = 'fight';
bonus.parrotSay();
assert.equal(played.at(-1).src, '/audio/memes/parrot-byd-full.mp3');
assert.equal(played.at(-1).volume, 0.8 * SET.voice);
assert.equal(bonus.bub, null, 'parrot speech has no balloon');
assert.ok(bonus.parTalk >= 12.9 * 60, 'animation covers the complete original');
bonus.parrotSay();
assert.equal(played.length, 1, 'reactions cannot restart the joke mid-sentence');
bonus.superFlash(bonus.f[0]);
assert.equal(played.length, 1, 'super announcement cannot interrupt the meme');
assert.ok(!played[0].paused);
bonus.superT = 0;
bonus.core = () => {};
bonus.onKO(bonus.f[0], bonus.f[1]);
assert.equal(played.length, 1, 'KO preserves the current recording');
bonus.pt = 190;
bonus.update();
assert.notEqual(bonus.done, 0, 'results wait for the complete speech');
const stale = played.at(-1).onended;
VO.stop();
stale();
assert.equal(played.length, 1, 'leaving scene cannot restart audio');
VO.on = false;
bonus.parTalk = 0;
bonus.parrotSay();
assert.equal(played.length, 1, 'voice toggle mutes original meme');
assert.equal(bonus.parTalk, 0, 'muted speech does not delay results');
VO.on = true;
bonus.phase = 'fight';
bonus.parTalk = 0;
bonus.parT = 1;
bonus.update();
assert.equal(played.length, 2);
for (let i = 0; i < 20; i++) bonus.update();
assert.equal(played.length, 2, 'no overlapping scheduled memes');
assert.equal(bonus.bub, null);
const edits = JSON.parse(fs.readFileSync('public/audio/memes/edits.json', 'utf8'));
assert.equal(Object.keys(edits.clips).length, 1);
const clip = edits.clips['parrot-byd-full'];
assert.equal(clip.completeSource, true);
assert.ok(clip.duration >= 12.9 && clip.duration < 13.1, 'full original at native speed');
assert.ok(fs.statSync('public/audio/memes/' + clip.file).size > 10000);
for (const file of ['parrot-milkshake.mp3', 'parrot-byd-1.mp3', 'parrot-byd-2.mp3', 'parrot-byd-3.mp3'])
  assert.ok(!fs.existsSync('public/audio/memes/' + file));
main.width = 1920;
main.height = 1080;
const preview = new T.Bonus(T.CH[0], 1, 'byd');
preview.phase = 'fight';
prepareFrame();
preview.draw();
fs.mkdirSync('output/parrot', { recursive: true });
fs.writeFileSync('output/parrot/bonus-1080p.png', main.toBuffer('image/png'));
VO.stop();
console.log('ALL OK: original clips, volume, duration, interruption, mute, scheduling and 1080p drawing');

VO.stop();
const recurring = new T.Bonus(T.CH[0], 1, 'byd');
recurring.phase = 'fight';
recurring.core = () => {};
const before = played.filter((audio) => audio.src.includes('/memes/')).length;
for (let frame = 0; frame < 45 * 60; frame++) {
  if (recurring.parTalk === 1) played.at(-1).onended?.();
  recurring.update();
}
const repetitions = played.filter((audio) => audio.src.includes('/memes/')).length - before;
assert.ok(repetitions >= 3, 'full meme plays at least three times during a 45-second stage');
VO.say('Fight!', { role: 'ann' });
assert.ok(played.at(-1).src.includes('/voices/'), 'normal announcements resume after meme completion');
VO.stop();
console.log('ALL OK: super moves preserve the meme and full recordings repeat throughout the stage');
