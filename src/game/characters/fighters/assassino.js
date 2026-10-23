/* Fighter definition: stats, special, quotes and the procedural fallback drawing. */
import { OUTC, P, arm, blade, ell, limbs, poly, px, rig } from '../../sprites/primitives.js';

const assassino = {
  id: 'assassino',
  name: ['CAPPUCCINO', 'ASSASSINO'],
  short: 'ASSASSINO',
  voice: 'Cappuccino Assassino!',
  col: '#d8343f',
  stage: 4,
  sp: 'slash',
  spName: 'TELEPORTE',
  st: { spd: 1.9, pow: 1, def: 0.9, reach: 1.15 },
  hurt: { w: 28, h: 60 },
  quote: 'Silenzioso come la schiuma. Letale come un espresso.',
  shout: 'ZAN!',
  call: 'Assassino!',
  draw(p) {
    const r = rig(p, 18, 18, 5),
      BK = '#2a2433',
      CUP = '#f1ebe1',
      RD = '#d8343f',
      po = p.pose;
    let aF = -0.6,
      aB = -2.2;
    if (po.includes('punch')) {
      aF = -1.4 + 1.5 * r.a;
    } else if (po === 'special') {
      aF = 0;
      aB = -0.25;
    } else if (po === 'hit' || po === 'down') {
      aF = -2.6;
      aB = -2.9;
    } else if (po === 'win') {
      aF = -1.57;
      aB = -1.6;
    } else if (po.includes('block')) {
      aF = -1.5;
      aB = -1.3;
    }
    limbs([r.hip, r.kB, r.fB], 3, BK);
    ell(r.fB[0] + 1, r.fB[1] - 1, 3, 1, BK);
    blade(r.hB, aB, 20, 1, 1.5, '#cdd5e2');
    arm(r, 0, 3, BK, -7);
    const cx = r.sh[0],
      top = r.sh[1] - 14,
      bot = r.hip[1] + 2,
      wv = p.f % 2;
    poly(
      [
        [cx - 9, top + 3],
        [cx - 19, top + 1 + wv],
        [cx - 18, top + 5],
        [cx - 9, top + 6],
      ],
      RD,
    );
    poly(
      [
        [cx - 9, top + 4],
        [cx - 17, top + 7 + wv],
        [cx - 15, top + 9],
        [cx - 9, top + 6],
      ],
      RD,
    );
    ell(cx - 11, top + 13, 3, 4, CUP);
    P(cx - 11, top + 12, 1, 3, OUTC);
    poly(
      [
        [cx - 10, top],
        [cx + 10, top],
        [cx + 8, bot],
        [cx - 8, bot],
      ],
      CUP,
    );
    ell(cx, top, 10, 3, '#a86e40');
    px(cx - 2, top, '#d9a070');
    px(cx + 3, top - 1, '#d9a070');
    P(cx - 10, top + 3, 20, 2, RD);
    P(cx - 10, top + 6, 21, 6, OUTC);
    P(cx - 9, top + 7, 19, 4, '#2a2433');
    P(cx, top + 9, 4, 1, '#ffffff');
    P(cx + 6, top + 9, 4, 1, '#ffffff');
    px(cx, top + 8, '#ffffff');
    px(cx + 9, top + 8, '#ffffff');
    limbs([r.hip, r.kF, r.fF], 3, BK);
    ell(r.fF[0] + 1, r.fF[1] - 1, 3, 1, BK);
    blade(r.hF, aF, 22, 1, 1.5, '#dfe6f0');
    P(r.hF[0] - 1, r.hF[1] - 1, 3, 3, '#d4a14a');
    arm(r, 1, 3, BK, 7);
  },
};

export { assassino };
