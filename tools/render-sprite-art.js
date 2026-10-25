// Review the actual runtime sprites and effects without a running server.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { T, createCanvas } from '../tests/harness.js';
import { PROJECTILE_ART } from '../src/game/data/projectile-art.js';
import { drawProjectileArt } from '../src/game/sprites/projectile-art.js';

const roster = [...T.CH, T.BOSS];
const samples = [
  ...[0, 2, 4, 6].map((f) => ['walk', f, 0]),
  ...['punch', 'kick'].flatMap((p) => [0.5, 1, 0.25].map((a) => [p, 0, a])),
  ['special', 0, 0.5],
  ['special', 0, 1],
];
const cards = roster.map((ch) => ({
  name: ch.id,
  frames: samples.map(([p, f, a]) => T.sprite(ch, p, f, a, false, '').toDataURL()),
}));
const effects = createCanvas(600, 8 * 80),
  g = effects.getContext('2d');
g.fillStyle = '#32283f';
g.fillRect(0, 0, effects.width, effects.height);
Object.keys(PROJECTILE_ART).forEach((type, row) => {
  g.fillStyle = '#fff';
  g.fillText(type, 10, row * 80 + 40);
  [0, 4, 8].forEach((t, i) =>
    drawProjectileArt(g, { type, t, dir: 1, w: 48 }, 170 + i * 150, row * 80 + 40, t),
  );
});
fs.mkdirSync('output/sprite-art', { recursive: true });
fs.writeFileSync('output/sprite-art/projectiles.png', effects.toBuffer('image/png'));
fs.writeFileSync(
  'output/sprite-art/preview.html',
  `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Revisão dos sprites</title><style>body{background:#211b2c;color:#fff;font:16px system-ui;padding:24px}main{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}article{background:#32283f;padding:16px}img{image-rendering:pixelated;max-width:100%}article img{width:256px}label{display:block}</style><h1>Sprites regenerados</h1><p>Caminhada · soco · chute · especial</p><button id="pause">Pausar / continuar</button><main></main><h2>Projéteis: três fases</h2><img src="projectiles.png"><script>const cards=${JSON.stringify(cards)};let tick=0,paused=false;const main=document.querySelector('main');cards.forEach(c=>{const a=document.createElement('article');a.innerHTML='<label>'+c.name+'</label><img alt="'+c.name+'">';main.append(a)});function draw(){document.querySelectorAll('article img').forEach((im,i)=>im.src=cards[i].frames[tick%12])}draw();document.querySelector('button').onclick=()=>paused=!paused;setInterval(()=>{if(!paused){tick++;draw()}},160);</script></html>`,
);
const sha = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const files = [
  ...roster.map((ch) => `public/atlases/${ch.id}.png`),
  ...Object.keys(PROJECTILE_ART).map((t) => `public/atlases/projectile-${t}.png`),
];
fs.writeFileSync(
  'docs/arte/geracao-sprites-2026-10-25.json',
  JSON.stringify(
    {
      date: '2026-10-25',
      tool: 'image_gen',
      characters: 9,
      framesPerCharacter: 19,
      projectileTypes: 8,
      framesPerProjectile: 3,
      prompts: ['assets/sprite-art/prompts.json', 'assets/sprite-art/projectiles.json'],
      files: files.map((file) => ({ file, sha256: sha(file) })),
    },
    null,
    2,
  ) + '\n',
);
console.log('Sprite preview and generation inventory written.');
