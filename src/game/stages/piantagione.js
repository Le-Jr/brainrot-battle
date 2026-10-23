/* Stage painter (2x layers quantized to pixel art) with its animated hooks. */
import {
  FARW,
  FW,
  GY,
  HDC,
  SH2,
  cloud,
  finish,
  frond,
  glow,
  layers,
  leafBlob,
  lg,
  ridge,
  rr,
  setSeed,
} from './toolkit.js';

function hPiantagione() {
  setSeed(91);
  const L = layers();
  let g = L.sky.getContext('2d');
  g.fillStyle = lg(g, 0, 0, 0, 280, ['#2a8ae4', '#5ab4f2', '#a4dcf8', '#e4f6ff']);
  g.fillRect(0, 0, 640, 280);
  glow(g, 540, 60, 120, '#fffbe0', 0.6);
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.arc(540, 60, 22, 0, 7);
  g.fill();
  for (let i = 0; i < 5; i++)
    cloud(g, 60 + i * 130, 50 + (i % 2) * 40, 16 + rr() * 10, ['#d4e8f8', '#f2faff', '#ffffff']);
  g = L.far.getContext('2d');
  g.fillStyle = lg(g, 0, 90, 0, 250, ['#f4faff', '#8a9aba', '#5a6a8a']);
  g.beginPath();
  g.moveTo(380, 250);
  g.lineTo(480, 104);
  g.lineTo(500, 100);
  g.lineTo(600, 250);
  g.fill();
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.moveTo(462, 130);
  g.lineTo(480, 104);
  g.lineTo(500, 100);
  g.lineTo(520, 132);
  g.lineTo(500, 124);
  g.lineTo(488, 136);
  g.fill();
  g.fillStyle = lg(g, 0, 236, 0, 260, ['#3a9ae0', '#2a7ac8']);
  g.fillRect(0, 240, FARW, 30);
  ridge(g, FARW, 262, 34, 60, 17, '#5aa84a', '#3a7a34', '#8ad070');
  for (let x = 10; x < FARW; x += 24)
    for (let r = 0; r < 3; r++) {
      leafBlob(g, x + (r % 2) * 12, 246 + r * 10, 7, ['#1e6a2a', '#2e8a3a', '#5aaa4a'], 8);
    }
  g = L.mid.getContext('2d');
  const bt = (x, h) => {
    g.fillStyle = lg(g, x - 6, 0, x + 6, 0, ['#9aaa4a', '#7a8a3a', '#5a6a2a']);
    g.fillRect(x - 6, 286 - h, 12, h);
    for (let y = 286 - h; y < 286; y += 10) {
      g.fillStyle = '#6a7a2a';
      g.fillRect(x - 6, y, 12, 2);
    }
    for (let i = 0; i < 7; i++)
      frond(g, x, 286 - h, -Math.PI / 2 + (i - 3) * 0.55, 60 + rr() * 20, '#3fa34a', '#2e8a3a');
    g.fillStyle = '#5a6a2a';
    g.fillRect(x + 4, 290 - h, 4, 14);
    for (let k = 0; k < 9; k++) {
      g.fillStyle = k % 3 ? '#ffd23f' : '#e8b820';
      g.beginPath();
      g.ellipse(x + 10 + (k % 3) * 5, 300 - h + Math.floor(k / 3) * 7, 4, 7, 0.4, 0, 7);
      g.fill();
    }
    g.fillStyle = '#8a2a4a';
    g.beginPath();
    g.ellipse(x + 14, 324 - h, 5, 9, 0, 0, 7);
    g.fill();
  };
  for (const [x, h] of [
    [60, 150],
    [250, 120],
    [460, 160],
    [650, 130],
    [800, 110],
  ])
    bt(x, h);
  for (const x of [160, 560]) {
    g.fillStyle = '#a8743a';
    g.fillRect(x, 248, 46, 34);
    g.fillStyle = '#c89050';
    g.fillRect(x, 248, 46, 4);
    g.fillStyle = '#7a5228';
    g.fillRect(x, 264, 46, 2);
    for (let k = 0; k < 8; k++) {
      g.fillStyle = '#ffd23f';
      g.beginPath();
      g.ellipse(x + 5 + k * 5, 244, 3, 6, 0.3, 0, 7);
      g.fill();
    }
  }
  g = L.floor.getContext('2d');
  g.fillStyle = lg(g, 0, GY, 0, SH2, ['#a8844a', '#8a6a3a', '#6a4e2e']);
  g.fillRect(0, GY, FW, 88);
  for (let y = GY + 10; y < SH2; y += 14) {
    g.fillStyle = 'rgba(60,40,20,.35)';
    g.fillRect(0, y, FW, 3);
  }
  for (let x = 0; x < FW; x += 3) {
    const h = 2 + rr() * 6;
    g.fillStyle = '#6cb04a';
    g.fillRect(x, GY + 2 - h, 2, h);
  }
  for (const [x, y] of [
    [100, 300],
    [360, 336],
    [600, 316],
    [840, 344],
  ]) {
    g.fillStyle = '#ffd23f';
    g.beginPath();
    g.ellipse(x, y, 10, 4, 0.3, 0, 7);
    g.fill();
    g.fillStyle = '#5a3a1a';
    g.fillRect(x + 8, y - 3, 3, 2);
  }
  return finish(L, {
    name: 'PIANTAGIONE',
    music: 'banana',
    front(c, cam, t) {
      HDC(c, (c) => {
        for (let k = 0; k < 2; k++) {
          const x = Math.round(((t * 1.6 + k * 300) % 760) - 60),
            y = 80 + k * 40 + Math.round(Math.sin(t / 18 + k) * 10),
            w = (t >> 3) & 1;
          c.fillStyle = '#1b1024';
          c.fillRect(x, y, 12, 5);
          c.fillRect(x - 4, y - 2 - w * 4, 8, 3);
          c.fillStyle = '#ff9a2a';
          c.fillRect(x + 12, y, 5, 3);
          c.fillStyle = '#e8343f';
          c.fillRect(x + 2, y + 5, 6, 2);
        }
      });
    },
  });
}

export { hPiantagione };
