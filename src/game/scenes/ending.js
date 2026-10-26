import { UI, screenBackdrop, screenHeader, screenFooter, panel, paragraph } from '../ui/theme.js';
/* Ending celebration and rolling credits. */
import { AU } from '../audio/synth.js';
import { IT, VO } from '../audio/voice.js';
import { CH } from '../characters/roster.js';
import { GAME } from '../config.js';
import { ctx, txt } from '../core/canvas.js';
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
          ['#62c9ee', '#f8cd55'],
          ['#45b4ff', '#ffffff'],
          ['#7aff9a', '#f8cd55'],
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
    screenBackdrop(t);
    for (const p of FX.parts) {
      ctx.fillStyle = p.c;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
    }
    screenHeader('CAMPIONE', 'ALL CLEAR');
    txt('DEL BRAINROT!', 160, 40, 16, UI.gold, 'center');
    let k = 0;
    CH.forEach((ch, i) => {
      if (i === S.p1) return;
      const x = 26 + k++ * (268 / 6);
      drawSpr(sprite(ch, 'win', (Math.floor(t / 7) + i) % 8, 0, false, ''), x, 132, x < 160 ? 1 : -1, 0.55);
    });
    panel(145, 116, 30, 17, UI.gold, UI.goldDark);
    drawSpr(sprite(CH[S.p1], 'win', Math.floor(t / 7) % 8, 0, false, ''), 160, 116, 1, 1.0);
    panel(10, 139, 300, 23, UI.line);
    paragraph(CREDITS[Math.floor(t / 150) % CREDITS.length], 160, 145, 282, {
      size: 6,
      align: 'center',
      lineHeight: 10,
      maxLines: 2,
      color: UI.white,
    });
    screenFooter('FREE PLAY', 'ENTER VOLTAR AO MENU');
  },
};

export { Ending };
