/** Real engine UI contact sheet, with the production font. node tools/render-ui.js [before|after] */
import fs from 'node:fs';
import { GlobalFonts } from '@napi-rs/canvas';
if (!GlobalFonts.registerFromPath('output/ui/PressStart2P-Regular.ttf', 'Press Start 2P'))
  throw new Error('Place the Press Start 2P TTF in output/ui/PressStart2P-Regular.ttf first.');
const { T, main, createCanvas } = await import('../tests/harness.js');
const { Intro } = await import('../src/game/scenes/intro.js');
const { VO } = await import('../src/game/audio/voice.js');
VO.on = false;
const label = process.argv[2] || 'after';
const frames = [];
const g = main.getContext('2d');
function capture(name, scene, setup = () => {}) {
  if (scene.enter) scene.enter();
  setup(scene);
  g.setTransform(2, 0, 0, 2, 0, 0);
  g.globalAlpha = 1;
  scene.draw();
  const copy = createCanvas(640, 360);
  copy.getContext('2d').drawImage(main, 0, 0);
  frames.push([name, copy]);
}
T.S.mode = 'arcade';
for (const [phase, pt] of [
  ['load', 40],
  ['ready', 48],
  ['logo', 130],
  ['logo', 260],
  ['warn', 180],
])
  capture('INTRO ' + phase + pt, Intro, (s) => {
    s.phase = phase;
    s.t = 140;
    s.pt = pt;
  });
capture('TITLE / ATTRACT', T.Title, (s) => {
  s.t = 140;
  s.phase = 'attract';
  s.mt = 0;
});
for (const m of [0, 3, 5])
  capture('MENU ' + m, T.Title, (s) => {
    s.t = 160;
    s.phase = 'menu';
    s.mt = 40;
    s.m = m;
  });
capture('VERSUS MODE', T.Title, (s) => {
  s.t = 160;
  s.phase = 'menu';
  s.mt = 40;
  s.m = 1;
  s.sub = { m: 0 };
});
for (const mode of ['arcade', 'versus', 'training', 'bonus']) {
  T.S.mode = mode;
  capture('SELECT ' + mode, T.Select, (s) => {
    s.t = 120;
    s.cur = [2, 6];
  });
}
T.S.mode = 'versus';
T.S.vsCpu = false;
capture('SELECT MIRROR 2P', T.Select, (s) => {
  s.t = 120;
  s.cur = [0, 0];
});
T.S.vsCpu = true;
T.S.mode = 'arcade';
for (let m = 0; m < 8; m++)
  capture('OPTIONS ' + m, T.Options, (s) => {
    s.t = 120;
    s.m = m;
  });
for (let pg = 0; pg < 2; pg++)
  capture('MOVES ' + pg, T.Moves, (s) => {
    s.pg = pg;
  });
for (let i = 0; i < 3; i++)
  capture('CAR ' + i, T.CarSelect, (s) => {
    s.t = 120;
    s.i = i;
  });
capture('STAGE SELECT', T.StageSelect(T.CH[2], T.CH[6], { cpu: true, lv: [1, 1] }, 'VERSUS'), (s) => {
  s.t = 120;
  s.i = 0;
});
capture('VS', T.VS(T.CH[2], T.CH[6], 0, { cpu: true, lv: [1, 1] }, 'VERSUS CPU'), (s) => {
  s.t = 100;
});
const fight = new T.Fight(T.CH[2], T.CH[6], 0, { cpu: true, quiet: true, lv: [1, 1] });
fight.phase = 'fight';
fight.f[0].meter = 100;
fight.f[1].hp = 35;
fight.tick = 120;
capture('FIGHT HUD', { draw: () => fight.draw() });
fight.timer = 9;
fight.f[0].hp = 14;
fight.f[0].dhp = 40;
fight.combo[0] = { n: 12, t: 50 };
capture('HUD CRITICAL COMBO', { draw: () => fight.draw() });
fight.timer = 99;
fight.f[0].hp = 100;
fight.f[0].dhp = 100;
fight.combo[0] = null;
const training = new T.Training(T.CH[1], T.CH[4]);
training.phase = 'fight';
training.tick = 120;
training.show = { dmg: 42, t: 90 };
capture('TRAINING HUD', { draw: () => training.draw() });
for (const confirm of [false, true])
  capture(
    'PAUSE ' + confirm,
    T.FightScene(fight, () => {}),
    (s) => {
      s.pause = true;
      s.pt = 60;
      s.pm = 3;
      s.confirm = confirm;
      s.cm = 0;
    },
  );
for (const type of ['nonno', 'cyber', 'byd']) {
  const b = new T.Bonus(T.CH[0], 1, type);
  b.phase = 'fight';
  b.tick = 120;
  capture('BONUS ' + type, { draw: () => b.draw() });
}
T.S.mode = 'arcade';
const xi = {
  f: fight.f,
  stage: fight.stage,
  wins: [2, 1],
  perfects: [1, 0],
  combo: 7,
  gains: [340, 20],
  ups: [true, false],
};
for (const side of [0, 1])
  capture('RESULT ' + side, T.Result(fight.f[side], side, {}, xi), (s) => {
    s.t = 130;
  });
capture(
  'BONUS RESULT',
  T.BonusResult(T.CH[0], true, 650, true, () => {}, 'cyber'),
  (s) => {
    s.t = 120;
  },
);
capture('CONTINUE', T.Continue, (s) => {
  s.t = 120;
  s.st = 20;
});
capture('GAME OVER', T.Continue, (s) => {
  s.t = 120;
  s.over = 90;
});
capture(
  'CUTSCENE',
  T.Cutscene(T.WORLD_PRO, () => {}),
  (s) => {
    s.i = 0;
    s.t = 220;
  },
);
capture(
  'CUTSCENE SPEAKER',
  T.Cutscene(T.WORLD_PRO, () => {}),
  (s) => {
    s.i = 3;
    s.t = 220;
  },
);
T.S.ladder = [1, 2, 3, 4, 5, 6, 7];
T.S.li = 0;
capture(
  'TRAVEL',
  T.Travel(0, 5, () => {}),
  (s) => {
    s.t = 100;
  },
);
capture('ENDING', T.Ending, (s) => {
  s.t = 120;
});
fs.mkdirSync('output/ui/' + label, { recursive: true });
const sheet = createCanvas(1280, Math.ceil(frames.length / 2) * 390),
  sg = sheet.getContext('2d');
sg.fillStyle = '#080d1c';
sg.fillRect(0, 0, sheet.width, sheet.height);
frames.forEach(([name, c], i) => {
  fs.writeFileSync(
    'output/ui/' + label + '/' + name.replaceAll(/[^a-z0-9]/gi, '-').toLowerCase() + '.png',
    c.toBuffer('image/png'),
  );
  const x = (i % 2) * 640,
    y = Math.floor(i / 2) * 390;
  sg.fillStyle = '#f8cd55';
  sg.font = '14px monospace';
  sg.fillText(name, x + 12, y + 20);
  sg.drawImage(c, x, y + 30);
});
fs.writeFileSync('output/ui/' + label + '/contact-sheet.png', sheet.toBuffer('image/png'));
console.log('Rendered', frames.length, 'UI states:', 'output/ui/' + label);
