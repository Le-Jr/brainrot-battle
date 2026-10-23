/* Fighter definition: stats, special, quotes and the procedural fallback drawing. */
import { OUTC, P, arm, ell, eye, limbs, pal, poly, px, rig } from '../../sprites/primitives.js';

const chimp = {
  id: 'chimp',
  name: ['CHIMPANZINI', 'BANANINI'],
  short: 'CHIMPANZINI',
  voice: 'Chimpanzini Bananini!',
  col: '#ffd23f',
  stage: 8,
  sp: 'banana',
  spName: 'BANANARANGUE',
  st: { spd: 1.9, pow: 0.9, def: 0.95, reach: 0.9 },
  hurt: { w: 28, h: 60 },
  quote: 'Bananini per tutti! Tranne che per te.',
  shout: 'BANANINI!',
  call: 'Bananini!',
  draw(p) {
    const r = rig(p, 16, 16, 5),
      BR = '#6b4428',
      FC = '#e2b48a',
      YL = '#ffd23f',
      py = pal(YL);
    limbs([r.hip, r.kB, r.fB], 4, BR);
    ell(r.fB[0] + 1, r.fB[1] - 1, 3, 1, FC);
    arm(r, 0, 3, BR, -7);
    ell(r.hB[0], r.hB[1], 2, 2, FC);
    const cx = r.sh[0] - 1,
      cy = r.hip[1] - 11,
      top = cy - 12;
    ell(cx, cy, 10, 13, YL);
    P(cx - 1, cy + 13, 3, 2, '#5a3a1a');
    for (let y = cy - 8; y < cy + 10; y++) {
      px(cx - 4, y, py.s);
      px(cx + 4, y, py.h);
    }
    poly(
      [
        [cx - 9, top + 1],
        [cx - 17, top + 11],
        [cx - 12, top + 13],
        [cx - 5, top + 4],
      ],
      YL,
    );
    poly(
      [
        [cx + 5, top + 3],
        [cx + 14, top + 10],
        [cx + 11, top + 13],
        [cx + 2, top + 5],
      ],
      YL,
    );
    ell(cx - 8, top - 6, 3, 3, BR);
    ell(cx + 1, top - 7, 9, 8, BR);
    ell(cx + 3, top - 5, 6, 5, FC);
    eye(cx + 1, top - 8, 1);
    eye(cx + 6, top - 8, 1);
    px(cx + 4, top - 4, OUTC);
    px(cx + 6, top - 4, OUTC);
    P(cx + 2, top - 2, 5, 1, OUTC);
    poly(
      [
        [cx - 3, top + 3],
        [cx + 1, top + 12],
        [cx + 4, top + 3],
      ],
      '#ffe066',
    );
    limbs([r.hip, r.kF, r.fF], 4, BR);
    ell(r.fF[0] + 1, r.fF[1] - 1, 3, 1, FC);
    arm(r, 1, 3, BR, 7);
    ell(r.hF[0], r.hF[1], 3, 2, FC);
  },
};

export { chimp };
