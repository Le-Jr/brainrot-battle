/* Fighter definition: stats, special, quotes and the procedural fallback drawing. */
import { OUTC, P, arm, ell, limbs, pal, px, rbox, rig } from '../../sprites/primitives.js';

const ballerina = {
  id: 'ballerina',
  name: ['BALLERINA', 'CAPPUCCINA'],
  short: 'BALLERINA',
  voice: 'Ballerina Cappuccina!',
  col: '#ff7ab8',
  stage: 7,
  sp: 'spin',
  spName: 'PIRUETA',
  st: { spd: 2, pow: 0.85, def: 0.9, reach: 1 },
  hurt: { w: 24, h: 60 },
  quote: 'Un passo di danza e sei a terra. Che eleganza!',
  shout: 'MIMIMI!',
  call: 'Pirouette!',
  draw(p) {
    const r = rig(p, 24, 14, 3),
      SK = '#f4c8a4',
      PK = '#ff7ab8',
      TU = '#ff9fd2',
      CUP = '#f7f3ee';
    if (p.pose === 'idle') r.hB = [r.sh[0] - 6, r.sh[1] - 10];
    if (p.pose === 'special') {
      r.hF = [r.sh[0] + 10, r.sh[1] - 9];
      r.hB = [r.sh[0] - 9, r.sh[1] - 9];
      r.fB = [r.hip[0] + 2, r.hip[1] + 11];
      r.kB = [r.hip[0] - 4, r.hip[1] + 6];
      r.fF = [1, 0];
      r.kF = [1, Math.round(r.hip[1] / 2)];
    }
    const shoe = (f) => ell(f[0] + 1, f[1] - 1, 2, 1, '#ff5aa0');
    limbs([r.hip, r.kB, r.fB], 3, SK);
    shoe(r.fB);
    arm(r, 0, 2, SK, -3);
    const tx = r.hip[0] + Math.round(r.lean * 0.5);
    rbox(r.sh[0] - 4, r.sh[1], 9, Math.max(4, r.hip[1] - r.sh[1]), PK);
    ell(tx, r.hip[1] - 1, 13, 4, TU);
    for (let i = -12; i <= 12; i += 3) px(tx + i, r.hip[1] + 2, pal(TU).hh);
    for (let i = -10; i <= 10; i += 4) px(tx + i, r.hip[1] - 3, pal(TU).s);
    P(r.sh[0] - 1, r.sh[1] - 2, 3, 2, SK);
    const hx = r.sh[0] + 1,
      hy = r.sh[1] - 14;
    ell(hx - 9, hy + 6, 3, 3, CUP);
    P(hx - 9, hy + 5, 1, 2, OUTC);
    rbox(hx - 7, hy, 14, 12, CUP);
    P(hx - 7, hy + 9, 14, 1, '#e79cc4');
    ell(hx, hy, 7, 2, '#c8874f');
    px(hx - 1, hy, '#fff3e0');
    px(hx + 1, hy, '#fff3e0');
    px(hx, hy + 1, '#fff3e0');
    P(hx - 2, hy + 4, 1, 2, OUTC);
    P(hx + 3, hy + 4, 1, 2, OUTC);
    px(hx - 3, hy + 3, OUTC);
    px(hx + 4, hy + 3, OUTC);
    px(hx - 3, hy + 7, '#ff9fb0');
    px(hx + 4, hy + 7, '#ff9fb0');
    P(hx, hy + 7, 2, 1, '#c0405a');
    const sp = p.f % 4;
    for (let i = 0; i < 3; i++) {
      px(hx - 3 + i * 3 + ((i + sp) % 2), hy - 4 - (i % 2), 'rgba(255,255,255,.75)');
      px(hx - 3 + i * 3 + ((i + sp + 1) % 2), hy - 6 - (i % 2), 'rgba(255,255,255,.45)');
    }
    limbs([r.hip, r.kF, r.fF], 3, SK);
    shoe(r.fF);
    arm(r, 1, 2, SK, 3);
  },
};

export { ballerina };
