/* Continue countdown after losing a story fight. */
import { AU } from '../audio/synth.js';
import { CH } from '../characters/roster.js';
import { H, W } from '../config.js';
import { ctx, txt, vgrad } from '../core/canvas.js';
import { CONFIRM, anyPressed } from '../core/input.js';
import { go } from '../core/scene.js';
import { drawSpr, sprite } from '../sprites/sprite.js';
import { S } from '../state.js';
import { goVs } from './flow.js';
import { Title } from './title.js';

const Continue = {
  id: 'continue',
  tapStart: true,
  enter() {
    this.t = 0;
    this.n = 9;
    AU.play('cont');
  },
  update() {
    this.t++;
    if (this.n >= 0 && this.t % 60 === 0) {
      this.n--;
      AU.sfx('blip');
    }
    if (this.n >= 0 && anyPressed(CONFIRM)) {
      AU.sfx('ok');
      goVs();
    }
    if (this.n < -2) go(Title);
  },
  draw() {
    ctx.fillStyle = '#0c0814';
    ctx.fillRect(0, 0, W, H);
    const ch = CH[S.p1];
    drawSpr(sprite(ch, 'down', 0, 0, false, ''), W / 2 - 24, 150, 1, 1, true);
    if (this.n >= 0) {
      txt('CONTINUAR?', W / 2, 40, 16, '#ffffff', 'center');
      txt(String(this.n), W / 2, 70, 32, vgrad(70, 32, ['#ffffff', '#ffd23a', '#ff4d5e']), 'center');
      txt('APERTE START', W / 2, 164, 8, '#cbbfe6', 'center');
    } else txt('FIM DE JOGO', W / 2, 60, 16, '#ff4d5e', 'center');
  },
};

export { Continue };
