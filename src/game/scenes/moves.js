/* COMANDOS screen: two-page move list. */
import { AU } from '../audio/synth.js';
import { CH } from '../characters/roster.js';
import { H, W } from '../config.js';
import { ctx, txt, vgrad } from '../core/canvas.js';
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
    ctx.fillStyle = '#120a1c';
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 12) {
      ctx.fillStyle = (y / 12) % 2 ? '#1a1028' : '#160d22';
      ctx.fillRect(0, y, W, 12);
    }
    txt('COMANDOS', W / 2, 6, 16, vgrad(6, 16, ['#fff7b0', '#ffb03a', '#ff5a2a']), 'center');
    txt(this.pg + 1 + '/2  ← →', W - 8, 10, 8, '#9a8fb3', 'right', null);
    const L =
      this.pg === 0
        ? [
            ['SOCO/CHUTE', 'J / K   (2P: B / N)'],
            ['SOCO FORTE', '→ + SOCO (defenda em pé)'],
            ['RASTEIRA', '↓ + CHUTE (derruba)'],
            ['UPPERCUT', '→ ↓ ↘ + SOCO (invencível)'],
            ['AGARRÃO', 'perto + → + CHUTE'],
            ['ESPECIAL', 'L   (2P: M)'],
            ['ESPECIAL EX', '↓ ↘ → + ESP. (½ barra)'],
            ['SUPER', 'ESP. com barra cheia'],
            ['DEFESA', 'segure para trás'],
          ]
        : [
            ['CORRENTES', 'SOCO → SOCO/CHUTE/FORTE'],
            ['', '↓SOCO → ↓SOCO → ↓CHUTE'],
            ['CANCELAR', 'golpe que acertou'],
            ['', '→ aperte ESPECIAL'],
            ['JUGGLE', 'UPPER lança: bata no ar'],
            ['COMBO 3+', 'o locutor grita COMBO!'],
            ['DANO', 'combo longo perde força'],
            ['TREINO', 'TAB mostra hitboxes'],
          ];
    L.forEach(([a, b], i) => {
      const y = 30 + i * 13;
      txt(a, 10, y, 8, '#ffd23a', 'left', null);
      txt(b, 108, y, 8, '#f1e9ff', 'left', null);
    });
    if (this.pg === 1) {
      txt('ESPECIAIS (L)', 14, 144, 8, '#ff6ad5', 'left', null);
      CH.forEach((c, i) =>
        txt(c.spName, 14 + (i % 4) * 76, 156 + Math.floor(i / 4) * 10, 8, c.col, 'left', null),
      );
    }
  },
};

export { Moves };
