/** Capture the production intro at its key moments. */
import fs from 'node:fs';
import { GlobalFonts } from '@napi-rs/canvas';
if (fs.existsSync('output/ui/PressStart2P-Regular.ttf'))
  GlobalFonts.registerFromPath('output/ui/PressStart2P-Regular.ttf', 'Press Start 2P');
const { main, createCanvas } = await import('../tests/harness.js');
const { Intro } = await import('../src/game/scenes/intro.js');
const frames = [
  ['CRT', 'load', 18, 18],
  ['START', 'ready', 90, 20],
  ['REVEAL', 'logo', 155, 65],
  ['APRESENTA', 'logo', 220, 130],
  ['AUTOR', 'logo', 340, 250],
  ['AVISO', 'warn', 460, 90],
];
fs.mkdirSync('output/intro', { recursive: true });
const sheet = createCanvas(1280, 3 * 384),
  g = sheet.getContext('2d');
g.fillStyle = '#020a07';
g.fillRect(0, 0, sheet.width, sheet.height);
for (const [i, [label, phase, t, pt]] of frames.entries()) {
  Object.assign(Intro, { phase, t, pt, assetsReady: true });
  main.getContext('2d').setTransform(2, 0, 0, 2, 0, 0);
  Intro.draw();
  fs.writeFileSync(`output/intro/${phase}-${pt}.png`, main.toBuffer('image/png'));
  const x = (i % 2) * 640,
    y = Math.floor(i / 2) * 384;
  g.fillStyle = '#a5ff66';
  g.font = '12px monospace';
  g.fillText(label, x + 12, y + 16);
  g.drawImage(main, x, y + 24);
}
fs.writeFileSync('output/intro/contact-sheet.png', sheet.toBuffer('image/png'));
console.log('Intro frames: output/intro/contact-sheet.png');
