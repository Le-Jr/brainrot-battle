import { UNLOCKS } from '../src/game/progression/unlocks.js';
/** Real engine previews for every cinematic beat and the second boss fight. */
import fs from 'node:fs';
import { GlobalFonts } from '@napi-rs/canvas';
if (fs.existsSync('output/ui/PressStart2P-Regular.ttf'))
  GlobalFonts.registerFromPath('output/ui/PressStart2P-Regular.ttf', 'Press Start 2P');
const { T, main, createCanvas } = await import('../tests/harness.js');
const { Finale } = await import('../src/game/scenes/finale.js');
const { ASCENSION, FINAL_VICTORY } = await import('../src/game/story/finale.js');
const { FinalFight } = await import('../src/game/combat/final-fight.js');
const { MEGA_BOSS } = await import('../src/game/characters/fighters/saturnita-mega.js');
const { VO } = await import('../src/game/audio/voice.js');
VO.on = false;
T.S.p1 = 0;
const g = main.getContext('2d');
fs.mkdirSync('output/finale', { recursive: true });
const captures = [];
for (const [label, panels] of [
  ['ascension', ASCENSION],
  ['victory', FINAL_VICTORY],
]) {
  const s = Finale(panels, () => {}, label === 'victory');
  for (let i = 0; i < panels.length; i++) {
    s.i = i;
    s.t = 240;
    g.setTransform(2, 0, 0, 2, 0, 0);
    s.draw();
    const name = `${label}-${i + 1}-${panels[i].shot}`;
    fs.writeFileSync(`output/finale/${name}.png`, main.toBuffer('image/png'));
    const c = createCanvas(640, 360);
    c.getContext('2d').drawImage(main, 0, 0);
    captures.push(c);
  }
}
const f = new FinalFight(T.CH[0], { cpu: true, lvl: 1, lv: [4, 5] });
f.phase = 'fight';
f.tick = 140;
f.warning = { x: f.f[0].x + 55, remaining: 40, cycle: 0 };
g.setTransform(2, 0, 0, 2, 0, 0);
f.draw();
fs.writeFileSync('output/finale/final-fight.png', main.toBuffer('image/png'));
const last = createCanvas(640, 360);
last.getContext('2d').drawImage(main, 0, 0);
captures.push(last);
const sheet = createCanvas(1280, Math.ceil(captures.length / 2) * 360);
captures.forEach((c, i) => sheet.getContext('2d').drawImage(c, (i % 2) * 640, Math.floor(i / 2) * 360));
fs.writeFileSync('output/finale/contact-sheet.png', sheet.toBuffer('image/png'));
console.log('Final boss profile:', T.profile(MEGA_BOSS));
console.log('Finale previews: output/finale/');

UNLOCKS.beginSandbox();
for (const unlocked of [false, true]) {
  UNLOCKS.data.bribri = unlocked;
  T.S.mode = 'versus';
  T.S.vsCpu = true;
  T.S.p1 = unlocked ? 8 : 0;
  T.go(T.Select);
  T.Select.t = 120;
  g.setTransform(2, 0, 0, 2, 0, 0);
  T.Select.draw();
  fs.writeFileSync(
    `output/finale/select-${unlocked ? 'unlocked' : 'locked'}.png`,
    main.toBuffer('image/png'),
  );
}
UNLOCKS.endSandbox();
