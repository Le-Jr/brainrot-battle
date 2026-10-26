import { UI, screenBackdrop, screenHeader, screenFooter, paragraph, panel } from '../ui/theme.js';
/* Bonus mode: pick which car to smash. */
import { AU } from '../audio/synth.js';
import { CARS } from '../characters/cars.js';
import { CH } from '../characters/roster.js';

import { ctx, txt } from '../core/canvas.js';
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
    screenBackdrop(this.t);
    screenHeader('BÔNUS', 'TARGET SELECT');
    CARLIST.forEach(([id, name], i) => {
      const x = 10 + i * 102,
        selected = i === this.i;
      panel(x, 38, 96, 82, selected ? UI.gold : UI.line);
      txt('0' + (i + 1), x + 6, 44, 6, selected ? UI.gold : UI.muted, 'left', null);
      drawSpr(sprite(CARS[id], 'd0', 0, 0, false, ''), x + 48, 94, 1, 0.84);
      paragraph(name, x + 48, 102, 84, {
        size: 6,
        align: 'center',
        lineHeight: 9,
        maxLines: 2,
        color: selected ? UI.white : UI.muted,
      });
      if (selected) {
        ctx.fillStyle = UI.gold;
        ctx.fillRect(x + 1, 117, 94, 2);
      }
    });
    panel(10, 128, 300, 29, UI.line);
    paragraph(CARLIST[this.i][2], 20, 135, 280, { size: 6, lineHeight: 10, maxLines: 2 });
    screenFooter('←→ ESCOLHER', 'ENTER QUEBRAR · ESC VOLTAR');
  },
};

export { CarSelect };
