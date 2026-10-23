/* Stage painter (2x layers quantized to pixel art) with its animated hooks. */
import { FARW, FW, GY, HDC, MIDW, SH2, cloud, finish, glow, layers, lg, rr, setSeed } from './toolkit.js';

function hCielo() {
  setSeed(71);
  const L = layers();
  let g = L.sky.getContext('2d');
  g.fillStyle = lg(g, 0, 0, 0, 360, ['#1a58c4', '#3a82e0', '#78b8f4', '#c4e4ff', '#f2faff']);
  g.fillRect(0, 0, 640, 360);
  glow(g, 520, 60, 180, '#fffbe8', 0.7);
  g.fillStyle = '#fffdf0';
  g.beginPath();
  g.arc(520, 60, 26, 0, 7);
  g.fill();
  g = L.far.getContext('2d');
  for (let i = 0; i < 14; i++)
    cloud(g, rr() * FARW, 230 + rr() * 30, 26 + rr() * 20, ['#b8d0ec', '#dcecfc', '#ffffff']);
  g.fillStyle = lg(g, 0, 240, 0, 300, ['#e8f2fc', '#d4e6f8']);
  g.fillRect(0, 250, FARW, 110);
  g = L.mid.getContext('2d');
  for (let i = 0; i < 5; i++)
    cloud(g, rr() * MIDW, 268, 30 + rr() * 16, ['#c4d8ee', '#e4f0fc', '#ffffff', '#ffffff']);
  g.fillStyle = '#6e7a58';
  g.beginPath();
  g.moveTo(700, 140);
  g.lineTo(760, 120);
  g.lineTo(760, 280);
  g.lineTo(700, 280);
  g.fill();
  g.fillStyle = '#8a966e';
  g.fillRect(700, 140, 60, 6);
  g.fillStyle = '#2fa04a';
  g.fillRect(712, 160, 36, 10);
  g.fillStyle = '#f4f4f4';
  g.fillRect(712, 170, 36, 10);
  g.fillStyle = '#e03a3a';
  g.fillRect(712, 180, 36, 10);
  g = L.floor.getContext('2d');
  g.fillStyle = lg(g, 0, GY, 0, SH2, ['#8a966e', '#6e7a58', '#525c40']);
  g.fillRect(0, GY, FW, 88);
  g.fillStyle = '#c8d4b0';
  g.fillRect(0, GY, FW, 2);
  for (let x = 0; x < FW; x += 48) {
    g.fillStyle = '#4a5438';
    g.fillRect(x, GY, 2, 88);
  }
  for (const y of [296, 322]) {
    g.fillStyle = '#4a5438';
    g.fillRect(0, y, FW, 2);
  }
  for (let x = 8; x < FW; x += 16)
    for (const y of [284, 308, 336]) {
      g.fillStyle = '#b8c4a0';
      g.fillRect(x, y, 2, 2);
    }
  for (let x = 60; x < FW; x += 120) {
    g.fillStyle = '#f4f0d8';
    g.fillRect(x, 312, 60, 4);
  }
  g.fillStyle = '#2fa04a';
  g.beginPath();
  g.ellipse(480, 330, 60, 14, 0, 0, 7);
  g.fill();
  g.fillStyle = '#f4f4f4';
  g.beginPath();
  g.ellipse(480, 330, 40, 9, 0, 0, 7);
  g.fill();
  g.fillStyle = '#e03a3a';
  g.beginPath();
  g.ellipse(480, 330, 20, 5, 0, 0, 7);
  g.fill();
  const cl = [];
  for (let i = 0; i < 7; i++) cl.push([rr() * 720, 30 + rr() * 150, 14 + rr() * 20, 0.4 + rr() * 1.4]);
  return finish(L, {
    name: 'CIELO',
    music: 'march',
    back(c, cam, t) {
      HDC(c, (c) => {
        for (const [x0, y, r, sp] of cl) {
          const x = ((((x0 - t * sp) % 760) + 760) % 760) - 60;
          c.fillStyle = 'rgba(255,255,255,.85)';
          c.beginPath();
          c.ellipse(x, y, r * 2, r * 0.7, 0, 0, 7);
          c.fill();
          c.fillStyle = 'rgba(200,220,245,.6)';
          c.beginPath();
          c.ellipse(x + 4, y + r * 0.4, r * 1.6, r * 0.35, 0, 0, 7);
          c.fill();
        }
      });
    },
    front(c, cam, t) {
      HDC(c, (c) => {
        c.fillStyle = 'rgba(255,255,255,.6)';
        for (let i = 0; i < 12; i++) {
          const x = Math.round(640 - ((t * (12 + (i % 4) * 4) + i * 97) % 720)),
            y = 40 + ((i * 37) % 200);
          c.fillRect(x, y, 24 + (i % 3) * 10, 2);
        }
      });
    },
  });
}

export { hCielo };
