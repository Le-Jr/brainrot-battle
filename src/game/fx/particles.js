/* Particles, floating popups and hit rings. */
import { FLOOR } from '../config.js';
import { ctx, txt } from '../core/canvas.js';
import { rnd } from '../core/math.js';

/* ============================== EFFECTS ============================== */
const FX = { parts: [], pops: [], rings: [] };
function spark(x, y, cols, n, spd, grav = 0.12) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2,
      s = rnd(spd * 0.3, spd);
    FX.parts.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 0.6,
      life: rnd(10, 22),
      c: cols[i % cols.length],
      s: Math.random() < 0.35 ? 2 : 1,
      g: grav,
    });
  }
}
function popup(x, y, text, col = '#ffe066', size = 8) {
  FX.pops.push({ x, y, text, col, life: 46, size });
}
function updFX() {
  for (const p of FX.parts) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.g;
    p.vx *= 0.96;
    p.life--;
    if (p.y > FLOOR + 2) {
      p.y = FLOOR + 2;
      p.vy *= -0.3;
    }
  }
  FX.parts = FX.parts.filter((p) => p.life > 0);
  for (const p of FX.pops) {
    p.y -= 0.45;
    p.life--;
  }
  FX.pops = FX.pops.filter((p) => p.life > 0);
  for (const r of FX.rings) r.t++;
  FX.rings = FX.rings.filter((r) => r.t < 10);
}
function drawFX(cam) {
  for (const r of FX.rings) {
    const L = 4 + r.t * 2.2,
      x = Math.round(r.x - cam),
      y = Math.round(r.y);
    ctx.fillStyle = r.t < 4 ? '#ffffff' : r.c;
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4 + 0.2,
        ex = Math.round(Math.cos(a) * L),
        ey = Math.round(Math.sin(a) * L);
      const l2 = L * 0.55;
      ctx.fillRect(x + Math.round(Math.cos(a) * l2), y + Math.round(Math.sin(a) * l2), 2, 2);
      ctx.fillRect(x + ex, y + ey, 1, 1);
    }
  }
  for (const p of FX.parts) {
    ctx.fillStyle = p.c;
    ctx.fillRect(Math.round(p.x - cam), Math.round(p.y), p.s, p.s);
  }
  for (const p of FX.pops) {
    const a = Math.min(1, p.life / 12);
    ctx.globalAlpha = a;
    txt(p.text, Math.round(p.x - cam), Math.round(p.y), p.size, p.col, 'center');
    ctx.globalAlpha = 1;
  }
}

export { FX, drawFX, popup, spark, updFX };
