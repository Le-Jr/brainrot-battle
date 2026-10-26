import { UI, screenHeader, screenFooter, panel, paragraph, fitLabel } from '../ui/theme.js';
/* Match result in the KOF/SF style: the winner over the frozen stage, VITÓRIA/DERROTA, portraits, win quote,
   match stats and the XP gained. */
import { AU } from '../audio/synth.js';
import { ANN, IT, VO } from '../audio/voice.js';
import { BOSS } from '../characters/fighters/saturnita.js';
import { CH } from '../characters/roster.js';
import { H, W } from '../config.js';
import { ctx, txt } from '../core/canvas.js';

import { CONFIRM, anyPressed } from '../core/input.js';
import { go } from '../core/scene.js';
import { XP } from '../progression/xp.js';
import { drawSpr, sprite } from '../sprites/sprite.js';
import { drawStage } from '../stages/index.js';
import { S } from '../state.js';
import { freedScene } from '../story/encounters.js';
import { fade } from '../ui/arcade.js';

import { Continue } from './continue.js';
import { Cutscene } from './cutscene.js';
import { arcadeNext } from './flow.js';
import { Select } from './select.js';

function Result(f, side, opts, xi) {
  const twoP = S.mode === 'versus' && !S.vsCpu,
    lost = !twoP && side !== 0;
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
      if (this.t === 10) AU.sfx('slam');
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
      const t = this.t,
        k = Math.min(1, Math.max(0, (t - 30) / 50));
      if (xi.stage) drawStage(xi.stage, 80, t);
      ctx.fillStyle = 'rgba(5,8,18,.86)';
      ctx.fillRect(0, 0, W, H);
      const head = twoP ? (side === 0 ? '1P VENCE' : '2P VENCE') : lost ? 'DERROTA' : 'VITÓRIA';
      const up = xi.ups[0] && t > 90 && !twoP;
      screenHeader(head, up ? 'LEVEL UP · NV ' + XP.lvl(xi.f[0].ch.id) : 'MATCH RESULT');
      panel(10, 38, 126, 28, lost ? UI.danger : UI.gold);
      fitLabel(f.ch.name[0], 20, 44, 106, 6, UI.white);
      fitLabel(f.ch.name[1], 20, 55, 106, 6, UI.gold);
      drawSpr(
        sprite(f.ch, 'win', Math.floor(t / 7) % 8, 0, f.alt, ''),
        72,
        154,
        1,
        f.ch === BOSS ? 1.05 : 1.4,
      );
      panel(146, 38, 164, 122, lost ? UI.danger : UI.gold);
      paragraph('"' + f.ch.quote + '"', 156, 48, 144, { size: 6, lineHeight: 9, maxLines: 5 });
      ctx.fillStyle = UI.line;
      ctx.fillRect(156, 96, 144, 1);
      [
        ['ROUNDS', xi.wins[side] + ' X ' + xi.wins[1 - side]],
        ['PERFEITOS', String(xi.perfects[side])],
        ['MAIOR COMBO', xi.combo >= 2 ? xi.combo + ' HITS' : '-'],
      ].forEach(([name, value], i) => {
        txt(name, 156, 102 + i * 10, 6, UI.muted, 'left', null);
        txt(value, 300, 102 + i * 10, 6, UI.white, 'right', null);
      });
      if (twoP) {
        txt('1P +' + Math.round(xi.gains[0] * k) + ' XP', 156, 141, 6, UI.p1, 'left', null);
        txt('2P +' + Math.round(xi.gains[1] * k) + ' XP', 300, 151, 6, UI.p2, 'right', null);
      } else {
        const id = xi.f[0].ch.id;
        txt('+' + Math.round(xi.gains[0] * k) + ' XP', 156, 139, 8, UI.green);
        txt('NV ' + XP.lvl(id), 300, 141, 6, UI.gold, 'right', null);
        ctx.fillStyle = UI.raised;
        ctx.fillRect(156, 152, 144, 3);
        ctx.fillStyle = UI.green;
        ctx.fillRect(156, 152, Math.round(144 * XP.prog(id) * k), 3);
      }
      screenFooter(
        S.mode === 'arcade' ? (S.li < 7 ? 'LUTA ' + (S.li + 1) + '/7' : 'CHEFE FINAL') : 'MATCH RESULT',
        twoP || S.mode === 'versus' ? 'ENTER NOVA LUTA' : 'ENTER CONTINUAR',
      );
      if (t < 10) fade(1 - t / 10, '255,255,255');
    },
  };
}

export { Result };
