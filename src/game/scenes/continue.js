import { UI, screenHeader, screenFooter } from '../ui/theme.js';
/* Continue countdown after losing a story fight (arcade style): the beaten fighter, a big 9..0 count with a draining
   ring, punch to speed it up, START to continue, then GAME OVER. */
import { AU } from '../audio/synth.js';
import { ANN, VO } from '../audio/voice.js';
import { CH } from '../characters/roster.js';
import { H, W } from '../config.js';
import { ctx, txt, vgrad } from '../core/canvas.js';
import { shade } from '../core/color.js';
import { anyPressed } from '../core/input.js';
import { go } from '../core/scene.js';
import { S } from '../state.js';
import { chromaText, fade, frameBox, glitchBands, plate } from '../ui/arcade.js';
import { headShot } from '../ui/portrait.js';
import { goVs } from './flow.js';
import { Title } from './title.js';

const SECOND = 60;
const START_KEYS = ['Enter', 'NumpadEnter', 'Space', 'T_start'];
const SPEED_KEYS = ['KeyJ', 'KeyK', 'KeyL', 'KeyZ', 'KeyX', 'KeyC', 'T_p', 'T_k', 'T_s'];

const Continue = {
  id: 'continue',
  tapStart: true,
  enter() {
    this.t = 0;
    this.n = 9;
    this.st = 0; // frames into the current second
    this.pick = -1; // frames since START (continuing)
    this.over = -1; // frames since GAME OVER
    AU.play('cont');
    VO.say('Continue?', ANN);
  },
  tick() {
    this.n--;
    this.st = 0;
    if (this.n >= 0) AU.sfx('count');
    else {
      this.over = 0;
      AU.stop();
      AU.sfx('ko');
      VO.say('Game over...', ANN);
    }
  },
  update() {
    this.t++;
    if (this.pick >= 0) {
      if (++this.pick === 34) goVs();
      return;
    }
    if (this.over >= 0) {
      if (++this.over > 220 || (this.over > 60 && anyPressed(START_KEYS))) go(Title);
      return;
    }
    if (this.t === 1) AU.sfx('count');
    if (anyPressed(START_KEYS)) {
      this.pick = 0;
      AU.sfx('start');
      VO.say("Let's go!", ANN);
      return;
    }
    if (anyPressed(['Escape', 'Backspace'])) {
      this.n = 0;
      this.tick();
      return;
    }
    // arcade habit: mashing buttons speeds the countdown up
    if (anyPressed(SPEED_KEYS) && this.st > 8) this.tick();
    else if (++this.st >= SECOND) this.tick();
  },
  draw() {
    const ch = CH[S.p1],
      n = Math.max(0, this.n);
    ctx.fillStyle = vgrad(0, H, ['#1a0410', '#3a0818', '#0c0208']);
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 3) {
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.fillRect(0, y, W, 1);
    }
    // the beaten fighter: a portrait that darkens with every second, and the body on the floor
    const gloom = this.over >= 0 ? 0.75 : 0.12 + (9 - n) * 0.06;
    frameBox(
      22,
      30,
      100,
      100,
      shade(ch.col, -0.2),
      vgrad(30, 100, [shade(ch.col, -0.45), shade(ch.col, -0.8)]),
    );
    headShot(ch, 23, 31, 98, { t: 0 });
    ctx.fillStyle = `rgba(40,0,12,${gloom.toFixed(3)})`;
    ctx.fillRect(22, 30, 100, 100);
    plate(
      26,
      134,
      ch.short.length * 6 + 16,
      11,
      vgrad(134, 11, [shade(ch.col, 0.2), shade(ch.col, -0.4)]),
      5,
    );
    txt(ch.short, 34, 136, 6, '#ffffff', 'left', '#080e20');
    if (this.over >= 0) {
      this.drawGameOver();
      screenFooter('FREE PLAY', 'ENTER MENU');
      return;
    }
    screenHeader('CONTINUE?', 'FREE PLAY');
    const cx = 226,
      cy = 92,
      p = this.st / SECOND;
    // draining ring for the current second
    for (let i = 0; i < 48; i++) {
      const a = -Math.PI / 2 + (i / 48) * Math.PI * 2,
        on = i / 48 >= p;
      ctx.fillStyle = on ? (n <= 3 ? '#ff4d5e' : '#f8cd55') : '#3a1020';
      ctx.fillRect(Math.round(cx + Math.cos(a) * 42) - 1, Math.round(cy + Math.sin(a) * 42) - 1, 3, 3);
    }
    const slam = 1 + Math.max(0, 1 - this.st / 8) * 0.5;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(2 * slam, 2 * slam);
    txt(
      String(n),
      0,
      -16,
      32,
      n <= 3
        ? vgrad(-16, 32, ['#ffd0d0', '#ff4d5e', '#8a1020'])
        : vgrad(-16, 32, ['#ffffff', '#f8cd55', '#ff8a2a']),
      'center',
    );
    ctx.restore();
    if (this.pick >= 0) {
      fade(Math.max(0, 1 - this.pick / 12), '255,255,255');
      txt('CONTINUAR!', cx, 142, 16, vgrad(142, 16, ['#ffffff', '#f8cd55', '#ff8a2a']), 'center');
      if (this.pick > 18) fade((this.pick - 18) / 16);
      return;
    }
    txt('APERTE START', cx, 145, 8, UI.white, 'center');
    screenFooter('SOCO ACELERAR', 'ENTER CONTINUAR · ESC SAIR');
  },
  drawGameOver() {
    const k = Math.min(1, this.over / 40);
    ctx.globalAlpha = k;
    ctx.fillStyle = 'rgba(5,2,10,.85)';
    ctx.fillRect(0, 58, W, 64);
    ctx.fillStyle = '#d8343f';
    ctx.fillRect(0, 58, W, 1);
    ctx.fillRect(0, 121, W, 1);
    chromaText('GAME OVER', W / 2, 70, 24, '#ff4d5e', 'center', 2);
    txt('OBRIGADO POR JOGAR', W / 2, 104, 8, '#c89aa8', 'center');
    ctx.globalAlpha = 1;
    if (this.over < 30 && this.over % 4 < 2) glitchBands(4, 50, 120, 8);
    if (this.over > 160) fade((this.over - 160) / 60);
  },
};

export { Continue };
