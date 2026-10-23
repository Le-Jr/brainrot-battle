/* Stage painter (2x layers quantized to pixel art) with its animated hooks. */
import { rgba } from '../core/color.js';
import { FARW, FW, GY, HDC, MIDW, SH2, building, finish, glow, layers, lg, rr, setSeed } from './toolkit.js';

function hPiazza() {
  setSeed(21);
  const L = layers();
  let g = L.sky.getContext('2d');
  g.fillStyle = lg(g, 0, 0, 0, 280, ['#070722', '#15124a', '#2e2468', '#5e3a7e', '#a85a7e']);
  g.fillRect(0, 0, 640, 280);
  const stars = [];
  for (let i = 0; i < 110; i++) {
    const s = [Math.floor(rr() * 640), Math.floor(rr() * 170), rr()];
    stars.push(s);
    g.fillStyle = s[2] > 0.8 ? '#ffffff' : '#b8c0ff';
    g.fillRect(s[0], s[1], s[2] > 0.9 ? 2 : 1, s[2] > 0.9 ? 2 : 1);
  }
  glow(g, 140, 70, 90, '#d8d0ff', 0.35);
  g.fillStyle = '#f6f0dc';
  g.beginPath();
  g.arc(140, 70, 26, 0, 7);
  g.fill();
  g.fillStyle = '#dcd2b8';
  for (const [a, b, r] of [
    [-8, -6, 6],
    [9, 8, 7],
    [6, -12, 3],
    [-10, 10, 3],
  ]) {
    g.beginPath();
    g.arc(140 + a, 70 + b, r, 0, 7);
    g.fill();
  }
  g = L.far.getContext('2d');
  for (let x = 0; x < FARW;) {
    const w = 24 + rr() * 40,
      h = 50 + rr() * 70;
    g.fillStyle = '#231a4a';
    g.fillRect(x, 250 - h, w, h + 40);
    for (let wy = 258 - h; wy < 240; wy += 10)
      for (let wx = x + 4; wx < x + w - 4; wx += 8)
        if (rr() > 0.72) {
          g.fillStyle = '#ffcf6a';
          g.fillRect(wx, wy, 3, 5);
        }
    x += w;
  }
  g.fillStyle = '#2c2056';
  g.beginPath();
  g.arc(300, 168, 46, Math.PI, 0);
  g.fill();
  g.fillRect(254, 168, 92, 90);
  g.fillRect(296, 108, 8, 18);
  g.beginPath();
  g.arc(300, 108, 6, 0, 7);
  g.fill();
  for (let k = 0; k < 8; k++) {
    g.fillStyle = '#3a2c6a';
    g.fillRect(258 + k * 11, 130 + Math.abs(k - 3.5) * 6, 2, 40);
  }
  g.fillStyle = '#2c2056';
  g.fillRect(560, 90, 22, 170);
  for (let k = 0; k < 4; k++) {
    g.fillStyle = '#3a2c6a';
    g.fillRect(560, 100 + k * 40, 22, 3);
  }
  g.fillRect(556, 80, 30, 12);
  glow(g, 571, 120, 20, '#ffcf6a', 0.5);
  g = L.mid.getContext('2d');
  const cols = ['#c8704a', '#e0a060', '#d4805a', '#b85a4a', '#e8b878'];
  let x = 0;
  const bulbs = [];
  for (let i = 0; x < MIDW; i++) {
    const w = 110 + Math.floor(rr() * 50),
      h = 130 + Math.floor(rr() * 40);
    building(g, x, 280 - h, w, h, {
      wall: cols[i % 5],
      trim: '#8a3a2a',
      frame: '#3a2420',
      shutter: '#2f6b4a',
      lit: 0.45,
      balcony: 1,
      glass: '#1e2240',
    });
    g.fillStyle = '#3a1a14';
    g.fillRect(x + w / 2 - 14, 244, 28, 36);
    g.fillStyle = '#5a2a1a';
    g.fillRect(x + w / 2 - 12, 246, 24, 34);
    if (i % 2 === 0) {
      for (let k = 0; k < 6; k++) {
        g.fillStyle = k % 2 ? '#f4ece0' : '#c8203a';
        g.fillRect(x + w / 2 - 30 + k * 10, 236, 10, 10);
      }
    }
    x += w + (rr() > 0.6 ? 14 : 0);
  }
  for (let sx = 0; sx < MIDW; sx += 120) {
    for (let k = 0; k <= 120; k += 3) {
      const yy = 150 + Math.sin((k / 120) * Math.PI) * 22;
      g.fillStyle = '#1a1020';
      g.fillRect(sx + k, yy, 3, 1);
      if (k % 15 === 0) bulbs.push([sx + k, yy + 2, (sx / 120 + k / 15) % 4]);
    }
  }
  g = L.floor.getContext('2d');
  g.fillStyle = '#3e3046';
  g.fillRect(0, GY, FW, 88);
  for (let y = GY, row = 0; y < SH2; row++) {
    const h = 5 + Math.floor((y - GY) / 12) * 2,
      w = h * 2 + 4;
    for (let x = (-(row % 2) * w) / 2; x < FW; x += w) {
      const v = rr();
      g.fillStyle = v > 0.66 ? '#6a5a76' : v > 0.33 ? '#5e4e6a' : '#54465e';
      g.beginPath();
      g.ellipse(x + w / 2, y + h / 2, w / 2 - 1, h / 2 - 1, 0, 0, 7);
      g.fill();
      g.fillStyle = 'rgba(255,220,160,.12)';
      g.fillRect(x + 3, y + 1, w - 6, 1);
    }
    y += h;
  }
  for (const x of [160, 480, 800]) {
    g.fillStyle = lg(g, x, GY, x, SH2, ['rgba(255,200,110,.0)', 'rgba(255,200,110,.18)']);
    g.beginPath();
    g.ellipse(x, GY + 40, 140, 40, 0, 0, 7);
    g.fill();
  }
  return finish(L, {
    name: 'PIAZZA',
    music: 'piazza',
    back(c, cam, t) {
      HDC(c, (c) => {
        for (const [sx, sy, ph] of stars)
          if (Math.sin(t / 20 + ph * 40) > 0.86) {
            c.fillStyle = '#ffffff';
            c.fillRect(sx - 2, sy, 5, 1);
            c.fillRect(sx, sy - 2, 1, 5);
          }
      });
    },
    midA(c, cam, t) {
      HDC(c, (c) => {
        const ox = -Math.round(cam * 1.2);
        for (const [bx, by, k] of bulbs) {
          const on = (Math.floor(t / 18) + k) % 5 !== 0,
            col = ['#ff6a7a', '#7aff9a', '#fff4c0', '#ffd23a'][k];
          if (on) {
            c.fillStyle = rgba(col, 0.25);
            c.fillRect(bx + ox - 4, by - 3, 9, 9);
          }
          c.fillStyle = on ? col : '#3a2a40';
          c.fillRect(bx + ox - 1, by, 3, 4);
        }
      });
    },
  });
}

export { hPiazza };
