/* VS splash before a fight (also warms the sprite cache). */
import { AU } from '../audio/synth.js';
import { IT, VO } from '../audio/voice.js';
import { BOSS } from '../characters/fighters/saturnita.js';
import { Fight } from '../combat/fight.js';
import { H, W } from '../config.js';
import { ctx, txt, vgrad } from '../core/canvas.js';
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
        const F = new Fight(c1, c2, stage, opts);
        go(FightScene(F, (F2) => onMatch(F2, opts)));
      }
    },
    draw() {
      const t = this.t;
      ctx.fillStyle = '#120a1c';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#5a1424';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(186, 0);
      ctx.lineTo(134, H);
      ctx.lineTo(0, H);
      ctx.fill();
      ctx.fillStyle = c2 === BOSS ? '#3a1450' : '#14305a';
      ctx.beginPath();
      ctx.moveTo(190, 0);
      ctx.lineTo(W, 0);
      ctx.lineTo(W, H);
      ctx.lineTo(138, H);
      ctx.fill();
      for (let i = 0; i < 24; i++) {
        const y = (i * 29) % H,
          l = ((i * 53 + t * 7) % (W + 60)) - 30;
        ctx.fillStyle = 'rgba(255,255,255,.12)';
        ctx.fillRect(i % 2 ? l : W - l, y, 24, 1);
      }
      const s1 = Math.min(1, t / 16);
      drawSpr(
        sprite(c1, 'idle', Math.floor(t / 7) % 8, 0, false, ''),
        70 - Math.round((1 - s1) * 120),
        172,
        1,
        2,
      );
      drawSpr(
        sprite(c2, 'idle', Math.floor(t / 7) % 8, 0, c1 === c2, ''),
        250 + Math.round((1 - s1) * 120),
        c2 === BOSS ? 186 : 172,
        -1,
        2,
      );
      txt(c1.name[0], 8, 8, 8, '#ffffff');
      txt(c1.name[1], 8, 18, 8, '#ffb0b8');
      txt('NV' + opts.lv[0], 8, 28, 8, '#ffd23a');
      txt(c2.name[0], W - 8, 8, 8, '#ffffff', 'right');
      txt(c2.name[1], W - 8, 18, 8, '#9adcff', 'right');
      txt('NV' + opts.lv[1], W - 8, 28, 8, '#ffd23a', 'right');
      if (t > 14) {
        const k = Math.max(1, 2.5 - (t - 14) / 6);
        ctx.save();
        ctx.translate(W / 2, 80);
        ctx.scale(k, k);
        txt('VS', 0, -16, 32, vgrad(-16, 32, ['#ffffff', '#ffd23a', '#ff4d5e']), 'center');
        ctx.restore();
      }
      txt(label, W / 2, 150, 8, '#ffd23a', 'center');
      txt('LOCAL: ' + STAGES[stage].name, W / 2, 162, 8, '#cbbfe6', 'center');
    },
  };
}

export { VS };
