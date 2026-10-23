/* Match result: win quote, XP gained and level-ups. */
import { AU } from '../audio/synth.js';
import { ANN, IT, VO } from '../audio/voice.js';
import { BOSS } from '../characters/fighters/saturnita.js';
import { CH } from '../characters/roster.js';
import { H, W } from '../config.js';
import { ctx, txt, wrap } from '../core/canvas.js';
import { shade } from '../core/color.js';
import { CONFIRM, anyPressed } from '../core/input.js';
import { go } from '../core/scene.js';
import { drawSpr, sprite } from '../sprites/sprite.js';
import { S } from '../state.js';
import { freedScene } from '../story/encounters.js';
import { xpBar } from '../ui/widgets.js';
import { Continue } from './continue.js';
import { Cutscene } from './cutscene.js';
import { arcadeNext } from './flow.js';
import { Select } from './select.js';

function Result(f, side, opts, xi) {
  return {
    id: 'result',
    tapStart: true,
    enter() {
      this.t = 0;
      setTimeout(() => VO.say(f.ch.voice.replace(/!$/, '') + '... vince!', IT), 300);
      if (xi.ups.some(Boolean))
        setTimeout(() => {
          AU.sfx('levelup');
          VO.queue('Level up!', ANN);
        }, 1700);
    },
    update() {
      this.t++;
      if (this.t > 50 && anyPressed(CONFIRM)) {
        AU.sfx('ok');
        if (S.mode === 'versus') {
          go(Select);
          return;
        }
        if (side === 0) {
          const beat = S.li < 7 ? CH[S.ladder[S.li]] : null;
          S.li++;
          if (beat) go(Cutscene(freedScene(CH[S.p1], beat, S.li), arcadeNext, beat));
          else arcadeNext();
        } else go(Continue);
      }
    },
    draw() {
      const t = this.t;
      ctx.fillStyle = '#120a1c';
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = i % 2 ? shade(f.ch.col, -0.6) : shade(f.ch.col, -0.7);
        ctx.beginPath();
        const a0 = (i * Math.PI) / 5 + t / 200,
          a1 = a0 + Math.PI / 5;
        ctx.moveTo(90, 120);
        ctx.lineTo(90 + Math.cos(a0) * 400, 120 + Math.sin(a0) * 400);
        ctx.lineTo(90 + Math.cos(a1) * 400, 120 + Math.sin(a1) * 400);
        ctx.fill();
      }
      drawSpr(sprite(f.ch, 'win', Math.floor(t / 7) % 8, 0, f.alt, ''), 90, f.ch === BOSS ? 190 : 176, 1, 2);
      const who =
        S.mode === 'versus' ? (side === 0 ? 'JOGADOR 1' : 'JOGADOR 2') : side === 0 ? 'VOCÊ' : 'CPU';
      txt(who + ' VENCE!', W - 12, 12, 8, side === 0 ? '#ff8a96' : '#9adcff', 'right');
      txt(f.ch.name[0], W - 12, 26, 8, '#ffffff', 'right');
      txt(f.ch.name[1], W - 12, 36, 8, f.ch.col, 'right');
      ctx.fillStyle = 'rgba(18,10,28,.88)';
      ctx.fillRect(168, 50, 144, 74);
      ctx.fillStyle = f.ch.col;
      ctx.fillRect(168, 50, 144, 2);
      const q = '"' + f.ch.quote + '"',
        shown = q.slice(0, Math.floor(t * 0.9));
      wrap(shown, 16)
        .slice(0, 7)
        .forEach((l, i) => txt(l, 176, 57 + i * 9, 8, '#f1e9ff', 'left', null));
      const k = Math.min(1, t / 60);
      if (S.mode === 'versus') {
        [0, 1].forEach((i) => {
          txt(
            (i ? '2P' : '1P') + ' +' + Math.round(xi.gains[i] * k) + ' XP',
            176,
            130 + i * 11,
            8,
            i ? '#9adcff' : '#ff8a96',
          );
          if (xi.ups[i] && t > 90 && (t >> 3) & 1) txt('UP!', W - 12, 130 + i * 11, 8, '#ffd23a', 'right');
        });
      } else {
        txt('+' + Math.round(xi.gains[0] * k) + ' XP', 176, 130, 8, '#7aff9a');
        xpBar(xi.f[0].ch.id, 176, 142, 90);
        if (xi.ups[0] && t > 90 && (t >> 3) & 1) txt('LEVEL UP!', W - 12, 130, 8, '#ffd23a', 'right');
      }
      if (t > 50 && (t >> 4) % 2)
        txt(
          S.mode === 'versus' ? 'START: NOVA LUTA' : side === 0 ? 'START: CONTINUAR' : 'START',
          W - 12,
          164,
          8,
          '#ffd23a',
          'right',
        );
    },
  };
}

export { Result };
