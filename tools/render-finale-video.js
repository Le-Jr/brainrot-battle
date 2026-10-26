/** Review movie assembled from actual engine frames, original FM score and shipped Chatterbox voices. */
import fs from 'node:fs';
import { once } from 'node:events';
import { spawn, execFileSync } from 'node:child_process';
import { GlobalFonts } from '@napi-rs/canvas';
if (fs.existsSync('output/ui/PressStart2P-Regular.ttf'))
  GlobalFonts.registerFromPath('output/ui/PressStart2P-Regular.ttf', 'Press Start 2P');
const { T, main } = await import('../tests/harness.js');
const { Finale } = await import('../src/game/scenes/finale.js');
const { ASCENSION, FINAL_VICTORY } = await import('../src/game/story/finale.js');
const { VO } = await import('../src/game/audio/voice.js');
const { VOICE_CLIPS } = await import('../src/game/data/voice-clips.js');
const { voiceKey } = await import('../src/game/audio/voice-key.js');
VO.on = false;
T.S.p1 = 0;
fs.mkdirSync('output/finale', { recursive: true });
const victory = process.argv.includes('--victory');
const panels = victory ? FINAL_VICTORY : ASCENSION;
const basename = victory ? 'collective-victory' : 'cinematic';
let at = 0;
const timeline = panels.map((p) => {
  const file = 'public/audio/voices/' + VOICE_CLIPS[voiceKey(p.text, 'pt')][0];
  const duration = Number(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], {
      encoding: 'utf8',
    }),
  );
  const frames = Math.ceil(Math.max(p.frames / 60, duration + 0.5) * 30);
  const beat = { file, start: at, frames };
  at += frames / 30;
  return beat;
});
const video = spawn(
  'ffmpeg',
  [
    '-nostdin',
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-f',
    'rawvideo',
    '-pixel_format',
    'rgba',
    '-video_size',
    '640x360',
    '-framerate',
    '30',
    '-i',
    'pipe:0',
    '-an',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '20',
    '-pix_fmt',
    'yuv420p',
    `output/finale/${basename}-silent.mp4`,
  ],
  { stdio: ['pipe', 'ignore', 'inherit'] },
);
const closed = once(video, 'close');
const scene = Finale(panels, () => {}, victory),
  g = main.getContext('2d');
for (let i = 0; i < timeline.length; i++) {
  scene.i = i;
  for (let frame = 0; frame < timeline[i].frames; frame++) {
    scene.t = frame * 2;
    g.setTransform(2, 0, 0, 2, 0, 0);
    scene.draw();
    const data = Buffer.from(g.getImageData(0, 0, 640, 360).data.buffer);
    if (!video.stdin.write(data)) await once(video.stdin, 'drain');
  }
  console.log('Rendered beat', i + 1);
}
video.stdin.end();
const [code] = await closed;
if (code !== 0) throw new Error('Video encoding failed: ' + code);
const change = victory ? at : timeline[5].start;
const filters = [
  `[1:a]atrim=0:${change},asetpts=PTS-STARTPTS,volume=0.45[opening]`,
  `[2:a]atrim=0:${at - change},asetpts=PTS-STARTPTS,volume=0.65,adelay=${Math.round(change * 1000)}:all=1[battle]`,
];
timeline.forEach((beat, i) =>
  filters.push(`[${i + 3}:a]adelay=${Math.round(beat.start * 1000)}:all=1[v${i}]`),
);
filters.push(
  '[opening][battle]' +
    timeline.map((_, i) => `[v${i}]`).join('') +
    `amix=inputs=${timeline.length + 2}:normalize=0,alimiter=limit=0.95[mix]`,
);
const args = [
  '-nostdin',
  '-hide_banner',
  '-loglevel',
  'error',
  '-y',
  '-i',
  `output/finale/${basename}-silent.mp4`,
  '-stream_loop',
  '-1',
  '-i',
  victory ? 'output/finale/audio/laststand.wav' : 'output/finale/audio/ascension.wav',
  '-stream_loop',
  '-1',
  '-i',
  'output/finale/audio/laststand.wav',
];
for (const beat of timeline) args.push('-i', beat.file);
args.push(
  '-filter_complex',
  filters.join(';'),
  '-map',
  '0:v',
  '-map',
  '[mix]',
  '-c:v',
  'copy',
  '-c:a',
  'aac',
  '-b:a',
  '192k',
  '-t',
  String(at),
  '-movflags',
  '+faststart',
  `output/finale/${basename}.mp4`,
);
execFileSync('ffmpeg', args, { stdio: 'inherit' });
fs.writeFileSync(`output/finale/${basename}-timeline.json`, JSON.stringify(timeline, null, 2) + '\n');
console.log('Review movie:', at.toFixed(1), `seconds, output/finale/${basename}.mp4`);
