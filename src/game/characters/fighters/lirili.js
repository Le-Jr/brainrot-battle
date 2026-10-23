/* Fighter definition: stats, special, quotes and the procedural fallback drawing. */
import { hsh } from '../../core/math.js';
import { OUTC, P, arm, ell, eye, limbs, pal, px, rbox, rig, spanEll } from '../../sprites/primitives.js';

const lirili = {
  id: 'lirili',
  name: ['LIRILÌ', 'LARILÀ'],
  short: 'LIRILI',
  voice: 'Lirilì Larilà!',
  col: '#3f9e52',
  stage: 3,
  sp: 'clock',
  spName: 'RELOGIO',
  st: { spd: 1.2, pow: 1.2, def: 1.2, reach: 1.1 },
  hurt: { w: 32, h: 66 },
  quote: 'Il tempo e mio. Tu sei solo in ritardo.',
  shout: 'TIC TAC!',
  call: 'Tic tac, tempo!',
  draw(p) {
    const r = rig(p, 24, 18, 6),
      CG = '#3f9e52',
      EG = '#9ba6b2',
      SD = '#8a5a2e',
      pg = pal(CG);
    const sandal = (f) => {
      rbox(f[0] - 4, f[1] - 2, 10, 2, SD);
      P(f[0] - 1, f[1] - 5, 1, 3, SD);
      P(f[0] + 2, f[1] - 5, 1, 3, SD);
    };
    limbs([r.hip, r.kB, r.fB], 6, CG);
    sandal(r.fB);
    arm(r, 0, 5, CG, -9);
    const cx = r.sh[0],
      cy = r.sh[1] + 8;
    ell(cx, cy, 12, 15, CG);
    for (const i of [-6, -2, 2, 6]) for (let y = cy - 11; y < cy + 12; y++) if (y % 2) px(cx + i, y, pg.s);
    for (let k = 0; k < 9; k++)
      px(cx - 9 + Math.round(hsh(k) * 18), cy - 9 + Math.round(hsh(k + 5) * 18), '#f6f0c4');
    ell(cx - 6, cy - 15, 6, 8, '#8b96a2');
    ell(cx - 6, cy - 15, 3, 5, '#e8a0a8', false);
    ell(cx + 3, cy - 17, 10, 9, EG);
    limbs(
      [
        [cx + 10, cy - 14],
        [cx + 15, cy - 8],
        [cx + 16, cy - 1],
        [cx + 19, cy + 1],
      ],
      4,
      EG,
    );
    P(cx + 8, cy - 10, 3, 2, OUTC);
    P(cx + 8, cy - 10, 2, 1, '#ffffff');
    eye(cx + 5, cy - 21, 1);
    limbs([r.hip, r.kF, r.fF], 6, CG);
    sandal(r.fF);
    arm(r, 1, 5, CG, 9);
    ell(r.hF[0], r.hF[1], 5, 5, '#e8c050');
    spanEll(r.hF[0], r.hF[1], 3, 3, '#fffbe8');
    P(r.hF[0], r.hF[1] - 2, 1, 3, OUTC);
    P(r.hF[0], r.hF[1], 2, 1, OUTC);
    px(r.hF[0], r.hF[1] - 7, '#e8c050');
  },
};

export { lirili };
