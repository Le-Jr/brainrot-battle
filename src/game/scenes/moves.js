import { UI, screenBackdrop, screenHeader, screenFooter, fitLabel } from '../ui/theme.js';
/* COMANDOS screen: two-page move list. */
import { AU } from '../audio/synth.js';
import { availableRoster } from '../characters/roster.js';

import { ctx, txt } from '../core/canvas.js';
import { CONFIRM, anyPressed, menuPad } from '../core/input.js';
import { go } from '../core/scene.js';
import { Title } from './title.js';

const Moves = {
  id: 'moves',
  enter() {
    this.t = 0;
    this.pg = 0;
  },
  update() {
    this.t++;
    const p = menuPad();
    if (p.pleft || p.pright) {
      this.pg ^= 1;
      AU.sfx('blip');
    }
    if (anyPressed(['Escape', 'Backspace']) || anyPressed(CONFIRM)) {
      go(Title);
    }
  },
  draw() {
    screenBackdrop(this.t);
    screenHeader('COMANDOS', 'HOW TO PLAY  ' + (this.pg + 1) + '/2');
    const rows =
      this.pg === 0
        ? [
            ['SOCO / CHUTE', 'J / K · 2P: B / N'],
            ['SOCO FORTE', '→ + SOCO · DEFESA EM PÉ'],
            ['RASTEIRA', '↓ + CHUTE · DERRUBA'],
            ['UPPERCUT', '→ ↓ ↘ + SOCO · INVENCÍVEL'],
            ['AGARRÃO', 'PERTO + → + CHUTE'],
            ['ESPECIAL', 'L · 2P: M'],
            ['ESPECIAL EX', '↓ ↘ → + ESPECIAL · ½ BARRA'],
            ['SUPER', 'ESPECIAL COM BARRA CHEIA'],
            ['DEFESA', 'SEGURE PARA TRÁS'],
          ]
        : [
            ['CORRENTE', 'SOCO → SOCO / CHUTE / FORTE'],
            ['AGACHADO', '↓ SOCO → ↓ SOCO → ↓ CHUTE'],
            ['CANCELAR', 'ACERTE UM GOLPE → ESPECIAL'],
            ['JUGGLE', 'UPPERCUT LANÇA · BATA NO AR'],
            ['COMBO', '3+ ACERTOS · GANHE PODER'],
            ['TREINO', 'TAB MOSTRA AS HITBOXES'],
          ];
    rows.forEach(([name, value], i) => {
      const y = 37 + i * (this.pg ? 13 : 14);
      if (i % 2 === 0) {
        ctx.fillStyle = UI.panel;
        ctx.fillRect(10, y - 3, 300, 13);
      }
      txt(name, 16, y, 6, UI.gold, 'left', null);
      fitLabel(value, 114, y, 188, 6, UI.white);
    });
    if (this.pg === 1) {
      txt('ESPECIAIS DOS LUTADORES', 16, 120, 6, UI.gold, 'left', null);
      const roster = availableRoster(),
        columns = roster.length > 8 ? 3 : 4;
      roster.forEach((ch, i) =>
        fitLabel(
          ch.spName,
          16 + (i % columns) * (300 / columns),
          134 + Math.floor(i / columns) * (columns === 3 ? 12 : 15),
          300 / columns - 2,
          6,
          UI.white,
        ),
      );
    }
    screenFooter('←→ MUDAR PÁGINA', 'ENTER / ESC VOLTAR');
  },
};

export { Moves };
