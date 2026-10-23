/* Boss: La Vacca Saturno Saturnita (stats, special, quotes and fallback drawing). */
import { OUTC, P, arm, ell, eye, limbs, pal, px, rbox, rig } from '../../sprites/primitives.js';

const BOSS = {
  id: 'saturnita',
  name: ['LA VACCA', 'SATURNITA'],
  short: 'SATURNITA',
  voice: 'La Vacca Saturno Saturnita!',
  call: 'Muuu! Anello cosmico!',
  col: '#e8a85a',
  stage: 9,
  sp: 'ring',
  spName: 'ANEL CÓSMICO',
  st: { spd: 1.35, pow: 1.3, def: 1.45, reach: 1.3 },
  hurt: { w: 40, h: 72 },
  quote: 'Muuu... Isto não acabou. O algoritmo sempre volta.',
  shout: 'MUUU!',
  draw(p) {
    const r = rig(p, 22, 24, 7),
      WH = '#f4f0ea',
      SP = '#2a2230',
      PK = '#f0a0b4',
      SA = '#e8b06a',
      HO = '#3a2a2a';
    const ring = (cx, cy, front) => {
      const pts = [];
      for (let a = 0; a < Math.PI * 2; a += 0.025) {
        const s = Math.sin(a);
        if (s > 0 !== front) continue;
        pts.push([Math.round(cx + Math.cos(a) * 27), Math.round(cy + s * 6 - Math.cos(a) * 3)]);
      }
      for (const q of pts) P(q[0] - 1, q[1] - 1, 4, 4, OUTC);
      for (const q of pts) {
        P(q[0], q[1], 2, 1, '#ecdcb0');
        P(q[0], q[1] + 1, 2, 1, '#b49c74');
      }
    };
    limbs([r.hip, r.kB, r.fB], 5, WH);
    rbox(r.fB[0] - 3, r.fB[1] - 3, 7, 3, HO);
    arm(r, 0, 5, WH, -13);
    ell(r.hB[0], r.hB[1], 3, 2, HO);
    const cx = r.sh[0],
      cy = r.sh[1] + 10;
    ring(cx, cy, false);
    ell(cx, cy, 16, 16, SA);
    const ps = pal(SA);
    for (let y = -13; y <= 13; y += 5) {
      const hw = Math.floor(15 * Math.sqrt(Math.max(0, 1 - (y / 16) ** 2)));
      for (let x = -hw; x <= hw; x++) if (((x + y) & 1) === 0) px(cx + x, cy + y, ps.s);
      for (let x = -hw + 1; x < hw; x++) px(cx + x, cy + y + 1, ps.h);
    }
    ell(cx + 5, cy + 5, 3, 2, '#c8603a', false);
    ring(cx, cy, true);
    ell(cx - 3, cy - 31, 2, 3, '#e8dcc0');
    ell(cx + 9, cy - 31, 2, 3, '#e8dcc0');
    ell(cx - 6, cy - 24, 3, 2, WH);
    ell(cx + 3, cy - 22, 9, 8, WH);
    ell(cx - 1, cy - 25, 3, 3, SP, false);
    px(cx + 6, cy - 17, SP);
    px(cx + 7, cy - 16, SP);
    ell(cx + 11, cy - 17, 5, 4, PK);
    px(cx + 12, cy - 18, OUTC);
    px(cx + 14, cy - 18, OUTC);
    P(cx + 9, cy - 14, 5, 1, '#b05a70');
    eye(cx + 4, cy - 26, 1);
    eye(cx + 9, cy - 26, 1);
    px(cx + 5, cy - 25, '#b060ff');
    px(cx + 10, cy - 25, '#b060ff');
    limbs([r.hip, r.kF, r.fF], 5, WH);
    rbox(r.fF[0] - 3, r.fF[1] - 3, 7, 3, HO);
    P(r.kF[0] - 2, r.kF[1] - 1, 3, 3, SP);
    arm(r, 1, 5, WH, 13);
    ell(r.hF[0], r.hF[1], 3, 2, HO);
  },
};

export { BOSS };
