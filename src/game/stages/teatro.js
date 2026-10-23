/* Stage painter (2x layers quantized to pixel art) with its animated hooks. */
import { FW, GY, HDC, MIDW, SH2, finish, glow, layers, lg, rr, setSeed } from './toolkit.js';

function hTeatro() {
  setSeed(81);
  const L = layers();
  let g = L.sky.getContext('2d');
  g.fillStyle = lg(g, 0, 0, 0, 280, ['#160c2a', '#2e1a4a', '#4e2a60', '#6e3a6a']);
  g.fillRect(0, 0, 640, 280);
  glow(g, 170, 90, 70, '#f4e8c8', 0.4);
  g.fillStyle = '#f4e8c8';
  g.beginPath();
  g.arc(170, 90, 24, 0, 7);
  g.fill();
  for (let i = 0; i < 60; i++) {
    g.fillStyle = '#fff6d8';
    g.fillRect(Math.floor(rr() * 640), Math.floor(rr() * 160), 1, 1);
  }
  g = L.far.getContext('2d');
  g.fillStyle = '#24123c';
  g.fillRect(260, 150, 240, 130);
  for (let x = 260; x < 500; x += 18) g.fillRect(x, 140, 10, 12);
  g.fillRect(340, 90, 50, 64);
  for (let x = 340; x < 390; x += 12) g.fillRect(x, 82, 8, 10);
  g.beginPath();
  g.moveTo(330, 90);
  g.lineTo(365, 40);
  g.lineTo(400, 90);
  g.fill();
  for (const [x, y] of [
    [360, 110],
    [290, 180],
    [460, 180],
    [380, 200],
  ]) {
    g.fillStyle = '#ffcf6a';
    g.fillRect(x, y, 8, 14);
    glow(g, x + 4, y + 7, 14, '#ffcf6a', 0.4);
  }
  for (let i = 0; i < 9; i++) {
    const x = 40 + i * 80,
      y = 40 + (i % 3) * 24;
    g.fillStyle = '#5a4a6a';
    g.fillRect(x + 4, 0, 1, y);
    g.fillStyle = '#ffd23a';
    g.fillRect(x, y, 10, 2);
    g.fillRect(x + 4, y - 4, 2, 10);
    glow(g, x + 5, y + 1, 10, '#ffe88a', 0.5);
  }
  g = L.mid.getContext('2d');
  const curtain = (x0, w) => {
    for (let x = 0; x < w; x++) {
      const s = Math.sin((x / w) * Math.PI * 5) * 0.5 + 0.5;
      g.fillStyle = s > 0.75 ? '#d8283e' : s > 0.5 ? '#b81c34' : s > 0.25 ? '#8e1428' : '#5e0a1a';
      g.fillRect(x0 + x, 0, 1, 286);
    }
    g.fillStyle = '#ffd23a';
    g.fillRect(x0, 250, w, 4);
    g.fillStyle = '#8a6a1a';
    for (let x = 0; x < w; x += 6) g.fillRect(x0 + x, 254, 3, 10);
  };
  curtain(0, 90);
  curtain(MIDW - 90, 90);
  curtain(390, 60);
  for (let x = 0; x < MIDW; x++) {
    const h = 34 + Math.round(Math.abs(Math.sin(x / 22)) * 12);
    g.fillStyle = Math.floor(x / 22) % 2 ? '#c8203a' : '#9a1630';
    g.fillRect(x, 0, 1, h);
    g.fillStyle = '#ffd23a';
    g.fillRect(x, h, 1, 2);
  }
  g.fillStyle = lg(g, 0, 0, 0, 20, ['#f8d860', '#b88a20']);
  g.fillRect(0, 0, MIDW, 8);
  for (let x = 0; x < MIDW; x += 24) {
    g.fillStyle = '#ffe88a';
    g.beginPath();
    g.arc(x + 12, 8, 5, 0, Math.PI);
    g.fill();
  }
  g = L.floor.getContext('2d');
  g.fillStyle = lg(g, 0, GY, 0, SH2, ['#c8884a', '#a06a36', '#7a4a24']);
  g.fillRect(0, GY, FW, 88);
  for (let y = GY + 4, h = 4; y < SH2; h++) {
    g.fillStyle = '#6a4022';
    g.fillRect(0, y, FW, 1);
    y += h;
  }
  for (let x = 0; x < FW; x += 52) ((g.fillStyle = 'rgba(60,30,10,.4)'), g.fillRect(x, GY, 1, 88));
  g.fillStyle = lg(g, 0, GY, 0, GY + 30, ['rgba(255,230,180,.35)', 'rgba(255,230,180,0)']);
  g.fillRect(0, GY, FW, 30);
  g.fillStyle = '#e8b060';
  g.fillRect(0, GY, FW, 2);
  return finish(L, {
    name: 'TEATRO',
    music: 'waltz',
    midA(c, cam, t) {
      HDC(c, (c) => {
        const ox = -Math.round(cam * 1.2);
        [160, 460, 740].forEach((x, i) => {
          const sw = Math.round(Math.sin(t / 60 + i * 2) * 70);
          c.fillStyle = 'rgba(255,246,210,.1)';
          c.beginPath();
          c.moveTo(x + ox - 6, 46);
          c.lineTo(x + ox + 6, 46);
          c.lineTo(x + ox + sw + 50, 290);
          c.lineTo(x + ox + sw - 50, 290);
          c.fill();
        });
      });
    },
    front(c, cam, t) {
      HDC(c, (c) => {
        for (let x = 12; x < 640; x += 40) {
          c.fillStyle = '#ffd23a';
          c.fillRect(x, 338, 6, 2);
          c.fillStyle = 'rgba(255,220,120,.25)';
          c.fillRect(x - 4, 334, 14, 6);
        }
        for (let i = 0; i < 24; i++) {
          const x = i * 28 + ((i * 7) % 9),
            b = Math.round(Math.abs(Math.sin(t / 14 + i)) * 3);
          c.fillStyle = '#120818';
          c.beginPath();
          c.arc(x, 350 - b, 10, 0, 7);
          c.fill();
          c.fillRect(x - 14, 352 - b, 28, 12);
        }
      });
    },
  });
}

export { hTeatro };
