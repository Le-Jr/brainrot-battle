/* Stage painter (2x layers quantized to pixel art) with its animated hooks. */
import { rgba } from '../core/color.js';
import { vn } from '../core/math.js';
import {
  FARW,
  FW,
  GY,
  HDC,
  SH2,
  finish,
  glow,
  layers,
  lg,
  palmHD,
  ridge,
  rr,
  setSeed,
  speck,
} from './toolkit.js';

function hBeach() {
  setSeed(11);
  const L = layers();
  let g = L.sky.getContext('2d');
  g.fillStyle = lg(g, 0, 0, 0, 232, ['#1d1450', '#46277a', '#9a3a82', '#e8606a', '#ff9a56', '#ffd486']);
  g.fillRect(0, 0, 640, 232);
  glow(g, 460, 204, 150, '#ffcf7a', 0.55);
  g.fillStyle = lg(g, 0, 150, 0, 232, ['#fff3c4', '#ffc070', '#ff8a52']);
  g.beginPath();
  g.arc(460, 204, 56, 0, 7);
  g.fill();
  g.fillStyle = '#ff9a56';
  for (let k = 0; k < 6; k++) g.fillRect(400, 208 + k * 5, 120, 1 + k * 0.6);
  for (let i = 0; i < 6; i++) {
    g.fillStyle = rgba('#ffb0a0', 0.35);
    g.beginPath();
    g.ellipse(80 + i * 110, 60 + (i % 3) * 24, 60, 5, 0, 0, 7);
    g.fill();
  }
  g.fillStyle = lg(g, 0, 228, 0, 360, ['#5a3a8a', '#3a5aa6', '#2a76bd', '#1e5a9a']);
  g.fillRect(0, 228, 640, 132);
  for (let y = 232; y < 300; y += 3) {
    const hw = 12 + (y - 232) * 1.1 + rr() * 20;
    g.fillStyle = rgba(y % 2 ? '#ffd486' : '#ff9a6a', 0.75 - (y - 232) / 140);
    g.fillRect(460 - hw, y, hw * 2, 1);
  }
  g = L.far.getContext('2d');
  ridge(g, FARW, 228, 40, 60, 3, '#4a2a6a', '#2a1840', null);
  g.fillStyle = '#2a1440';
  g.fillRect(600, 176, 8, 52);
  g.fillRect(596, 170, 16, 8);
  glow(g, 604, 174, 30, '#ffe08a', 0.6);
  g.fillStyle = '#ffe08a';
  g.fillRect(600, 172, 8, 4);
  g = L.mid.getContext('2d');
  for (const [x, h, l] of [
    [70, 170, -1],
    [300, 140, 1],
    [560, 180, -1],
    [790, 150, 1],
  ])
    palmHD(g, x, 280, h, l, ['#4a2a3a', '#5a3448', '#8a5060'], '#1e5a3a', '#2e7a4a');
  g.fillStyle = '#6a3a3a';
  g.fillRect(452, 214, 4, 70);
  for (let a = 0; a < 12; a++) {
    g.fillStyle = a % 2 ? '#f4ece0' : '#e8343f';
    g.beginPath();
    g.moveTo(454, 206);
    g.arc(454, 214, 44, Math.PI + (a * Math.PI) / 12, Math.PI + ((a + 1) * Math.PI) / 12);
    g.fill();
  }
  g.fillStyle = '#d8c4a0';
  g.fillRect(640, 190, 60, 8);
  g.fillStyle = '#a8845a';
  for (const dx of [642, 694]) g.fillRect(dx, 198, 4, 84);
  g.fillStyle = '#e8343f';
  g.fillRect(646, 168, 48, 22);
  g.fillStyle = '#ffffff';
  g.fillRect(652, 174, 36, 4);
  g = L.floor.getContext('2d');
  g.fillStyle = lg(g, 0, GY, 0, SH2, ['#f6d49a', '#e8b06c', '#c88a52']);
  g.fillRect(0, GY, FW, SH2 - GY);
  for (let y = GY + 8; y < SH2; y += 6)
    for (let x = 0; x < FW; x += 2) {
      if (vn(x / 26 + y * 0.37) > 0.62) {
        g.fillStyle = 'rgba(160,96,50,.35)';
        g.fillRect(x, y + Math.round(Math.sin(x / 14) * 1.5), 2, 1);
      }
    }
  speck(g, 0, GY, FW, 88, 900, ['#fff4d0', '#b8763e', '#d89a5a']);
  g.fillStyle = lg(g, 0, GY, 0, GY + 14, ['#7ab4d0', 'rgba(200,160,110,0)']);
  g.fillRect(0, GY, FW, 14);
  for (const [x, y] of [
    [120, 320],
    [420, 340],
    [660, 306],
    [880, 330],
  ]) {
    g.fillStyle = '#ffb0a0';
    g.beginPath();
    g.ellipse(x, y, 6, 4, 0, 0, 7);
    g.fill();
    g.fillStyle = '#ffd8c8';
    g.fillRect(x - 2, y - 2, 4, 2);
  }
  return finish(L, {
    name: 'SPIAGGIA',
    music: 'beach',
    back(c, cam, t) {
      HDC(c, (c) => {
        for (let i = 0; i < 46; i++) {
          const y = 236 + ((i * 13) % 60),
            x = ((i * 97 + t * (0.3 + (i % 3) * 0.2)) % 700) - 30;
          c.fillStyle = y < 270 && Math.abs(x - 460) < 80 ? 'rgba(255,240,190,.9)' : 'rgba(190,220,255,.55)';
          c.fillRect(Math.round(x), y, 6 + (i % 4) * 4, 2);
        }
        for (let k = 0; k < 3; k++) {
          const x = Math.round(((t * 0.5 + k * 230) % 760) - 60),
            y = 80 + k * 24 + Math.round(Math.sin(t / 22 + k) * 6),
            w = Math.floor(t / 10 + k) % 2;
          c.fillStyle = '#2a1640';
          c.fillRect(x - 6, y - 2 - w * 3, 6, 2);
          c.fillRect(x, y, 2, 2);
          c.fillRect(x + 2, y - 2 - w * 3, 6, 2);
        }
      });
    },
    front(c, cam, t) {
      HDC(c, (c) => {
        const ox = -Math.round(cam * 2);
        for (let x = 0; x < FW; x += 4) {
          const y = GY + 2 + Math.round(Math.sin(x / 30 + t / 18) * 3 + Math.sin(t / 40) * 2);
          c.fillStyle = 'rgba(255,255,255,.75)';
          c.fillRect(x + ox, y, 4, 2);
        }
      });
    },
  });
}

export { hBeach };
