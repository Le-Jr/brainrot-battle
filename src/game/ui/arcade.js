/* Neo-Geo-style UI kit shared by the intro, title and cutscenes: slanted plates, framed boxes, sparkles, glitches and wipes. */
import { panel, UI } from './theme.js';
import { H, REDUCED, W } from '../config.js';
import { ctx, cv, txt } from '../core/canvas.js';
import { rnd } from '../core/math.js';

/** Pixel-crisp parallelogram (left edge leans right by `skew` px at the top). `fill` may be a gradient. */
function plate(x, y, w, h, fill, skew = 6) {
  ctx.fillStyle = fill;
  for (let r = 0; r < h; r++) ctx.fillRect(x + Math.round(skew * (1 - r / Math.max(1, h - 1))), y + r, w, 1);
}

/** Arcade dialog frame: dark outline, accent line, inner bevel and a translucent body. */
function frameBox(x, y, w, h, accent = UI.gold, fill = UI.panel) {
  panel(x, y, w, h, accent, fill);
}

/** Four-point star glint; `p` goes 0 → 1 over its life (grows, then shrinks). Drawn in half pixels for a fine line. */
function sparkle(x, y, p, col = '#ffffff') {
  if (REDUCED) return;
  const k = Math.sin(Math.min(1, Math.max(0, p)) * Math.PI);
  if (k <= 0) return;
  const L = 1 + k * 7,
    l = 1 + k * 3;
  ctx.fillStyle = col;
  ctx.fillRect(x - L, y + 0.25, L * 2 + 1, 0.5);
  ctx.fillRect(x + 0.25, y - L, 0.5, L * 2 + 1);
  ctx.fillRect(x - l, y, l * 2 + 1, 1);
  ctx.fillRect(x, y - l, 1, l * 2 + 1);
  ctx.globalAlpha *= 0.5;
  ctx.fillRect(x - 1, y - 1, 3, 3);
  ctx.globalAlpha /= 0.5;
}

/** Text with a chromatic-aberration fringe (magenta left, cyan right) and an outline. */
function chromaText(s, x, y, size, col, align = 'center', shift = 1) {
  txt(s, x - shift, y, size, 'rgba(255,58,208,.85)', align, '#050812');
  txt(s, x + shift, y, size, 'rgba(74,240,255,.6)', align, null);
  txt(s, x, y, size, col, align, null);
}

/** Cinematic black bars. */
function letterbox(top, bottom, col = '#000') {
  ctx.fillStyle = col;
  if (top) ctx.fillRect(0, 0, W, top);
  if (bottom) ctx.fillRect(0, H - bottom, W, bottom);
}

/** Full-screen color overlay (fades). */
function fade(alpha, col = '0,0,0') {
  if (alpha <= 0) return;
  ctx.fillStyle = `rgba(${col},${Math.min(1, alpha).toFixed(3)})`;
  ctx.fillRect(0, 0, W, H);
}

/** Slide horizontal bands of what is already on screen sideways, with RGB tints (digital glitch). */
function glitchBands(n, y0 = 0, y1 = H, maxOff = 8) {
  if (REDUCED) return;
  for (let k = 0; k < n; k++) {
    const y = Math.floor(rnd(y0, y1 - 6)),
      h = Math.floor(rnd(2, 7)),
      off = Math.round(rnd(-maxOff, maxOff));
    ctx.drawImage(cv, 0, y * 2, 640, h * 2, off, y, W, h);
    ctx.fillStyle = k % 2 ? 'rgba(255,0,180,.18)' : 'rgba(0,255,200,.15)';
    ctx.fillRect(0, y, W, h);
  }
}

/** Diagonal wipe in the style of 90s arcade screen changes. `p` 0 → 1 covers the screen, 1 → 2 uncovers it. */
function wipe(p, col = '#050812', accent = '#f8cd55') {
  if (p <= 0 || p >= 2) return;
  const cover = p <= 1,
    k = cover ? p : p - 1,
    slant = 60,
    edge = -slant + k * (W + slant * 2);
  ctx.fillStyle = col;
  ctx.beginPath();
  if (cover) {
    ctx.moveTo(-slant, 0);
    ctx.lineTo(edge + slant, 0);
    ctx.lineTo(edge, H);
    ctx.lineTo(-slant, H);
  } else {
    ctx.moveTo(edge + slant, 0);
    ctx.lineTo(W + slant, 0);
    ctx.lineTo(W + slant, H);
    ctx.lineTo(edge, H);
  }
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(edge + slant, 0);
  ctx.lineTo(edge + slant + 3, 0);
  ctx.lineTo(edge + 3, H);
  ctx.lineTo(edge, H);
  ctx.fill();
}

/** True during the "on" half of a blink cycle of `period` frames. */
const blink = (t, period = 32) => REDUCED || t % period < period / 2;

export { blink, chromaText, fade, frameBox, glitchBands, letterbox, plate, sparkle, wipe };
