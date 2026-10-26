import { screenBackdrop, screenHeader, screenFooter, menuRow } from '../ui/theme.js';
/* OPÇÕES screen: difficulty, music volume, narrator and voice selection. */
import { AU } from '../audio/synth.js';
import { ANN, IT, VO } from '../audio/voice.js';
import { W } from '../config.js';

import { CONFIRM, anyPressed, menuPad } from '../core/input.js';
import { clamp } from '../core/math.js';
import { go } from '../core/scene.js';
import { emit } from '../events.js';
import { S, SET } from '../state.js';
import { Title } from './title.js';

const Options = {
  id: 'options',
  enter() {
    this.m = 0;
    this.t = 0;
    this.msg = '';
  },
  items() {
    return [
      ['DIFICULDADE', ['FÁCIL', 'NORMAL', 'DIFÍCIL'][S.diff]],
      ['MÚSICA', Math.round((SET.music / 0.42) * 100) + '%'],
      ['NARRADOR', VO.on ? 'LIGADO' : 'DESLIGADO'],
      ['LOCUTOR (EN)', 'OUVIR VOZ'],
      ['HISTÓRIA (PT)', 'OUVIR VOZ'],
      ['NOMES (IT)', 'OUVIR VOZ'],
      ['TESTAR VOZES', ''],
      ['VOLTAR', ''],
    ];
  },
  change(i, dir) {
    const role = ['ann', 'pt', 'it'];
    if (i === 0) S.diff = (S.diff + 3 + dir) % 3;
    else if (i === 1) {
      AU.setMusic(clamp(SET.music + dir * 0.042, 0, 0.63));
    } else if (i === 2) {
      VO.on = !VO.on;
      emit('voice', VO.on);
    } else if (i >= 3 && i <= 5) {
      if (VO.label(role[i - 3]) !== 'CHATTERBOX') VO.cycle(role[i - 3]);
      this.test(role[i - 3]);
    } else if (i === 6) {
      this.test('ann');
      setTimeout(() => this.test('pt'), 1800);
      setTimeout(() => this.test('it'), 4200);
    } else if (i === 7) {
      go(Title);
      return;
    }
    AU.sfx('blip');
  },
  test(r) {
    VO.say(
      r === 'ann'
        ? 'Round one... Fight!'
        : r === 'pt'
          ? 'Muito além da internet existe Brainrotália.'
          : 'Tralalero Tralalà!',
      r === 'ann' ? ANN : r === 'it' ? IT : { role: 'pt' },
    );
  },
  update() {
    this.t++;
    const p = menuPad(),
      n = this.items().length;
    if (anyPressed(['Escape', 'Backspace'])) {
      go(Title);
      return;
    }
    if (p.pup) {
      this.m = (this.m + n - 1) % n;
      AU.sfx('blip');
    }
    if (p.pdown) {
      this.m = (this.m + 1) % n;
      AU.sfx('blip');
    }
    if (p.pleft) this.change(this.m, -1);
    if (p.pright) this.change(this.m, 1);
    if (anyPressed(CONFIRM)) this.change(this.m, 1);
  },
  draw() {
    screenBackdrop(this.t);
    screenHeader('OPÇÕES', 'SYSTEM CONFIG');
    this.items().forEach(([name, value], i) => {
      menuRow(name, 10, 35 + i * 16, W - 20, i === this.m, { value, height: 14 });
    });
    screenFooter('↑↓ SELECIONAR', '←→ AJUSTAR · ENTER OUVIR/OK');
  },
};

export { Options };
