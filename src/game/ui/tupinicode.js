/* Tupinicode studio card: a jungle at night with an old CRT computer wrapped in vines, fireflies and a glitchy logo. */
import { FONT } from '../config.js';
import { ctx, mk } from '../core/canvas.js';
import { HDC, glow, leafBlob, lg, quant, rr, setSeed } from '../stages/toolkit.js';
import { chromaText } from './arcade.js';

/** Screen of the CRT, in HD (2x) pixels. */
const SCREEN = { x: 226, y: 62, w: 188, h: 130 };
let ART = null;

/* ---------- painting helpers (HD canvas space) ---------- */
const bez = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
};

/** Thick hanging vine (cubic Bézier) with a highlight and small leaves along it. */
function vine(g, p0, p1, p2, p3, w, col, hi, leaves) {
  g.lineCap = 'round';
  g.strokeStyle = col;
  g.lineWidth = w;
  g.beginPath();
  g.moveTo(...p0);
  g.bezierCurveTo(...p1, ...p2, ...p3);
  g.stroke();
  g.strokeStyle = hi;
  g.lineWidth = Math.max(1, w * 0.3);
  g.beginPath();
  g.moveTo(p0[0] - w * 0.25, p0[1]);
  g.bezierCurveTo(p1[0] - w * 0.25, p1[1], p2[0] - w * 0.25, p2[1], p3[0] - w * 0.25, p3[1]);
  g.stroke();
  if (!leaves) return;
  for (let t = 0.08; t < 1; t += 0.07 + rr() * 0.06) {
    const [x, y] = bez(p0, p1, p2, p3, t),
      s = rr() < 0.5 ? -1 : 1;
    g.fillStyle = leaves[(rr() * leaves.length) | 0];
    g.beginPath();
    g.ellipse(x + s * 5, y + 2, 6, 3, s * 0.7, 0, 7);
    g.fill();
  }
}

/** Big tropical leaf: a drooping midrib with leaflets on both sides (dark under side, lit upper side). */
function leaf(g, x, y, ang, len, wid, dark, lit, rib) {
  const pts = [];
  for (let s = 0; s <= len; s += 3) {
    const k = s / len;
    pts.push([x + Math.cos(ang) * s, y + Math.sin(ang) * s + k * k * len * 0.32]);
  }
  for (let i = 2; i < pts.length - 1; i++) {
    const k = i / pts.length,
      [px, py] = pts[i],
      [nx, ny] = pts[i + 1],
      a = Math.atan2(ny - py, nx - px),
      L = wid * Math.sin(k * Math.PI) * (0.75 + rr() * 0.35);
    for (const side of [-1, 1]) {
      const da = a + side * 1.05 + 0.25,
        tx = px + Math.cos(da) * L,
        ty = py + Math.sin(da) * L + L * 0.25;
      g.fillStyle = side < 0 ? lit : dark;
      g.beginPath();
      g.moveTo(px - Math.cos(a) * 2, py - Math.sin(a) * 2);
      g.lineTo(tx, ty);
      g.lineTo(px + Math.cos(a) * 3, py + Math.sin(a) * 3);
      g.fill();
    }
  }
  g.strokeStyle = rib;
  g.lineWidth = 2;
  g.beginPath();
  pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
  g.stroke();
}

/** Mossy boulder. */
function rock(g, x, y, rx, ry) {
  g.fillStyle = lg(g, x - rx, y - ry, x + rx, y + ry, ['#56604f', '#3b4337', '#1d231b']);
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, 7);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,.08)';
  g.beginPath();
  g.ellipse(x - rx * 0.3, y - ry * 0.45, rx * 0.4, ry * 0.2, -0.3, 0, 7);
  g.fill();
  leafBlob(g, x - rx * 0.1, y - ry * 0.75, rx * 0.7, ['#2f6b2a', '#3f8a35', '#6cbf45'], 26);
}

/** The old computer: CRT case, bezel, dark screen, vents, neck and base. */
function computer(g) {
  const cx = 320;
  g.fillStyle = 'rgba(0,0,0,.55)';
  g.beginPath();
  g.ellipse(cx, 256, 170, 16, 0, 0, 7);
  g.fill();
  // CRT back bulge (seen above the case)
  g.fillStyle = lg(g, 0, 28, 0, 60, ['#6d7264', '#555a4d']);
  g.fillRect(236, 28, 168, 14);
  // case
  g.fillStyle = lg(g, 196, 0, 444, 0, ['#b3b6a4', '#9a9e8b', '#7f8473']);
  g.fillRect(196, 36, 248, 190);
  g.fillStyle = '#cfd1c0';
  g.fillRect(196, 36, 248, 3);
  g.fillRect(196, 36, 3, 190);
  g.fillStyle = '#5c604f';
  g.fillRect(441, 39, 3, 187);
  g.fillRect(196, 223, 248, 3);
  // bezel
  g.fillStyle = lg(g, 0, 50, 0, 206, ['#4a4f43', '#5e6355', '#43473c']);
  g.fillRect(212, 50, 216, 156);
  g.fillStyle = '#2a2e25';
  g.fillRect(212, 50, 216, 3);
  g.fillRect(212, 50, 3, 156);
  // screen (off state; the lit content is drawn every frame)
  g.fillStyle = '#081109';
  g.fillRect(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h);
  // vents, brand plate and power button
  g.fillStyle = '#6b6f60';
  for (let i = 0; i < 6; i++) g.fillRect(214 + i * 9, 212, 5, 6);
  g.fillStyle = '#8a8e7c';
  g.fillRect(392, 211, 26, 9);
  g.fillStyle = '#3d4136';
  g.fillRect(394, 213, 22, 5);
  // neck and base
  g.fillStyle = lg(g, 286, 0, 354, 0, ['#9fa290', '#7d8171']);
  g.fillRect(286, 226, 68, 12);
  g.fillStyle = lg(g, 0, 238, 0, 252, ['#a9ac9a', '#6f7364']);
  g.fillRect(244, 238, 152, 14);
  g.fillStyle = '#c9cbb9';
  g.fillRect(244, 238, 152, 2);
}

/** Paint the static layers once (background with the computer, foreground plants) and quantize them. */
function buildTupinicodeArt() {
  if (ART) return ART;
  setSeed(777);
  const bg = mk(640, 360),
    fg = mk(640, 360);
  let g = bg.getContext('2d');
  g.fillStyle = lg(g, 0, 0, 0, 360, ['#020906', '#05150c', '#0a2414', '#071a0e', '#030b06']);
  g.fillRect(0, 0, 640, 360);
  glow(g, 320, 140, 280, '#1f7a3e', 0.5);
  // three depths of jungle canopy
  for (const [n, cols, r0] of [
    [60, ['#030d07', '#05140b', '#082011'], 34],
    [50, ['#061a0e', '#0a2817', '#103a20'], 26],
    [36, ['#0a2614', '#10391f', '#185230'], 20],
  ])
    for (let i = 0; i < n; i++) {
      const x = rr() * 640,
        y = rr() * 360;
      if (Math.abs(x - 320) < 150 && y > 20 && y < 250) continue;
      leafBlob(g, x, y, r0 + rr() * r0, cols, 30);
    }
  // dark trunks at the sides
  for (const [x, w] of [
    [40, 34],
    [596, 30],
  ]) {
    g.fillStyle = lg(g, x - w / 2, 0, x + w / 2, 0, ['#0c140c', '#1a2617', '#0a110a']);
    g.fillRect(x - w / 2, 0, w, 360);
  }
  // vines hanging behind the computer
  for (let i = 0; i < 9; i++) {
    const x = 120 + rr() * 400,
      len = 80 + rr() * 200;
    vine(
      g,
      [x, -10],
      [x + rr() * 40 - 20, len * 0.4],
      [x + rr() * 60 - 30, len * 0.7],
      [x + rr() * 30 - 15, len],
      3 + rr() * 2,
      '#14281a',
      '#1f3d24',
      ['#16401f', '#1c5228'],
    );
  }
  computer(g);
  // ground and roots spreading from the base
  g.fillStyle = lg(g, 0, 248, 0, 360, ['rgba(6,20,10,0)', '#06140a', '#030a05']);
  g.fillRect(0, 248, 640, 112);
  for (let i = 0; i < 10; i++) {
    const s = i % 2 ? 1 : -1,
      x0 = 300 + rr() * 40;
    vine(
      g,
      [x0, 252],
      [x0 + s * (40 + rr() * 40), 262 + rr() * 10],
      [x0 + s * (90 + rr() * 80), 250 + rr() * 30],
      [x0 + s * (150 + rr() * 120), 268 + rr() * 40],
      4 + rr() * 3,
      '#3a2a18',
      '#5a4226',
      null,
    );
  }
  quant(bg, 16, false);

  g = fg.getContext('2d');
  // vines draped over the case
  vine(g, [250, -10], [230, 40], [190, 70], [206, 140], 5, '#2a3a1c', '#4a6630', ['#2f6b2a', '#3f8a35']);
  vine(g, [206, 140], [214, 190], [250, 200], [262, 250], 4, '#3a2a18', '#5a4226', ['#2f6b2a']);
  vine(g, [410, -10], [430, 30], [470, 60], [440, 110], 5, '#2a3a1c', '#4a6630', ['#2f6b2a', '#3f8a35']);
  vine(g, [440, 110], [420, 150], [452, 180], [436, 236], 4, '#3a2a18', '#5a4226', ['#3f8a35']);
  vine(g, [300, -10], [290, 20], [350, 30], [370, 36], 4, '#2a3a1c', '#4a6630', ['#2f6b2a']);
  // rocks and ferns at the bottom
  rock(g, 520, 300, 56, 34);
  rock(g, 110, 312, 48, 28);
  rock(g, 590, 330, 40, 26);
  for (let i = 0; i < 16; i++) {
    const x = (i / 15) * 680 - 20,
      dark = i % 2 ? '#0f3a18' : '#145020';
    leaf(g, x, 372, -Math.PI / 2 + (rr() - 0.5) * 1.4, 70 + rr() * 50, 16, dark, '#2a7a34', '#0b2a12');
  }
  // big palm leaves framing the scene
  leaf(g, -20, 10, 0.35, 230, 34, '#0e3a1a', '#1f6b2e', '#0a2612');
  leaf(g, -10, 120, 0.1, 160, 28, '#0d3318', '#1a5e28', '#0a2612');
  leaf(g, 660, 0, Math.PI - 0.35, 230, 34, '#0e3a1a', '#1f6b2e', '#0a2612');
  leaf(g, 650, 130, Math.PI - 0.1, 160, 28, '#0d3318', '#1a5e28', '#0a2612');
  leaf(g, 150, -20, 1.2, 120, 22, '#0c3016', '#195a26', '#0a2612');
  leaf(g, 500, -20, Math.PI - 1.2, 120, 22, '#0c3016', '#195a26', '#0a2612');
  quant(fg, 14);

  const flies = [];
  for (let i = 0; i < 26; i++)
    flies.push({
      x: rr() * 320,
      y: 10 + rr() * 150,
      ph: rr() * 6.28,
      sp: 0.01 + rr() * 0.02,
      front: i % 3 === 0,
    });
  ART = { bg, fg, flies };
  return ART;
}

/* ---------- per-frame drawing (logical 320x180 space) ---------- */

/** Glowing fireflies; `front` picks the layer drawn over the plants. */
function drawFireflies(t, front) {
  for (const f of ART.flies) {
    if (f.front !== front) continue;
    const x = Math.round(f.x + Math.sin(t * f.sp + f.ph) * 14),
      y = Math.round(f.y + Math.cos(t * f.sp * 1.3 + f.ph) * 9),
      b = 0.5 + 0.5 * Math.sin(t * 0.07 + f.ph * 3);
    if (b < 0.15) continue;
    ctx.fillStyle = `rgba(170,255,80,${(0.16 * b).toFixed(3)})`;
    ctx.fillRect(x - 2, y - 1, 5, 3);
    ctx.fillRect(x - 1, y - 2, 3, 5);
    ctx.fillStyle = b > 0.6 ? '#f4ff9a' : '#b8ff5a';
    ctx.fillRect(x, y, 1, 1);
  }
}

/**
 * Draw the whole card. `screen(c, x, y, w, h)` paints the CRT contents in HD pixels; `power` (0..1) runs the
 * CRT turn-on effect; `glowK` scales the green light the screen throws on the jungle.
 */
function drawTupinicode(t, { power = 1, screen, glowK = 1 }) {
  const A = buildTupinicodeArt();
  ctx.drawImage(A.bg, 0, 0, 320, 180);
  drawFireflies(t, false);
  HDC(ctx, (c) => {
    const { x, y, w, h } = SCREEN;
    if (power <= 0) return;
    if (power < 1) {
      // CRT turn-on: a bright line opens horizontally, then vertically
      const k = power < 0.5 ? power / 0.5 : 1,
        v = power < 0.5 ? 0 : (power - 0.5) / 0.5,
        lw = w * k,
        lh = Math.max(2, h * v);
      c.fillStyle = v > 0 ? `rgba(120,255,150,${(1 - v * 0.6).toFixed(2)})` : '#d8ffe0';
      c.fillRect(x + (w - lw) / 2, y + (h - lh) / 2, lw, lh);
      return;
    }
    c.save();
    c.beginPath();
    c.rect(x, y, w, h);
    c.clip();
    c.fillStyle = lg(c, 0, y, 0, y + h, ['#06301a', '#04220f', '#031a0b']);
    c.fillRect(x, y, w, h);
    if (screen) screen(c, x, y, w, h);
    c.fillStyle = 'rgba(0,0,0,.28)';
    for (let yy = y; yy < y + h; yy += 4) c.fillRect(x, yy, w, 2);
    c.fillStyle = `rgba(160,255,180,${(0.03 + Math.sin(t * 0.3) * 0.015).toFixed(3)})`;
    c.fillRect(x, y, w, h);
    c.restore();
    // glowing border and the light thrown on the jungle
    c.save();
    c.shadowColor = '#2dff6a';
    c.shadowBlur = 16;
    c.strokeStyle = '#3dff7a';
    c.lineWidth = 3;
    c.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
    c.restore();
    const gr = c.createRadialGradient(x + w / 2, y + h / 2, 40, x + w / 2, y + h / 2, 260);
    gr.addColorStop(0, `rgba(60,255,120,${(0.1 * glowK).toFixed(3)})`);
    gr.addColorStop(1, 'rgba(60,255,120,0)');
    c.fillStyle = gr;
    c.fillRect(0, 0, 640, 360);
  });
  // power LED
  ctx.fillStyle = power >= 1 ? (t % 90 < 80 ? '#5dff7a' : '#1a5a2a') : '#1a2a1a';
  ctx.fillRect(203, 107, 2, 1);
  ctx.drawImage(A.fg, 0, 0, 320, 180);
  drawFireflies(t, true);
}

/** Write a line on the CRT (HD pixels, 16px pixel font = 8 logical px) with phosphor glow. */
function screenLine(c, s, x, y, col = '#62ff8e', size = 16) {
  c.save();
  c.font = size + 'px ' + FONT;
  c.textBaseline = 'top';
  c.textAlign = 'left';
  c.shadowColor = '#2dff6a';
  c.shadowBlur = 8;
  c.fillStyle = col;
  c.fillText(s, x, y);
  c.restore();
}

/** CRT window chrome: title bar with three buttons. */
function screenWindow(c, x, y, w, title) {
  c.fillStyle = '#1d7a3a';
  c.fillRect(x + 8, y + 8, w - 16, 12);
  c.fillStyle = '#0a3a18';
  for (let i = 0; i < 3; i++) c.fillRect(x + 12 + i * 8, y + 11, 5, 6);
  if (title) screenLine(c, title, x + 40, y + 10, '#c8ffd4', 8);
}

/** The big studio logo under the computer: chromatic fringe, side dashes and an optional slam scale. */
function drawStudioLogo(y, scale = 1, col = '#6dff6a') {
  ctx.save();
  ctx.translate(160, y + 12);
  ctx.scale(scale, scale);
  for (const s of [-1, 1]) {
    ctx.fillStyle = '#ff3ad0';
    ctx.fillRect(s < 0 ? -139 : 127, -1, 12, 2);
    ctx.fillStyle = col;
    ctx.fillRect(s < 0 ? -138 : 128, -2, 10, 2);
  }
  chromaText('TUPINICODE', 0, -12, 24, col, 'center', 1);
  ctx.restore();
}

export { SCREEN, buildTupinicodeArt, drawStudioLogo, drawTupinicode, screenLine, screenWindow };
