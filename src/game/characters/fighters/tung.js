/* Fighter definition: stats, special, quotes and the procedural fallback drawing. */
import { OUTC, P, arm, blade, ell, eye, limbs, pal, px, rbox, rig } from '../../sprites/primitives.js';

const tung = {
  id: 'tung',
  name: ['TUNG TUNG', 'SAHUR'],
  short: 'TUNG SAHUR',
  voice: 'Tung tung tung Sahur!',
  col: '#c8894e',
  stage: 5,
  sp: 'bat',
  spName: 'TACO SAHUR',
  st: { spd: 1.5, pow: 1.15, def: 0.95, reach: 1.25 },
  hurt: { w: 26, h: 62 },
  quote: 'Tung tung tung... hai risposto troppo tardi.',
  shout: 'TUNG!',
  call: 'Tung tung tung tung!',
  draw(p) {
    const r = rig(p, 20, 20, 4),
      WD = '#b97f48',
      DK = '#6e4322',
      ps = pal(WD);
    const cx = r.hip[0] + Math.round(r.lean * 0.7),
      top = r.hip[1] - 34;
    limbs([r.hip, r.kB, r.fB], 3, DK);
    ell(r.fB[0] + 1, r.fB[1] - 1, 3, 1, DK);
    arm(r, 0, 3, DK, -8);
    rbox(cx - 10, top, 20, 38, WD);
    for (let i = 0; i < 4; i++) {
      const gx = cx - 6 + i * 4;
      for (let y = top + 5; y < top + 36; y++)
        if ((y + i * 3) % 9 < 6) px(gx + (((y >> 2) + i) % 2), y, ps.s);
    }
    ell(cx, top, 9, 3, '#e7b67c');
    ell(cx, top, 5, 1, '#c98e55', false);
    px(cx, top, '#8a5a30');
    eye(cx - 2, top + 11, 3);
    eye(cx + 6, top + 11, 3);
    P(cx - 5, top + 6, 5, 1, OUTC);
    P(cx + 4, top + 6, 5, 1, OUTC);
    P(cx - 4, top + 19, 13, 4, OUTC);
    P(cx - 3, top + 19, 11, 2, '#ffffff');
    P(cx - 3, top + 21, 11, 1, '#d84a5a');
    const po = p.pose;
    let ang = -1.1;
    if (po.includes('punch')) ang = -1.6 + 1.75 * r.a;
    else if (po.includes('kick')) ang = -1.3;
    else if (po === 'special') ang = 0;
    else if (po === 'hit' || po === 'down') ang = -2.4;
    else if (po === 'win') ang = -1.57;
    else if (po.includes('block')) ang = -1.75;
    blade(r.hF, ang, 26, 1.5, 3, '#e0aa6a');
    limbs([r.hip, r.kF, r.fF], 3, DK);
    ell(r.fF[0] + 1, r.fF[1] - 1, 3, 1, DK);
    arm(r, 1, 3, DK, 8);
  },
};

export { tung };
