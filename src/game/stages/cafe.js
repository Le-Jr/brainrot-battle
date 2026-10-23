/* Stage painter (2x layers quantized to pixel art) with its animated hooks. */
import { FONT } from '../config.js';
import { FARW, FW, GY, HDC, SH2, finish, glow, layers, lg, perspTiles, setSeed } from './toolkit.js';

function hCafe() {
  setSeed(51);
  const L = layers();
  let g = L.sky.getContext('2d');
  g.fillStyle = '#3a1f2e';
  g.fillRect(0, 0, 640, 360);
  for (let y = 0; y < 200; y += 24)
    for (let x = ((y / 24) % 2) * 16; x < 640; x += 32) {
      g.fillStyle = '#4c2a3e';
      g.beginPath();
      g.moveTo(x, y + 4);
      g.lineTo(x + 8, y + 12);
      g.lineTo(x, y + 20);
      g.lineTo(x - 8, y + 12);
      g.fill();
      g.fillStyle = '#5c3448';
      g.fillRect(x - 1, y + 11, 2, 2);
    }
  g.fillStyle = lg(g, 0, 0, 0, 20, ['#6a3a48', '#4a2834']);
  g.fillRect(0, 14, 640, 10);
  g.fillStyle = '#5a3040';
  g.fillRect(0, 188, 640, 8);
  g.fillStyle = lg(g, 0, 196, 0, 280, ['#245a4a', '#1a443a']);
  g.fillRect(0, 196, 640, 84);
  for (let x = 0; x < 640; x += 40) {
    g.fillStyle = '#163a30';
    g.fillRect(x, 196, 2, 84);
    g.fillStyle = '#2e6a58';
    g.fillRect(x + 2, 196, 1, 84);
  }
  g.fillStyle = '#3a1a14';
  g.fillRect(0, 196, 640, 4);
  g.fillStyle = '#7a4a2a';
  g.fillRect(216, 44, 208, 100);
  g.fillStyle = '#1d2a26';
  g.fillRect(222, 50, 196, 88);
  g.fillStyle = 'rgba(255,255,255,.06)';
  g.fillRect(222, 50, 196, 20);
  g.font = '16px ' + FONT;
  g.textBaseline = 'top';
  g.fillStyle = '#f0ead8';
  g.fillText('CAFFÈ', 264, 56);
  g.font = '8px ' + FONT;
  ['ESPRESSO .... 1', 'RISTRETTO ... 1', 'CAPPUCCINO .. 2', 'ASSASSINO ... ?'].forEach((s, i) => {
    g.fillStyle = i === 3 ? '#ff6a6a' : '#e8e2d0';
    g.fillText(s, 234, 84 + i * 12);
  });
  g = L.far.getContext('2d');
  g.fillStyle = '#5a3424';
  g.fillRect(20, 116, 280, 6);
  g.fillRect(470, 108, 250, 6);
  for (let x = 30; x < 290; x += 18) {
    g.fillStyle = '#f2ece2';
    g.fillRect(x, 100, 12, 16);
    g.fillStyle = '#ffffff';
    g.fillRect(x, 100, 12, 2);
    g.fillStyle = '#d8d0c4';
    g.fillRect(x + 12, 104, 4, 6);
  }
  for (let x = 480; x < 710; x += 16) {
    const c = ['#2e6a3a', '#8a2a2a', '#d4a14a', '#5a3a8a', '#2a5a8a'][((x / 16) | 0) % 5];
    g.fillStyle = c;
    g.fillRect(x, 72, 10, 36);
    g.fillRect(x + 3, 62, 4, 10);
    g.fillStyle = 'rgba(255,255,255,.3)';
    g.fillRect(x + 2, 76, 2, 28);
    g.fillStyle = '#f4e8c8';
    g.fillRect(x + 1, 86, 8, 8);
  }
  g.fillStyle = lg(g, 0, 226, 0, 280, ['#7a4a32', '#5a3424']);
  g.fillRect(0, 226, FARW, 54);
  g.fillStyle = '#2a1810';
  g.fillRect(0, 224, FARW, 4);
  for (let x = 0; x < FARW; x += 46) {
    g.fillStyle = '#4e2c1e';
    g.fillRect(x, 230, 2, 50);
  }
  g.fillStyle = lg(g, 340, 150, 420, 150, ['#e8ecf4', '#9aa2b2', '#6a7282']);
  g.fillRect(336, 150, 104, 76);
  g.fillStyle = '#b8c0ce';
  g.fillRect(330, 140, 116, 12);
  g.fillStyle = '#d4a14a';
  g.fillRect(366, 160, 44, 18);
  g.fillStyle = '#2a2430';
  g.fillRect(352, 196, 18, 14);
  g.fillRect(406, 196, 18, 14);
  g.fillStyle = '#f2ece2';
  g.fillRect(354, 214, 14, 10);
  g.fillRect(408, 214, 14, 10);
  g.fillStyle = '#ff3a3a';
  g.fillRect(426, 160, 4, 4);
  g = L.mid.getContext('2d');
  const lamps = [100, 320, 540, 760];
  for (const x of lamps) {
    g.fillStyle = '#1a1018';
    g.fillRect(x, 0, 2, 56);
    g.fillStyle = lg(g, x - 22, 56, x + 22, 56, ['#a8742a', '#e8bc6a', '#a8742a']);
    g.beginPath();
    g.moveTo(x - 6, 56);
    g.lineTo(x + 8, 56);
    g.lineTo(x + 24, 76);
    g.lineTo(x - 22, 76);
    g.fill();
    glow(g, x + 1, 80, 22, '#fff2c0', 0.9);
  }
  for (const x of [200, 420, 640]) {
    g.fillStyle = '#c0303a';
    g.fillRect(x - 16, 236, 32, 6);
    g.fillStyle = '#e85a64';
    g.fillRect(x - 16, 236, 32, 2);
    g.fillStyle = '#3a3440';
    g.fillRect(x - 2, 242, 4, 38);
    g.fillRect(x - 12, 276, 24, 4);
  }
  g = L.floor.getContext('2d');
  perspTiles(g, GY, '#2b2531', '#e9e1d2');
  g.fillStyle = lg(g, 0, GY, 0, SH2, ['rgba(255,240,210,.2)', 'rgba(0,0,0,.2)']);
  g.fillRect(0, GY, FW, 88);
  return finish(L, {
    name: 'CAFFÈ',
    music: 'cafe',
    back(c, cam, t) {
      HDC(c, (c) => {
        const on = !(Math.floor(t / 7) % 37 === 0 || Math.floor(t / 7) % 53 === 0);
        c.font = '16px ' + FONT;
        c.textBaseline = 'top';
        if (on) {
          c.shadowColor = '#ff6ad5';
          c.shadowBlur = 12;
        }
        c.fillStyle = on ? '#ffb0ec' : '#5a2a50';
        c.fillText('ESPRESSO', 460, 150);
        c.shadowBlur = 0;
      });
    },
    farA(c, cam, t) {
      HDC(c, (c) => {
        const x = 388 - Math.round(cam * 0.6);
        for (let i = 0; i < 7; i++) {
          const p = (t * 1 + i * 14) % 80;
          c.fillStyle = `rgba(255,255,255,${(0.6 - p / 140).toFixed(2)})`;
          c.fillRect(x + Math.round(Math.sin(p / 10 + i) * 5) - 2, Math.round(146 - p), 4, 3);
        }
      });
    },
    midA(c, cam, t) {
      HDC(c, (c) => {
        const ox = -Math.round(cam * 1.2),
          fl = 0.08 + Math.sin(t / 9) * 0.012;
        for (const x of lamps) {
          c.fillStyle = `rgba(255,226,150,${fl.toFixed(3)})`;
          c.beginPath();
          c.moveTo(x + ox - 18, 78);
          c.lineTo(x + ox + 20, 78);
          c.lineTo(x + ox + 90, 290);
          c.lineTo(x + ox - 90, 290);
          c.fill();
        }
      });
    },
  });
}

export { hCafe };
