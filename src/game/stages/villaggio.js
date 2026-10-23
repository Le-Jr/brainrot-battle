/* Stage painter (2x layers quantized to pixel art) with its animated hooks. */
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
  win,
} from './toolkit.js';

function hVillaggio() {
  setSeed(61);
  const L = layers();
  let g = L.sky.getContext('2d');
  g.fillStyle = lg(g, 0, 0, 0, 280, ['#050818', '#0e1438', '#1e2460', '#3a3274', '#5a3e7a']);
  g.fillRect(0, 0, 640, 280);
  const stars = [];
  for (let i = 0; i < 140; i++) {
    const s = [Math.floor(rr() * 640), Math.floor(rr() * 190), rr()];
    stars.push(s);
    g.fillStyle = s[2] > 0.85 ? '#ffffff' : '#a8b4ff';
    g.fillRect(s[0], s[1], 1, 1);
  }
  glow(g, 500, 70, 80, '#fff2c0', 0.35);
  g.fillStyle = '#fff6d0';
  g.beginPath();
  g.arc(500, 70, 24, 0, 7);
  g.fill();
  g.fillStyle = '#0e1438';
  g.beginPath();
  g.arc(511, 64, 22, 0, 7);
  g.fill();
  g = L.far.getContext('2d');
  ridge(g, FARW, 240, 40, 70, 13, '#161a40', '#10122e');
  g.fillStyle = '#141638';
  g.beginPath();
  g.arc(360, 186, 34, Math.PI, 0);
  g.fill();
  g.fillRect(326, 186, 68, 70);
  g.fillRect(358, 140, 4, 14);
  for (const x of [300, 420]) g.fillRect(x, 150, 10, 106);
  for (const x of [300, 420]) {
    g.beginPath();
    g.arc(x + 5, 150, 7, Math.PI, 0);
    g.fill();
  }
  for (const x of [338, 352, 366, 380]) ((g.fillStyle = '#ffcf6a'), g.fillRect(x, 206, 6, 10));
  for (const [x, h] of [
    [60, 90],
    [180, 110],
    [560, 100],
    [680, 80],
  ])
    palmHD(g, x, 262, h, x % 2 ? 1 : -1, ['#101230', '#121434', '#1a1c44'], '#101230', '#161a40');
  g = L.mid.getContext('2d');
  const lan = [];
  for (let i = 0; i < 5; i++) {
    const x = 16 + i * 168,
      w = 120,
      top = 170;
    for (let s = 0; s < 6; s++) {
      g.fillStyle = '#3a2416';
      g.fillRect(x + 6 + s * 22, top + 66, 6, 50);
    }
    g.fillStyle = lg(g, x, 0, x + w, 0, ['#7a4a2a', '#5a3418']);
    g.fillRect(x, top + 20, w, 50);
    for (let y = top + 22; y < top + 70; y += 6) {
      g.fillStyle = '#4a2a14';
      g.fillRect(x, y, w, 1);
    }
    g.fillStyle = '#9a6a3a';
    g.fillRect(x, top + 20, 3, 50);
    for (let k = 0; k < 26; k++) {
      g.fillStyle = k % 3 ? '#8a3a2a' : '#6e2a20';
      g.fillRect(x - 12 + k, top + 20 - k * 0.9, w + 24 - 2 * k, 2);
    }
    const lit = i % 2 === 0;
    win(g, x + 18, top + 32, 20, 20, lit, '#3a2014', '#1a1018');
    win(g, x + w - 38, top + 32, 20, 20, !lit, '#3a2014', '#1a1018');
    g.fillStyle = '#2a1a10';
    g.fillRect(x + w / 2 - 10, top + 40, 20, 30);
    lan.push([x + w + 20, top + 8]);
  }
  g.fillStyle = '#5a3a20';
  g.fillRect(392, 206, 48, 30);
  g.fillStyle = '#c8a070';
  g.beginPath();
  g.ellipse(392, 221, 6, 15, 0, 0, 7);
  g.fill();
  g.beginPath();
  g.ellipse(440, 221, 6, 15, 0, 0, 7);
  g.fill();
  g = L.floor.getContext('2d');
  g.fillStyle = lg(g, 0, GY, 0, SH2, ['#4a3428', '#3a281e', '#241812']);
  g.fillRect(0, GY, FW, 88);
  speck(g, 0, GY, FW, 88, 600, ['#5e4636', '#24170f', '#6a5240']);
  for (let x = 0; x < FW; x += 3) {
    const h = 2 + rr() * 7;
    g.fillStyle = rr() > 0.5 ? '#2a4a2a' : '#3a5a32';
    g.fillRect(x, GY + 2 - h, 2, h);
  }
  return finish(L, {
    name: 'VILLAGGIO',
    music: 'sahur',
    back(c, cam, t) {
      HDC(c, (c) => {
        for (const [sx, sy, ph] of stars)
          if (Math.sin(t / 24 + ph * 30) > 0.9) {
            c.fillStyle = '#ffffff';
            c.fillRect(sx - 2, sy, 5, 1);
            c.fillRect(sx, sy - 2, 1, 5);
          }
      });
    },
    midA(c, cam, t) {
      HDC(c, (c) => {
        const ox = -Math.round(cam * 1.2);
        lan.forEach(([lx, ly], i) => {
          const sw = Math.round(Math.sin(t / 30 + i) * 4),
            x = lx + ox + sw;
          c.fillStyle = `rgba(255,170,70,${(0.16 + Math.sin(t / 7 + i) * 0.04).toFixed(2)})`;
          c.beginPath();
          c.arc(x, ly + 10, 26, 0, 7);
          c.fill();
          c.fillStyle = '#1a1018';
          c.fillRect(lx + ox, ly - 20, 2, 18);
          c.fillStyle = '#e04a2a';
          c.fillRect(x - 6, ly, 13, 18);
          c.fillStyle = '#ffcf6a';
          c.fillRect(x - 4, ly + 4, 9, 10);
          c.fillStyle = '#8a2a1a';
          c.fillRect(x - 6, ly - 2, 13, 2);
          c.fillRect(x - 6, ly + 18, 13, 2);
        });
      });
    },
    front(c, cam, t) {
      HDC(c, (c) => {
        for (let i = 0; i < 14; i++)
          if (Math.sin(t / 9 + i * 2) > 0.2) {
            const x = Math.round(((i * 61 + t * 0.6) % 680) - 20),
              y = 190 + Math.round(Math.sin(t / 40 + i) * 40) + i * 6;
            c.fillStyle = 'rgba(216,255,122,.35)';
            c.fillRect(x - 2, y - 2, 5, 5);
            c.fillStyle = '#e8ff9a';
            c.fillRect(x, y, 2, 2);
          }
      });
    },
  });
}

export { hVillaggio };
