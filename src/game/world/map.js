/* Brainrotália world map: generated once (land, biomes, coast, landmarks) and the location table. */
import { H, W } from '../config.js';
import { R, ctx, fe, mk } from '../core/canvas.js';
import { BAYER, hex2rgb } from '../core/color.js';
import { hsh, vn } from '../core/math.js';
import { pip } from '../sprites/primitives.js';

/* ---------- Brainrotália world map ---------- */
const LOC = [
  { x: 212, y: 128, n: 'SPIAGGIA TRALALÀ', say: 'Spiaggia Tralalà' },
  { x: 136, y: 74, n: 'PIAZZA PIZZAIOLA', say: 'Piazza Pizzaiola' },
  { x: 204, y: 60, n: 'SELVA PATAPIM', say: 'Selva Patapim' },
  { x: 80, y: 108, n: 'DESERTO TIC-TAC', say: 'Deserto Tic-Tac' },
  { x: 122, y: 104, n: 'CAFFÈ ASSASSINO', say: 'Caffè Assassino' },
  { x: 66, y: 56, n: 'VILLAGGIO SAHUR', say: 'Villaggio Sahur' },
  { x: 110, y: 32, n: 'CIELO BOMBARDIRO', say: 'Cielo Bombardiro' },
  { x: 164, y: 48, n: 'TEATRO CAPPUCCINA', say: 'Teatro Cappuccina' },
  { x: 280, y: 120, n: 'ISOLA BANANINI', say: 'Isola Bananini' },
  { x: 286, y: 44, n: 'ANELLI DI SATURNO', say: 'Os anéis de Saturno' },
  { x: 176, y: 90, n: 'STRADA DEL NONNO', say: 'Strada del Nonno' },
];
const MAINLAND = [
  [46, 52],
  [60, 40],
  [86, 36],
  [112, 40],
  [140, 36],
  [170, 30],
  [204, 34],
  [226, 46],
  [234, 66],
  [224, 84],
  [208, 92],
  [214, 106],
  [228, 122],
  [222, 136],
  [204, 134],
  [190, 118],
  [176, 106],
  [158, 114],
  [140, 124],
  [110, 128],
  [84, 124],
  [60, 114],
  [46, 96],
  [38, 74],
];
const ISLES = [
  [
    [262, 112],
    [272, 108],
    [284, 110],
    [296, 116],
    [300, 124],
    [294, 126],
    [284, 122],
    [272, 120],
    [264, 120],
  ],
  [
    [18, 120],
    [28, 116],
    [34, 124],
    [26, 130],
    [18, 128],
  ],
  [
    [250, 140],
    [258, 138],
    [262, 144],
    [254, 148],
  ],
];
const BIOME = [
  { x: 204, y: 60, r: 24, c: ['#2e7a3a', '#246a30'] },
  { x: 80, y: 108, r: 22, c: ['#e8c27a', '#d8aa62'] },
  { x: 66, y: 56, r: 18, c: ['#5a8a3a', '#4e7a32'] },
  { x: 136, y: 74, r: 14, c: ['#c8a070', '#b88e60'] },
  { x: 164, y: 48, r: 12, c: ['#6a9a5a', '#5a8a4a'] },
  { x: 122, y: 104, r: 12, c: ['#8a6a44', '#7a5a3a'] },
];
let MAPC = null,
  MAPW = [];
/** Illustrated map (assets/stage-art/map), when present. */
let MAP_ART = null;
/** Where each location sits on the illustrated map (same order as LOC). */
const LOC_ART = [
  [220, 124],
  [133, 77],
  [186, 62],
  [96, 104],
  [141, 108],
  [72, 47],
  [124, 30],
  [144, 49],
  [288, 95],
  [288, 38],
  [171, 95],
];
/** Spots of the animated decorations (null = drawn by the art itself). */
const DECOR = {
  fin: [212, 140],
  plane: [110, 26],
  clock: [81, 96],
  steam: [121, 100],
  logs: [56, 66],
  spots: [164, 44],
};
/** Switch the travel map to the illustrated art: move the locations and decorations, re-seed the water sparkles. */
function useMapArt(img) {
  MAP_ART = img;
  LOC_ART.forEach(([x, y], i) => Object.assign(LOC[i], { x, y }));
  Object.assign(DECOR, {
    fin: [246, 140],
    plane: [124, 22],
    clock: null,
    steam: null,
    logs: null,
    spots: [144, 44],
  });
  const c = mk(W, H),
    g = c.getContext('2d');
  g.drawImage(img, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data;
  MAPW.length = 0;
  for (let i = 0; i < W * H; i++) {
    const r = d[i * 4],
      gg = d[i * 4 + 1],
      b = d[i * 4 + 2],
      y = (i / W) | 0;
    // open ocean only (blue, not the turquoise shallows), away from the HUD bars
    if (b > r + 60 && b > gg + 30 && y > 18 && y < 144 && hsh(i * 0.37) > 0.985)
      MAPW.push([i % W, y, hsh(i) * 6.28]);
  }
}
function getMap() {
  if (MAP_ART) return MAP_ART;
  if (MAPC) return MAPC;
  const c = mk(W, H),
    g = c.getContext('2d'),
    id = g.createImageData(W, H),
    d = id.data,
    land = new Uint8Array(W * H),
    dist = new Uint8Array(W * H).fill(99);
  const polys = [MAINLAND, ...ISLES],
    q = [];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (polys.some((p) => pip(p, x + 0.5, y + 0.5))) {
        land[y * W + x] = 1;
        dist[y * W + x] = 0;
        q.push(y * W + x);
      }
    }
  for (let qi = 0; qi < q.length; qi++) {
    const i = q[qi],
      x = i % W,
      y = (i / W) | 0,
      dd = dist[i];
    if (dd >= 7) continue;
    for (const [a, b] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + a,
        ny = y + b;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx;
      if (dist[j] > dd + 1) {
        dist[j] = dd + 1;
        q.push(j);
      }
    }
  }
  const put = (i, h) => {
    const r = hex2rgb(h);
    d[i * 4] = r[0];
    d[i * 4 + 1] = r[1];
    d[i * 4 + 2] = r[2];
    d[i * 4 + 3] = 255;
  };
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x,
        th = (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
      if (land[i]) {
        let col = vn(x / 9 + y / 13) > 0.5 ? '#5aa84a' : '#4e9a42';
        if (vn(x / 5 + 3 + y / 7) * 0.6 > th * 0.9) col = '#62b452';
        let best = null,
          bd = 1e9;
        for (const b of BIOME) {
          const dd = Math.hypot(x - b.x, y - b.y) / b.r;
          if (dd < 1 && dd < bd) {
            bd = dd;
            best = b;
          }
        }
        if (best && (bd < 0.75 || (1 - bd) * 4 > th)) col = vn(x / 4 + y / 5) > 0.5 ? best.c[0] : best.c[1];
        let edge = false;
        for (const [a, b] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const j = (y + b) * W + x + a;
          if (!land[j]) edge = true;
        }
        if (edge) col = '#f0d898';
        else if (dist[i] === 0) {
          let near = false;
          for (const [a, b] of [
            [2, 0],
            [-2, 0],
            [0, 2],
            [0, -2],
          ]) {
            const j = (y + b) * W + x + a;
            if (j >= 0 && j < W * H && !land[j]) near = true;
          }
          if (near && y > 100) col = '#e8cc88';
        }
        put(i, col);
      } else {
        const dd = dist[i];
        let col = y / H + vn(x / 30 + y / 40) * 0.3 > 0.7 ? '#163e86' : '#1a4a96';
        if (dd <= 1) col = '#bfe8ff';
        else if (dd <= 3) col = th < 0.5 ? '#4a9ad8' : '#3a86cc';
        else if (dd <= 6 && th < (7 - dd) / 5) col = '#2a6ab4';
        put(i, col);
        if (dd > 4 && hsh(i * 0.37) > 0.985) MAPW.push([x, y, hsh(i) * 6.28]);
      }
    }
  g.putImageData(id, 0, 0);
  for (const [x, y, h] of [
    [98, 64, 10],
    [106, 60, 13],
    [114, 66, 9],
    [92, 70, 7],
    [120, 72, 8],
    [180, 40, 7],
    [188, 44, 6],
  ]) {
    for (let k = 0; k < h; k++) {
      R(g, x - k, y - h + k, k * 2 + 1, 1, k < 3 ? '#f4f8ff' : k < h * 0.6 ? '#8a7a6a' : '#6e5e50');
      R(g, x, y - h + k, k + 1, 1, k < 3 ? '#d8e0f0' : '#5a4a40');
    }
  }
  for (let i = 0; i < 46; i++) {
    const a = hsh(i + 300) * 6.28,
      r = hsh(i + 301) * 20,
      x = Math.round(204 + Math.cos(a) * r),
      y = Math.round(60 + Math.sin(a) * r * 0.8);
    if (!land[y * W + x]) continue;
    fe(g, x, y, 2, 2, '#1e5a2a');
    R(g, x - 1, y - 2, 2, 1, '#3fa34a');
  }
  for (let i = 0; i < 7; i++) {
    const x = 58 + (i % 4) * 7,
      y = 50 + Math.floor(i / 4) * 9;
    R(g, x, y, 5, 4, '#8a5a30');
    R(g, x - 1, y - 2, 7, 2, '#c86a40');
  }
  for (let i = 0; i < 12; i++) {
    const x = 128 + (i % 4) * 5,
      y = 68 + Math.floor(i / 4) * 5;
    R(g, x, y, 4, 4, ['#e8b070', '#f2d0a0', '#d89060'][i % 3]);
    R(g, x, y, 4, 1, '#c84a30');
  }
  R(g, 135, 60, 3, 8, '#d8c8a0');
  R(g, 134, 58, 5, 2, '#c84a30');
  fe(g, 122, 104, 9, 6, '#f4f0e8');
  fe(g, 122, 104, 7, 4, '#6a3a1a');
  fe(g, 121, 103, 4, 2, '#8a5a30');
  R(g, 131, 102, 3, 5, '#f4f0e8');
  R(g, 132, 103, 1, 3, '#5aa84a');
  fe(g, 164, 46, 6, 4, '#d8343f');
  R(g, 158, 46, 13, 5, '#f2e0c8');
  R(g, 163, 47, 3, 4, '#5a2a2a');
  for (let k = 0; k < 4; k++) R(g, 66 + k * 6, 104 + (k % 2) * 2, 5, 1, '#c8964a');
  R(g, 79, 96, 4, 10, '#a87a4a');
  fe(g, 81, 96, 4, 4, '#f4ecd8');
  for (let i = 0; i < 80; i++) {
    const t = i / 80,
      x = Math.round(136 + (212 - 136) * t + Math.sin(t * 9) * 6),
      y = Math.round(74 + (128 - 74) * t);
    if (i % 3 === 0 && land[y * W + x]) R(g, x, y, 1, 1, '#f2e2b0');
  }
  for (let i = 0; i < 60; i++) {
    const t = i / 60,
      x = Math.round(66 + (136 - 66) * t),
      y = Math.round(56 + (74 - 56) * t + Math.sin(t * 7) * 4);
    if (i % 3 === 0) R(g, x, y, 1, 1, '#f2e2b0');
  }
  for (let i = 0; i < 60; i++) {
    const t = i / 60,
      x = Math.round(80 + (122 - 80) * t),
      y = Math.round(108 - 4 * Math.sin(t * 3.1));
    if (i % 3 === 0) R(g, x, y, 1, 1, '#f2e2b0');
  }
  R(g, 282, 104, 1, 10, '#7a5a3a');
  for (const [a, b] of [
    [-4, -1],
    [4, -1],
    [-3, 1],
    [3, 1],
  ])
    R(g, 282 + a, 104 + b, Math.abs(a), 1, '#2e8a3a');
  MAPC = c;
  return c;
}
function minePlane(x, y, d, t) {
  x = Math.round(x);
  y = Math.round(y);
  const Q = (a, b, w, h, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(d > 0 ? x + a : x - a - w + 1, y + b, w, h);
  };
  Q(-9, -2, 18, 5, '#120a1c');
  Q(-8, -1, 16, 3, '#7d8a6a');
  Q(6, -2, 5, 4, '#120a1c');
  Q(6, -1, 4, 2, '#4f9d3a');
  Q(9, -1, 1, 1, '#ffd23a');
  Q(-3, -6, 6, 12, '#120a1c');
  Q(-2, -5, 4, 10, '#9aa682');
  Q(-11, -1, 3, 2, (t >> 1) & 1 ? '#ffd23a' : '#ff8a3a');
}

export { DECOR, LOC, MAPW, getMap, minePlane, useMapArt };
