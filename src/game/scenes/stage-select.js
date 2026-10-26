import { UI, screenBackdrop, screenHeader, screenFooter, fitLabel } from '../ui/theme.js';
/* Versus stage select: live preview with its music, both fighters' portraits and a grid of every stage plus RANDOM. */
import { AU } from '../audio/synth.js';
import { ANN, VO } from '../audio/voice.js';
import { H, W } from '../config.js';
import { ctx, mk, txt, vgrad } from '../core/canvas.js';
import { CONFIRM, anyPressed, menuPad } from '../core/input.js';
import { go } from '../core/scene.js';
import { STAGES, drawStage } from '../stages/index.js';
import { blink, frameBox, plate, sparkle } from '../ui/arcade.js';
import { headShot } from '../ui/portrait.js';
import { LOC } from '../world/map.js';
import { Select } from './select.js';
import { VS } from './vs.js';

const COLS = 7,
  TW = 40,
  TH = 17,
  GX = (W - COLS * (TW + 2) + 2) / 2,
  GY = 124;
/** Fight stages that the random tile can land on (the bonus streets are pickable, but not drawn at random). */
const RANDOM_POOL = 10;
/** Where each stage is in Brainrotália (the two bonus-only stages have no map location). */
const PLACE = (i) => (LOC[i] ? LOC[i].n : i === 11 ? 'NEON CITTÀ' : 'VILA BRASILINI');

let THUMBS = null;
/** Small static thumbnails of every stage (their 2x layers scaled down, camera at the center). */
function thumbs() {
  if (THUMBS) return THUMBS;
  THUMBS = STAGES.map((st) => {
    const c = mk(TW * 2, TH * 2),
      g = c.getContext('2d'),
      k = (TW * 2) / 640,
      cam = 80;
    g.imageSmoothingEnabled = true;
    g.drawImage(st.sky, 0, 0, st.sky.width * k, st.sky.height * k);
    g.drawImage(st.far, -cam * 0.3 * 2 * k, 0, st.far.width * k, st.far.height * k);
    g.drawImage(st.mid, -cam * 0.6 * 2 * k, 0, st.mid.width * k, st.mid.height * k);
    g.drawImage(st.floor, -cam * 2 * k, 0, st.floor.width * k, st.floor.height * k);
    return c;
  });
  return THUMBS;
}

/** After both fighters are picked: choose where to fight, then go to the VS screen. */
function StageSelect(c1, c2, opts, label) {
  const n = STAGES.length + 1; // last tile = random
  return {
    id: 'stage-select',
    tapStart: true,
    enter() {
      this.t = 0;
      this.i = this.i ?? n - 1;
      this.still = 0;
      this.out = -1;
      thumbs();
      AU.play('select');
    },
    pick(dir) {
      this.i = (this.i + dir + n) % n;
      this.still = 0;
      AU.sfx('blip');
    },
    update() {
      this.t++;
      this.still++;
      if (this.out >= 0) {
        if (--this.out === 0) go(VS(c1, c2, this.stage, opts, label));
        return;
      }
      if (anyPressed(['Escape', 'Backspace', 'KeyK', 'T_k'])) {
        AU.sfx('blip');
        go(Select);
        return;
      }
      const p = menuPad();
      if (p.pleft) this.pick(-1);
      if (p.pright) this.pick(1);
      if (p.pup) this.pick(-COLS);
      if (p.pdown) this.pick(COLS);
      // preview the stage's music once the cursor rests on it
      if (this.still === 24 && this.i < STAGES.length) AU.play(STAGES[this.i].music);
      if (anyPressed(CONFIRM)) {
        this.stage = this.i < STAGES.length ? this.i : Math.floor(Math.random() * RANDOM_POOL);
        AU.sfx('ok');
        VO.say(
          this.i < STAGES.length ? PLACE(this.stage).toLowerCase() : 'Random!',
          this.i < STAGES.length ? { role: 'it' } : ANN,
        );
        this.out = 30;
      }
    },
    draw() {
      const t = this.t,
        random = this.i >= STAGES.length,
        show = random ? Math.floor(t / 10) % RANDOM_POOL : this.i,
        st = STAGES[show];
      screenBackdrop(t);
      screenHeader('ARENAS', 'STAGE SELECT');
      // live preview (the real stage renderer, scaled into the frame)
      const px = 94,
        py = 34,
        pw = 132,
        ph = 74;
      frameBox(px, py, pw, ph, '#f8cd55', '#000');
      ctx.save();
      ctx.beginPath();
      ctx.rect(px, py, pw, ph);
      ctx.clip();
      ctx.translate(px, py);
      ctx.scale(pw / W, ph / H);
      const cam = Math.round(80 + Math.sin(t / 90) * 70);
      drawStage(st, cam, t);
      if (st.front) st.front(ctx, cam, t);
      ctx.restore();
      if (random) {
        ctx.fillStyle = 'rgba(10,4,24,.55)';
        ctx.fillRect(px, py, pw, ph);
        txt(
          '?',
          W / 2,
          py + ph / 2 - 12,
          24,
          vgrad(py + 33, 24, ['#ffffff', '#f8cd55', '#ff8a2a']),
          'center',
        );
      }
      // the two fighters on each side
      const chip = (ch, x, flip, col) => {
        frameBox(x, 44, 44, 44, col, vgrad(44, 44, ['#203455', '#080e20']));
        headShot(ch, x + 1, 45, 42, { flip, t, alt: flip && c1 === c2 });
        fitLabel(ch.short, x + 22, 99, 66, 6, col, 'center');
      };
      chip(c1, 18, false, UI.p1);
      chip(c2, W - 62, true, UI.p2);
      txt(opts.cpu ? 'CPU' : '2P', W - 40, 35, 6, '#9adcff', 'center', null);
      txt('1P', 40, 35, 6, '#ff8a96', 'center', null);
      // stage name plate
      const name = random ? 'ALEATÓRIO' : PLACE(show),
        nw = Math.min(216, name.length * 6 + 24);
      plate(W / 2 - nw / 2 - 1, 112, nw + 2, 11, '#050812', 5);
      plate(W / 2 - nw / 2, 113, nw, 9, vgrad(113, 9, ['#2d4165', '#14233d']), 5);
      txt(name, W / 2 + 2, 114, 6, random ? '#f8cd55' : '#ffffff', 'center', null);
      // thumbnail grid
      const T = thumbs();
      for (let k = 0; k < n; k++) {
        const x = GX + (k % COLS) * (TW + 2),
          y = GY + Math.floor(k / COLS) * (TH + 4),
          sel = k === this.i;
        ctx.fillStyle = sel ? (blink(t, 16) ? '#f8cd55' : '#fff6b0') : '#050812';
        ctx.fillRect(x - 1, y - 1, TW + 2, TH + 2);
        if (k < STAGES.length) ctx.drawImage(T[k], x, y, TW, TH);
        else {
          ctx.fillStyle = vgrad(y, TH, ['#2d4165', '#14233d']);
          ctx.fillRect(x, y, TW, TH);
          txt('?', x + TW / 2, y + 4, 16, '#f8cd55', 'center');
        }
        if (!sel) {
          ctx.fillStyle = 'rgba(10,4,24,.35)';
          ctx.fillRect(x, y, TW, TH);
        } else sparkle(x + TW - 2, y + 1, (t % 30) / 30);
      }
      screenFooter('←→ ESCOLHER', 'ENTER LUTAR · ESC VOLTAR');
      if (this.out >= 0 && (t >> 2) & 1) {
        ctx.fillStyle = 'rgba(255,255,255,.15)';
        ctx.fillRect(px, py, pw, ph);
      }
    },
  };
}

export { StageSelect };
