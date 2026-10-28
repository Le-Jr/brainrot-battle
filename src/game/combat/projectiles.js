/* Projectile drawing for every special. */
import { projectileScale } from '../sprites/projectile-layout.js';
import { FLOOR } from '../config.js';
import { ctx, fe } from '../core/canvas.js';
import { drawProjectileArt } from '../sprites/projectile-art.js';

function drawProj(p, cam, tk) {
  const x = Math.round(p.x - cam),
    y = Math.round(p.y),
    s = projectileScale(p),
    d = p.dir || 1;
  if (drawProjectileArt(ctx, p, x, y, tk)) return;
  // Keep the procedural fallback as readable as the shipped sprites.
  const magnify =
    { wave: 3, bomb: 3.5, boom: 2, banana: 3.5, clock: 3, ring: 2.4, meteor: 3.2, quake: 3 }[p.type] || 1;
  const anchorY = p.type === 'quake' || p.type === 'boom' ? FLOOR : y;
  ctx.save();
  ctx.translate(x, anchorY);
  ctx.scale(magnify, magnify);
  ctx.translate(-x, -anchorY);
  switch (p.type) {
    case 'wave': {
      const rx = Math.round(6 * s),
        ry = Math.round(9 * s),
        wob = Math.round(Math.sin(tk / 3) * 1);
      fe(ctx, x, y + wob, rx + 1, ry + 1, '#1b1024');
      fe(ctx, x, y + wob, rx, ry, '#2f7ae0');
      fe(ctx, x + d * 2, y + wob - 1, rx - 1, ry - 2, '#5aa8ff');
      fe(ctx, x + d * 3, y + wob - 2, rx - 3, ry - 4, '#bfe6ff');
      ctx.fillStyle = '#ffffff';
      for (let i = -ry; i <= ry; i += 3) ctx.fillRect(x + d * (rx - 1) + ((i + tk) % 2), y + wob + i, 1, 2);
      ctx.fillStyle = 'rgba(120,200,255,.6)';
      for (let i = 0; i < 4; i++)
        ctx.fillRect(x - d * (rx + 3 + i * 4), y + wob - 4 + ((i * 5 + tk) % 9), 3, 1);
      break;
    }
    case 'bomb': {
      fe(ctx, x, y, 5, 4, '#1b1024');
      fe(ctx, x, y, 4, 3, '#3a3440');
      ctx.fillStyle = '#2fa04a';
      ctx.fillRect(x - 1, y - 3, 1, 7);
      ctx.fillStyle = '#f4f4f4';
      ctx.fillRect(x, y - 3, 1, 7);
      ctx.fillStyle = '#e03a3a';
      ctx.fillRect(x + 1, y - 3, 1, 7);
      ctx.fillStyle = (tk >> 1) & 1 ? '#ffd23a' : '#ff5a2a';
      ctx.fillRect(x - d * 5, y - 4, 2, 2);
      break;
    }
    case 'boom': {
      const r = Math.min(18, 6 + p.t * 2);
      fe(ctx, x, y, r, Math.round(r * 0.9), p.t < 6 ? '#ffffff' : '#ffb040');
      fe(ctx, x, y - 2, Math.round(r * 0.65), Math.round(r * 0.55), p.t < 6 ? '#fff7b0' : '#ff5a2a');
      if (p.t > 6) fe(ctx, x, y - 4, Math.round(r * 0.35), Math.round(r * 0.3), '#5a4a50');
      break;
    }
    case 'banana': {
      const k = Math.floor(tk / 3) % 4;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((k * Math.PI) / 2);
      ctx.scale(s, s);
      const B = [
        [-5, 1],
        [-4, 2],
        [-3, 3],
        [-2, 3],
        [-1, 3],
        [0, 3],
        [1, 3],
        [2, 2],
        [3, 1],
        [4, 0],
        [5, -1],
      ];
      for (const [a, b] of B) {
        ctx.fillStyle = '#1b1024';
        ctx.fillRect(a - 1, b - 2, 3, 4);
      }
      for (const [a, b] of B) {
        ctx.fillStyle = '#ffd23f';
        ctx.fillRect(a, b - 1, 1, 2);
        ctx.fillStyle = '#fff3a0';
        ctx.fillRect(a, b - 1, 1, 1);
      }
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(5, -2, 1, 1);
      ctx.fillRect(-6, 0, 1, 1);
      ctx.restore();
      break;
    }
    case 'clock': {
      const r = Math.round(6 * s);
      fe(ctx, x, y, r + 1, r + 1, '#1b1024');
      fe(ctx, x, y, r, r, '#e8c050');
      fe(ctx, x, y, r - 2, r - 2, '#fffbe8');
      ctx.fillStyle = '#1b1024';
      const a = tk * 0.3;
      for (let i = 0; i < r - 2; i++)
        ctx.fillRect(x + Math.round(Math.cos(a) * i), y + Math.round(Math.sin(a) * i), 1, 1);
      for (let i = 0; i < r - 3; i++)
        ctx.fillRect(x + Math.round(Math.cos(a / 12) * i), y + Math.round(Math.sin(a / 12) * i), 1, 1);
      ctx.fillStyle = 'rgba(160,220,255,.5)';
      for (let i = 1; i < 4; i++) ctx.fillRect(x - d * (r + i * 4), y - 1, 2, 2);
      break;
    }
    case 'ring': {
      const a = tk * 0.25;
      for (let k = 0; k < 40; k++) {
        const an = (k / 40) * Math.PI * 2,
          xx = x + Math.round(Math.cos(an) * 14),
          yy = y + Math.round(Math.sin(an) * 6);
        ctx.fillStyle = '#120a1c';
        ctx.fillRect(xx - 1, yy - 1, 3, 3);
      }
      for (let k = 0; k < 40; k++) {
        const an = (k / 40) * Math.PI * 2,
          xx = x + Math.round(Math.cos(an) * 14),
          yy = y + Math.round(Math.sin(an) * 6);
        ctx.fillStyle =
          Math.abs((((an - a) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) < 0.8
            ? '#ffffff'
            : k % 2
              ? '#ecdcb0'
              : '#c070ff';
        ctx.fillRect(xx, yy, 2, 1);
      }
      fe(ctx, x, y, 3, 3, '#e8b06a');
      break;
    }
    case 'meteor': {
      fe(ctx, x, y, 6, 6, '#120a1c');
      fe(ctx, x, y, 5, 5, '#8a5a4a');
      fe(ctx, x - 1, y - 1, 3, 3, '#c08a6a');
      ctx.fillStyle = (tk >> 1) & 1 ? '#ffd23a' : '#ff6a2a';
      ctx.fillRect(x - 3, y - 11, 6, 5);
      ctx.fillRect(x - 1, y - 15, 2, 4);
      break;
    }
    case 'quake': {
      const w = Math.round(p.w / 2);
      for (let i = -w; i <= w; i += 3) {
        const hh = Math.round(4 + Math.abs(Math.sin(i * 0.7 + tk * 0.6)) * 8 * s);
        ctx.fillStyle = '#1b1024';
        ctx.fillRect(x + i - 1, FLOOR - hh - 1, 4, hh + 1);
        ctx.fillStyle = i % 2 ? '#7a5a3a' : '#9a7a4a';
        ctx.fillRect(x + i, FLOOR - hh, 2, hh);
        ctx.fillStyle = '#6cc04a';
        ctx.fillRect(x + i, FLOOR - hh, 2, 1);
      }
      break;
    }
  }
  ctx.restore();
}

export { drawProj };
