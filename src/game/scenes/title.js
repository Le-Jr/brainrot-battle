import { UI, panel, menuRow, paragraph, screenFooter, fitLabel } from '../ui/theme.js';
/* Title screen: logo slam, attract screen with the cast (APERTE START) and the Neo-Geo-style main menu. */
import { AU } from '../audio/synth.js';
import { ANN, VO } from '../audio/voice.js';
import { BOSS } from '../characters/fighters/saturnita.js';
import { CH } from '../characters/roster.js';
import { GAME, H, REDUCED, W } from '../config.js';
import { ctx, txt, vgrad } from '../core/canvas.js';
import { CONFIRM, anyPressed, menuPad } from '../core/input.js';
import { clamp, rnd } from '../core/math.js';
import { go } from '../core/scene.js';
import { XP } from '../progression/xp.js';
import { drawSpr, sprite } from '../sprites/sprite.js';
import { STAGES, drawStage } from '../stages/index.js';
import { S } from '../state.js';
import { blink, fade, sparkle } from '../ui/arcade.js';
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
  { id: 'versus', l: 'VERSUS', d: 'Luta livre: contra a CPU ou contra um amigo no mesmo teclado.' },
  { id: 'bonus', l: 'BÔNUS', d: 'Destrua carros para farmar XP: Nonno, Cybercaminhão ou Bi-ai-di.' },
  {
    id: 'training',
    l: 'TREINO',
    d: 'Boneco parado, vida infinita e dano do combo. Aperte TAB para ver as hitboxes.',
  },
  { id: 'moves', l: 'COMANDOS', d: 'Todos os golpes, combos, cancelamentos e especiais.' },
  { id: 'options', l: 'OPÇÕES', d: 'Ajuste a dificuldade, o volume e as vozes do jogo.' },
];
/** VERSUS sub-choice, shown inside the mode card. */
const VS_MODES = [
  { cpu: true, l: '1P VS CPU', d: 'CPU usa o nível definido em OPÇÕES.' },
  { cpu: false, l: '1P VS 2P', d: 'Dois jogadores, no mesmo teclado.' },
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
    this.sub = null;
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
    // VERSUS sub-choice: against the CPU or local 2 players
    if (this.sub) {
      const p = menuPad();
      if (p.pup || p.pdown) {
        this.sub.m ^= 1;
        AU.sfx('blip');
      }
      if (anyPressed(['Escape', 'Backspace'])) {
        this.sub = null;
        AU.sfx('blip');
      } else if (anyPressed(CONFIRM)) {
        AU.sfx('ok');
        S.mode = 'versus';
        S.vsCpu = VS_MODES[this.sub.m].cpu;
        this.sub = null;
        this.back = true;
        go(Select);
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
      if (id === 'versus') {
        this.sub = { m: S.vsCpu ? 0 : 1 };
        return;
      }
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
      const a = (REDUCED ? 0 : t / 120) + (i * Math.PI) / 8;
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
    drawLogo(160, (inMenu ? -2 : 5) + (1 - e) * 20, sc * (inMenu ? 0.78 : 1), t);
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
        txt(label, W / 2, 102, 16, vgrad(102, 16, ['#fff7b0', '#f8cd55', '#ff8a2a']), 'center');
        ctx.globalAlpha = 1;
      }
    }
    if (mk > 0) this.drawMenu(mk);
    const total = CH.reduce((sum, ch) => sum + XP.get(ch.id), 0);
    screenFooter('XP ' + total + ' · FREE PLAY', inMenu ? '↑↓ ESCOLHER · ENTER OK' : '© 2026 TUPINICODE');
  },
  /** Slanted plates on the left, mode card on the right; both slide in with `mk` (0 → 1). */
  drawMenu(mk) {
    ctx.save();
    ctx.globalAlpha = mk;
    MENU.forEach((item, i) => menuRow(item.l, 10, 69 + i * 15, 124, i === this.m, { height: 13 }));
    panel(146, 69, 164, 88, UI.gold);
    if (this.sub) {
      txt('VERSUS', 156, 76, 8, UI.gold, 'left', null);
      VS_MODES.forEach((mode, i) => menuRow(mode.l, 154, 91 + i * 19, 148, i === this.sub.m, { height: 16 }));
      paragraph(VS_MODES[this.sub.m].d, 156, 135, 144, { size: 6, lineHeight: 10, maxLines: 2 });
    } else {
      txt('0' + (this.m + 1) + ' / MODE SELECT', 156, 76, 6, UI.gold, 'left', null);
      paragraph(MENU[this.m].d, 156, 94, 144, { size: 6, lineHeight: 11, maxLines: 5 });
      fitLabel('BRAINROT BATTAGLIA', 156, 147, 144, 6, UI.muted);
    }
    ctx.restore();
  },
};

export { Title };
