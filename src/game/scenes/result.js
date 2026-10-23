/* Match result in the KOF/SF style: the winner over the frozen stage, VITÓRIA/DERROTA, portraits, win quote,
   match stats and the XP gained. */
import { AU } from '../audio/synth.js';
import { ANN, IT, VO } from '../audio/voice.js';
import { BOSS } from '../characters/fighters/saturnita.js';
import { CH } from '../characters/roster.js';
import { H, W } from '../config.js';
import { ctx, txt, vgrad, wrap } from '../core/canvas.js';
import { rgba, shade } from '../core/color.js';
import { CONFIRM, anyPressed } from '../core/input.js';
import { go } from '../core/scene.js';
import { XP } from '../progression/xp.js';
import { drawSpr, sprite } from '../sprites/sprite.js';
import { drawStage } from '../stages/index.js';
import { S } from '../state.js';
import { freedScene } from '../story/encounters.js';
import { blink, fade, frameBox, plate, sparkle } from '../ui/arcade.js';
import { headShot } from '../ui/portrait.js';
import { Continue } from './continue.js';
import { Cutscene } from './cutscene.js';
import { arcadeNext } from './flow.js';
import { Select } from './select.js';

const ease = (k) => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);

function Result(f, side, opts, xi) {
  const twoP = S.mode === 'versus' && !S.vsCpu,
    lost = !twoP && side !== 0,
    loser = xi.f[1 - side];
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
        col = f.ch.col,
        k1 = ease(t / 14),
        k2 = ease((t - 8) / 14);
      // frozen fight stage, darkened and tinted with the winner's color
      if (xi.stage) drawStage(xi.stage, 80, t);
      ctx.fillStyle = vgrad(0, H, ['rgba(10,4,24,.62)', 'rgba(10,4,24,.82)', 'rgba(10,4,24,.92)']);
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = rgba(col, 0.16);
      ctx.fillRect(0, 0, W, H);
      // speed lines
      for (let i = 0; i < 22; i++) {
        const y = 16 + ((i * 37) % 150),
          x = ((i * 89 + t * (4 + (i % 3) * 2)) % (W + 80)) - 40;
        ctx.fillStyle = i % 3 ? 'rgba(255,255,255,.07)' : rgba(col, 0.25);
        ctx.fillRect(x, y, 30 + (i % 4) * 10, 1);
      }
      // slanted color band, name watermark and the winner
      const bx = -40 + (1 - k1) * -200;
      plate(bx, 36, 220, 122, vgrad(36, 122, [rgba(shade(col, 0.1), 0.9), rgba(shade(col, -0.55), 0.9)]), 34);
      plate(bx + 216, 36, 4, 122, '#ffd23a', 34);
      ctx.globalAlpha = 0.14 * k1;
      txt(f.ch.short, 88, 104, 24, '#ffffff', 'center', null);
      ctx.globalAlpha = 1;
      drawSpr(
        sprite(f.ch, 'win', Math.floor(t / 7) % 8, 0, f.alt, ''),
        84 - (1 - k1) * 120,
        f.ch === BOSS ? 176 : 166,
        1,
        2,
      );
      // cinema bars
      ctx.fillStyle = '#05020a';
      ctx.fillRect(0, 0, W, 14);
      ctx.fillRect(0, 166, W, 14);
      ctx.fillStyle = '#ffd23a';
      ctx.fillRect(0, 14, W, 1);
      ctx.fillRect(0, 165, W, 1);
      // right column slides in
      ctx.save();
      ctx.translate((1 - k2) * 180, 0);
      const head = twoP ? (side === 0 ? '1P VENCE' : '2P VENCE') : lost ? 'DERROTA' : 'VITÓRIA',
        slam = t < 22 ? 1 + Math.max(0, 1 - (t - 10) / 10) * 0.6 : 1;
      plate(168, 18, 148, 19, '#05020a', 7);
      plate(
        169,
        19,
        146,
        17,
        lost
          ? vgrad(19, 17, ['#ff9a8a', '#d8343f', '#6a0a18'])
          : vgrad(19, 17, ['#fff6b0', '#ffd23a', '#e8901a']),
        7,
      );
      ctx.save();
      ctx.translate(245, 27);
      ctx.scale(slam, slam);
      txt(head, 0, -8, 16, '#ffffff', 'center', lost ? '#3a0410' : '#5a2a00');
      ctx.restore();
      if (!lost && t > 20) sparkle(310, 20, (t % 36) / 36);
      // winner name and the two portraits
      txt(f.ch.name[0], 170, 42, 8, '#ffffff', 'left');
      txt(f.ch.name[1], 170, 51, 8, col, 'left');
      frameBox(268, 40, 21, 21, '#ffd23a', vgrad(40, 21, [shade(col, -0.35), shade(col, -0.75)]));
      headShot(f.ch, 269, 41, 19, { t, alt: f.alt });
      frameBox(294, 40, 21, 21, '#5a5068', '#120a1c');
      headShot(loser.ch.isCar ? f.ch : loser.ch, 295, 41, 19, { flip: true, t: 0, alt: loser.alt });
      ctx.fillStyle = 'rgba(20,0,10,.6)';
      ctx.fillRect(294, 40, 21, 21);
      txt('K.O.', 305, 47, 6, '#ff4d5e', 'center', '#05020a');
      // win quote
      frameBox(169, 66, 146, 48, col);
      const q = '"' + f.ch.quote + '"';
      let left = Math.floor(Math.max(0, t - 16) * 0.9);
      wrap(q, 17)
        .slice(0, 5)
        .forEach((l, i) => {
          if (left <= 0) return;
          txt(l.slice(0, left), 174, 70 + i * 9, 8, '#f1e9ff', 'left', null);
          left -= l.length + 1;
        });
      // match stats and XP
      const k = Math.min(1, Math.max(0, (t - 30) / 50)),
        rows = [
          ['ROUNDS', '' + xi.wins[side] + ' x ' + xi.wins[1 - side]],
          ['PERFEITO', xi.perfects[side] ? 'x' + xi.perfects[side] : '-'],
          ['MAIOR COMBO', xi.combo >= 2 ? xi.combo + ' HITS' : '-'],
        ];
      rows.forEach(([a, b], i) => {
        txt(a, 172, 120 + i * 8, 6, '#9a8fb3', 'left', null);
        txt(b, 314, 120 + i * 8, 6, '#ffffff', 'right', null);
      });
      if (twoP)
        [0, 1].forEach((i) => {
          txt(
            (i ? '2P' : '1P') + ' +' + Math.round(xi.gains[i] * k) + ' XP',
            172 + i * 74,
            146,
            6,
            i ? '#9adcff' : '#ff8a96',
            'left',
            null,
          );
          if (xi.ups[i] && t > 90 && blink(t, 16))
            txt('UP!', 172 + i * 74 + 52, 146, 6, '#ffd23a', 'left', null);
        });
      else {
        const id = xi.f[0].ch.id,
          lv = XP.lvl(id),
          p = XP.prog(id);
        txt('+' + Math.round(xi.gains[0] * k) + ' XP', 172, 145, 8, '#7aff9a', 'left');
        txt('NV' + lv, 314, 146, 6, '#ffd23a', 'right', null);
        ctx.fillStyle = '#05020a';
        ctx.fillRect(237, 146, 54, 6);
        ctx.fillStyle = '#2a1838';
        ctx.fillRect(238, 147, 52, 4);
        ctx.fillStyle = vgrad(147, 4, ['#c8ffd0', '#7aff9a', '#2aa858']);
        ctx.fillRect(238, 147, Math.round(52 * p * k), 4);
        if (xi.ups[0] && t > 90) {
          plate(206, 155, 92, 9, blink(t, 12) ? '#ffd23a' : '#ff8a2a', 4);
          txt('LEVEL UP!', 254, 156, 6, '#1a0a24', 'center', null);
        }
      }
      ctx.restore();
      // bottom bar
      const next = twoP || S.mode === 'versus' ? 'START: NOVA LUTA' : lost ? 'START' : 'START: CONTINUAR';
      if (t > 50 && blink(t, 32)) txt(next, W - 6, 169, 8, '#ffd23a', 'right', null);
      if (S.mode === 'arcade' && S.li < 8)
        txt(S.li < 7 ? 'LUTA ' + (S.li + 1) + '/7' : 'CHEFE FINAL', 6, 170, 6, '#9a8fb3', 'left', null);
      if (t < 10) fade(1 - t / 10, '255,255,255');
    },
  };
}

export { Result };
