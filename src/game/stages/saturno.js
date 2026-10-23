/* Stage painter (2x layers quantized to pixel art) with its animated hooks. */
import { FW, GY, HDC, MIDW, SH2, finish, glow, layers, lg, rr, setSeed, speck } from './toolkit.js';

function hSaturno() {
  setSeed(101);
  const L = layers();
  let g = L.sky.getContext('2d');
  g.fillStyle = lg(g, 0, 0, 0, 360, ['#04020c', '#0c0624', '#180a38', '#260e44']);
  g.fillRect(0, 0, 640, 360);
  for (let i = 0; i < 26; i++) {
    const x = rr() * 640,
      y = rr() * 300,
      r = 40 + rr() * 90;
    glow(g, x, y, r, ['#8a2a9a', '#3a2a9a', '#c04a8a'][i % 3], 0.16);
  }
  const stars = [];
  for (let i = 0; i < 220; i++) {
    const s = [Math.floor(rr() * 640), Math.floor(rr() * 280), rr()];
    stars.push(s);
    g.fillStyle = s[2] > 0.9 ? '#ffffff' : s[2] > 0.6 ? '#c8d0ff' : '#8a90c0';
    g.fillRect(s[0], s[1], s[2] > 0.95 ? 2 : 1, s[2] > 0.95 ? 2 : 1);
  }
  glow(g, 80, 60, 26, '#4a9aff', 0.5);
  g.fillStyle = '#3a7ad0';
  g.beginPath();
  g.arc(80, 60, 12, 0, 7);
  g.fill();
  g.fillStyle = '#4ab04a';
  g.fillRect(74, 54, 6, 4);
  g.fillRect(82, 62, 5, 3);
  g = L.far.getContext('2d');
  const SX = 500,
    SY = 140,
    SR = 96;
  const ring = (a0, a1) => {
    for (const [r, col, lw] of [
      [186, '#8a7458', 5],
      [170, '#e8d8b0', 8],
      [154, '#b49c74', 5],
    ]) {
      g.strokeStyle = col;
      g.lineWidth = lw;
      g.beginPath();
      g.ellipse(SX, SY, r, r * 0.22, -0.18, a0, a1);
      g.stroke();
    }
  };
  ring(Math.PI, Math.PI * 2);
  g.save();
  g.beginPath();
  g.arc(SX, SY, SR, 0, 7);
  g.clip();
  for (let y = -SR; y < SR; y += 4) {
    g.fillStyle = ['#f0c888', '#e0aa62', '#d09a52', '#f2d6a0'][Math.floor((y + SR) / 12) % 4];
    g.fillRect(SX - SR, SY + y, SR * 2, 4);
  }
  g.fillStyle = lg(g, SX - SR, SY - SR, SX + SR, SY + SR, [
    'rgba(255,255,230,.35)',
    'rgba(0,0,0,0)',
    'rgba(40,10,40,.75)',
  ]);
  g.fillRect(SX - SR, SY - SR, SR * 2, SR * 2);
  g.restore();
  ring(0, Math.PI);
  g = L.mid.getContext('2d');
  for (let i = 0; i < 12; i++) {
    const x = rr() * MIDW,
      y = 110 + rr() * 110,
      r = 6 + rr() * 14;
    g.fillStyle = '#4a3a4a';
    g.beginPath();
    g.ellipse(x, y, r, r * 0.8, rr(), 0, 7);
    g.fill();
    g.fillStyle = '#7a6a7a';
    g.beginPath();
    g.ellipse(x - r * 0.25, y - r * 0.25, r * 0.5, r * 0.4, 0, 0, 7);
    g.fill();
  }
  g = L.floor.getContext('2d');
  g.fillStyle = lg(g, 0, GY, 0, SH2, ['#d0c0a0', '#9a8a72', '#6a5a4e']);
  g.fillRect(0, GY, FW, 88);
  for (let i = 0; i < 60; i++) {
    const x = rr() * FW,
      y = GY + 8 + rr() * 76,
      r = 3 + rr() * 12;
    g.fillStyle = 'rgba(60,40,50,.5)';
    g.beginPath();
    g.ellipse(x, y, r, r * 0.4, 0, 0, 7);
    g.fill();
    g.fillStyle = 'rgba(255,245,220,.5)';
    g.beginPath();
    g.ellipse(x, y + r * 0.15, r * 0.8, r * 0.25, 0, 0, Math.PI);
    g.fill();
  }
  speck(g, 0, GY, FW, 88, 700, ['#e8dcc0', '#5a4a44']);
  g.fillStyle = '#fff4dc';
  g.fillRect(0, GY, FW, 2);
  return finish(L, {
    name: 'SATURNO',
    music: 'boss',
    back(c, cam, t) {
      HDC(c, (c) => {
        for (const [sx, sy, ph] of stars)
          if (Math.sin(t / 16 + ph * 50) > 0.9) {
            c.fillStyle = '#ffffff';
            c.fillRect(sx - 2, sy, 5, 1);
            c.fillRect(sx, sy - 2, 1, 5);
          }
        const k = t % 360;
        if (k < 40) {
          c.fillStyle = 'rgba(255,255,255,.9)';
          for (let i = 0; i < 10; i++) c.fillRect(600 - k * 10 + i * 3, 20 + k * 3 - i, 3, 2);
        }
      });
    },
    farA(c, cam, t) {
      HDC(c, (c) => {
        const ox = -Math.round(cam * 0.6);
        for (let i = 0; i < 40; i++) {
          const a = t / 80 + i * 0.157,
            x = 500 + ox + Math.cos(a) * 172,
            y = 140 + Math.sin(a) * 34 - Math.cos(a) * 30;
          if (Math.sin(a) > 0) {
            c.fillStyle = 'rgba(255,240,200,.7)';
            c.fillRect(Math.round(x), Math.round(y), 2, 2);
          }
        }
      });
    },
  });
}

export { hSaturno };
