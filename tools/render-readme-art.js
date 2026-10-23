// Renders the README artwork with the real engine (headless, through tests/harness.js):
//   assets/readme/banner.png            title screen
//   assets/readme/chars/<id>.png        idle and win poses of every fighter
//   assets/readme/stages.png            4-column grid with a live fight on each of the 13 stages
//   assets/readme/<scene>.png           select, map, cutscene, bonus and boss-fight screens
// Usage: npm run readme:art
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GlobalFonts } from '@napi-rs/canvas';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// Skia cannot read woff2, so fetch the TTF of Press Start 2P (SIL OFL) once into node_modules/.cache
const FONT = path.join(ROOT, 'node_modules', '.cache', 'brainrot-battaglia', 'PressStart2P-Regular.ttf');
if (!fs.existsSync(FONT)) {
  try {
    const css = await (
      await fetch('https://fonts.googleapis.com/css2?family=Press+Start+2P', {
        headers: { 'User-Agent': 'Mozilla/4.0' },
      })
    ).text();
    const url = /url\((https:[^)]+\.ttf)\)/.exec(css)[1];
    fs.mkdirSync(path.dirname(FONT), { recursive: true });
    fs.writeFileSync(FONT, Buffer.from(await (await fetch(url)).arrayBuffer()));
  } catch (e) {
    console.warn('Could not download the pixel font, text will use a fallback:', e.message);
  }
}
if (fs.existsSync(FONT)) GlobalFonts.registerFromPath(FONT, 'Press Start 2P');
const { T, main, createCanvas } = await import('../tests/harness.js');
const OUT = path.join(ROOT, 'assets', 'readme');
fs.mkdirSync(path.join(OUT, 'chars'), { recursive: true });
const g = main.getContext('2d');
const save = (canvas, name) => fs.writeFileSync(path.join(OUT, name), canvas.toBuffer('image/png'));
const frame = () => {
  g.setTransform(2, 0, 0, 2, 0, 0);
  g.imageSmoothingEnabled = false;
  g.globalAlpha = 1;
  T.scene.draw();
};
const run = (n, fn) => {
  for (let i = 0; i < n; i++) {
    if (fn) fn(i);
    T.step();
  }
};

// Deterministic randomness, so re-running the script gives the same pictures
let seed = 42;
Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// Title screen, after the logo slam
T.go(T.Title);
run(120);
frame();
save(main, 'banner.png');

// Character cards: idle and win poses, cropped to the sprite and scaled 2x
for (const ch of [...T.CH, T.BOSS]) {
  for (const [pose, f] of [
    ['idle', 0],
    ['win', 6],
  ]) {
    const img = T.sprite(ch, pose, f, 0, false, '');
    const d = img.getContext('2d').getImageData(0, 0, img.width, img.height).data;
    let x0 = 1e9,
      y0 = 1e9,
      x1 = -1,
      y1 = -1;
    for (let y = 0; y < img.height; y++)
      for (let x = 0; x < img.width; x++)
        if (d[(y * img.width + x) * 4 + 3] > 0) {
          x0 = Math.min(x0, x);
          y0 = Math.min(y0, y);
          x1 = Math.max(x1, x);
          y1 = Math.max(y1, y);
        }
    const w = x1 - x0 + 1,
      h = y1 - y0 + 1,
      pad = 8,
      c = createCanvas((w + pad * 2) * 2, (h + pad * 2) * 2),
      cg = c.getContext('2d');
    cg.imageSmoothingEnabled = false;
    cg.drawImage(img, x0, y0, w, h, pad * 2, pad * 2, w * 2, h * 2);
    save(c, `chars/${ch.id}${pose === 'win' ? '-win' : ''}.png`);
  }
}

// Stage grid: a CPU vs CPU fight on every stage, 4 columns at 320x180
const stages = T.STG();
const cols = 4,
  grid = createCanvas(320 * cols, 180 * Math.ceil(stages.length / cols)),
  gg = grid.getContext('2d');
gg.fillStyle = '#0c0814';
gg.fillRect(0, 0, grid.width, grid.height);
stages.forEach((st, i) => {
  const F = new T.Fight(T.CH[i % 8], T.CH[(i + 3) % 8], i, { cpu: true, lvl: 2, quiet: true });
  F.ai[0] = new T.AI(2);
  for (let k = 0; k < 260; k++) F.update();
  g.setTransform(2, 0, 0, 2, 0, 0);
  F.draw();
  gg.drawImage(main, (i % cols) * 320, Math.floor(i / cols) * 180, 320, 180);
});
save(grid, 'stages.png');

// Screens
T.S.mode = 'arcade';
T.go(T.Select);
run(40);
frame();
save(main, 'select.png');

T.S.p1 = 0;
T.S.ladder = [4, 1, 2, 3, 5, 6, 7];
T.S.li = 2;
T.S.loc = 0;
T.go(T.Travel(0, T.CH[T.S.ladder[2]].stage, () => {}));
run(120);
frame();
save(main, 'map.png');

T.go(T.Cutscene(T.preFight(T.CH[0], T.CH[2], 0), () => {}, T.CH[2]));
T.scene.i = 1;
run(140);
frame();
save(main, 'cutscene.png');

const B = new T.Bonus(T.CH[5], 3, 'byd');
T.go(T.FightScene(B, () => {}));
run(900, (n) => {
  T.keys.clear();
  T.keys.add('KeyD');
  if (n % 5 === 0) T.pressedQ.add(['KeyJ', 'KeyK', 'KeyJ', 'KeyL'][(n / 5) % 4]);
  if (B.f[1].hp < B.f[1].maxhp * 0.45) T.keys.clear();
});
frame();
save(main, 'bonus.png');

const F = new T.Fight(T.CH[3], T.BOSS, 9, { cpu: true, lvl: 2, quiet: true, lv: [5, 8] });
F.ai[0] = new T.AI(2);
T.go(T.FightScene(F, () => {}));
run(420);
frame();
save(main, 'boss-fight.png');

console.log('README art written to', path.relative(ROOT, OUT));
