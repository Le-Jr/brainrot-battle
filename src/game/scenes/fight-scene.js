/* Wraps a Fight with pause menu and the hitbox toggle. */
import { AU } from '../audio/synth.js';
import { VO } from '../audio/voice.js';
import { H, W } from '../config.js';
import { ctx, txt } from '../core/canvas.js';
import { CONFIRM, START, anyPressed, menuPad } from '../core/input.js';
import { go } from '../core/scene.js';
import { DEBUG } from '../state.js';
import { Title } from './title.js';

function FightScene(F, onDone) {
  return {
    id: 'fight',
    F,
    enter() {
      AU.play(F.stage.music);
      this.pause = false;
      this.pm = 0;
      this.out = 0;
    },
    update() {
      if (anyPressed(['Tab'])) DEBUG.showBox = !DEBUG.showBox;
      if (this.pause) {
        const p = menuPad();
        if (p.pup || p.pdown) {
          this.pm ^= 1;
          AU.sfx('blip');
        }
        if (anyPressed(['Escape', 'Backspace'])) this.pause = false;
        else if (anyPressed(CONFIRM)) {
          AU.sfx('ok');
          if (this.pm === 0) this.pause = false;
          else {
            VO.stop();
            DEBUG.showBox = false;
            go(Title);
          }
        }
        return;
      }
      if (F.phase !== 'end' && anyPressed(START)) {
        this.pause = true;
        this.pm = 0;
        AU.sfx('blip');
        return;
      }
      F.update();
      if (F.done !== undefined) {
        this.out++;
        if (this.out === 21) onDone(F);
      }
    },
    draw() {
      F.draw();
      if (this.pause) {
        ctx.fillStyle = 'rgba(10,4,20,.7)';
        ctx.fillRect(0, 0, W, H);
        txt('PAUSA', W / 2, 60, 16, '#ffd23a', 'center');
        ['CONTINUAR', 'SAIR PARA O MENU'].forEach((s, i) =>
          txt((i === this.pm ? '> ' : '  ') + s, 96, 96 + i * 14, 8, i === this.pm ? '#ffffff' : '#9a8fb3'),
        );
      }
    },
  };
}

export { FightScene };
