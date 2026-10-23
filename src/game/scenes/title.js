/* Title screen and main menu. */
import { AU } from '../audio/synth.js';
import { ANN, VO } from '../audio/voice.js';
import { CH } from '../characters/roster.js';
import { GAME, H, REDUCED, W } from '../config.js';
import { ctx, txt, vgrad, wrap } from '../core/canvas.js';
import { CONFIRM, anyPressed, menuPad } from '../core/input.js';
import { rnd } from '../core/math.js';
import { go } from '../core/scene.js';
import { XP } from '../progression/xp.js';
import { drawSpr, sprite } from '../sprites/sprite.js';
import { STAGES, drawStage } from '../stages/index.js';
import { S } from '../state.js';
import { drawLogo } from '../ui/logo.js';
import { Moves } from './moves.js';
import { Options } from './options.js';
import { Select } from './select.js';

/* ---------- title ---------- */
const MENU = [
  {
    id: 'arcade',
    l: 'HISTÓRIA',
    d: 'Escolha um brainrot, viaje por Brainrotália e enfrente La Vacca Saturnita.',
  },
  { id: 'versus', l: 'VERSUS', d: 'Dois jogadores no mesmo teclado. Sem piedade.' },
  { id: 'bonus', l: 'BÔNUS', d: 'Destrua carros para farmar XP: Nonno, Cybercaminhão ou Bi-ai-di.' },
  {
    id: 'training',
    l: 'TREINO',
    d: 'Boneco parado, vida infinita e dano do combo. Aperte TAB para ver as hitboxes.',
  },
  { id: 'moves', l: 'COMANDOS', d: 'Todos os golpes, combos, cancelamentos e especiais.' },
  { id: 'options', l: 'OPÇÕES', d: 'Dificuldade, música e escolha das vozes do narrador.' },
];
const Title = {
  id: 'title',
  tapStart: true,
  enter() {
    this.m = this.m || 0;
    this.t = this.back ? 40 : 0;
    this.back = false;
    this.show = 0;
    AU.play('title');
  },
  update() {
    this.t++;
    if (this.t === 18) {
      AU.sfx('slam');
      if (!REDUCED) this.shake = 10;
      VO.say(GAME.toLowerCase() + '!', ANN);
    }
    if (this.shake > 0) this.shake--;
    if (this.t < 36) {
      if (anyPressed(CONFIRM)) this.t = 36;
      return;
    }
    const p = menuPad();
    if (p.pup) {
      this.m = (this.m + MENU.length - 1) % MENU.length;
      AU.sfx('blip');
    }
    if (p.pdown) {
      this.m = (this.m + 1) % MENU.length;
      AU.sfx('blip');
    }
    if (this.t % 240 === 0) this.show = (this.show + 1) % CH.length;
    if (anyPressed(CONFIRM)) {
      AU.sfx('ok');
      const id = MENU[this.m].id;
      this.back = true;
      if (id === 'moves') go(Moves);
      else if (id === 'options') go(Options);
      else {
        S.mode = id;
        go(Select);
      }
    }
  },
  draw() {
    const t = this.t,
      cam = Math.round(80 + Math.sin(t / 260) * 70);
    const sh = this.shake > 0 ? Math.round(rnd(-this.shake, this.shake) * 0.5) : 0;
    ctx.save();
    ctx.translate(sh, 0);
    drawStage(STAGES[1], cam, t);
    ctx.fillStyle = vgrad(0, H, ['rgba(12,6,24,.9)', 'rgba(12,6,24,.55)', 'rgba(12,6,24,.85)']);
    ctx.fillRect(-10, 0, W + 20, H);
    for (let i = 0; i < 14; i++) {
      const a = t / 90 + (i * Math.PI) / 7;
      ctx.fillStyle = i % 2 ? 'rgba(255,90,170,.05)' : 'rgba(255,210,58,.05)';
      ctx.beginPath();
      ctx.moveTo(160, 52);
      ctx.lineTo(160 + Math.cos(a) * 400, 52 + Math.sin(a) * 400);
      ctx.lineTo(160 + Math.cos(a + 0.2) * 400, 52 + Math.sin(a + 0.2) * 400);
      ctx.fill();
    }
    const e = Math.min(1, t / 18),
      sc = t < 18 ? 0.8 + (1 - e) * 2.2 : 0.8 + (t < 26 ? Math.sin(((t - 18) / 8) * Math.PI) * 0.06 : 0);
    drawLogo(160, 4 + (1 - e) * 20, sc, t);
    if (t >= 18 && t < 30) {
      ctx.fillStyle = `rgba(255,255,255,${(1 - (t - 18) / 12).toFixed(2)})`;
      ctx.fillRect(-10, 0, W + 20, H);
    }
    ctx.restore();
    if (t < 36) return;
    const a = Math.min(1, (t - 36) / 14);
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(10,5,22,.86)';
    ctx.fillRect(12, 86, 140, 80);
    ctx.fillStyle = '#ffd23a';
    ctx.fillRect(12, 86, 140, 1);
    MENU.forEach((it, i) => {
      const y = 91 + i * 12,
        sel = i === this.m;
      if (sel) {
        ctx.fillStyle = 'rgba(255,210,58,.18)';
        ctx.fillRect(13, y - 2, 138, 11);
        ctx.fillStyle = '#ffd23a';
        ctx.fillRect(13, y - 2, 2, 11);
        const bx = 18 + ((t >> 3) & 1);
        ctx.fillRect(bx, y + 1, 3, 5);
        ctx.fillRect(bx + 3, y + 2, 1, 3);
      }
      txt(it.l, 26, y, 8, sel ? '#ffffff' : '#9a8fb3', 'left', null);
    });
    ctx.fillStyle = 'rgba(10,5,22,.86)';
    ctx.fillRect(160, 86, 148, 80);
    ctx.fillStyle = '#ff6ad5';
    ctx.fillRect(160, 86, 148, 1);
    const ch = CH[this.show];
    drawSpr(sprite(ch, 'idle', Math.floor(t / 7) % 8, 0, false, ''), 282, 160, -1, 0.75);
    wrap(MENU[this.m].d, 16)
      .slice(0, 6)
      .forEach((l, i) => txt(l, 166, 92 + i * 10, 8, '#f1e9ff', 'left', null));
    const tot = CH.reduce((s, c) => s + XP.get(c.id), 0);
    txt('XP ' + tot, 166, 154, 8, '#7aff9a', 'left', null);
    ctx.globalAlpha = 1;
    if ((t >> 5) % 2)
      txt(
        AU.ctx ? 'ENTER: CONFIRMAR   ↑↓: ESCOLHER' : 'APERTE ENTER OU TOQUE NA TELA',
        W / 2,
        170,
        8,
        '#ffffff',
        'center',
      );
  },
};

export { Title };
