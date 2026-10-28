import assert from 'node:assert/strict';
import fs from 'node:fs';
import { TRACKS, noteMidi } from '../src/game/audio/tracks.js';
import { MUSIC_FILES } from '../src/game/audio/music-files.js';
import { AU } from '../src/game/audio/synth.js';
import { SET } from '../src/game/state.js';
import { IMPORTED_MUSIC } from '../src/game/audio/imported-music.js';
import { loadAudioSettings, changeAudioLevel } from '../src/game/audio/settings.js';

for (const [id, url] of Object.entries(MUSIC_FILES)) {
  const tr = TRACKS[id],
    spb = tr.spb || 16;
  assert.equal(tr.lead.length, tr.chords.length, id);
  for (const bar of tr.lead) {
    const notes = bar.split(' ');
    assert.equal(notes.length, spb / 2, id);
    for (const n of notes) if (!['.', '-'].includes(n)) assert.notEqual(noteMidi(n), null, `${id}: ${n}`);
  }
  for (const lane of Object.values(tr.dr)) assert.equal(lane.length, spb, id);
  assert.equal(
    fs
      .readFileSync('public' + url)
      .subarray(0, 4)
      .toString(),
    'OggS',
    id,
  );
}
assert.equal(TRACKS.laststand.lead[0], 'A5 G5 A5 - G5 F5 E5 D5');
assert.ok(TRACKS.laststand.lead.length >= 24);

// An old download must never restart music after a scene change or stop.
const originalFetch = globalThis.fetch;
const requests = [],
  sources = [];
globalThis.fetch = () => new Promise((resolve) => requests.push(resolve));
AU.ctx = {
  currentTime: 0,
  decodeAudioData: async () => ({ duration: 30 }),
  createBufferSource() {
    const source = {
      connect() {},
      disconnect() {},
      start(...args) {
        this.started = args;
      },
      stop() {
        this.stopped = true;
      },
    };
    sources.push(source);
    return source;
  },
};
const settle = () => new Promise((resolve) => setImmediate(resolve));
const response = { ok: true, arrayBuffer: async () => new ArrayBuffer(1) };
try {
  AU.play('beach');
  AU.play('boss');
  requests[0](response);
  await settle();
  assert.equal(sources.length, 0, 'stale beach download ignored');
  requests[1](response);
  await settle();
  assert.equal(sources.length, 1);
  assert.equal(sources[0].loop, true);
  assert.equal(AU.track, null, 'synth stops when recorded playback takes over');
  AU.stop();
  assert.ok(sources[0].stopped);
  AU.play('jungle');
  AU.stop();
  requests[2](response);
  await settle();
  assert.equal(sources.length, 1, 'stop cancels pending playback');
  AU.play('desert');
  requests[3]({ ok: false, status: 404 });
  await settle();
  assert.equal(AU.track, TRACKS.desert, 'failed file keeps live synth fallback');
} finally {
  AU.stop();
  globalThis.fetch = originalFetch;
}
// Real imported tracks use a streaming media element, with no decoded-buffer cache.
const media = [];
globalThis.Audio = class {
  constructor(src) {
    this.src = src;
    media.push(this);
  }
  play() {
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  removeAttribute() {
    this.src = '';
  }
  load() {}
};
AU.ctx.createMediaElementSource = () => ({ connect() {}, disconnect() {} });
AU.mg = { gain: { value: 0 } };
AU.sg = { gain: { value: 0 } };
const store = {};
globalThis.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => {
    store[key] = value;
  },
};
try {
  AU.play('laststand');
  assert.equal(media.at(-1).src, IMPORTED_MUSIC.laststand.url);
  assert.equal(media.at(-1).loop, true);
  assert.equal(AU.track, null);
  AU.play('win');
  assert.equal(media.at(-1).src, IMPORTED_MUSIC.win.url);
  assert.equal(media.at(-1).loop, false, 'victory fanfare plays once');
  AU.play('cont');
  assert.equal(media.at(-1).src, IMPORTED_MUSIC.cont.url);
  assert.equal(media.at(-1).loop, true, 'continue music repeats until interrupted');
  const oldFailure = media.at(-1).onerror;
  AU.play('beach');
  assert.ok(media[0].paused);
  oldFailure();
  assert.equal(AU.cur, 'beach', 'old streaming errors cannot cancel a new track');
  media.at(-1).onerror();
  assert.equal(AU.track, TRACKS.beach, 'streaming errors restore synth');
  AU.setDucking(0.35);
  changeAudioLevel('music', -1);
  AU.applyLevels();
  assert.equal(AU.mg.gain.value, SET.music * 0.35, 'volume changes preserve pause ducking');
  AU.music = false;
  changeAudioLevel('music', 1);
  AU.applyLevels();
  assert.equal(AU.mg.gain.value, 0, 'changing volume preserves music mute');
  for (let i = 0; i < 20; i++) changeAudioLevel('effects', -1);
  AU.applyLevels();
  assert.equal(AU.sg.gain.value, 0);
  const remembered = SET.music;
  SET.music = 0;
  loadAudioSettings();
  assert.equal(SET.music, remembered, 'volume survives a reload');
  store.brb_audio = '{broken';
  assert.doesNotThrow(loadAudioSettings);
  store.brb_audio = JSON.stringify({ music: 99, effects: -1, voice: 0 });
  loadAudioSettings();
  assert.equal(SET.music, 0.42);
  assert.equal(SET.effects, 0);
  assert.equal(SET.voice, 0);
} finally {
  AU.stop();
  delete globalThis.Audio;
}
assert.equal(Object.keys(IMPORTED_MUSIC).length, 19);
for (const [id, source] of Object.entries({
  byd: 'Favela_Knockout.mp3',
  cyber: 'Asphalt_Impact.mp3',
  bonus: 'Throttle_Lock.mp3',
  boss: 'Cathedral_of_the_Unbeaten.mp3',
  ending: 'The_Last_Quarter.mp3',
  win: 'Winner_s_Stance.mp3',
  cont: 'Ten_Seconds_Remaining.mp3',
})) {
  assert.equal(IMPORTED_MUSIC[id].source, source);
  assert.equal(MUSIC_FILES[id], IMPORTED_MUSIC[id].url);
  assert.ok(IMPORTED_MUSIC[id].loudness <= -19.5, `${id}: loudness`);
  assert.ok(IMPORTED_MUSIC[id].truePeak < -1, `${id}: peak headroom`);
}
console.log(
  'ALL OK: music assets, streamed imports, scene changes, fallback, mute, pause ducking and saved mixer levels',
);
