/* Fighter definition: stats, special, quotes and the procedural fallback drawing. */
import { OUTC, P, arm, ell, eye, limbs, pal, px, rig } from '../../sprites/primitives.js';

const patapim = {
  id: 'patapim',
  name: ['BRR BRR', 'PATAPIM'],
  short: 'PATAPIM',
  voice: 'Brr brr Patapim!',
  col: '#6b9a3a',
  stage: 2,
  sp: 'quake',
  spName: 'TERREMOTO',
  st: { spd: 1.4, pow: 1.1, def: 1.05, reach: 1.15 },
  hurt: { w: 30, h: 62 },
  quote: 'Brr brr patapim! La foresta ha parlato.',
  shout: 'BRR BRR!',
  call: 'Brr brr patapim!',
  draw(p) {
    const r = rig(p, 22, 14, 6),
      LG = '#8a6a44',
      FT = '#dcb48c',
      BD = '#5f8a35',
      FC = '#e8c094',
      NS = '#d99a7a',
      pb = pal(BD);
    const foot = (f) => {
      ell(f[0] + 3, f[1] - 2, 7, 3, FT);
      px(f[0] + 7, f[1] - 3, OUTC);
      px(f[0] + 9, f[1] - 3, OUTC);
    };
    limbs([r.hip, r.kB, r.fB], 3, LG);
    foot(r.fB);
    arm(r, 0, 3, LG, -8);
    ell(r.hB[0], r.hB[1], 2, 2, FT);
    const cx = r.sh[0],
      cy = r.sh[1] + 6;
    ell(cx, cy, 11, 12, BD);
    px(cx - 5, cy + 3, pb.ss);
    px(cx - 4, cy + 4, pb.ss);
    px(cx - 7, cy - 2, pb.ss);
    px(cx + 2, cy + 7, pb.ss);
    px(cx - 2, cy + 6, pb.s);
    ell(cx - 7, cy - 15, 6, 4, '#3f9a3a');
    ell(cx + 8, cy - 14, 5, 4, '#3f9a3a');
    ell(cx + 1, cy - 19, 7, 5, '#56b545');
    ell(cx - 2, cy - 13, 5, 3, '#6cc04a', false);
    ell(cx + 5, cy - 6, 6, 5, FC);
    eye(cx + 3, cy - 8, 1);
    eye(cx + 8, cy - 8, 1);
    P(cx + 2, cy - 2, 4, 1, OUTC);
    limbs(
      [
        [cx + 9, cy - 5],
        [cx + 12, cy + 1],
        [cx + 12, cy + 7],
      ],
      3,
      NS,
    );
    ell(cx + 12, cy + 8, 2, 2, NS);
    limbs([r.hip, r.kF, r.fF], 3, LG);
    foot(r.fF);
    arm(r, 1, 3, LG, 8);
    ell(r.hF[0], r.hF[1], 3, 2, FT);
  },
};

export { patapim };
