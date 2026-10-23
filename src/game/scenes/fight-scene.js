/* Wraps a Fight with the pause menu (continue, restart, quit with confirmation) and the hitbox toggle. */
import { AU } from '../audio/synth.js';
import { VO } from '../audio/voice.js';
import { H, W } from '../config.js';
import { ctx, txt, vgrad } from '../core/canvas.js';
import { shade } from '../core/color.js';
import { CONFIRM, START, anyPressed, menuPad } from '../core/input.js';
import { go } from '../core/scene.js';
import { sprite } from '../sprites/sprite.js';
import { DEBUG, SET } from '../state.js';
import { blink, frameBox, plate, sparkle } from '../ui/arcade.js';
import { fitShot, headShot } from '../ui/portrait.js';
import { Title } from './title.js';

const OPTIONS = ['CONTINUAR', 'REINICIAR LUTA', 'HITBOXES', 'SAIR PARA O MENU'];
const ease = (k) => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);

/** Music volume, lowered while paused. */
function duck(on) {
  if (AU.mg && AU.music) AU.mg.gain.value = on ? SET.music * 0.35 : SET.music;
}

/** Put the match back at round 1 with full health and empty gauges. */
function restart(F) {
  F.round = 1;
  F.wins = [0, 0];
  F.perfects = [0, 0];
  F.bestCombo = 0;
  F.done = undefined;
  for (const f of F.f) f.meter = 0;
  F.startRound();
}

function FightScene(F, onDone) {
  return {
    id: 'fight',
    F,
    enter() {
      AU.play(F.stage.music);
      this.pause = false;
      this.pm = 0;
      this.pt = 0;
      this.confirm = false;
      this.out = 0;
    },
    open() {
      this.pause = true;
      this.pm = 0;
      this.pt = 0;
      this.confirm = false;
      AU.sfx('wipe');
      duck(true);
    },
    close() {
      this.pause = false;
      duck(false);
    },
    update() {
      if (anyPressed(['Tab'])) DEBUG.showBox = !DEBUG.showBox;
      if (this.pause) return this.updatePause();
      if (F.phase !== 'end' && anyPressed(START)) return this.open();
      F.update();
      if (F.done !== undefined) {
        this.out++;
        if (this.out === 21) onDone(F);
      }
    },
    updatePause() {
      this.pt++;
      if (this.pt < 6) return;
      const p = menuPad();
      if (this.confirm) {
        if (p.pleft || p.pright || p.pup || p.pdown) {
          this.cm ^= 1;
          AU.sfx('blip');
        }
        if (anyPressed(['Escape', 'Backspace'])) this.confirm = false;
        else if (anyPressed(CONFIRM)) {
          AU.sfx('ok');
          if (this.cm === 0) this.confirm = false;
          else {
            duck(false);
            VO.stop();
            DEBUG.showBox = false;
            go(Title);
          }
        }
        return;
      }
      if (p.pup) {
        this.pm = (this.pm + OPTIONS.length - 1) % OPTIONS.length;
        AU.sfx('blip');
      }
      if (p.pdown) {
        this.pm = (this.pm + 1) % OPTIONS.length;
        AU.sfx('blip');
      }
      if (anyPressed(['Escape', 'Backspace'])) return this.close();
      if (anyPressed(CONFIRM)) {
        AU.sfx('ok');
        const o = OPTIONS[this.pm];
        if (o === 'CONTINUAR') this.close();
        else if (o === 'REINICIAR LUTA') {
          restart(F);
          this.out = 0;
          this.close();
        } else if (o === 'HITBOXES') DEBUG.showBox = !DEBUG.showBox;
        else {
          this.confirm = true;
          this.cm = 0;
        }
      }
    },
    draw() {
      F.draw();
      if (this.pause) this.drawPause();
    },
    /** Dimmed fight, a framed panel with the matchup, the options as slanted plates and the controls hint. */
    drawPause() {
      const t = this.pt,
        k = ease(t / 8),
        [a, b] = F.f;
      ctx.fillStyle = `rgba(8,3,18,${(0.72 * k).toFixed(3)})`;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(0,0,0,.22)';
      for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
      const px = 56,
        pw = 208,
        py = Math.round(36 + (1 - k) * 30),
        ph = 118;
      ctx.globalAlpha = k;
      frameBox(px, py, pw, ph, '#ffd23a', 'rgba(14,6,30,.95)');
      plate(W / 2 - 52, py - 9, 104, 16, vgrad(py - 9, 16, ['#fff6b0', '#ffd23a', '#e8901a']), 6);
      txt('PAUSA', W / 2 + 3, py - 5, 8, '#1a0a24', 'center', null);
      sparkle(W / 2 + 54, py - 8, (this.pt % 40) / 40);
      // matchup: both portraits, names, round and timer
      const chip = (f, x, flip) => {
        frameBox(
          x,
          py + 10,
          30,
          30,
          f.ch.col,
          vgrad(py + 10, 30, [shade(f.ch.col, -0.35), shade(f.ch.col, -0.75)]),
        );
        if (f.isCar) fitShot(sprite(f.ch, f.poseInfo().pose, 0, 0, false, ''), x + 1, py + 11, 28, flip);
        else headShot(f.ch, x + 1, py + 11, 28, { flip, t: this.pt, alt: f.alt });
      };
      chip(a, px + 10, false);
      chip(b, px + pw - 40, true);
      txt(a.ch.short, px + 46, py + 12, 8, shade(a.ch.col, 0.4), 'left', null);
      txt(b.ch.short, px + pw - 46, py + 32, 8, shade(b.ch.col, 0.4), 'right', null);
      txt('VS', W / 2, py + 22, 8, '#ffd23a', 'center');
      const info = F.opts.dummy
        ? 'TREINO'
        : F.opts.bonus
          ? 'BÔNUS  ' + F.timer + 's'
          : 'ROUND ' + F.round + '  ' + F.timer + 's';
      txt(info, W / 2, py + 46, 8, '#9a8fb3', 'center', null);
      ctx.fillStyle = 'rgba(255,210,58,.35)';
      ctx.fillRect(px + 8, py + 56, pw - 16, 1);
      if (this.confirm) {
        txt('SAIR DA LUTA?', W / 2, py + 64, 8, '#ffffff', 'center');
        txt('O progresso será perdido.', W / 2, py + 76, 8, '#cbbfe6', 'center', null);
        ['NÃO', 'SIM'].forEach((s, i) => {
          const sel = i === this.cm,
            x = W / 2 - 64 + i * 72;
          plate(x - 1, py + 91, 58, 13, '#05020a', 5);
          plate(
            x,
            py + 92,
            56,
            11,
            sel ? vgrad(py + 92, 11, ['#fff6b0', '#ffd23a', '#e8901a']) : 'rgba(34,16,58,.94)',
            5,
          );
          txt(s, x + 31, py + 94, 8, sel ? '#1a0a24' : '#cbbfe6', 'center', null);
        });
      } else {
        OPTIONS.forEach((o, i) => {
          const sel = i === this.pm,
            y = py + 62 + i * 13,
            w = sel ? 150 : 140,
            x = W / 2 - w / 2,
            label = o === 'HITBOXES' ? 'HITBOXES: ' + (DEBUG.showBox ? 'SIM' : 'NÃO') : o;
          plate(x - 1, y - 1, w + 2, 12, '#05020a', 5);
          plate(x, y, w, 10, sel ? vgrad(y, 10, ['#fff6b0', '#ffd23a', '#e8901a']) : 'rgba(34,16,58,.94)', 5);
          if (sel) {
            const bx = x - 8 + (blink(this.pt, 16) ? 1 : 0);
            ctx.fillStyle = '#ffd23a';
            ctx.fillRect(bx, y + 2, 2, 6);
            ctx.fillRect(bx + 2, y + 3, 2, 4);
          }
          txt(label, W / 2 + 2, y + 1, 8, sel ? '#1a0a24' : '#cbbfe6', 'center', null);
        });
      }
      ctx.globalAlpha = 1;
      txt('↑↓ ESCOLHER   ENTER OK   ESC VOLTAR', W / 2, 166, 8, 'rgba(255,255,255,.65)', 'center', null);
    },
  };
}

export { FightScene };
