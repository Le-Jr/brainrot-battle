/* Fighter definition: stats, special, quotes and the procedural fallback drawing. */
import { OUTC, P, ell, pal, poly, px, spanEll } from '../../sprites/primitives.js';

const bombardiro = {
  id: 'bombardiro',
  name: ['BOMBARDIRO', 'CROCODILO'],
  short: 'BOMBARDIRO',
  voice: 'Bombardiro Crocodilo!',
  col: '#5ea648',
  stage: 6,
  sp: 'bomb',
  spName: 'BOMBA',
  st: { spd: 1.3, pow: 1.2, def: 1.1, reach: 1.1 },
  hurt: { w: 50, h: 52 },
  quote: 'Missione compiuta. Bombardiro vola via!',
  shout: 'BOMBA!',
  call: 'Bombardiro, bomba!',
  draw(p) {
    const ph = (p.f * Math.PI) / 4,
      a = p.a || 0,
      po = p.pose;
    let x = 0,
      y = -26 + Math.round(Math.sin(ph) * 2),
      lunge = 0,
      open = 1;
    if (po === 'crouch' || po === 'cblock' || po === 'cpunch' || po === 'ckick') y += 10;
    if (po.includes('punch')) {
      lunge = Math.round(10 * a);
      open = 1 + Math.round(3 * a);
    }
    if (po.includes('kick')) x += Math.round(8 * a);
    if (po === 'hit' || po === 'down') {
      x -= 4;
      open = 4;
    }
    if (po === 'special') open = 3;
    if (po === 'win') {
      open = 3;
      y -= 4;
    }
    if (po.includes('block')) x -= 3;
    const G1 = '#8a9672',
      CR = '#4f9d3a',
      pc = pal(CR);
    const fl = p.f % 2 ? '#ffd36a' : '#ff8a3a';
    P(x - 27, y - 1, 3, 2, fl);
    px(x - 29, y, '#ff5a3a');
    px(x - 28, y + 1, fl);
    poly(
      [
        [x - 14, y - 5],
        [x - 28, y - 19],
        [x - 22, y - 20],
        [x - 8, y - 6],
      ],
      '#6e7a58',
    );
    poly(
      [
        [x - 6, y - 3],
        [x - 22, y - 13],
        [x - 14, y - 13],
        [x + 4, y - 4],
      ],
      '#6e7a58',
    );
    ell(x - 4, y, 20, 8, G1);
    spanEll(x - 12, y - 1, 4, 4, OUTC);
    spanEll(x - 12, y - 1, 3, 3, '#2fa04a');
    spanEll(x - 12, y - 1, 2, 2, '#f4f4f4');
    spanEll(x - 12, y - 1, 1, 1, '#e03a3a');
    P(x - 22, y + 3, 30, 1, pal(G1).s);
    for (let i = 0; i < 4; i++) px(x - 20 + i * 7, y - 4, pal(G1).ss);
    poly(
      [
        [x - 6, y + 2],
        [x + 2, y + 2],
        [x - 14, y + 15],
        [x - 26, y + 15],
      ],
      '#9aa682',
    );
    ell(x - 16, y + 17, 4, 2, '#3a3440');
    px(x - 18, y + 16, '#9a94a4');
    ell(x + 18 + lunge, y + 3 + open, 11, 3, '#62ae48');
    for (let i = 0; i < 5; i++) px(x + 10 + lunge + i * 3, y + 1 + open, '#ffffff');
    ell(x + 19 + lunge, y - 3, 13, 5, CR);
    for (let i = 0; i < 5; i++) px(x + 11 + lunge + i * 3, y + 2, '#ffffff');
    ell(x + 9 + lunge, y - 8, 6, 5, CR);
    P(x + 8 + lunge, y - 11, 3, 3, OUTC);
    P(x + 9 + lunge, y - 10, 2, 2, '#ffd23a');
    px(x + 10 + lunge, y - 10, OUTC);
    px(x + 29 + lunge, y - 6, OUTC);
    px(x + 27 + lunge, y - 6, OUTC);
    for (let i = 0; i < 4; i++) px(x + 14 + lunge + i * 4, y - 7 + (i % 2), pc.s);
  },
};

export { bombardiro };
