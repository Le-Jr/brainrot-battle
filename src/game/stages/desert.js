/* Stage painter (2x layers quantized to pixel art) with its animated hooks. */
import { rgba } from '../core/color.js';
import { vn } from '../core/math.js';
import { FARW, FW, GY, HDC, SH2, finish, glow, layers, lg, ridge, setSeed, speck } from './toolkit.js';

function hDesert() {
  setSeed(41);
  const L = layers();
  let g = L.sky.getContext('2d');
  g.fillStyle = lg(g, 0, 0, 0, 260, ['#1a1036', '#3e1c5a', '#8a3068', '#dc5e52', '#ffa04c', '#ffd884']);
  g.fillRect(0, 0, 640, 260);
  glow(g, 190, 220, 170, '#ffd48a', 0.6);
  g.fillStyle = lg(g, 0, 160, 0, 260, ['#fff2c0', '#ffc070', '#ff7a4a']);
  g.beginPath();
  g.arc(190, 220, 52, 0, 7);
  g.fill();
  g.fillStyle = '#ff9a56';
  for (let k = 0; k < 7; k++) g.fillRect(130, 226 + k * 5, 120, 1 + k * 0.6);
  for (const [x, y, w] of [
    [40, 70, 140],
    [380, 56, 180],
    [300, 110, 110],
    [520, 128, 90],
  ]) {
    g.fillStyle = rgba('#a04a78', 0.6);
    g.fillRect(x, y, w, 2);
    g.fillStyle = rgba('#e87a7a', 0.45);
    g.fillRect(x + 16, y + 3, w - 32, 2);
  }
  g = L.far.getContext('2d');
  for (const [x, w, h] of [
    [60, 110, 90],
    [480, 90, 70],
    [640, 80, 110],
  ]) {
    g.fillStyle = lg(g, x, 0, x + w, 0, ['#8a3e5e', '#6a2a4a']);
    g.fillRect(x, 256 - h, w, h + 40);
    g.fillStyle = '#9a4e6a';
    g.fillRect(x - 6, 256 - h, w + 12, 8);
    for (let k = 0; k < h; k += 10) {
      g.fillStyle = 'rgba(60,20,40,.35)';
      g.fillRect(x, 256 - h + 8 + k, w, 2);
    }
  }
  ridge(g, FARW, 262, 30, 70, 9, '#b05a5c', '#8a3e50', '#e08a72');
  g.fillStyle = '#5a2a44';
  g.fillRect(340, 120, 40, 150);
  g.fillRect(332, 110, 56, 14);
  g.beginPath();
  g.arc(360, 150, 18, 0, 7);
  g.fillStyle = '#f4ecd8';
  g.fill();
  g.strokeStyle = '#5a2a44';
  g.lineWidth = 2;
  g.beginPath();
  g.arc(360, 150, 18, 0, 7);
  g.stroke();
  g.fillStyle = '#5a2a44';
  for (let k = 0; k < 12; k++)
    g.fillRect(360 + Math.cos(k * 0.52) * 14 - 1, 150 + Math.sin(k * 0.52) * 14 - 1, 2, 2);
  g = L.mid.getContext('2d');
  const cactus = (x, h) => {
    const C = (a, b, w, hh) => {
      g.fillStyle = lg(g, a, 0, a + w, 0, ['#5a8a4a', '#3e6a36', '#2a4a26']);
      g.fillRect(a, b, w, hh);
      g.fillStyle = '#8ab86a';
      g.fillRect(a + 2, b, 2, hh);
      g.fillStyle = '#f4e8c8';
      for (let y = b + 4; y < b + hh; y += 8) {
        g.fillRect(a - 1, y, 2, 1);
        g.fillRect(a + w - 1, y + 4, 2, 1);
      }
    };
    C(x, 286 - h, 14, h);
    C(x - 16, 286 - h * 0.62, 10, h * 0.3);
    C(x - 16, 286 - h * 0.4, 26, 8);
    C(x + 20, 286 - h * 0.5, 10, h * 0.22);
    C(x + 8, 286 - h * 0.32, 22, 8);
    g.fillStyle = '#ff6a8a';
    g.fillRect(x + 4, 282 - h, 6, 4);
  };
  for (const [x, h] of [
    [60, 90],
    [330, 70],
    [580, 110],
    [780, 64],
  ])
    cactus(x, h);
  for (const x of [200, 470, 700]) {
    g.fillStyle = '#4a2440';
    g.beginPath();
    g.ellipse(x, 284, 20, 8, 0, 0, 7);
    g.fill();
    g.fillStyle = '#7a3a50';
    g.beginPath();
    g.ellipse(x - 4, 280, 12, 5, 0, 0, 7);
    g.fill();
  }
  g = L.floor.getContext('2d');
  g.fillStyle = lg(g, 0, GY, 0, SH2, ['#f0aa62', '#d8884a', '#b0683c']);
  g.fillRect(0, GY, FW, 88);
  for (let y = GY + 6; y < SH2; y += 5)
    for (let x = 0; x < FW; x += 2) {
      if (vn(x / 22 + y * 0.21) > 0.6) {
        g.fillStyle = 'rgba(140,70,40,.4)';
        g.fillRect(x, y + Math.round(Math.sin(x / 11 + y) * 1.5), 2, 1);
      }
    }
  speck(g, 0, GY, FW, 88, 500, ['#ffd08a', '#a86034']);
  g.fillStyle = '#f2e8d4';
  g.beginPath();
  g.ellipse(660, 318, 12, 8, 0, 0, 7);
  g.fill();
  g.fillStyle = '#3a2030';
  g.fillRect(654, 314, 4, 4);
  g.fillRect(662, 314, 4, 4);
  g.fillRect(656, 322, 8, 2);
  return finish(L, {
    name: 'DESERTO',
    music: 'desert',
    farA(c, cam, t) {
      HDC(c, (c) => {
        const x = 360 - Math.round(cam * 0.6),
          a = t / 30;
        c.fillStyle = '#3a1a30';
        for (let r = 0; r < 13; r++)
          c.fillRect(Math.round(x + Math.cos(a) * r) - 1, Math.round(150 + Math.sin(a) * r) - 1, 2, 2);
        for (let r = 0; r < 9; r++)
          c.fillRect(
            Math.round(x + Math.cos(a / 12) * r) - 1,
            Math.round(150 + Math.sin(a / 12) * r) - 1,
            3,
            3,
          );
      });
    },
    front(c, cam, t) {
      HDC(c, (c) => {
        const x = Math.round(((t * 2.6) % (FW + 400)) - 200 - cam * 2),
          y = 316 - Math.round(Math.abs(Math.sin(t / 14)) * 20);
        c.fillStyle = '#8a5a30';
        for (let a = 0; a < 30; a++) {
          const an = a * 0.45 + t * 0.15;
          c.fillRect(x + Math.round(Math.cos(an) * 10), y + Math.round(Math.sin(an) * 10), 2, 2);
          c.fillRect(x + Math.round(Math.cos(an * 1.7) * 6), y + Math.round(Math.sin(an * 1.3) * 6), 2, 2);
        }
        c.fillStyle = 'rgba(255,230,190,.3)';
        for (let i = 0; i < 10; i++) {
          const xx = Math.round(((t * (3 + i * 0.4) + i * 140) % 760) - 60),
            yy = 250 + i * 9;
          c.fillRect(xx, yy, 16 + i * 2, 2);
        }
      });
    },
  });
}

export { hDesert };
