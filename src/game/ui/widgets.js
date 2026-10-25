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
  B(9, -5, 4, 3, '#ffd23a');
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
function bubble(x, y, text, side = 1, col = '#ffffff') {
  const lines = wrapTxt(text, 18),
    w = Math.max(...lines.map((l) => l.length)) * 8 + 10,
    h = lines.length * 10 + 8;
  let bx = Math.round(clamp(x - (side > 0 ? 10 : w - 10), 4, W - w - 4)),
    by = Math.round(y - h - 8);
  by = Math.max(24, by);
  ctx.fillStyle = '#120a1c';
  ctx.fillRect(bx - 1, by - 1, w + 2, h + 2);
  ctx.fillStyle = col;
  ctx.fillRect(bx, by, w, h);
  ctx.fillStyle = '#120a1c';
  ctx.fillRect(Math.round(x) - 2, by + h, 5, 3);
  ctx.fillStyle = col;
  ctx.fillRect(Math.round(x) - 1, by + h, 3, 2);
  ctx.fillRect(Math.round(x), by + h + 2, 1, 2);
  lines.forEach((l, i) => txt(l, bx + 5, by + 5 + i * 10, 8, '#120a1c', 'left', null));
}
function xpBar(id, x, y, w) {
  const l = XP.lvl(id),
    p = XP.prog(id);
  txt('NV' + l, x, y, 8, '#ffd23a');
  const bx = x + (l >= 10 ? 36 : 28);
  ctx.fillStyle = '#120a1c';
  ctx.fillRect(bx - 1, y, w + 2, 8);
  ctx.fillStyle = '#2a1838';
  ctx.fillRect(bx, y + 1, w, 6);
  ctx.fillStyle = '#7aff9a';
  ctx.fillRect(bx, y + 1, Math.round(w * p), 6);
  ctx.fillStyle = 'rgba(255,255,255,.45)';
  ctx.fillRect(bx, y + 1, Math.round(w * p), 1);
}

export { bubble, parrot, xpBar };
