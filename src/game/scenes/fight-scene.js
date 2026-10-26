import { UI, panel, menuRow, screenFooter, fitLabel, paragraph } from '../ui/theme.js';
/* Wraps a Fight with the pause menu (continue, restart, quit with confirmation) and the hitbox toggle. */
import { AU } from '../audio/synth.js';
import { VO } from '../audio/voice.js';
import { H, W } from '../config.js';
import { ctx, txt } from '../core/canvas.js';

import { CONFIRM, START, anyPressed, menuPad } from '../core/input.js';
import { go } from '../core/scene.js';
import { sprite } from '../sprites/sprite.js';
import { DEBUG, SET } from '../state.js';

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
      const k = ease(this.pt / 8),
        [a, b] = F.f;
      ctx.fillStyle = 'rgba(5,8,18,.8)';
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.globalAlpha = k;
      panel(40, 26, 240, 132, UI.gold);
      txt('PAUSA', 52, 36, 12, UI.white);
      txt('ROUND ' + String(F.round).padStart(2, '0'), 268, 40, 6, UI.gold, 'right', null);
      const chip = (f, x, flip) => {
        panel(x, 54, 22, 22, flip ? UI.p2 : UI.p1);
        if (f.isCar) fitShot(sprite(f.ch, f.poseInfo().pose, 0, 0, false, ''), x + 1, 55, 20, flip);
        else headShot(f.ch, x + 1, 55, 20, { flip, t: 0, alt: f.alt });
      };
      chip(a, 52, false);
      chip(b, 246, true);
      fitLabel(a.ch.short, 80, 58, 64, 6, UI.p1);
      fitLabel(b.ch.short, 240, 58, 64, 6, UI.p2, 'right');
      txt('VS', 160, 62, 6, UI.gold, 'center', null);
      txt('NV ' + (a.lvl || 1), 80, 69, 6, UI.muted, 'left', null);
      txt(F.timer + ' SEC', 240, 69, 6, UI.muted, 'right', null);
      if (this.confirm) {
        txt('VOLTAR AO MENU?', 160, 87, 8, UI.white, 'center');
        paragraph('O progresso desta luta será perdido.', 160, 104, 204, {
          size: 6,
          align: 'center',
          maxLines: 2,
        });
        ['NÃO', 'SIM'].forEach((label, i) =>
          menuRow(label, 76 + i * 88, 134, 80, this.cm === i, { height: 16 }),
        );
      } else
        OPTIONS.forEach((name, i) =>
          menuRow(
            name === 'HITBOXES' ? 'HITBOXES: ' + (DEBUG.showBox ? 'SIM' : 'NÃO') : name,
            52,
            82 + i * 18,
            216,
            this.pm === i,
            { height: 16 },
          ),
        );
      ctx.restore();
      screenFooter('↑↓ ESCOLHER', 'ENTER OK · ESC RETOMAR');
    },
  };
}

export { FightScene };
