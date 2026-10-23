/* Title logo, pre-rendered once, with the shine sweep. */
import { FONT } from '../config.js';
import { ctx, mk } from '../core/canvas.js';

/* ---------- logo ---------- */
let LOGO = null,
  LOGOTMP = null;
function buildLogo() {
  const c = mk(640, 200),
    g = c.getContext('2d');
  g.textAlign = 'center';
  g.textBaseline = 'top';
  const line = (text, y, size, fill, depth, band) => {
    g.font = size + 'px ' + FONT;
    for (let i = depth; i > 0; i--) {
      g.fillStyle = i >= depth - 1 ? '#120a1c' : i > depth / 2 ? '#3a0a2a' : '#7a1a3a';
      g.fillText(text, 320 + i, y + i);
    }
    g.fillStyle = '#120a1c';
    for (const [dx, dy] of [
      [-4, 0],
      [4, 0],
      [0, -4],
      [0, 4],
      [-3, -3],
      [3, 3],
      [-3, 3],
      [3, -3],
    ])
      g.fillText(text, 320 + dx, y + dy);
    const f = mk(640, 200),
      fg = f.getContext('2d');
    fg.textAlign = 'center';
    fg.textBaseline = 'top';
    fg.font = size + 'px ' + FONT;
    fg.fillStyle = fill;
    fg.fillText(text, 320, y);
    fg.globalCompositeOperation = 'source-atop';
    fg.fillStyle = 'rgba(255,255,255,.45)';
    fg.fillRect(0, y + 3, 640, band);
    fg.fillStyle = 'rgba(0,0,0,.18)';
    fg.fillRect(0, y + size * 0.62, 640, size * 0.4);
    for (let yy = y; yy < y + size; yy += 4) {
      fg.fillStyle = 'rgba(255,255,255,.06)';
      fg.fillRect(0, yy, 640, 1);
    }
    g.drawImage(f, 0, 0);
  };
  const gr = g.createLinearGradient(0, 14, 0, 66);
  gr.addColorStop(0, '#fff7b0');
  gr.addColorStop(0.35, '#ffd23a');
  gr.addColorStop(0.7, '#ff8a2a');
  gr.addColorStop(1, '#e8343f');
  line('BRAINROT', 12, 52, gr, 9, 7);
  const tri = g.createLinearGradient(70, 0, 570, 0);
  [
    ['#2fbf5a', 0],
    ['#2fbf5a', 0.33],
    ['#ffffff', 0.335],
    ['#ffffff', 0.66],
    ['#ff3a4a', 0.665],
    ['#ff3a4a', 1],
  ].forEach(([c, o]) => tri.addColorStop(o, c));
  line('BATTAGLIA', 84, 44, tri, 8, 6);
  const rb = [
    [176, 146],
    [470, 140],
    [464, 182],
    [170, 188],
  ];
  g.fillStyle = '#120a1c';
  g.beginPath();
  rb.forEach(([x, y], i) => (i ? g.lineTo(x + 4, y + 4) : g.moveTo(x + 4, y + 4)));
  g.fill();
  g.fillStyle = '#d8343f';
  g.beginPath();
  rb.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.fill();
  g.fillStyle = '#ff5a6a';
  g.fillRect(180, 147, 284, 4);
  g.font = '22px ' + FONT;
  g.fillStyle = '#120a1c';
  g.fillText('ULTRA CAOS', 322, 157);
  g.fillStyle = '#ffffff';
  g.fillText('ULTRA CAOS', 320, 155);
  for (const [x, s] of [
    [46, 1],
    [594, -1],
  ]) {
    g.fillStyle = '#120a1c';
    g.beginPath();
    [
      [0, 0],
      [18, 0],
      [8, 26],
      [22, 26],
      [-6, 70],
      [2, 36],
      [-12, 36],
    ].forEach(([a, b], i) => (i ? g.lineTo(x + a * s + 3, 30 + b + 3) : g.moveTo(x + a * s + 3, 30 + b + 3)));
    g.fill();
    g.fillStyle = '#ffd23a';
    g.beginPath();
    [
      [0, 0],
      [18, 0],
      [8, 26],
      [22, 26],
      [-6, 70],
      [2, 36],
      [-12, 36],
    ].forEach(([a, b], i) => (i ? g.lineTo(x + a * s, 30 + b) : g.moveTo(x + a * s, 30 + b)));
    g.fill();
  }
  LOGO = c;
  LOGOTMP = mk(640, 200);
}
function drawLogo(x, y, sc, t) {
  const w = 320 * sc,
    h = 100 * sc;
  ctx.drawImage(LOGO, Math.round(x - w / 2), Math.round(y), w, h);
  const k = t % 200;
  if (k < 40) {
    const g = LOGOTMP.getContext('2d');
    g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, 640, 200);
    g.drawImage(LOGO, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    const sx = -100 + k * 20;
    g.fillStyle = 'rgba(255,255,255,.55)';
    g.beginPath();
    g.moveTo(sx, 0);
    g.lineTo(sx + 40, 0);
    g.lineTo(sx - 20, 200);
    g.lineTo(sx - 60, 200);
    g.fill();
    ctx.drawImage(LOGOTMP, Math.round(x - w / 2), Math.round(y), w, h);
  }
}

export { buildLogo, drawLogo };
