/** Render actual campaign travel screens with the production font. */
import fs from 'node:fs';
import { GlobalFonts } from '@napi-rs/canvas';
if (fs.existsSync('output/ui/PressStart2P-Regular.ttf'))
  GlobalFonts.registerFromPath('output/ui/PressStart2P-Regular.ttf', 'Press Start 2P');
const { T, main, createCanvas } = await import('../tests/harness.js');
const { VO } = await import('../src/game/audio/voice.js');
VO.on = false;
T.S.p1 = 0;
T.S.ladder = [4, 1, 2, 3, 5, 6, 7];
const g = main.getContext('2d');
fs.mkdirSync('output/map', { recursive: true });
const sheet = createCanvas(1280, 720);
for (const [i, [name, li, from, to, t]] of [
  ['jungle', 2, 0, 2, 100],
  ['island', 3, 3, 8, 160],
  ['saturn', 7, 7, 9, 165],
  ['departure', 0, 0, 4, 30],
].entries()) {
  T.S.li = li;
  const scene = T.Travel(from, to, () => {});
  scene.t = t;
  g.setTransform(2, 0, 0, 2, 0, 0);
  scene.draw();
  fs.writeFileSync(`output/map/${name}.png`, main.toBuffer('image/png'));
  sheet.getContext('2d').drawImage(main, (i % 2) * 640, Math.floor(i / 2) * 360);
}
fs.writeFileSync('output/map/contact-sheet.png', sheet.toBuffer('image/png'));
console.log('Travel previews: output/map/contact-sheet.png');
