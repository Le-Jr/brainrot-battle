import { FinalFight } from '../combat/final-fight.js';
import { UI, screenBackdrop, screenHeader, screenFooter, panel, fitLabel } from '../ui/theme.js';
/* VS splash before a fight (also warms the sprite cache). */
import { AU } from '../audio/synth.js';
import { IT, VO } from '../audio/voice.js';
import { BOSS } from '../characters/fighters/saturnita.js';
import { Fight } from '../combat/fight.js';
import { W } from '../config.js';
import { ctx, txt } from '../core/canvas.js';
import { CONFIRM, anyPressed } from '../core/input.js';
import { go } from '../core/scene.js';
import { drawSpr, sprite, warmList } from '../sprites/sprite.js';
import { STAGES } from '../stages/index.js';
import { FightScene } from './fight-scene.js';
import { onMatch } from './flow.js';

function VS(c1, c2, stage, opts, label) {
  return {
    id: 'vs',
    enter() {
      this.t = 0;
      AU.stop();
      AU.sfx('vs');
      this.warm = [...warmList(c1, false), ...warmList(c2, c1 === c2)];
      setTimeout(() => VO.say(c1.voice.replace(/!$/, '') + '... contro... ' + c2.voice, IT), 250);
    },
    update() {
      this.t++;
      for (let i = 0; i < 12 && this.warm.length; i++) {
        const w = this.warm.pop();
        sprite(w[0], w[1], w[2], w[3], w[4], '');
      }
      if (this.t > 190 || (this.t > 50 && anyPressed(CONFIRM))) {
        const F = opts.finale ? new FinalFight(c1, opts) : new Fight(c1, c2, stage, opts);
        go(FightScene(F, (F2) => onMatch(F2, opts)));
      }
    },
    draw() {
      const t = this.t;
      screenBackdrop(t);
      ctx.fillStyle = 'rgba(239,98,92,.18)';
      ctx.beginPath();
      ctx.moveTo(0, 30);
      ctx.lineTo(180, 30);
      ctx.lineTo(140, 166);
      ctx.lineTo(0, 166);
      ctx.fill();
      ctx.fillStyle = 'rgba(98,201,238,.15)';
      ctx.beginPath();
      ctx.moveTo(184, 30);
      ctx.lineTo(W, 30);
      ctx.lineTo(W, 166);
      ctx.lineTo(144, 166);
      ctx.fill();
      const k = Math.min(1, t / 16);
      drawSpr(sprite(c1, 'idle', Math.floor(t / 7) % 8, 0, false, ''), 66 - (1 - k) * 100, 158, 1, 1.35);
      drawSpr(
        sprite(c2, 'idle', Math.floor(t / 7) % 8, 0, c1 === c2, ''),
        254 + (1 - k) * 100,
        158,
        -1,
        c2 === BOSS ? 1.0 : 1.35,
      );
      screenHeader('VERSUS', label);
      [c1, c2].forEach((ch, i) => {
        const x = i ? 180 : 10,
          color = i ? UI.p2 : UI.p1;
        panel(x, 36, 130, 30, color);
        fitLabel(ch.name[0], x + 7, 42, 116, 6, UI.white);
        fitLabel(ch.name[1], x + 7, 53, 86, 6, color);
        txt('NV ' + opts.lv[i], x + 123, 54, 6, UI.gold, 'right', null);
      });
      if (t > 14) txt('VS', 160, 91, 32, UI.gold, 'center');
      screenFooter(label, 'LOCAL: ' + STAGES[stage].name);
    },
  };
}

export { VS };
