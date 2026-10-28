/* Small UI widgets: the BYD parrot, speech bubbles and the XP bar. */
import { W } from '../config.js';
import { ctx, txt, wrapTxt } from '../core/canvas.js';
import { clamp } from '../core/math.js';
import { XP } from '../progression/xp.js';
import { drawBonusArt } from '../sprites/bonus-art.js';

function parrot(x, y, talk, t, startled = false) {
  const frame = startled ? 4 : talk ? [1, 2, 1, 0][(t >> 3) & 3] : t % 180 < 8 ? 3 : 0;
  if (drawBonusArt(ctx, 'parrot', frame, x + 10, y + 18, 0.5)) return;
  const B = (a, b, w, h, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(x + a, y + b, w, h);
  };
  B(-2, 14, 26, 3, '#5a3a20');
  B(-3, 13, 28, 1, '#7a5a30');
  B(3, -1, 11, 16, '#1b1024');
  B(4, 0, 9, 14, '#2fbf4a');
  B(4, 0, 9, 3, '#6ae070');
  B(9, 2, 4, 10, '#24983a');
  B(2, 10, 4, 8, '#1b1024');
  B(3, 10, 2, 7, '#e8343f');
  B(5, 12, 2, 6, '#3a7ad0');
  B(7, -8, 10, 9, '#1b1024');
  B(8, -7, 8, 7, '#3fd05a');
  B(8, -7, 8, 2, '#8af090');
  B(9, -5, 4, 3, '#f8cd55');
  B(13, -5, 2, 2, '#1b1024');
  B(13, -5, 1, 1, '#ffffff');
  const open = talk && (t >> 2) & 1;
  B(16, -5, 5, 3, '#1b1024');
  B(16, -4, 4, 1, '#f0e8d8');
  B(17, -2 + (open ? 2 : 0), 3, 2, '#1b1024');
  B(17, -2 + (open ? 2 : 0), 2, 1, '#d8d0c0');
  B(6, 14, 2, 2, '#e8a040');
  B(11, 14, 2, 2, '#e8a040');
}
/** A straight branch stand: the bird's perch sits on a fork, with a stable foot. */
function parrotCane(x, top, bottom) {
  ctx.save();
  // Small grounded shadow and a broad, low wooden base.
  ctx.fillStyle = 'rgba(10,18,15,.28)';
  ctx.beginPath();
  ctx.ellipse(x + 1, bottom + 1, 10, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  const stroke = (color, width) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 8, bottom);
    ctx.lineTo(x, bottom - 4);
    ctx.lineTo(x + 8, bottom);
    ctx.moveTo(x, bottom - 3);
    ctx.lineTo(x, top + 8);
    ctx.lineTo(x - 5, top);
    ctx.moveTo(x, top + 8);
    ctx.lineTo(x + 6, top);
    ctx.stroke();
  };
  stroke('#29251b', 3.5);
  stroke('#785639', 2);
  ctx.strokeStyle = '#b18a55';
  ctx.lineWidth = 0.65;
  ctx.beginPath();
  ctx.moveTo(x - 0.5, bottom - 5);
  ctx.lineTo(x - 0.5, top + 9);
  ctx.stroke();
  // A short twine binding where the branch forks under the existing perch.
  ctx.fillStyle = '#bcaa78';
  for (let i = 0; i < 3; i++) ctx.fillRect(x - 1.7, top + 7 + i * 1.4, 3.4, 0.65);
  ctx.restore();
}

function bubble(x, y, text, side = 1, col = '#ffffff', compact = false) {
  const size = compact ? 5 : 8,
    lineHeight = compact ? 7 : 10;
  const lines = wrapTxt(text, compact ? 16 : 18),
    w = Math.max(...lines.map((l) => l.length)) * size + (compact ? 14 : 10),
    h = lines.length * lineHeight + (compact ? 12 : 8);
  let bx = Math.round(clamp(x - (side > 0 ? 10 : w - 10), 4, W - w - 4)),
    by = Math.round(y - h - 8);
  by = Math.max(24, by);
  if (compact) {
    const tail = Math.round(clamp(x, bx + 8, bx + w - 8));
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath();
    ctx.roundRect(bx + 2, by + 3, w, h, 5);
    ctx.fill();
    ctx.fillStyle = '#fff8de';
    ctx.strokeStyle = '#527b3c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, 5);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tail - 3, by + h - 0.5);
    ctx.lineTo(tail, by + h + 5);
    ctx.lineTo(tail + 4, by + h - 0.5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff8de';
    ctx.fillRect(tail - 2, by + h - 1, 5, 2);
    ctx.fillStyle = '#a1bd66';
    ctx.fillRect(bx + 7, by + 5, 12, 1);
    lines.forEach((l, i) => txt(l, bx + 7, by + 8 + i * lineHeight, size, '#263d26', 'left', null));
    ctx.restore();
    return;
  }
  ctx.fillStyle = '#080e20';
  ctx.fillRect(bx - 1, by - 1, w + 2, h + 2);
  ctx.fillStyle = col;
  ctx.fillRect(bx, by, w, h);
  ctx.fillStyle = '#080e20';
  ctx.fillRect(Math.round(x) - 2, by + h, 5, 3);
  ctx.fillStyle = col;
  ctx.fillRect(Math.round(x) - 1, by + h, 3, 2);
  ctx.fillRect(Math.round(x), by + h + 2, 1, 2);
  lines.forEach((l, i) => txt(l, bx + 5, by + 5 + i * 10, 8, '#080e20', 'left', null));
}
function xpBar(id, x, y, w) {
  const l = XP.lvl(id),
    p = XP.prog(id);
  txt('NV' + l, x, y, 6, '#f8cd55');
  const bx = x + (l >= 10 ? 30 : 24);
  ctx.fillStyle = '#080e20';
  ctx.fillRect(bx - 1, y, w + 2, 8);
  ctx.fillStyle = '#203455';
  ctx.fillRect(bx, y + 1, w, 6);
  ctx.fillStyle = '#7aff9a';
  ctx.fillRect(bx, y + 1, Math.round(w * p), 6);
  ctx.fillStyle = 'rgba(255,255,255,.45)';
  ctx.fillRect(bx, y + 1, Math.round(w * p), 1);
}

export { bubble, parrot, parrotCane, xpBar };
