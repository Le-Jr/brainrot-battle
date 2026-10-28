/** Inspect each real projectile beside its caster: normal, EX and super. */
import fs from 'node:fs';
import { GlobalFonts } from '@napi-rs/canvas';
if (fs.existsSync('output/ui/PressStart2P-Regular.ttf'))
  GlobalFonts.registerFromPath('output/ui/PressStart2P-Regular.ttf', 'Press Start 2P');
const { T, main, createCanvas } = await import('../tests/harness.js');
const { VO } = await import('../src/game/audio/voice.js');
VO.on = false;
const specs = JSON.parse(fs.readFileSync('assets/sprite-art/projectiles.json', 'utf8'));
const tag = process.argv[2] || 'after';
const density = process.argv.includes('--hd') ? 3 : 1;
main.width = 640 * density;
main.height = 360 * density;
const g = main.getContext('2d'),
  out = createCanvas(1280, Object.keys(specs).length * 250),
  o = out.getContext('2d');
o.fillStyle = '#080d1c';
o.fillRect(0, 0, out.width, out.height);
fs.mkdirSync(`output/projectiles/${tag}`, { recursive: true });
for (const [row, [type, spec]] of Object.entries(specs).entries()) {
  const ch = [...T.CH, T.BOSS].find((ch) => ch.id === spec.owner);
  for (const [column, mode] of ['normal', 'ex', 'super'].entries()) {
    const f = new T.Fight(ch, T.CH[0], 0, { quiet: true, cpu: false, lv: [1, 1] });
    f.phase = 'fight';
    f.tick = 120;
    f.cam = 80;
    f.f[0].x = 145;
    f.f[1].x = 380;
    f.f[0].dir = 1;
    f.f[0].st = 'special';
    f.f[0].spec = { type: ch.sp, t: 12, sup: mode === 'super', ex: mode === 'ex', hits: 0 };
    f.spawn(f.f[0], type === 'boom' ? 'bomb' : type, f.f[1]);
    if (type === 'boom') {
      const p = f.projs[0];
      f.projs = [];
      p.x = 250;
      f.explode(p);
    }
    const p = f.projs.at(-1);
    f.projs = [p];
    p.x = 250;
    p.t = 4;
    if (type === 'meteor') p.y = 115;
    else if (type !== 'quake' && type !== 'boom') p.y = 125;
    g.setTransform(2 * density, 0, 0, 2 * density, 0, 0);
    f.draw();
    const img = createCanvas(main.width, main.height);
    img.getContext('2d').drawImage(main, 0, 0);
    fs.writeFileSync(`output/projectiles/${tag}/${type}-${mode}.png`, img.toBuffer('image/png'));
    o.imageSmoothingEnabled = false;
    o.drawImage(img, column * 426, row * 250 + 20, 426, 240);
    o.fillStyle = '#f8cd55';
    o.font = '14px monospace';
    o.fillText(type + ' / ' + mode, column * 426 + 8, row * 250 + 15);
  }
}
fs.writeFileSync(`output/projectiles/${tag}/contact-sheet.png`, out.toBuffer('image/png'));
console.log('Rendered all eight projectile types in normal, EX and super variants.');
