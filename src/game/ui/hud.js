import { UI, fitLabel } from './theme.js';
/* Fight HUD in the Neo-Geo style: slanted life bars, portrait chips, name plates, timer emblem, power gauges,
   combo counter and the round/K.O. banners. Side 0 is the left player, side 1 the right one (mirrored). */
import { W } from '../config.js';
import { ctx, txt, vgrad } from '../core/canvas.js';
import { shade } from '../core/color.js';
import { sprite } from '../sprites/sprite.js';
import { frameBox, plate, sparkle } from './arcade.js';
import { fitShot, headShot } from './portrait.js';

const BAR = { y: 9, h: 8, w: 105, skew: 3, inset: 33 };
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
  rows(x - 2, y - 2, w + 4, h + 4, sk, '#050812');
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
      : vgrad(y, h, ['#fff9c8', '#f8cd55', '#e8860e']),
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
  const S = 22,
    x = side ? W - 6 - S : 6,
    y = 6;
  frameBox(x, y, S, S, side ? UI.p2 : UI.p1, vgrad(y, S, [shade(f.ch.col, -0.35), shade(f.ch.col, -0.75)]));
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
  const x = side ? W - BAR.inset - BAR.w : BAR.inset,
    y = 21;
  plate(x, y, BAR.w, 9, UI.panel, side ? -2 : 2);
  fitLabel(name, side ? x + BAR.w - 4 : x + 4, y + 1, BAR.w - 8, 6, UI.white, side ? 'right' : 'left');
  ctx.fillStyle = side ? UI.p2 : UI.p1;
  ctx.fillRect(x, y + 8, BAR.w, 1);
  txt(side ? '2P' : '1P', side ? W - 6 : 6, 32, 6, side ? UI.p2 : UI.p1, side ? 'right' : 'left', null);
  for (let k = 0; k < need; k++) {
    const mx = side ? W - BAR.inset - 5 - k * 8 : BAR.inset + k * 8;
    ctx.fillStyle = UI.ink;
    ctx.fillRect(mx - 1, 32, 7, 7);
    ctx.fillStyle = k < wins ? UI.gold : UI.raised;
    ctx.fillRect(mx, 33, 5, 5);
    if (k < wins) {
      ctx.fillStyle = UI.white;
      ctx.fillRect(mx + 1, 34, 2, 1);
    }
  }
}

/** Timer emblem between the bars; red and pulsing in the last 10 seconds. */
function timerEmblem(label, warn, t) {
  const x = W / 2 - 15,
    y = 4,
    w = 30,
    h = 29;
  chamfer(x - 1, y - 1, w + 2, h + 2, UI.ink, 4);
  chamfer(x, y, w, h, warn ? UI.danger : UI.gold, 3);
  chamfer(x + 1, y + 1, w - 2, h - 2, UI.panel, 3);
  txt('TIME', W / 2, 8, 6, warn ? UI.danger : UI.muted, 'center', null);
  txt(label, W / 2, 16, 12, warn ? UI.danger : UI.white, 'center');
}

/** Power gauge at the bottom: two segments (EX at half, MAX when full, with a rainbow shimmer). */
function powerGauge(side, meter, t) {
  const w = 88,
    h = 5,
    y = 171,
    x = side ? W - 10 - w : 10,
    sk = side ? -2 : 2;
  const fill = Math.round((w * Math.max(0, Math.min(100, meter))) / 100),
    full = meter >= 100,
    half = meter >= 50;
  rows(x - 1, y - 1, w + 2, h + 2, sk, UI.line);
  rows(x, y, w, h, sk, UI.ink);
  rows(
    side ? x + w - fill : x,
    y,
    fill,
    h,
    sk,
    vgrad(y, h, full ? [UI.white, UI.gold, UI.goldDark] : ['#bceeff', UI.p2, '#246c9b']),
  );
  for (let i = 1; i < 4; i++) rows(x + Math.round((w * i) / 4), y, 1, h, sk, UI.ink);
  txt(
    full ? 'MAX' : half ? 'EX' : 'POW',
    side ? x - 7 : x + w + 7,
    y,
    6,
    full ? UI.gold : half ? UI.p2 : UI.muted,
    side ? 'right' : 'left',
  );
}
export function hudBackdrop() {
  ctx.fillStyle = vgrad(0, 42, ['rgba(5,8,18,.94)', 'rgba(5,8,18,.7)', 'rgba(5,8,18,0)']);
  ctx.fillRect(0, 0, W, 42);
  ctx.fillStyle = 'rgba(5,8,18,.9)';
  ctx.fillRect(0, 167, W, 13);
}

/** Big combo counter that pops on every new hit and fades out at the end. */
function comboCounter(side, c) {
  if (!c || c.t <= 0 || c.n < 2) return;
  const age = 70 - c.t,
    pop = 1 + Math.max(0, 6 - age) / 10,
    n = String(c.n),
    width = n.length * 16 * pop;
  const x = side ? W - 10 : 10,
    y = 46;
  ctx.save();
  ctx.globalAlpha = Math.min(1, c.t / 12);
  ctx.translate(side ? x - width / 2 : x + width / 2, y + 8);
  ctx.scale(pop, pop);
  txt(n, 0, -8, 16, vgrad(-8, 16, ['#ffffff', UI.gold, '#ff8a2a']), 'center');
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = Math.min(1, c.t / 12);
  txt('HIT COMBO', x, y + Math.ceil(16 * pop) + 5, 6, UI.white, side ? 'right' : 'left');
  ctx.restore();
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
  ctx.fillStyle = '#f8cd55';
  ctx.fillRect(x, y, bw, 1);
  ctx.fillRect(x, y + h - 1, bw, 1);
  ctx.fillStyle = 'rgba(255,210,58,.35)';
  ctx.fillRect(x, y + 2, bw, 1);
  ctx.fillRect(x, y + h - 3, bw, 1);
}

/** Winner plate under the K.O. / TEMPO banner. */
function winnerPlate(label, col, perfect, t) {
  const w = label.length * 8 + 24,
    x = (W - w) / 2,
    y = 102;
  plate(x - 1, y - 1, w + 2, 12, '#050812', 5);
  plate(x, y, w, 10, vgrad(y, 10, [shade(col, 0.3), col, shade(col, -0.45)]), 5);
  txt(label, W / 2 + 2, y + 1, 8, '#ffffff', 'center', '#080e20');
  if (perfect) {
    txt('PERFEITO!', W / 2, y + 16, 12, vgrad(y + 16, 12, ['#fff7b0', '#f8cd55', '#ff8a2a']), 'center');
    sparkle(W / 2 - 58, y + 18, (t % 40) / 40);
    sparkle(W / 2 + 58, y + 26, ((t + 20) % 40) / 40);
  }
}

export { BAR, band, comboCounter, lifeBar, namePlate, portraitChip, powerGauge, timerEmblem, winnerPlate };
