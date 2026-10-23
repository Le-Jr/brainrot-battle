/* OPÇÕES screen: difficulty, music volume, narrator and voice selection. */
import { AU } from '../audio/synth.js';
import { ANN, IT, VO } from '../audio/voice.js';
import { H, W } from '../config.js';
import { ctx, txt, vgrad, wrap } from '../core/canvas.js';
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
      ['LOCUTOR (EN)', VO.label('ann')],
      ['HISTÓRIA (PT)', VO.label('pt')],
      ['NOMES (IT)', VO.label('it')],
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
      VO.cycle(role[i - 3]);
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
    ctx.fillStyle = '#120a1c';
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 12) {
      ctx.fillStyle = (y / 12) % 2 ? '#1a1028' : '#160d22';
      ctx.fillRect(0, y, W, 12);
    }
    txt('OPÇÕES', W / 2, 8, 16, vgrad(8, 16, ['#fff7b0', '#ffb03a', '#ff5a2a']), 'center');
    this.items().forEach(([l, v], i) => {
      const y = 36 + i * 14,
        sel = i === this.m;
      if (sel) {
        ctx.fillStyle = 'rgba(255,210,58,.16)';
        ctx.fillRect(14, y - 3, 292, 13);
      }
      txt(l, 22, y, 8, sel ? '#ffd23a' : '#cbbfe6', 'left', null);
      if (v) txt((sel ? '< ' : '') + v + (sel ? ' >' : ''), 298, y, 8, '#ffffff', 'right', null);
    });
    wrap('Vozes "Natural" do Edge e as do Google no Chrome soam melhor.', 38).forEach((l, i) =>
      txt(l, W / 2, 156 + i * 10, 8, '#9a8fb3', 'center', null),
    );
  },
};

export { Options };
