/* Main canvas binding plus low-level drawing helpers (offscreen canvases, rects, pixel ellipses, outlined text). */
import { pixelText } from './pixel-font.js';
import { FONT } from '../config.js';

/** Main 640x360 canvas and its context, bound once by initCanvas(). */
let cv = null,
  ctx = null;
function initCanvas(canvas) {
  cv = canvas;
  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return ctx;
}
function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}
function R(g, x, y, w, h, c) {
  g.fillStyle = c;
  g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
function fe(g, cx, cy, rx, ry, c) {
  g.fillStyle = c;
  cx = Math.round(cx);
  cy = Math.round(cy);
  for (let y = -ry; y <= ry; y++) {
    const k = 1 - (y / (ry + 0.5)) ** 2;
    if (k < 0) continue;
    const hw = Math.floor((rx + 0.5) * Math.sqrt(k));
    g.fillRect(cx - hw, cy + y, hw * 2 + 1, 1);
  }
}
/*
 * Press Start 2P has no uppercase accented letters (MÚSICA came out as "MúSICA"). Those are drawn as the base
 * letter plus a pixel-art accent; the font is monospaced (advance = 1em), so every glyph cell is `size` wide.
 * Accent rectangles are in font units (size / 8), relative to the top-left of the glyph cell.
 */
const ACCENTS = {
  Á: ['A', 'acute'],
  À: ['A', 'grave'],
  Â: ['A', 'circ'],
  Ã: ['A', 'tilde'],
  É: ['E', 'acute'],
  È: ['E', 'grave'],
  Ê: ['E', 'circ'],
  Í: ['I', 'acute'],
  Ì: ['I', 'grave'],
  Ó: ['O', 'acute'],
  Ò: ['O', 'grave'],
  Ô: ['O', 'circ'],
  Õ: ['O', 'tilde'],
  Ú: ['U', 'acute'],
  Ù: ['U', 'grave'],
};
const MARKS = {
  acute: [
    [4, -3, 2, 1],
    [3, -2, 2, 1],
  ],
  grave: [
    [1, -3, 2, 1],
    [2, -2, 2, 1],
  ],
  circ: [
    [3, -3, 1, 1],
    [2, -2, 1, 1],
    [4, -2, 1, 1],
  ],
  tilde: [
    [2, -3, 2, 1],
    [5, -3, 1, 1],
    [1, -2, 1, 1],
    [4, -2, 2, 1],
  ],
};
/** Split uppercase accented letters into base letters plus accent marks (null when there are none). */
function splitAccents(s) {
  if (!/[À-Ý]/.test(s)) return null;
  const marks = [];
  const plain = Array.from(s, (c, i) => {
    const a = ACCENTS[c];
    if (!a) return c;
    marks.push([i, a[1]]);
    return a[0];
  }).join('');
  return marks.length ? { plain, marks } : null;
}
function drawMarks(marks, n, x, y, size, align, col, o) {
  const u = size / 8,
    x0 = align === 'center' ? x - (n * size) / 2 : align === 'right' ? x - n * size : x;
  ctx.fillStyle = col;
  for (const [i, type] of marks)
    for (const [mx, my, mw, mh] of MARKS[type])
      ctx.fillRect(x0 + i * size + mx * u - o, y + my * u - o, mw * u + o * 2, mh * u + o * 2);
}

function txt(s, x, y, size = 8, col = '#ffffff', align = 'left', ol = '#120a1c') {
  if (size <= 7 && typeof col === 'string') {
    pixelText(ctx, s, Math.round(x), Math.round(y), size, col, align, ol);
    return;
  }
  const acc = splitAccents(s);
  if (acc) s = acc.plain;
  ctx.font = size + 'px ' + FONT;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  x = Math.round(x);
  y = Math.round(y);
  if (ol) {
    ctx.fillStyle = ol;
    const o = size >= 16 ? 2 : 1;
    for (const [dx, dy] of [
      [-o, 0],
      [o, 0],
      [0, -o],
      [0, o],
      [o, o],
      [-o, o],
      [o, -o],
      [-o, -o],
    ])
      ctx.fillText(s, x + dx, y + dy);
    if (size >= 16) {
      ctx.fillText(s, x + o + 1, y + o + 1);
    }
  }
  if (acc && ol) drawMarks(acc.marks, s.length, x, y, size, align, ol, size >= 16 ? 2 : 1);
  ctx.fillStyle = col;
  ctx.fillText(s, x, y);
  if (acc) drawMarks(acc.marks, s.length, x, y, size, align, col, 0);
}
function vgrad(y, h, stops) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  return g;
}
function wrapTxt(s, n) {
  const out = [];
  let line = '';
  for (const w of s.split(' ')) {
    if (line && (line + w).length > n) {
      out.push(line.trimEnd());
      line = '';
    }
    line += w + ' ';
  }
  if (line.trim()) out.push(line.trimEnd());
  return out;
}
const wrap = wrapTxt;

export { R, ctx, cv, fe, initCanvas, mk, txt, vgrad, wrap, wrapTxt };
