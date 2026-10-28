/** Normalize the rendered masters with a constant gain and encode gapless Vorbis. */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { writeMusicPlaylist } from './music-playlist.js';

export function encodeMusic(report, out, published) {
  fs.mkdirSync(published, { recursive: true });
  for (const entry of report) {
    const input = path.join(out, entry.name + '.wav');
    const wav = fs.readFileSync(input);
    // The renderer writes a fixed 44-byte stereo PCM16 header.
    const frames = (wav.length - 44) / 4;
    for (let ch = 0; ch < 2; ch++) {
      const first = wav.readInt16LE(44 + ch * 2);
      const last = wav.readInt16LE(44 + (frames - 1) * 4 + ch * 2);
      // Remove a possible DC step at the wrap, over just 1.5 ms.
      for (let i = 0; i < 64; i++) {
        const at = 44 + i * 4 + ch * 2;
        const value = wav.readInt16LE(at) + (last - first) * (1 - i / 64);
        wav.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(value))), at);
      }
    }
    const loopMaster = path.join(out, entry.name + '-loop.wav');
    fs.writeFileSync(loopMaster, wav);
    let peak = 1;
    for (let at = 44; at < wav.length; at += 2) peak = Math.max(peak, Math.abs(wav.readInt16LE(at)));
    const gain = (0.85 * 32767) / peak;
    execFileSync('ffmpeg', [
      '-v',
      'error',
      '-y',
      '-i',
      loopMaster,
      '-af',
      `volume=${gain}`,
      '-c:a',
      'libvorbis',
      '-q:a',
      '5',
      path.join(published, entry.name + '.ogg'),
    ]);
    entry.encodedPeakTarget = 0.85;
  }
  fs.writeFileSync(path.join(published, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  writeMusicPlaylist(report, out, published);
}

if (process.argv[1]?.endsWith('/encode-music.js')) {
  const out = path.resolve('output/music');
  encodeMusic(
    JSON.parse(fs.readFileSync(path.join(out, 'report.json'), 'utf8')),
    out,
    path.resolve('public/audio/music'),
  );
}
