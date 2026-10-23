/* Fighter definition: stats, special, quotes and the procedural fallback drawing. */
import { OUTC, P, arm, ell, eye, limbs, pal, poly, px, rbox, rig } from '../../sprites/primitives.js';

const tralalero = {
  id: 'tralalero',
  name: ['TRALALERO', 'TRALALA'],
  short: 'TRALALERO',
  voice: 'Tralalero Tralalà!',
  col: '#3f86e0',
  stage: 0,
  sp: 'wave',
  spName: 'ONDA TRALALA',
  st: { spd: 1.7, pow: 1, def: 1, reach: 1 },
  hurt: { w: 40, h: 50 },
  quote: 'Tralalero tralala! Le mie scarpe corrono piu veloci di te.',
  shout: 'TRALALA!',
  call: 'Onda Tralalà!',
  draw(p) {
    const r = rig(p, 20, 16, 5),
      B = '#3f86e0',
      BL = '#eef4ff',
      ps = pal(B);
    const cx = r.hip[0] + Math.round(r.lean * 0.6),
      cy = r.hip[1] - 14;
    const shoe = (f) => {
      rbox(f[0] - 3, f[1] - 4, 9, 4, '#f4f6fb');
      P(f[0] - 1, f[1] - 3, 5, 1, '#e8343f');
      P(f[0] - 3, f[1] - 1, 9, 1, '#b8bfd0');
    };
    poly(
      [
        [cx - 8, cy + 6],
        [cx - 22, cy - 6],
        [cx - 17, cy + 8],
        [cx - 23, cy + 20],
        [cx - 8, cy + 12],
      ],
      B,
    );
    limbs([r.hip, r.kB, r.fB], 4, B);
    shoe(r.fB);
    const fM = [Math.round((r.fF[0] + r.fB[0]) / 2) - 1, Math.max(r.fF[1], r.fB[1])];
    if (p.pose === 'walk') fM[0] += Math.round(Math.sin(r.ph + 1.6) * 4);
    if (p.pose.includes('kick')) fM[1] = 0;
    limbs(
      [
        [r.hip[0] - 1, r.hip[1]],
        [Math.round((r.hip[0] + fM[0]) / 2) + 2, Math.round((r.hip[1] + fM[1]) / 2)],
        fM,
      ],
      4,
      B,
    );
    shoe(fM);
    arm(r, 0, 4, B, -6);
    ell(r.hB[0], r.hB[1], 2, 2, B);
    ell(cx, cy, 12, 16, B);
    ell(cx + 4, cy + 4, 7, 10, BL, false);
    poly(
      [
        [cx - 7, cy - 11],
        [cx - 3, cy - 27],
        [cx + 4, cy - 13],
      ],
      B,
    );
    ell(cx + 8, cy - 10, 9, 6, B);
    ell(cx + 9, cy - 6, 7, 3, BL, false);
    P(cx + 3, cy - 7, 13, 1, OUTC);
    for (let i = 0; i < 6; i++) {
      px(cx + 4 + i * 2, cy - 6, '#ffffff');
      px(cx + 5 + i * 2, cy - 8, '#ffffff');
    }
    eye(cx + 8, cy - 14, 1);
    for (let i = 0; i < 3; i++) P(cx - 1 + i * 2, cy - 3, 1, 4, ps.ss);
    limbs([r.hip, r.kF, r.fF], 4, B);
    shoe(r.fF);
    arm(r, 1, 4, B, 4);
    ell(r.hF[0], r.hF[1], 3, 3, B);
  },
};

export { tralalero };
