/* Bonus mode: pick which car to smash. */
import { AU } from '../audio/synth.js';
import { CARS } from '../characters/cars.js';
import { CH } from '../characters/roster.js';
import { H, W } from '../config.js';
import { ctx, txt, vgrad, wrap } from '../core/canvas.js';
import { CONFIRM, anyPressed, menuPad } from '../core/input.js';
import { go } from '../core/scene.js';
import { drawSpr, sprite } from '../sprites/sprite.js';
import { S } from '../state.js';
import { startBonus } from './flow.js';
import { Select } from './select.js';

const CARLIST = [
  ['nonno', 'MACCHINA DEL NONNO', 'Clássico italiano. Resistente, mas tem limite.'],
  ['cyber', 'CYBERCAMINHÃO', 'Aço inox e vidro "blindado". O mais duro de todos.'],
  ['byd', 'BI-AI-DI', 'Elétrico zero km. Cuidado com o papagaio.'],
];
const CarSelect = {
  id: 'car-select',
  enter() {
    this.i = ['nonno', 'cyber', 'byd'].indexOf(S.car);
    this.t = 0;
  },
  update() {
    this.t++;
    const p = menuPad();
    if (p.pleft) {
      this.i = (this.i + 2) % 3;
      AU.sfx('blip');
    }
    if (p.pright) {
      this.i = (this.i + 1) % 3;
      AU.sfx('blip');
    }
    if (anyPressed(['Escape', 'Backspace'])) {
      go(Select);
      return;
    }
    if (anyPressed(CONFIRM)) {
      AU.sfx('ok');
      S.car = CARLIST[this.i][0];
      startBonus(CH[S.p1], S.car, () => go(CarSelect));
    }
  },
  draw() {
    const t = this.t;
    ctx.fillStyle = '#120a1c';
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 12) {
      ctx.fillStyle = (y / 12) % 2 ? '#1a1028' : '#160d22';
      ctx.fillRect(0, y, W, 12);
    }
    txt('ESCOLHA O ALVO', W / 2, 8, 16, vgrad(8, 16, ['#fff7b0', '#ffb03a', '#ff5a2a']), 'center');
    CARLIST.forEach(([id, n], i) => {
      const x = 12 + i * 101,
        sel = i === this.i;
      ctx.fillStyle = sel ? 'rgba(255,210,58,.2)' : 'rgba(255,255,255,.05)';
      ctx.fillRect(x, 34, 94, 84);
      if (sel) {
        ctx.strokeStyle = (t >> 3) & 1 ? '#ffd23a' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, 34, 94, 84);
      }
      drawSpr(
        sprite(CARS[id], 'd' + (sel ? 0 : Math.min(3, (t >> 5) % 4)), 0, 0, false, ''),
        x + 47,
        96,
        1,
        0.95,
      );
      wrap(n, 11).forEach((l, k) =>
        txt(l, x + 47, 100 + k * 9, 8, sel ? '#ffffff' : '#9a8fb3', 'center', null),
      );
    });
    wrap(CARLIST[this.i][2], 36).forEach((l, k) => txt(l, W / 2, 132 + k * 10, 8, '#f1e9ff', 'center', null));
    txt('← →  ENTER: QUEBRAR   ESC: VOLTAR', W / 2, 166, 8, '#9a8fb3', 'center', null);
  },
};

export { CarSelect };
