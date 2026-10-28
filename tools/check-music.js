/** Decode shipped assets, checking actual samples rather than encoder metadata. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
const report = JSON.parse(fs.readFileSync('public/audio/music/report.json', 'utf8'));
const decoded = [];
for (const track of report) {
  const pcm = execFileSync(
    'ffmpeg',
    [
      '-v',
      'error',
      '-i',
      `public/audio/music/${track.name}.ogg`,
      '-ar',
      '44100',
      '-ac',
      '2',
      '-f',
      'f32le',
      '-',
    ],
    { maxBuffer: 64 * 1024 * 1024 },
  );
  let peak = 0,
    sum = 0;
  for (let i = 0; i < pcm.length; i += 4) {
    const v = pcm.readFloatLE(i);
    assert.ok(Number.isFinite(v), track.name);
    peak = Math.max(peak, Math.abs(v));
    sum += v * v;
  }
  const rms = Math.sqrt(sum / (pcm.length / 4));
  const duration = pcm.length / 8 / 44100;
  const seam = Math.max(
    ...[0, 1].map((ch) => Math.abs(pcm.readFloatLE(ch * 4) - pcm.readFloatLE(pcm.length - 8 + ch * 4))),
  );
  assert.ok(peak < 1 && rms > 0.02, `${track.name}: clipping/silence (${peak}, ${rms})`);
  assert.ok(Math.abs(duration - track.duration) < 0.004, `${track.name}: loop length changed`);
  assert.ok(seam < 0.1, `${track.name}: discontinuity at loop boundary (${seam})`);
  decoded.push({ name: track.name, duration, peak, rms, seam });
}
fs.writeFileSync('output/music/decoded-report.json', JSON.stringify(decoded, null, 2) + '\n');
console.table(decoded);
