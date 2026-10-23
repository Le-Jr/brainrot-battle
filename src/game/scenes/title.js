/* Title screen: logo slam, attract screen with the cast (APERTE START) and the Neo-Geo-style main menu. */
import { AU } from '../audio/synth.js';
import { ANN, VO } from '../audio/voice.js';
import { BOSS } from '../characters/fighters/saturnita.js';
import { CH } from '../characters/roster.js';
import { GAME, H, REDUCED, W } from '../config.js';
import { ctx, txt, vgrad, wrap } from '../core/canvas.js';
import { CONFIRM, anyPressed, menuPad } from '../core/input.js';
import { clamp, rnd } from '../core/math.js';
import { go } from '../core/scene.js';
import { XP } from '../progression/xp.js';
import { drawSpr, sprite } from '../sprites/sprite.js';
import { STAGES, drawStage } from '../stages/index.js';
import { S } from '../state.js';
import { blink, fade, frameBox, plate, sparkle } from '../ui/arcade.js';
import { drawLogo } from '../ui/logo.js';
import { Moves } from './moves.js';
import { Options } from './options.js';
import { Select } from './select.js';

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
/** Cast lineup on the attract screen: x position and facing (everyone looks at the center). */
const LINEUP = [26, 62, 98, 134, 186, 222, 258, 294];
/** Spots on the logo where the star glints appear. */
const GLINTS = [
  [70, 20],
  [252, 28],
  [112, 58],
  [214, 62],
  [160, 84],
  [92, 38],
  [236, 46],
];
const SLAM = 18;
const ease = (k) => 1 - Math.pow(1 - clamp(k, 0, 1), 3);

const Title = {
  id: 'title',
  tapStart: true,
  enter() {
    this.m = this.m || 0;
    this.t = this.back ? 60 : 0;
    this.phase = this.back ? 'menu' : 'intro';
    this.mt = this.back ? 30 : 0;
    this.back = false;
    this.show = 0;
    this.shake = 0;
    AU.play('title');
  },
  update() {
    this.t++;
    this.mt++;
    if (this.shake > 0) this.shake--;
    if (this.t === SLAM) {
      AU.sfx('slam');
      if (!REDUCED) this.shake = 10;
      VO.say(GAME.toLowerCase() + '!', ANN);
    }
    if (this.t % 240 === 0) this.show = (this.show + 1) % CH.length;
    if (this.phase === 'intro') {
      if (anyPressed(CONFIRM)) this.t = Math.max(this.t, 44);
      if (this.t >= 44) this.phase = 'attract';
      return;
    }
    if (this.phase === 'attract') {
      if (anyPressed(CONFIRM)) {
        AU.sfx('start');
        this.phase = 'menu';
        this.mt = 0;
      }
      return;
    }
    // menu
    if (anyPressed(['Escape', 'Backspace'])) {
      AU.sfx('wipe');
      this.phase = 'attract';
      this.mt = 0;
      return;
    }
    if (this.mt < 10) return;
    const p = menuPad();
    if (p.pup) {
      this.m = (this.m + MENU.length - 1) % MENU.length;
      AU.sfx('blip');
    }
    if (p.pdown) {
      this.m = (this.m + 1) % MENU.length;
      AU.sfx('blip');
    }
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
      inMenu = this.phase === 'menu',
      mk = inMenu ? ease(this.mt / 14) : 1 - ease(this.mt / 14),
      cam = Math.round(80 + Math.sin(t / 300) * 70),
      sh = this.shake > 0 ? Math.round(rnd(-this.shake, this.shake) * 0.5) : 0;
    ctx.save();
    ctx.translate(sh, 0);
    // cosmic backdrop: Saturn's rings, darkened, with rotating rays and the boss looming behind the logo
    drawStage(STAGES[9], cam, t);
    ctx.fillStyle = vgrad(0, H, ['rgba(10,4,24,.86)', 'rgba(24,6,40,.55)', 'rgba(10,4,24,.92)']);
    ctx.fillRect(-10, 0, W + 20, H);
    for (let i = 0; i < 16; i++) {
      const a = t / 120 + (i * Math.PI) / 8;
      ctx.fillStyle = i % 2 ? 'rgba(255,90,170,.06)' : 'rgba(255,210,58,.06)';
      ctx.beginPath();
      ctx.moveTo(160, 46);
      ctx.lineTo(160 + Math.cos(a) * 420, 46 + Math.sin(a) * 420);
      ctx.lineTo(160 + Math.cos(a + 0.18) * 420, 46 + Math.sin(a + 0.18) * 420);
      ctx.fill();
    }
    if (t > SLAM) {
      const a = Math.min(1, (t - SLAM) / 30) * (0.22 + Math.sin(t / 40) * 0.06);
      drawSpr(sprite(BOSS, 'idle', Math.floor(t / 9) % 8, 0, false, 'p'), 160, 156, -1, 2.3, false, a);
    }
    // the cast, rising one by one, sliding away when the menu opens
    ctx.fillStyle = vgrad(140, 30, ['rgba(255,106,213,0)', 'rgba(255,106,213,.22)', 'rgba(120,40,200,.0)']);
    ctx.fillRect(0, 140 + mk * 60, W, 30);
    CH.forEach((ch, i) => {
      const rise = ease((t - SLAM - i * 3) / 14);
      if (rise <= 0) return;
      const y = 168 + (1 - rise) * 40 + mk * 70,
        f = (Math.floor(t / 7) + i) % 8;
      drawSpr(sprite(ch, 'idle', f, 0, false, ''), LINEUP[i], y, i < 4 ? 1 : -1, 0.62);
    });
    // logo slam and glints
    const e = Math.min(1, t / SLAM),
      sc =
        t < SLAM
          ? 0.8 + (1 - e) * 2.2
          : 0.8 + (t < SLAM + 8 ? Math.sin(((t - SLAM) / 8) * Math.PI) * 0.06 : 0);
    drawLogo(160, 4 + (1 - e) * 20, sc, t);
    if (t > SLAM + 10) {
      const k = Math.floor(t / 40),
        [gx, gy] = GLINTS[k % GLINTS.length];
      sparkle(gx, gy, (t % 40) / 40);
      const [hx, hy] = GLINTS[(k * 3 + 2) % GLINTS.length];
      sparkle(hx, hy, ((t + 20) % 40) / 40, '#fff4b0');
    }
    ctx.restore();
    if (t >= SLAM && t < SLAM + 12) fade(1 - (t - SLAM) / 12, '255,255,255');
    if (t < SLAM) return;

    // attract: APERTE START
    if (this.phase === 'attract' || (!inMenu && mk > 0)) {
      if (blink(t, 36)) {
        const label = 'APERTE START';
        ctx.globalAlpha = 1 - mk;
        txt(label, W / 2 + 2, 102 + 2, 16, 'rgba(0,0,0,.5)', 'center', null);
        txt(label, W / 2, 102, 16, vgrad(102, 16, ['#fff7b0', '#ffd23a', '#ff8a2a']), 'center');
        ctx.globalAlpha = 1;
      }
    }
    if (mk > 0) this.drawMenu(mk);
    // bottom strip: total XP, copyright, free play
    ctx.fillStyle = 'rgba(5,2,10,.9)';
    ctx.fillRect(0, 170, W, 10);
    ctx.fillStyle = '#ffd23a';
    ctx.fillRect(0, 170, W, 1);
    const tot = CH.reduce((s, c) => s + XP.get(c.id), 0);
    txt('XP ' + tot, 4, 172, 8, '#7aff9a', 'left', null);
    txt('© 2026 TUPINICODE', W / 2, 172, 8, '#cbbfe6', 'center', null);
    if (inMenu) txt('ESC', W - 4, 172, 8, '#9a8fb3', 'right', null);
    else txt('FREE PLAY', W - 4, 172, 8, blink(t, 60) ? '#ffffff' : '#9a8fb3', 'right', null);
  },
  /** Slanted plates on the left, mode card on the right; both slide in with `mk` (0 → 1). */
  drawMenu(mk) {
    const t = this.t;
    MENU.forEach((it, i) => {
      const k = ease(mk * 1.6 - i * 0.12),
        sel = i === this.m,
        w = sel ? 124 : 112,
        x = 10 - (1 - k) * 170,
        y = 86 + i * 13;
      plate(x - 1, y - 1, w + 2, 13, '#05020a', 7);
      plate(x, y, w, 11, sel ? vgrad(y, 11, ['#fff6b0', '#ffd23a', '#e8901a']) : 'rgba(34,16,58,.94)', 6);
      if (sel) {
        plate(x, y, w, 2, 'rgba(255,255,255,.55)', 6);
        const sx = x + ((t * 4) % (w + 30)) - 10;
        if (sx < x + w) plate(Math.max(x, sx), y, 6, 11, 'rgba(255,255,255,.35)', 6);
        const bx = x + w + 10 + (blink(t, 16) ? 1 : 0);
        ctx.fillStyle = '#ffd23a';
        ctx.fillRect(bx, y + 2, 2, 7);
        ctx.fillRect(bx + 2, y + 3, 2, 5);
        ctx.fillRect(bx + 4, y + 4, 2, 3);
        sparkle(x + w + 4, y + 1, (t % 30) / 30);
      }
      txt(it.l, x + 14, y + 2, 8, sel ? '#1a0a24' : '#cbbfe6', 'left', sel ? null : '#05020a');
    });
    // mode card
    const k = ease(mk * 1.4 - 0.2),
      x = 170 + (1 - k) * 170;
    frameBox(x, 90, 140, 74, '#ff6ad5');
    plate(x + 4, 82, 92, 11, vgrad(82, 11, ['#ff9ae0', '#ff6ad5', '#b02a90']), 5);
    txt(MENU[this.m].l, x + 14, 84, 8, '#ffffff', 'left', '#3a0a2a');
    // the showcased fighter stands behind the text, like key art
    const ch = CH[this.show];
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 1, 91, 138, 72);
    ctx.clip();
    drawSpr(sprite(ch, 'idle', Math.floor(t / 7) % 8, 0, false, ''), x + 104, 168, -1, 0.95, false, 0.4);
    ctx.restore();
    wrap(MENU[this.m].d, 16)
      .slice(0, 6)
      .forEach((l, i) => txt(l, x + 6, 97 + i * 10, 8, '#f1e9ff', 'left'));
  },
};

export { Title };
