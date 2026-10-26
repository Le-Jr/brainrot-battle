import { UI, panel, screenHeader, screenFooter, fitLabel } from '../ui/theme.js';
/* Bonus stage result and XP screen. */
import { AU } from '../audio/synth.js';
import { ANN, VO } from '../audio/voice.js';
import { BONUS_STAGE } from '../combat/bonus.js';
import { H, W } from '../config.js';
import { ctx, txt } from '../core/canvas.js';
import { CONFIRM, anyPressed } from '../core/input.js';
import { go, tick } from '../core/scene.js';
import { XP } from '../progression/xp.js';
import { drawSpr, sprite } from '../sprites/sprite.js';
import { STAGES, drawStage } from '../stages/index.js';
import { S } from '../state.js';
import { xpBar } from '../ui/widgets.js';
import { CarSelect } from './car-select.js';
import { startBonus } from './flow.js';

function BonusResult(ch, destroyed, gain, up, next, type) {
  return {
    id: 'bonus-result',
    tapStart: true,
    enter() {
      this.t = 0;
      AU.play('win');
      if (up)
        setTimeout(() => {
          AU.sfx('levelup');
          VO.queue('Level up!', ANN);
        }, 900);
    },
    update() {
      this.t++;
      if (this.t < 40) return;
      if (S.mode === 'bonus') {
        if (anyPressed(['Escape', 'Backspace', 'T_k', 'KeyK'])) {
          go(CarSelect);
          return;
        }
        if (anyPressed(CONFIRM)) startBonus(ch, type, next);
      } else if (anyPressed(CONFIRM)) next();
    },
    draw() {
      const t = this.t;
      drawStage(STAGES[BONUS_STAGE[type]], 80, tick);
      ctx.fillStyle = 'rgba(5,8,18,.8)';
      ctx.fillRect(0, 0, W, H);
      screenHeader('BÔNUS', 'RESULTADO');
      drawSpr(sprite(ch, 'win', Math.floor(tick / 7) % 8, 0, false, ''), 70, 153, 1, 1.45);
      panel(142, 38, 168, 120, UI.gold);
      fitLabel(destroyed ? 'DESTRUÍDO!' : 'TEMPO ESGOTADO', 226, 49, 148, 8, UI.white, 'center');
      txt('+' + Math.min(gain, Math.floor(t * 6)) + ' XP', 226, 72, 16, UI.green, 'center');
      xpBar(ch.id, 154, 101, 120);
      fitLabel('XP TOTAL ' + XP.get(ch.id), 226, 119, 148, 6, UI.muted, 'center');
      if (up && t > 40) fitLabel('LEVEL UP! · NV ' + XP.lvl(ch.id), 226, 139, 148, 8, UI.gold, 'center');
      screenFooter('BONUS CLEAR', S.mode === 'bonus' ? 'ENTER DE NOVO · ESC TROCAR' : 'ENTER CONTINUAR');
    },
  };
}

export { BonusResult };
