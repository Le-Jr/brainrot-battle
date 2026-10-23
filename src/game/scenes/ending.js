/* Ending celebration and rolling credits. */
import { AU } from '../audio/synth.js';
import { IT, VO } from '../audio/voice.js';
import { CH } from '../characters/roster.js';
import { GAME, H, W } from '../config.js';
import { R, ctx, txt, vgrad } from '../core/canvas.js';
import { CONFIRM, anyPressed } from '../core/input.js';
import { rnd } from '../core/math.js';
import { go } from '../core/scene.js';
import { FX, spark, updFX } from '../fx/particles.js';
import { drawSpr, sprite } from '../sprites/sprite.js';
import { S } from '../state.js';
import { Title } from './title.js';

const CREDITS = [
  'OBRIGADO POR JOGAR ' + GAME + '!',
  'ELENCO: 8 BRAINROTS FURIOSOS',
  'CHEFE: LA VACCA SATURNITA',
  'MÚSICA: FM AO VIVO NO SEU NAVEGADOR',
  'FARME XP NO MODO BÔNUS',
  'APERTE START',
];
const Ending = {
  id: 'ending',
  tapStart: true,
  enter() {
    this.t = 0;
    AU.play('ending');
    setTimeout(() => VO.say('Campione del Brainrot!', IT), 300);
  },
  update() {
    this.t++;
    if (this.t % 14 === 0)
      spark(
        rnd(30, 290),
        rnd(20, 80),
        [
          ['#ff6ad5', '#ffd23a'],
          ['#45b4ff', '#ffffff'],
          ['#7aff9a', '#ffd23a'],
        ][Math.floor(rnd(0, 3))],
        22,
        2.2,
        0.04,
      );
    updFX();
    if (this.t > 120 && anyPressed(CONFIRM)) go(Title);
  },
  draw() {
    const t = this.t;
    ctx.fillStyle = vgrad(0, H, ['#0b0a26', '#3b2a72', '#c06a7c']);
    ctx.fillRect(0, 0, W, H);
    for (const p of FX.parts) {
      ctx.fillStyle = p.c;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
    }
    ctx.fillStyle = '#2a1d4c';
    ctx.fillRect(0, 150, W, 30);
    CH.forEach((c, i) => {
      if (i === S.p1) return;
      const k = i < S.p1 ? i : i - 1,
        x = 24 + k * (272 / 6) + (k > 2 ? 38 : 0);
      drawSpr(sprite(c, 'win', (Math.floor(t / 7) + i) % 8, 0, false, ''), x, 152, x < W / 2 ? 1 : -1);
    });
    R(ctx, W / 2 - 14, 128, 28, 24, '#d4a14a');
    R(ctx, W / 2 - 14, 128, 28, 2, '#ffe08a');
    drawSpr(sprite(CH[S.p1], 'win', Math.floor(t / 7) % 8, 0, false, ''), W / 2, 128, 1);
    txt('CAMPIONE', W / 2, 10, 16, vgrad(10, 16, ['#fff7b0', '#ffb03a', '#ff4a3a']), 'center');
    txt('DEL BRAINROT!', W / 2, 30, 16, '#ffffff', 'center');
    txt(CREDITS[Math.floor(t / 150) % CREDITS.length], W / 2, 166, 8, '#ffd23a', 'center');
  },
};

export { Ending };
