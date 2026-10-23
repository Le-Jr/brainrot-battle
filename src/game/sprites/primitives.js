/* Procedural pixel-art primitives and the pose rig used by the cars and the fallback character drawings. */
import { shade } from '../core/color.js';

const SW = 128,
  SH = 104,
  OX = 64,
  OY = 100,
  OUTC = '#1b1024';
/** Canvas the procedural primitives draw into (set by sprite() while a draw(p) runs). */
let G = null;
const setTarget = (g) => {
  G = g;
};
const PALC = new Map();
function pal(h) {
  let p = PALC.get(h);
  if (!p) {
    p = { b: h, h: shade(h, 0.28), hh: shade(h, 0.55), s: shade(h, -0.3), ss: shade(h, -0.55) };
    PALC.set(h, p);
  }
  return p;
}
function px(x, y, c) {
  G.fillStyle = c;
  G.fillRect(OX + Math.round(x), OY + Math.round(y), 1, 1);
}
function P(x, y, w, h, c) {
  G.fillStyle = c;
  G.fillRect(OX + Math.round(x), OY + Math.round(y), w, h);
}
function spanEll(cx, cy, rx, ry, c) {
  G.fillStyle = c;
  cx = Math.round(cx);
  cy = Math.round(cy);
  for (let y = -ry; y <= ry; y++) {
    const k = 1 - (y / (ry + 0.5)) ** 2;
    if (k < 0) continue;
    const hw = Math.floor((rx + 0.5) * Math.sqrt(k));
    G.fillRect(OX + cx - hw, OY + cy + y, hw * 2 + 1, 1);
  }
}
function ell(cx, cy, rx, ry, h, ol = true) {
  cx = Math.round(cx);
  cy = Math.round(cy);
  if (ol) spanEll(cx, cy, rx + 1, ry + 1, OUTC);
  const p = pal(h);
  for (let y = -ry; y <= ry; y++) {
    const k = 1 - (y / (ry + 0.5)) ** 2;
    if (k < 0) continue;
    const hw = Math.floor((rx + 0.5) * Math.sqrt(k));
    for (let x = -hw; x <= hw; x++) {
      const nx = x / (rx + 0.5),
        ny = y / (ry + 0.5),
        l = -(nx * 0.6 + ny * 0.8),
        d = ((cx + x + cy + y) & 1) === 0;
      let c = p.b;
      if (l > 0.62) c = p.hh;
      else if (l > 0.44) c = d ? p.hh : p.h;
      else if (l > 0.24) c = p.h;
      else if (l > 0.12) c = d ? p.h : p.b;
      else if (l < -0.64) c = p.ss;
      else if (l < -0.46) c = d ? p.ss : p.s;
      else if (l < -0.26) c = p.s;
      else if (l < -0.15) c = d ? p.s : p.b;
      // rim light on the back-lower edge for a modern 32-bit feel
      if (nx * nx + ny * ny > 0.78 && nx > 0.35 && ny > -0.2) c = p.h;
      G.fillStyle = c;
      G.fillRect(OX + cx + x, OY + cy + y, 1, 1);
    }
  }
}
function rbox(x, y, w, h, c, ol = true) {
  x = Math.round(x);
  y = Math.round(y);
  const p = pal(c);
  if (ol) {
    G.fillStyle = OUTC;
    G.fillRect(OX + x - 1, OY + y, w + 2, h);
    G.fillRect(OX + x, OY + y - 1, w, h + 2);
  }
  G.fillStyle = p.b;
  G.fillRect(OX + x, OY + y, w, h);
  G.fillStyle = p.h;
  G.fillRect(OX + x, OY + y, w, Math.min(2, h));
  G.fillRect(OX + x, OY + y, 1, h);
  G.fillStyle = p.hh;
  G.fillRect(OX + x + 1, OY + y, Math.max(0, w - 3), 1);
  G.fillStyle = p.s;
  G.fillRect(OX + x + w - 2, OY + y + 1, 2, h - 1);
  G.fillRect(OX + x, OY + y + h - 2, w, 2);
  G.fillStyle = p.ss;
  G.fillRect(OX + x + w - 1, OY + y + 2, 1, h - 2);
}
function limbs(pts, th, c) {
  const r = Math.max(1, Math.floor(th / 2)),
    p = pal(c),
    seg = [];
  for (let j = 0; j < pts.length - 1; j++) {
    const a = pts[j],
      b = pts[j + 1],
      dx = b[0] - a[0],
      dy = b[1] - a[1],
      n = Math.max(1, Math.ceil(Math.hypot(dx, dy)));
    for (let i = 0; i <= n; i++) seg.push([Math.round(a[0] + (dx * i) / n), Math.round(a[1] + (dy * i) / n)]);
  }
  for (const s of seg) spanEll(s[0], s[1], r + 1, r + 1, OUTC);
  for (const s of seg) spanEll(s[0], s[1], r, r, p.b);
  for (const s of seg) {
    G.fillStyle = p.h;
    G.fillRect(OX + s[0] - (r > 1 ? 1 : 0), OY + s[1] - r, 1, 1);
    G.fillStyle = p.s;
    G.fillRect(OX + s[0] + (r > 1 ? 1 : 0), OY + s[1] + r, 1, 1);
  }
}
function pip(pts, x, y) {
  let ins = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0],
      yi = pts[i][1],
      xj = pts[j][0],
      yj = pts[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}
function poly(pts, c, ol = true) {
  let x0 = 1e9,
    y0 = 1e9,
    x1 = -1e9,
    y1 = -1e9;
  for (const [x, y] of pts) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  x0 = Math.floor(x0) - 1;
  y0 = Math.floor(y0) - 1;
  x1 = Math.ceil(x1) + 1;
  y1 = Math.ceil(y1) + 1;
  const w = x1 - x0 + 1,
    h = y1 - y0 + 1;
  const m = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) m[y * w + x] = pip(pts, x0 + x + 0.5, y0 + y + 0.5) ? 1 : 0;
  const at = (x, y) => x >= 0 && y >= 0 && x < w && y < h && m[y * w + x];
  if (ol) {
    G.fillStyle = OUTC;
    for (let y = -1; y <= h; y++)
      for (let x = -1; x <= w; x++)
        if (!at(x, y) && (at(x + 1, y) || at(x - 1, y) || at(x, y + 1) || at(x, y - 1)))
          G.fillRect(OX + x0 + x, OY + y0 + y, 1, 1);
  }
  const p = pal(c);
  for (let y = 0; y < h; y++) {
    const t = y / Math.max(1, h - 1);
    for (let x = 0; x < w; x++)
      if (m[y * w + x]) {
        const d = ((x + y) & 1) === 0;
        let cc = p.b;
        if (t < 0.2) cc = p.h;
        else if (t < 0.3) cc = d ? p.h : p.b;
        else if (t > 0.82) cc = p.s;
        else if (t > 0.7) cc = d ? p.s : p.b;
        if (!at(x, y - 1)) cc = p.hh;
        G.fillStyle = cc;
        G.fillRect(OX + x0 + x, OY + y0 + y, 1, 1);
      }
  }
}
function eye(x, y, r) {
  x = Math.round(x);
  y = Math.round(y);
  if (r <= 1) {
    P(x - 1, y - 1, 4, 4, OUTC);
    P(x, y, 2, 2, '#ffffff');
    px(x + 1, y + 1, '#140c1c');
    return;
  }
  spanEll(x, y, r + 1, r + 2, OUTC);
  spanEll(x, y, r, r + 1, '#ffffff');
  P(x, y - 1, 2, 3, '#140c1c');
  px(x, y - 1, '#ffffff');
}
// pose rig: returns joint positions (facing right, origin at feet)
function rig(p, H, T, sw = 5) {
  const ph = (p.f * Math.PI) / 4,
    a = p.a || 0,
    CR = Math.round(H * 0.55);
  let hy = -H,
    lean = 0,
    bob = 0,
    fF = [sw, 0],
    fB = [-sw, 0],
    hF = [7, 7],
    hB = [-5, 8],
    bend = 3,
    kick = false;
  switch (p.pose) {
    case 'idle':
      bob = Math.round(Math.sin(ph));
      break;
    case 'walk':
      fF = [sw + Math.round(Math.sin(ph) * 5), -Math.round(Math.max(0, Math.cos(ph)) * 3)];
      fB = [-sw - Math.round(Math.sin(ph) * 5), -Math.round(Math.max(0, -Math.cos(ph)) * 3)];
      bob = -Math.round(Math.abs(Math.sin(ph)));
      hF = [6 - Math.round(Math.sin(ph) * 3), 8];
      hB = [-4 + Math.round(Math.sin(ph) * 3), 8];
      break;
    case 'crouch':
      hy = -CR;
      fF = [sw + 3, 0];
      fB = [-sw - 3, 0];
      hF = [8, 3];
      hB = [4, 5];
      bend = 7;
      break;
    case 'cblock':
      hy = -CR;
      fF = [sw + 3, 0];
      fB = [-sw - 3, 0];
      hF = [7, -1];
      hB = [5, 2];
      bend = 7;
      break;
    case 'block':
      hF = [7, -1];
      hB = [5, 2];
      lean = -1;
      break;
    case 'punch':
      lean = 2;
      hF = [6 + Math.round(14 * a), 2];
      hB = [-3, 6];
      fF = [sw + 2, 0];
      break;
    case 'cpunch':
      hy = -CR;
      lean = 2;
      hF = [6 + Math.round(14 * a), 3];
      hB = [3, 5];
      fF = [sw + 3, 0];
      fB = [-sw - 3, 0];
      bend = 7;
      break;
    case 'kick':
      lean = -3;
      fF = [sw + Math.round(16 * a), -Math.round(H * 0.95 * a)];
      hF = [4, 4];
      hB = [-6, 5];
      kick = true;
      break;
    case 'ckick':
      hy = -CR;
      fF = [sw + Math.round(18 * a), 0];
      fB = [-sw - 4, 0];
      hF = [6, 4];
      hB = [-4, 4];
      lean = -2;
      bend = 7;
      kick = true;
      break;
    case 'jump':
      fF = [5, -Math.round(H * 0.45)];
      fB = [-3, -Math.round(H * 0.3)];
      hF = [7, 2];
      hB = [-6, 4];
      break;
    case 'jpunch':
      fF = [5, -Math.round(H * 0.45)];
      fB = [-3, -Math.round(H * 0.3)];
      hF = [6 + Math.round(14 * a), 4];
      hB = [-4, 5];
      lean = 2;
      break;
    case 'jkick':
      fF = [sw + Math.round(16 * a), -Math.round(H * 0.3)];
      fB = [-3, -Math.round(H * 0.35)];
      hF = [4, 3];
      hB = [-6, 3];
      lean = -2;
      kick = true;
      break;
    case 'special':
      lean = 2;
      hF = [16, 2];
      hB = [13, 5];
      fF = [sw + 4, 0];
      fB = [-sw - 2, 0];
      break;
    case 'hit':
    case 'down':
      lean = -4;
      hF = [-2, -4];
      hB = [-8, -2];
      fB = [-sw - 2, 0];
      break;
    case 'win':
      bob = Math.round(Math.sin(ph));
      hF = [5, -13];
      hB = [-6, -13];
      break;
  }
  const hip = [0, hy + bob],
    sh = [lean, hy + bob - T];
  const knee = (f, isF) => [
    Math.round((hip[0] + f[0]) / 2 + (isF && kick ? 0 : bend)),
    Math.round((hip[1] + f[1]) / 2),
  ];
  return {
    hip,
    sh,
    fF,
    fB,
    kF: knee(fF, true),
    kB: knee(fB, false),
    hF: [sh[0] + hF[0], sh[1] + hF[1]],
    hB: [sh[0] + hB[0], sh[1] + hB[1]],
    lean,
    bob,
    ph,
    a,
  };
}
function arm(r, which, th, c, sx) {
  const h = which ? r.hF : r.hB;
  const s = [r.sh[0] + sx, r.sh[1] + 2];
  const e = [Math.round((s[0] + h[0]) / 2) - 1, Math.round((s[1] + h[1]) / 2) + 2];
  limbs([s, e, h], th, c);
}
function blade(h, ang, L, w1, w2, c) {
  const dx = Math.cos(ang),
    dy = Math.sin(ang),
    nx = -dy,
    ny = dx;
  const b = [h[0] - dx * 3, h[1] - dy * 3],
    e = [h[0] + dx * L, h[1] + dy * L];
  poly(
    [
      [b[0] + nx * w1, b[1] + ny * w1],
      [e[0] + nx * w2, e[1] + ny * w2],
      [e[0] - nx * w2, e[1] - ny * w2],
      [b[0] - nx * w1, b[1] - ny * w1],
    ],
    c,
  );
}

export {
  OUTC,
  OX,
  OY,
  P,
  SH,
  SW,
  arm,
  blade,
  ell,
  eye,
  limbs,
  pal,
  pip,
  poly,
  px,
  rbox,
  rig,
  setTarget,
  spanEll,
};
