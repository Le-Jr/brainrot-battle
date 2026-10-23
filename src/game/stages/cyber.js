/* Stage painter (2x layers quantized to pixel art) with its animated hooks. */
import { FONT } from '../config.js';
import { FARW, FW, GY, HDC, SH2, finish, glow, layers, lg, rr, setSeed } from './toolkit.js';

function hCyber() {
  setSeed(121);
  const L = layers();
  let g = L.sky.getContext('2d');
  g.fillStyle = lg(g, 0, 0, 0, 260, ['#07031a', '#1a0840', '#4a1260', '#a42a7a', '#ff5a8a']);
  g.fillRect(0, 0, 640, 260);
  glow(g, 320, 206, 160, '#ff5aa0', 0.5);
  g.save();
  g.beginPath();
  g.arc(320, 206, 64, 0, 7);
  g.clip();
  g.fillStyle = lg(g, 0, 142, 0, 270, ['#fff06a', '#ff9a4a', '#ff3a8a']);
  g.fillRect(250, 140, 140, 130);
  g.fillStyle = '#4a1260';
  for (let k = 0; k < 7; k++) g.fillRect(250, 206 + k * 9, 140, 2 + k);
  g.restore();
  const stars = [];
  for (let i = 0; i < 80; i++) {
    stars.push([Math.floor(rr() * 640), Math.floor(rr() * 140), rr()]);
    g.fillStyle = '#ffd8ff';
    g.fillRect(stars[i][0], stars[i][1], 1, 1);
  }
  g = L.far.getContext('2d');
  for (let x = 0; x < FARW;) {
    const w = 22 + rr() * 34,
      h = 60 + rr() * 110;
    g.fillStyle = '#120626';
    g.fillRect(x, 250 - h, w, h + 40);
    g.fillStyle = '#ff4ad8';
    g.fillRect(x, 250 - h, w, 2);
    for (let wy = 256 - h; wy < 244; wy += 8)
      for (let wx = x + 3; wx < x + w - 3; wx += 6)
        if (rr() > 0.68) {
          g.fillStyle = rr() > 0.5 ? '#4af0ff' : '#ff6ad5';
          g.fillRect(wx, wy, 2, 4);
        }
    x += w + 2;
  }
  g = L.mid.getContext('2d');
  const signs = [];
  for (let i = 0; i < 5; i++) {
    const x = 20 + i * 170;
    g.fillStyle = lg(g, x, 0, x + 110, 0, ['#22103e', '#160a2c']);
    g.fillRect(x, 140, 110, 140);
    g.fillStyle = '#4af0ff';
    g.fillRect(x, 140, 110, 2);
    signs.push([x + 10, 154, i]);
    for (let wy = 190; wy < 272; wy += 14)
      for (let wx = x + 8; wx < x + 100; wx += 16) {
        g.fillStyle = rr() > 0.5 ? '#3a1a60' : '#6a2a90';
        g.fillRect(wx, wy, 10, 8);
      }
  }
  g = L.floor.getContext('2d');
  g.fillStyle = lg(g, 0, GY, 0, SH2, ['#1a0830', '#0e0420']);
  g.fillRect(0, GY, FW, 88);
  for (let y = GY, k = 0; y < SH2; k++) {
    g.fillStyle = '#ff3ad0';
    g.fillRect(0, y, FW, 1);
    y += 3 + k * 1.6;
  }
  for (let x = -600; x < FW + 600; x += 48) {
    g.strokeStyle = '#4af0ff';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(480 + (x - 480) * 0.4, GY);
    g.lineTo(480 + (x - 480) * 2.4, SH2);
    g.stroke();
  }
  g.fillStyle = lg(g, 0, GY, 0, GY + 40, ['rgba(255,90,160,.35)', 'rgba(255,90,160,0)']);
  g.fillRect(0, GY, FW, 40);
  return finish(L, {
    name: 'NEON CITTÀ',
    music: 'cyber',
    back(c, cam, t) {
      HDC(c, (c) => {
        for (const [sx, sy, ph] of stars)
          if (Math.sin(t / 18 + ph * 40) > 0.9) {
            c.fillStyle = '#ffffff';
            c.fillRect(sx - 2, sy, 5, 1);
            c.fillRect(sx, sy - 2, 1, 5);
          }
      });
    },
    midA(c, cam, t) {
      HDC(c, (c) => {
        const ox = -Math.round(cam * 1.2);
        c.font = '16px ' + FONT;
        c.textBaseline = 'top';
        const words = ['MEME', 'ROTT', 'CAOS', 'RIZZ', 'SIGMA'];
        for (const [x, y, i] of signs) {
          const on = ((t >> 3) + i) % 13 !== 0,
            col = i % 2 ? '#4af0ff' : '#ff6ad5';
          if (on) {
            c.shadowColor = col;
            c.shadowBlur = 10;
          }
          c.fillStyle = on ? col : '#2a1a40';
          c.fillText(words[i], x + ox, y);
          c.shadowBlur = 0;
        }
        c.fillStyle = 'rgba(120,200,255,.35)';
        for (let i = 0; i < 40; i++) {
          const x = (i * 53 + t * 3) % 660,
            y = (i * 97 + t * 9) % 360;
          c.fillRect(Math.round(x), Math.round(y), 1, 8);
        }
      });
    },
  });
}

export { hCyber };
