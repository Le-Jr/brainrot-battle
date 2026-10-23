/* Stage painter (2x layers quantized to pixel art) with its animated hooks. */
import {
  FARW,
  FW,
  GY,
  HDC,
  MIDW,
  SH2,
  finish,
  glow,
  layers,
  leafBlob,
  lg,
  ridge,
  rr,
  setSeed,
  speck,
} from './toolkit.js';

function hJungle() {
  setSeed(31);
  const L = layers();
  let g = L.sky.getContext('2d');
  g.fillStyle = lg(g, 0, 0, 0, 280, ['#4ab0d8', '#8ad8d4', '#d4f2c8']);
  g.fillRect(0, 0, 640, 280);
  glow(g, 520, 40, 200, '#fffbe0', 0.6);
  for (let k = 0; k < 6; k++) {
    g.fillStyle = 'rgba(255,255,220,.08)';
    g.beginPath();
    g.moveTo(520, 0);
    g.lineTo(80 + k * 90, 360);
    g.lineTo(120 + k * 90, 360);
    g.fill();
  }
  g = L.far.getContext('2d');
  ridge(g, FARW, 190, 60, 80, 5, '#5a9a7a', '#3e7a5e');
  for (let i = 0; i < 34; i++)
    leafBlob(g, rr() * FARW, 170 + rr() * 70, 30 + rr() * 20, ['#2a6a4a', '#357a52', '#5a9a6a'], 50);
  g.fillStyle = lg(g, 320, 70, 360, 70, ['#bfe8f4', '#ffffff', '#9fd8ec']);
  g.fillRect(320, 70, 44, 190);
  for (const [x, y, r] of [
    [316, 70, 14],
    [368, 72, 16],
    [312, 256, 16],
    [372, 256, 18],
  ])
    leafBlob(g, x, y, r, ['#24603a', '#2e7a46', '#4a9a5a'], 30);
  glow(g, 342, 262, 40, '#ffffff', 0.6);
  g.fillStyle = lg(g, 0, 220, 0, 280, ['rgba(220,250,240,0)', 'rgba(220,250,240,.55)']);
  g.fillRect(0, 220, FARW, 80);
  g = L.mid.getContext('2d');
  for (const k of [40, 250, 500, 720]) {
    g.fillStyle = lg(g, k, 0, k + 34, 0, ['#6a4a30', '#4a3220', '#2e1e14']);
    g.fillRect(k, 0, 34, 286);
    for (let y = 10; y < 280; y += 18) {
      g.fillStyle = '#2e1e14';
      g.fillRect(k + 8 + (y % 3) * 4, y, 10, 3);
    }
    g.fillStyle = '#4a3220';
    g.beginPath();
    g.moveTo(k - 20, 286);
    g.quadraticCurveTo(k + 4, 250, k + 10, 240);
    g.lineTo(k + 24, 240);
    g.quadraticCurveTo(k + 40, 250, k + 60, 286);
    g.fill();
    leafBlob(g, k + 17, 10, 70, ['#1e5a2a', '#2e7a3a', '#5aa84a'], 140);
  }
  for (let i = 0; i < 22; i++) {
    const x = rr() * MIDW,
      len = 60 + rr() * 120;
    for (let y = 0; y < len; y += 2) {
      const xx = x + Math.sin(y / 14 + i) * 4;
      g.fillStyle = '#2e6a2a';
      g.fillRect(xx, y, 2, 2);
      if (y % 10 === 0) {
        g.fillStyle = '#4caf50';
        g.fillRect(xx + 2, y, 5, 3);
      }
    }
  }
  for (let i = 0; i < 20; i++) {
    const x = rr() * MIDW;
    leafBlob(g, x, 268, 24, ['#1e5a2a', '#2e8a3a', '#6cc04a'], 40);
    if (rr() > 0.5) {
      g.fillStyle = '#ff4a6a';
      g.beginPath();
      g.arc(x + rr() * 20 - 10, 258, 4, 0, 7);
      g.fill();
      g.fillStyle = '#ffe066';
      g.fillRect(x - 1, 257, 2, 2);
    }
  }
  g = L.floor.getContext('2d');
  g.fillStyle = lg(g, 0, GY, 0, SH2, ['#5a8a34', '#44702a', '#2e4c1c']);
  g.fillRect(0, GY, FW, 88);
  for (let x = 0; x < FW; x += 3) {
    const h = 4 + rr() * 8;
    g.fillStyle = rr() > 0.5 ? '#7ac04f' : '#9ad86a';
    g.fillRect(x, GY - h + 4, 2, h);
  }
  speck(g, 0, GY + 8, FW, 80, 700, ['#3a6a24', '#6aa040', '#8a6a3a']);
  for (const x of [140, 520, 860]) {
    g.fillStyle = '#e03a3a';
    g.beginPath();
    g.ellipse(x, 320, 10, 6, 0, Math.PI, 0);
    g.fill();
    g.fillStyle = '#ffffff';
    g.fillRect(x - 4, 316, 3, 2);
    g.fillRect(x + 3, 317, 2, 2);
    g.fillStyle = '#f4e8d0';
    g.fillRect(x - 3, 320, 6, 8);
  }
  return finish(L, {
    name: 'GIUNGLA',
    music: 'jungle',
    farA(c, cam, t) {
      HDC(c, (c) => {
        const wx = 320 - Math.round(cam * 0.6);
        for (let i = 0; i < 24; i++) {
          const xx = wx + 4 + ((i * 7) % 38),
            yy = 70 + ((t * 3.6 + i * 31) % 190);
          c.fillStyle = 'rgba(255,255,255,.85)';
          c.fillRect(xx, Math.round(yy), 2, 10);
        }
      });
    },
    front(c, cam, t) {
      HDC(c, (c) => {
        for (let k = 0; k < 3; k++) {
          const x = Math.round(((t * 1 + k * 240) % 760) - 40),
            y = 120 + k * 50 + Math.round(Math.sin(t / 25 + k * 2) * 24),
            w = (Math.floor(t / 5) + k) % 2;
          c.fillStyle = k % 2 ? '#4ab4ff' : '#ff9a2a';
          c.fillRect(x - 6, y - 2 + w * 2, 6, 5);
          c.fillRect(x + 2, y - 2 + w * 2, 6, 5);
          c.fillStyle = '#1b1024';
          c.fillRect(x, y, 2, 5);
        }
      });
    },
  });
}

export { hJungle };
