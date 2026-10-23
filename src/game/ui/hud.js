/* Fight HUD in the Neo-Geo style: slanted life bars, portrait chips, name plates, timer emblem, power gauges,
   combo counter and the round/K.O. banners. Side 0 is the left player, side 1 the right one (mirrored). */
import { W } from '../config.js';
import { ctx, txt, vgrad } from '../core/canvas.js';
import { shade } from '../core/color.js';
import { sprite } from '../sprites/sprite.js';
import { frameBox, plate, sparkle } from './arcade.js';
import { fitShot, headShot } from './portrait.js';

const BAR = { y: 7, h: 9, w: 112, skew: 5, inset: 34 };
const ease = (k) => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);

/** Rows r0..r1 of a slanted bar of height h: row r is shifted by skew·(1 − r/(h−1)). Keeps every row pixel-crisp. */
function rows(x, y, w, h, skew, fill, r0 = 0, r1 = h) {
  if (w <= 0) return;
  ctx.fillStyle = fill;
  for (let r = r0; r < r1; r++)
    ctx.fillRect(x + Math.round(skew * (1 - r / Math.max(1, h - 1))), y + r, w, 1);
}

/** Rectangle with chamfered corners (the timer emblem). */
function chamfer(x, y, w, h, fill, cut) {
  ctx.fillStyle = fill;
  for (let i = 0; i <= cut; i++) ctx.fillRect(x + cut - i, y + i, w - (cut - i) * 2, h - i * 2);
}

/** Life bar: gold bevel frame, red damage trail (white for a few frames right after a hit), gloss and a moving shine. */
function lifeBar(side, frac, trail, t, hitFlash) {
  const { y, h, w } = BAR,
    sk = side ? -BAR.skew : BAR.skew,
    x = side ? W - BAR.inset - w : BAR.inset;
  rows(x - 2, y - 2, w + 4, h + 4, sk, '#05020a');
  rows(x - 1, y - 1, w + 2, h + 2, sk, vgrad(y - 1, h + 2, ['#fff2b0', '#c98a2a', '#6a3a08']));
  rows(x, y, w, h, sk, vgrad(y, h, ['#2e0c1c', '#12040c']));
  const hw = Math.round(w * Math.max(0, frac)),
    dw = Math.round(w * Math.max(0, trail)),
    hx = side ? x + w - hw : x;
  rows(side ? x + w - dw : x + hw, y, dw - hw, h, sk, hitFlash ? '#ffffff' : '#e8343f');
  const low = frac < 0.3,
    hot = low && (t >> 3) & 1;
  rows(
    hx,
    y,
    hw,
    h,
    sk,
    low
      ? vgrad(y, h, [hot ? '#ffe0b0' : '#ffb070', '#ff5a2a', '#a8180c'])
      : vgrad(y, h, ['#fff9c8', '#ffd23a', '#e8860e']),
  );
  rows(hx, y, hw, h, sk, 'rgba(255,255,255,.6)', 1, 2);
  rows(hx, y, hw, h, sk, 'rgba(90,30,0,.35)', h - 2, h);
  // quarter notches and a shine travelling along the bar
  for (let q = 1; q < 4; q++) rows(x + Math.round((w * q) / 4), y, 1, h, sk, 'rgba(0,0,0,.3)');
  const s = (t * 2) % (w + 60);
  if (s < hw - 5) rows(side ? x + w - s - 5 : x + s, y, 5, h, sk, 'rgba(255,255,255,.28)');
}

/** Framed head shot next to the life bar; flashes white when hit, blue when frozen, darkens on K.O. */
function portraitChip(side, f, t) {
  const S = 26,
    x = side ? W - 4 - S : 4,
    y = 3;
  frameBox(x, y, S, S, f.ch.col, vgrad(y, S, [shade(f.ch.col, -0.35), shade(f.ch.col, -0.75)]));
  if (f.isCar) fitShot(sprite(f.ch, f.poseInfo().pose, 0, 0, false, ''), x + 1, y + 1, S - 2, !!side);
  else {
    const tint = f.flash > 0 && f.flash & 2 ? 'w' : f.frozen > 0 ? 'b' : '';
    headShot(f.ch, x + 1, y + 1, S - 2, { tint, flip: !!side, t, alt: f.alt });
  }
  if (f.st === 'ko' || f.dead) {
    ctx.fillStyle = 'rgba(20,0,10,.55)';
    ctx.fillRect(x, y, S, S);
  }
}

/** Slanted plate with the fighter's name in their color, followed by the round-win medals. */
function namePlate(side, name, col, wins, need, t) {
  const y = 19,
    w = name.length * 8 + 14,
    sk = side ? -4 : 4,
    x = side ? W - BAR.inset - w : BAR.inset;
  plate(x - 1, y - 1, w + 2, 12, '#05020a', sk);
  plate(x, y, w, 10, vgrad(y, 10, ['#3a2456', '#1e1030', '#120a1c']), sk);
  plate(side ? x + w - 4 : x, y, 4, 10, col, sk);
  plate(x, y + 9, w, 1, shade(col, -0.2), sk);
  txt(name, side ? x + w - 8 : x + 8, y + 1, 8, shade(col, 0.45), side ? 'right' : 'left', '#05020a');
  // round-win medals under the portrait chip
  for (let k = 0; k < need; k++) {
    const my = 32,
      mx = side ? W - 13 - k * 11 : 5 + k * 11,
      won = k < wins;
    ctx.fillStyle = '#05020a';
    ctx.fillRect(mx - 1, my - 1, 10, 10);
    ctx.fillStyle = won ? vgrad(my, 8, ['#fff7b0', '#ffd23a', '#c07010']) : '#2a1838';
    ctx.fillRect(mx, my, 8, 8);
    if (won) {
      ctx.fillStyle = '#7a3a00';
      ctx.fillRect(mx + 2, my + 2, 1, 3);
      ctx.fillRect(mx + 5, my + 2, 1, 3);
      ctx.fillRect(mx + 3, my + 5, 2, 1);
      if ((t + k * 20) % 90 < 30) sparkle(mx + 6, my + 1, ((t + k * 20) % 90) / 30);
    } else {
      ctx.fillStyle = '#3a2a50';
      ctx.fillRect(mx + 3, my + 3, 2, 2);
    }
  }
}

/** Timer emblem between the bars; red and pulsing in the last 10 seconds. */
function timerEmblem(label, warn, t) {
  const x = 146,
    y = 3,
    w = 28,
    h = 25;
  chamfer(x - 2, y - 2, w + 4, h + 4, '#05020a', 6);
  chamfer(x - 1, y - 1, w + 2, h + 2, vgrad(y, h, ['#fff2b0', '#c98a2a', '#6a3a08']), 5);
  chamfer(x, y, w, h, vgrad(y, h, ['#3a1a5a', '#1a0a2e', '#0e0618']), 4);
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  ctx.fillRect(x + 4, y + 1, w - 8, 1);
  const k = warn ? 1 + Math.max(0, Math.sin((t / 30) * Math.PI * 2)) * 0.12 : 1;
  ctx.save();
  ctx.translate(160, y + 13);
  ctx.scale(k, k);
  txt(
    label,
    0,
    -8,
    16,
    warn
      ? vgrad(-8, 16, ['#ffd0d0', '#ff4d5e', '#a8102a'])
      : vgrad(-8, 16, ['#ffffff', '#e8e0ff', '#a898d8']),
    'center',
  );
  ctx.restore();
}

/** Power gauge at the bottom: two segments (EX at half, MAX when full, with a rainbow shimmer). */
function powerGauge(side, meter, t) {
  const w = 100,
    h = 6,
    y = 168,
    sk = side ? -3 : 3,
    x = side ? W - 8 - w : 8,
    mw = Math.round((w * Math.min(100, meter)) / 100),
    full = meter >= 100,
    half = meter >= 50,
    fx = side ? x + w - mw : x;
  rows(x - 2, y - 2, w + 4, h + 4, sk, '#05020a');
  rows(x - 1, y - 1, w + 2, h + 2, sk, vgrad(y - 1, h + 2, ['#c8d8ff', '#5a6aa8', '#2a3260']));
  rows(x, y, w, h, sk, '#100820');
  if (full) {
    const C = ['#ff6ad5', '#45b4ff', '#ffd23a', '#7aff9a'];
    for (let i = 0; i < mw; i += 4) rows(fx + i, y, Math.min(4, mw - i), h, sk, C[((i >> 2) + (t >> 1)) % 4]);
  } else {
    rows(
      fx,
      y,
      mw,
      h,
      sk,
      vgrad(y, h, half ? ['#c8ffff', '#4af0ff', '#1a8ab8'] : ['#9ac8ff', '#2a7ad8', '#1a3a80']),
    );
  }
  rows(fx, y, mw, h, sk, 'rgba(255,255,255,.45)', 1, 2);
  rows(x + w / 2, y, 1, h, sk, '#05020a');
  const lx = side ? x - 6 : x + w + 6,
    al = side ? 'right' : 'left';
  if (full) txt('MAX', lx, y - 1, 8, (t >> 3) & 1 ? '#ffffff' : '#ffd23a', al);
  else if (half) txt('EX', lx, y - 1, 8, '#4af0ff', al);
}

/** Big combo counter that pops on every new hit and fades out at the end. */
function comboCounter(side, c) {
  if (!c || c.t <= 0 || c.n < 2) return;
  const age = 70 - c.t,
    pop = 1 + Math.max(0, 6 - age) / 10,
    n = String(c.n),
    nw = n.length * 24,
    x = side ? W - 10 : 10,
    y = 50;
  ctx.save();
  ctx.globalAlpha = Math.min(1, c.t / 12);
  ctx.translate(side ? x - nw / 2 : x + nw / 2, y + 12);
  ctx.scale(pop, pop);
  txt(n, 0, -12, 24, vgrad(-12, 24, ['#ffffff', '#ffd23a', '#ff5a2a']), 'center');
  ctx.restore();
  ctx.globalAlpha = Math.min(1, c.t / 12);
  txt('HITS', side ? x - nw - 4 : x + nw + 4, y + 14, 8, '#ffffff', side ? 'right' : 'left');
  txt('COMBO', side ? x - nw - 4 : x + nw + 4, y + 4, 8, '#ffb0e8', side ? 'right' : 'left');
  ctx.globalAlpha = 1;
}

/**
 * Banner band across the screen: grows from the center with `k` (0..1), gold rules top and bottom.
 * `col` is the band color as "r,g,b".
 */
function band(y, h, k, col = '10,4,24') {
  const bw = Math.round(W * ease(k)),
    x = (W - bw) / 2;
  if (bw <= 0) return;
  ctx.fillStyle = `rgba(${col},.82)`;
  ctx.fillRect(x, y, bw, h);
  ctx.fillStyle = '#ffd23a';
  ctx.fillRect(x, y, bw, 1);
  ctx.fillRect(x, y + h - 1, bw, 1);
  ctx.fillStyle = 'rgba(255,210,58,.35)';
  ctx.fillRect(x, y + 2, bw, 1);
  ctx.fillRect(x, y + h - 3, bw, 1);
}

/** Winner plate under the K.O. / TEMPO banner. */
function winnerPlate(label, col, perfect, t) {
  const w = label.length * 8 + 28,
    x = (W - w) / 2,
    y = 108;
  plate(x - 1, y - 1, w + 2, 14, '#05020a', 6);
  plate(x, y, w, 12, vgrad(y, 12, [shade(col, 0.3), col, shade(col, -0.45)]), 6);
  txt(label, W / 2 + 3, y + 2, 8, '#ffffff', 'center', '#120a1c');
  if (perfect) {
    txt('PERFEITO!', W / 2, y + 18, 16, vgrad(y + 18, 16, ['#fff7b0', '#ffd23a', '#ff8a2a']), 'center');
    sparkle(W / 2 - 76, y + 20, (t % 40) / 40);
    sparkle(W / 2 + 76, y + 30, ((t + 20) % 40) / 40);
  }
}

export { BAR, band, comboCounter, lifeBar, namePlate, portraitChip, powerGauge, timerEmblem, winnerPlate };
