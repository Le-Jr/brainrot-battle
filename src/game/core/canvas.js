/* Main canvas binding plus low-level drawing helpers (offscreen canvases, rects, pixel ellipses, outlined text). */
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
function txt(s, x, y, size = 8, col = '#ffffff', align = 'left', ol = '#120a1c') {
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
  ctx.fillStyle = col;
  ctx.fillText(s, x, y);
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
