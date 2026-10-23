/* Stage painter (2x layers quantized to pixel art) with its animated hooks. */
import {
  FARW,
  FW,
  GY,
  HDC,
  MIDW,
  SH2,
  building,
  cloud,
  finish,
  layers,
  lg,
  ridge,
  rr,
  setSeed,
  speck,
  win,
} from './toolkit.js';

function hStrada() {
  setSeed(111);
  const L = layers();
  let g = L.sky.getContext('2d');
  g.fillStyle = lg(g, 0, 0, 0, 280, ['#4aa2e8', '#86c8f2', '#cfeaf8', '#f8f0d8']);
  g.fillRect(0, 0, 640, 280);
  for (let i = 0; i < 5; i++)
    cloud(g, 40 + i * 140, 60 + (i % 2) * 30, 14 + rr() * 10, ['#d4e8f8', '#f2faff', '#ffffff']);
  g = L.far.getContext('2d');
  ridge(g, FARW, 250, 40, 90, 21, '#8ab06a', '#6a944e', '#a8c884');
  for (let i = 0; i < 8; i++) {
    const x = 40 + i * 90;
    for (let y = 0; y < 50; y++) {
      const hw = Math.round(Math.sin((y / 50) * Math.PI) * 6) + 1;
      g.fillStyle = '#2e5a34';
      g.fillRect(x - hw, 190 + y, hw * 2, 1);
    }
  }
  g.fillStyle = '#f0d8a8';
  g.fillRect(240, 190, 80, 36);
  g.fillStyle = '#c86a40';
  g.beginPath();
  g.moveTo(232, 192);
  g.lineTo(280, 172);
  g.lineTo(328, 192);
  g.fill();
  win(g, 252, 200, 10, 14, false, '#5a3a2a', '#5a7aa0');
  win(g, 296, 200, 10, 14, false, '#5a3a2a', '#5a7aa0');
  g = L.mid.getContext('2d');
  const cols = ['#f2c46a', '#e8a060', '#f4e0b0', '#e88a70', '#c8d870'];
  const laundry = [];
  let x = 0;
  for (let i = 0; x < MIDW; i++) {
    const w = 130 + Math.floor(rr() * 40),
      h = 150 + Math.floor(rr() * 40);
    building(g, x, 280 - h, w, h, {
      wall: cols[i % 5],
      trim: '#9a4a30',
      shutter: '#3a7a5a',
      balcony: 1,
      frame: '#5a3a2a',
      glass: '#3a4a6a',
      lit: 0,
    });
    g.fillStyle = '#5a3a2a';
    g.fillRect(x + w / 2 - 16, 240, 32, 40);
    g.fillStyle = '#6a4a3a';
    g.fillRect(x + w / 2 - 14, 242, 28, 38);
    if (i % 2 === 0) laundry.push([x + w, 280 - h + 60]);
    x += w;
  }
  g.fillStyle = '#8ad0e0';
  g.beginPath();
  g.ellipse(660, 262, 18, 10, 0, 0, 7);
  g.fill();
  g.fillRect(644, 256, 8, 14);
  g.fillStyle = '#2a2430';
  g.beginPath();
  g.arc(646, 276, 6, 0, 7);
  g.arc(676, 276, 6, 0, 7);
  g.fill();
  g.fillStyle = '#5a5a6a';
  g.fillRect(672, 240, 3, 18);
  g.fillRect(666, 238, 14, 3);
  g = L.floor.getContext('2d');
  g.fillStyle = lg(g, 0, GY, 0, GY + 14, ['#e8dcc8', '#b8ac98']);
  g.fillRect(0, GY, FW, 14);
  for (let x = 0; x < FW; x += 30) ((g.fillStyle = '#a89c88'), g.fillRect(x, GY, 2, 14));
  g.fillStyle = '#8a8070';
  g.fillRect(0, GY + 12, FW, 3);
  g.fillStyle = lg(g, 0, GY + 15, 0, SH2, ['#5a5662', '#4a4652', '#3a3642']);
  g.fillRect(0, GY + 15, FW, SH2 - GY - 15);
  speck(g, 0, GY + 15, FW, 73, 1600, ['#6a6672', '#34303c', '#7a7682']);
  for (let x = 0; x < FW; x += 64) {
    g.fillStyle = '#e8e0c8';
    g.fillRect(x, 334, 32, 4);
  }
  return finish(L, {
    name: 'STRADA',
    music: 'bonus',
    midA(c, cam, t) {
      HDC(c, (c) => {
        const ox = -Math.round(cam * 1.2);
        for (const [lx, ly] of laundry) {
          c.fillStyle = '#2a2030';
          c.fillRect(lx + ox - 40, ly, 80, 1);
          ['#ff5a6a', '#ffffff', '#5aa0ff', '#ffd23a'].forEach((col, k) => {
            const sw = Math.round(Math.sin(t / 12 + k) * 2);
            c.fillStyle = col;
            c.fillRect(lx + ox - 36 + k * 20 + sw, ly + 1, 12, 14 + (k % 2) * 4);
            c.fillStyle = 'rgba(0,0,0,.2)';
            c.fillRect(lx + ox - 36 + k * 20 + sw + 9, ly + 1, 3, 14 + (k % 2) * 4);
          });
        }
      });
    },
  });
}

export { hStrada };
