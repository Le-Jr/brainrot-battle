import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { VOICE_CLIPS } from '../src/game/data/voice-clips.js';
import { voiceKey } from '../src/game/audio/voice-key.js';
import { ELON_LINES } from '../src/game/audio/elon-lines.js';
import { VO } from '../src/game/audio/voice.js';

const files = new Set(Object.values(VOICE_CLIPS).flat());
const report = JSON.parse(fs.readFileSync('public/audio/voices/generation.json', 'utf8'));
assert.ok(files.size > 200, 'complete game voice catalog');
for (const file of files) {
  const path = 'public/audio/voices/' + file;
  assert.ok(fs.statSync(path).size > 1000, file + ': nonempty MP3');
  assert.ok(report.clips[file], file + ': generation provenance');
  const probe = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
    { encoding: 'utf8' },
  );
  assert.equal(probe.status, 0, file + ': decodable');
  assert.ok(Number(probe.stdout) > 0.1, file + ': positive duration');
  const decode = spawnSync('ffmpeg', ['-nostdin', '-v', 'error', '-xerror', '-i', path, '-f', 'null', '-'], {
    encoding: 'utf8',
  });
  assert.equal(decode.status, 0, file + ': complete decode: ' + decode.stderr);
}
ELON_LINES.forEach((line, i) => assert.ok(VOICE_CLIPS[voiceKey(line.text, i ? 'pt' : 'ann')]));

// Actual playback supports browsers without speechSynthesis, interruption and queued lines.
const played = [];
globalThis.window = globalThis;
globalThis.Audio = class {
  constructor(src) {
    this.src = src;
    this.paused = false;
  }
  play() {
    played.push(this);
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
};
VO.say('Fight!', { role: 'ann' });
assert.equal(played.length, 1);
VO.queue('K.O.!', { role: 'ann' });
assert.equal(played.length, 1, 'queue waits for current clip');
played[0].onended();
assert.equal(played.length, 2);
VO.say('Perfect!', { role: 'ann' });
assert.equal(played[1].paused, true, 'new line interrupts previous clip');
const stale = played[2].onended;
VO.stop();
stale();
assert.equal(played.length, 3, 'stale completion cannot restart audio');
const versus = Object.entries(VOICE_CLIPS).find(([, sequence]) => sequence.length === 3);
VO.say(versus[0].slice(3), { role: 'it' });
for (let i = 0; i < 3; i++) played.at(-1).onended();
assert.equal(played.length, 6, 'versus plays name, contro, name');
VO.on = false;
VO.say('Fight!', { role: 'ann' });
assert.equal(played.length, 6, 'narrator toggle mutes recordings');
console.log(`ALL OK: ${files.size} Chatterbox MP3s, catalog, playback, queue, mute and interruption`);
