/* Stage painter (2x layers quantized to pixel art) with its animated hooks. */
import { FONT } from '../config.js';
import { shade } from '../core/color.js';
import {
  FARW,
  FW,
  GY,
  HDC,
  SH2,
  cloud,
  fbm,
  finish,
  glow,
  layers,
  lg,
  palmHD,
  rr,
  setSeed,
  speck,
} from './toolkit.js';

function hByd() {
  setSeed(131);
  const L = layers();
  let g = L.sky.getContext('2d');
  g.fillStyle = lg(g, 0, 0, 0, 280, ['#2a8ae8', '#62b6f4', '#b2e0fa', '#f2f8ea']);
  g.fillRect(0, 0, 640, 280);
  glow(g, 110, 60, 90, '#fff6c0', 0.6);
  g.fillStyle = '#fffbe0';
  g.beginPath();
  g.arc(110, 60, 20, 0, 7);
  g.fill();
  for (let i = 0; i < 4; i++)
    cloud(g, 230 + i * 120, 50 + (i % 2) * 40, 14 + rr() * 8, ['#d4e8f8', '#f2faff', '#ffffff']);
  g = L.far.getContext('2d');
  const hill = (x) => 200 - fbm(x / 120, 7) * 90;
  g.beginPath();
  g.moveTo(0, SH2);
  for (let x = 0; x <= FARW; x += 2) g.lineTo(x, hill(x));
  g.lineTo(FARW, SH2);
  g.fillStyle = lg(g, 0, 100, 0, 280, ['#4a9a52', '#2e7a3e']);
  g.fill();
  const hc = ['#f2c46a', '#e86a5a', '#5ab0e0', '#f4e0b0', '#a0d070', '#e88ac0', '#ffffff'];
  for (let i = 0; i < 260; i++) {
    const x = Math.floor(rr() * FARW),
      top = hill(x),
      y = top + 6 + rr() * (250 - top);
    if (y > 250) continue;
    const w = 10 + rr() * 8,
      h = 8 + rr() * 6;
    g.fillStyle = hc[i % 7];
    g.fillRect(x, y, w, h);
    g.fillStyle = shade(hc[i % 7], -0.25);
    g.fillRect(x + w - 2, y, 2, h);
    g.fillStyle = '#8a4a30';
    g.fillRect(x - 1, y - 2, w + 2, 2);
    g.fillStyle = '#2a2a3a';
    g.fillRect(x + 2, y + 3, 3, 3);
  }
  const tx = 560,
    ty = hill(560) - 4;
  g.fillStyle = '#e8eef4';
  g.fillRect(tx - 3, ty - 60, 6, 60);
  g.fillRect(tx - 26, ty - 52, 52, 6);
  g.beginPath();
  g.arc(tx, ty - 64, 5, 0, 7);
  g.fill();
  g.fillStyle = 'rgba(120,140,170,.5)';
  g.fillRect(tx + 1, ty - 58, 2, 58);
  g = L.mid.getContext('2d');
  for (const x of [40, 330, 700])
    palmHD(g, x, 284, 130, x % 2 ? 1 : -1, ['#7a5a3a', '#8a6a44', '#a88458'], '#2e8a3a', '#4aaa4a');
  g.fillStyle = '#f4f6f8';
  g.fillRect(150, 190, 260, 94);
  g.fillStyle = '#2a6ad8';
  g.fillRect(150, 190, 260, 8);
  g.fillStyle = lg(g, 0, 206, 0, 268, ['#cfeeff', '#8ac4e8']);
  g.fillRect(162, 206, 236, 62);
  for (let x = 162; x < 398; x += 34) {
    g.fillStyle = '#7aa8c8';
    g.fillRect(x, 206, 2, 62);
  }
  g.fillStyle = 'rgba(255,255,255,.4)';
  g.beginPath();
  g.moveTo(180, 206);
  g.lineTo(210, 206);
  g.lineTo(170, 268);
  g.lineTo(162, 268);
  g.fill();
  g.fillStyle = '#2a6ad8';
  g.fillRect(208, 166, 144, 22);
  g.font = '16px ' + FONT;
  g.textBaseline = 'top';
  g.fillStyle = '#ffffff';
  g.fillText('ELÉTRICOS', 212, 170);
  g = L.floor.getContext('2d');
  g.fillStyle = '#f2efe6';
  g.fillRect(0, GY, FW, 16);
  for (let x = 0; x < FW; x++) {
    const y = GY + 8 + Math.round(Math.sin(x / 9) * 5);
    g.fillStyle = '#1a1a1a';
    g.fillRect(x, y - 2, 1, 4);
  }
  g.fillStyle = '#8a8070';
  g.fillRect(0, GY + 15, FW, 3);
  g.fillStyle = lg(g, 0, GY + 18, 0, SH2, ['#4a4652', '#3a3642', '#2e2a36']);
  g.fillRect(0, GY + 18, FW, SH2 - GY - 18);
  speck(g, 0, GY + 18, FW, 70, 1400, ['#5a5662', '#2a2632']);
  for (let x = 0; x < FW; x += 80)
    for (let y = GY + 30; y < SH2 - 4; y += 4) ((g.fillStyle = '#e8e0a0'), g.fillRect(x, y, 4, 2));
  return finish(L, {
    name: 'VILA BRASILINI',
    music: 'byd',
    front(c, cam, t) {
      HDC(c, (c) => {
        for (let k = 0; k < 3; k++) {
          const x = Math.round(((t * 1.2 + k * 220) % 760) - 60),
            y = 70 + k * 24 + Math.round(Math.sin(t / 20 + k) * 6),
            w = Math.floor(t / 8 + k) % 2;
          c.fillStyle = '#2a2a3a';
          c.fillRect(x - 6, y - 2 - w * 3, 6, 2);
          c.fillRect(x, y, 2, 2);
          c.fillRect(x + 2, y - 2 - w * 3, 6, 2);
        }
      });
    },
  });
}

export { hByd };
