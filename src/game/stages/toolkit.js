/* Stage painting toolkit: 2x layers, seeded RNG, gradients, glows, foliage, buildings and pixel quantization. */
import { mk } from '../core/canvas.js';
import { BAYER, rgba, shade } from '../core/color.js';
import { hsh, vn } from '../core/math.js';

/* ============================== HD STAGES (painted at 2x, quantized to a pixel-art grid) ============================== */
const FW = 960,
  FARW = 736,
  MIDW = 832,
  GY = 272,
  SH2 = 360;
/** Seeded RNG: each stage builder calls setSeed() first, so every stage paints identically on every load. */
let SEED = 1;
const rr = () => hsh(SEED++ * 1.371 + 0.5);
const setSeed = (s) => {
  SEED = s;
};
function lg(g, x0, y0, x1, y1, stops) {
  const gr = g.createLinearGradient(x0, y0, x1, y1);
  stops.forEach((c, i) =>
    Array.isArray(c) ? gr.addColorStop(c[1], c[0]) : gr.addColorStop(i / (stops.length - 1), c),
  );
  return gr;
}
function glow(g, x, y, r, col, a = 1) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, rgba(col, a));
  gr.addColorStop(0.45, rgba(col, a * 0.35));
  gr.addColorStop(1, rgba(col, 0));
  g.fillStyle = gr;
  g.fillRect(x - r, y - r, r * 2, r * 2);
}
function fbm(x, s = 0) {
  return vn(x + s) * 0.55 + vn(x * 2.1 + s * 3.1) * 0.28 + vn(x * 4.3 + s * 7.7) * 0.17;
}
function quant(c, L = 14, cut = true) {
  const g = c.getContext('2d'),
    id = g.getImageData(0, 0, c.width, c.height),
    d = id.data,
    w = c.width;
  for (let i = 0; i < d.length; i += 4) {
    const p = i >> 2,
      x = p % w,
      y = (p / w) | 0,
      b = (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16 - 0.5;
    for (let k = 0; k < 3; k++) {
      const v = (d[i + k] / 255) * (L - 1) + b * 0.85;
      d[i + k] = Math.max(0, Math.min(255, (Math.round(v) / (L - 1)) * 255));
    }
    if (cut) d[i + 3] = d[i + 3] > 110 ? 255 : 0;
  }
  g.putImageData(id, 0, 0);
  return c;
}
function speck(g, x, y, w, h, n, cols, sz = 1) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = cols[i % cols.length];
    g.fillRect(Math.round(x + rr() * w), Math.round(y + rr() * h), sz, sz);
  }
}
function ridge(g, w, base, amp, sc, seed, top, bot, rim, snow) {
  const yy = (x) => base - fbm(x / sc, seed) * amp;
  g.beginPath();
  g.moveTo(0, SH2);
  for (let x = 0; x <= w; x += 2) g.lineTo(x, yy(x));
  g.lineTo(w, SH2);
  g.closePath();
  g.fillStyle = lg(g, 0, base - amp, 0, base + 40, [top, bot]);
  g.fill();
  if (snow) {
    g.fillStyle = snow;
    for (let x = 0; x <= w; x += 2) {
      const y = yy(x);
      if (y < base - amp * 0.62) {
        g.fillRect(x, y, 2, Math.max(2, (base - amp * 0.62 - y) * 0.8));
      }
    }
  }
  if (rim) {
    g.fillStyle = rim;
    for (let x = 0; x <= w; x += 2) {
      const y = yy(x),
        y2 = yy(x + 2);
      if (y2 < y + 1) g.fillRect(x, y, 2, 2);
    }
  }
}
function cloud(g, x, y, r, cols) {
  const P = [];
  for (let i = 0; i < 9; i++)
    P.push([
      x + (i - 4) * r * 0.42 + (rr() - 0.5) * r * 0.3,
      y + Math.abs(i - 4) * r * 0.07 + (rr() - 0.5) * r * 0.2,
      r * (0.55 + rr() * 0.5) * (1 - Math.abs(i - 4) * 0.07),
    ]);
  const C = (dy, k, col) => {
    g.fillStyle = col;
    for (const [a, b, c] of P) {
      g.beginPath();
      g.arc(a, b + dy, c * k, 0, 7);
      g.fill();
    }
  };
  C(r * 0.16, 1, cols[0]);
  C(0, 0.94, cols[1]);
  C(-r * 0.14, 0.7, cols[2]);
  if (cols[3]) C(-r * 0.26, 0.38, cols[3]);
}
function frond(g, x, y, ang, len, c1, c2) {
  for (let s = 0; s < len; s += 2) {
    const k = s / len,
      a = ang + k * k * 0.9 * (Math.cos(ang) > 0 ? 1 : -1) * 0.6,
      px_ = x + Math.cos(ang) * s,
      py = y + Math.sin(ang) * s + k * k * len * 0.45;
    const L = (1 - k) * len * 0.28 + 3;
    g.strokeStyle = k < 0.5 ? c1 : c2;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(px_, py);
    g.lineTo(px_ + Math.cos(a + 1.4) * L, py + Math.sin(a + 1.4) * L + L * 0.5);
    g.moveTo(px_, py);
    g.lineTo(px_ + Math.cos(a - 1.4) * L, py + Math.sin(a - 1.4) * L + L * 0.5);
    g.stroke();
  }
  g.strokeStyle = c2;
  g.lineWidth = 2;
  g.beginPath();
  for (let s = 0; s < len; s += 2) {
    const k = s / len;
    g.lineTo(x + Math.cos(ang) * s, y + Math.sin(ang) * s + k * k * len * 0.45);
  }
  g.stroke();
}
function palmHD(g, x, base, h, lean, trunk, leaf, leaf2) {
  let cx = x,
    cy = base;
  for (let i = 0; i < h; i += 4) {
    const k = i / h;
    cx = x + lean * k * k * 40;
    cy = base - i;
    g.fillStyle = (i / 4) % 2 ? trunk[0] : trunk[1];
    g.fillRect(cx - 5 + k * 2, cy - 4, 10 - k * 3, 5);
    g.fillStyle = trunk[2];
    g.fillRect(cx + 3 - k, cy - 4, 2, 4);
  }
  for (let i = 0; i < 9; i++)
    frond(g, cx, cy, -Math.PI / 2 + (i - 4) * 0.42 + (rr() - 0.5) * 0.2, 50 + rr() * 26, leaf, leaf2);
  g.fillStyle = '#3a2418';
  for (const [a, b] of [
    [-5, 4],
    [3, 6],
    [-1, 9],
  ]) {
    g.beginPath();
    g.arc(cx + a, cy + b, 4, 0, 7);
    g.fill();
  }
}
function leafBlob(g, x, y, r, cols, n = 60) {
  for (let i = 0; i < n; i++) {
    const a = rr() * 6.28,
      d = Math.sqrt(rr()) * r,
      px_ = x + Math.cos(a) * d,
      py = y + Math.sin(a) * d * 0.8,
      lit = (py - y) / r < -0.1 && (px_ - x) / r < 0.3;
    g.fillStyle = cols[lit ? 2 : py > y + r * 0.3 ? 0 : 1];
    g.beginPath();
    g.ellipse(px_, py, 5 + rr() * 5, 3 + rr() * 3, rr() * 3, 0, 7);
    g.fill();
  }
}
function win(g, x, y, w, h, lit, frame, glass) {
  g.fillStyle = frame;
  g.fillRect(x - 2, y - 2, w + 4, h + 4);
  g.fillStyle = lit ? lg(g, x, y, x, y + h, ['#ffe9a8', '#ffb54a']) : glass;
  g.fillRect(x, y, w, h);
  g.fillStyle = frame;
  g.fillRect(x + w / 2 - 1, y, 2, h);
  g.fillRect(x, y + h * 0.45, w, 2);
  if (!lit) {
    g.fillStyle = 'rgba(255,255,255,.18)';
    g.fillRect(x + 2, y + 2, 3, h * 0.4);
  }
}
function building(g, x, y, w, h, o) {
  g.fillStyle = lg(g, x, y, x + w, y, [o.wall, shade(o.wall, -0.18)]);
  g.fillRect(x, y, w, h);
  speck(g, x, y, w, h, (w * h) / 40, [shade(o.wall, 0.12), shade(o.wall, -0.14)], 2);
  g.fillStyle = o.trim;
  g.fillRect(x - 4, y - 8, w + 8, 8);
  g.fillStyle = shade(o.trim, 0.3);
  g.fillRect(x - 4, y - 8, w + 8, 2);
  g.fillStyle = shade(o.trim, -0.4);
  g.fillRect(x - 2, y, w + 4, 3);
  if (o.roof) {
    g.fillStyle = o.roof;
    g.beginPath();
    g.moveTo(x - 8, y - 8);
    g.lineTo(x + w / 2, y - 8 - (o.peak || 18));
    g.lineTo(x + w + 8, y - 8);
    g.fill();
    for (let k = 0; k < (o.peak || 18); k += 4) {
      g.fillStyle = shade(o.roof, -0.25);
      g.fillRect(x - 4 + k, y - 10 - k * 0.9, w + 8 - k * 2, 1);
    }
  }
  const cols = Math.max(1, Math.floor((w - 16) / 30)),
    rows = Math.max(1, Math.floor((h - 40) / 40));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const wx = x + 12 + c * ((w - 24) / cols) + ((w - 24) / cols - 14) / 2,
        wy = y + 16 + r * 40;
      const lit = o.lit !== undefined ? rr() < o.lit : false;
      win(g, wx, wy, 14, 22, lit, o.frame || '#3a2a2a', o.glass || '#2a3446');
      if (o.shutter) {
        g.fillStyle = o.shutter;
        g.fillRect(wx - 8, wy - 2, 6, 26);
        g.fillRect(wx + 16, wy - 2, 6, 26);
        g.fillStyle = shade(o.shutter, -0.3);
        for (let k = 0; k < 26; k += 4) {
          g.fillRect(wx - 8, wy - 2 + k, 6, 1);
          g.fillRect(wx + 16, wy - 2 + k, 6, 1);
        }
      }
      if (o.balcony && r === 0 && c % 2 === 0) {
        g.fillStyle = '#2a2028';
        g.fillRect(wx - 6, wy + 24, 26, 2);
        for (let k = 0; k < 26; k += 4) g.fillRect(wx - 6 + k, wy + 24, 1, 8);
        g.fillRect(wx - 6, wy + 32, 26, 2);
        leafBlob(g, wx + 8, wy + 22, 8, ['#2e6a2a', '#3f8a3a', '#7ac04f'], 14);
        g.fillStyle = '#ff5a6a';
        g.fillRect(wx + 2, wy + 18, 2, 2);
        g.fillRect(wx + 12, wy + 20, 2, 2);
      }
    }
  g.fillStyle = lg(g, 0, y + h - 30, 0, y + h, ['rgba(0,0,0,0)', 'rgba(0,0,0,.35)']);
  g.fillRect(x, y + h - 30, w, 30);
}
function perspTiles(g, y0, c1, c2, lines, vx = FW / 2) {
  for (let y = y0, row = 0; y < SH2; row++) {
    const h = Math.max(3, Math.round(3 + (y - y0) * 0.16));
    for (let x = -400; x < FW + 400; x += 40) {
      const k = (y - y0) / (SH2 - y0),
        sx = vx + (x - vx) * (1 + k * 1.6),
        ex = vx + (x + 40 - vx) * (1 + k * 1.6);
      g.fillStyle = (x / 40 + row) & 1 ? c1 : c2;
      g.beginPath();
      g.moveTo(sx, y);
      g.lineTo(ex, y);
      const k2 = Math.min(1, (y + h - y0) / (SH2 - y0));
      g.lineTo(vx + (x + 40 - vx) * (1 + k2 * 1.6), y + h);
      g.lineTo(vx + (x - vx) * (1 + k2 * 1.6), y + h);
      g.fill();
    }
    if (lines) {
      g.fillStyle = lines;
      g.fillRect(0, y, FW, 1);
    }
    y += h;
  }
}
function layers() {
  return { sky: mk(640, SH2), far: mk(FARW, SH2), mid: mk(MIDW, SH2), floor: mk(FW, SH2) };
}
function finish(L, o) {
  quant(L.sky, 16, false);
  quant(L.far, 14);
  quant(L.mid, 14);
  quant(L.floor, 14);
  return Object.assign({ hd: true }, L, o);
}
const HDC = (c, fn) => {
  c.save();
  c.scale(0.5, 0.5);
  fn(c);
  c.restore();
};

export {
  FARW,
  FW,
  GY,
  HDC,
  MIDW,
  SH2,
  building,
  cloud,
  fbm,
  finish,
  frond,
  glow,
  layers,
  leafBlob,
  lg,
  palmHD,
  perspTiles,
  ridge,
  rr,
  setSeed,
  speck,
  win,
};
