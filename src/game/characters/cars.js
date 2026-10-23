/* The three bonus-stage cars, drawn procedurally with 5 damage states each. */
import { hsh } from '../core/math.js';
import { P, ell, pal, poly, px, rbox } from '../sprites/primitives.js';

const CAR = {
  id: 'car',
  name: ['LA MACCHINA', 'DEL NONNO'],
  short: 'MACCHINA',
  col: '#d8343f',
  hurt: { w: 84, h: 40 },
  st: { spd: 0, pow: 1, def: 0.55, reach: 1 },
  draw(p) {
    const d = +p.pose.slice(1),
      RED = '#d8343f',
      pr = pal(RED);
    if (d === 4) {
      poly(
        [
          [-42, -1],
          [-38, -13],
          [-20, -18],
          [22, -16],
          [40, -9],
          [42, -1],
        ],
        '#7a2a2a',
      );
      for (let k = 0; k < 10; k++) px(-38 + k * 8, -8 - (k % 3), '#2a1414');
      ell(-26, -3, 6, 3, '#2a2430');
      P(-30, -19, 6, 3, '#c8ccd6');
      P(10, -17, 8, 2, '#3a3440');
      return;
    }
    ell(-24, -7, 7, 7, '#2a2430');
    ell(-24, -7, 3, 3, '#c8ccd6');
    if (d < 3) {
      ell(24, -7, 7, 7, '#2a2430');
      ell(24, -7, 3, 3, '#c8ccd6');
    } else {
      P(18, -6, 12, 2, '#3a3440');
    }
    const roof = d >= 3 ? -31 : -38;
    poly(
      [
        [-25, -21],
        [-17, roof],
        [13, roof],
        [24, -21],
      ],
      RED,
    );
    rbox(-41, -22, 82, 13 + (d >= 3 ? 1 : 0), RED);
    const wc = d >= 2 ? '#1e1a26' : '#9ad6f0';
    poly(
      [
        [-21, -22],
        [-15, roof + 3],
        [-3, roof + 3],
        [-3, -22],
      ],
      wc,
      false,
    );
    poly(
      [
        [1, -22],
        [1, roof + 3],
        [11, roof + 3],
        [19, -22],
      ],
      wc,
      false,
    );
    if (d < 2) {
      px(-12, roof + 5, '#ffffff');
      px(-11, roof + 6, '#ffffff');
      px(4, roof + 5, '#ffffff');
    }
    if (d === 1)
      for (let k = 0; k < 6; k++) {
        px(-15 + k, roof + 5 + k, '#ffffff');
        px(7 + k, roof + 9 - k, '#ffffff');
        px(-9, roof + 5 + k, '#ffffff');
      }
    if (d >= 3) P(-2, -21, 16, 11, '#2a1a1e');
    else {
      P(-1, -21, 1, 12, pr.ss);
      P(8, -16, 3, 1, '#c8ccd6');
    }
    P(-38, -12, 10, 2, '#2fa04a');
    P(-28, -12, 10, 2, '#f4f4f4');
    P(-18, -12, 10, 2, '#e03a3a');
    rbox(-43, -10, 86, 3, d >= 2 ? '#8a8c96' : '#c8ccd6');
    ell(38, -17, 2, 2, d >= 2 ? '#4a4a3a' : '#fff6c8');
    ell(-39, -17, 2, 1, '#ff5a3a');
    if (d >= 1)
      for (let k = 0; k < 5 * d; k++) {
        const x = -36 + Math.round(hsh(k * 3) * 72),
          y = -20 + Math.round(hsh(k * 5) * 9);
        px(x, y, pr.ss);
        px(x + 1, y, pr.s);
      }
    if (d >= 2)
      for (let k = 0; k < 4 * d; k++)
        px(-30 + Math.round(hsh(k * 7 + 1) * 60), -19 + Math.round(hsh(k * 9 + 2) * 8), '#8a5a3a');
  },
};
const CYBER = {
  id: 'cyber',
  name: ['CYBER', 'CAMINHÃO'],
  short: 'CYBERCAMINHÃO',
  col: '#9aa0aa',
  hurt: { w: 90, h: 44 },
  st: { spd: 0, pow: 1, def: 1, reach: 1 },
  draw(p) {
    const d = +p.pose.slice(1),
      ST = '#a8aeb8',
      pr = pal(ST);
    if (d === 4) {
      poly(
        [
          [-46, -1],
          [-42, -14],
          [-8, -24],
          [40, -14],
          [46, -1],
        ],
        '#5a5e66',
      );
      for (let k = 0; k < 9; k++) px(-40 + k * 9, -7 - (k % 3), '#1a1a20');
      ell(-28, -4, 7, 3, '#22222a');
      P(-14, -25, 10, 3, '#c8ccd6');
      return;
    }
    const wh = (x) => {
      P(x - 9, -16, 18, 9, '#18181e');
      ell(x, -7, 7, 7, '#22222a');
      ell(x, -7, 4, 4, '#5a5e66');
      px(x, -7, '#a8aeb8');
    };
    wh(-27);
    if (d < 3) wh(27);
    else P(18, -6, 14, 3, '#3a3a44');
    poly(
      [
        [-46, -12],
        [-43, -30],
        [-6, -46],
        [46, -27],
        [47, -12],
      ],
      ST,
    );
    for (let x = -40; x < 44; x += 2)
      for (let y = -28; y < -13; y += 3) if (((x + y) & 3) === 0) px(x, y, pr.h);
    P(-46, -13, 94, 2, '#5a5e66');
    P(-40, -22, 84, 1, pr.s);
    P(20, -27, 26, 1, '#ffffff');
    P(20, -26, 26, 1, '#d8f0ff');
    poly(
      [
        [-30, -30],
        [-7, -41],
        [24, -31],
        [24, -27],
        [-30, -27],
      ],
      '#283040',
      false,
    );
    if (d === 0) {
      px(-18, -33, '#7a8aa8');
      px(-17, -34, '#7a8aa8');
      px(4, -36, '#7a8aa8');
    }
    if (d >= 1) {
      const crack = (cx, cy, n) => {
        for (let k = 0; k < n; k++) {
          const a = (k / n) * 6.28 + 0.3;
          for (let r = 1; r < 7; r++)
            px(cx + Math.round(Math.cos(a) * r), cy + Math.round(Math.sin(a) * r * 0.7), '#e8f4ff');
        }
        px(cx, cy, '#ffffff');
      };
      crack(-16, -32, 7);
      if (d >= 2) crack(8, -34, 8);
    }
    if (d >= 2)
      for (let k = 0; k < 10; k++)
        px(-38 + Math.round(hsh(k * 3 + 2) * 80), -24 + Math.round(hsh(k * 5 + 1) * 9), pr.ss);
    if (d >= 3) {
      P(-4, -26, 18, 12, '#2a2a32');
      P(-3, -25, 16, 1, '#5a5e66');
    }
    ell(44, -20, 2, 2, d >= 2 ? '#4a4a3a' : '#fff6c8');
  },
};
const BYDC = {
  id: 'byd',
  name: ['O BI-AI-DI', 'ELÉTRICO'],
  short: 'BI-AI-DI',
  col: '#2a6ad8',
  hurt: { w: 84, h: 40 },
  st: { spd: 0, pow: 1, def: 1, reach: 1 },
  draw(p) {
    const d = +p.pose.slice(1),
      WH = '#eef2f6',
      BL = '#2a6ad8';
    if (d === 4) {
      poly(
        [
          [-42, -1],
          [-38, -12],
          [-16, -18],
          [24, -16],
          [40, -9],
          [42, -1],
        ],
        '#7a8290',
      );
      for (let k = 0; k < 10; k++) px(-38 + k * 8, -8 - (k % 3), '#2a2a34');
      ell(-24, -3, 6, 3, '#2a2430');
      P(-22, -19, 8, 2, BL);
      return;
    }
    const wh = (x) => {
      ell(x, -7, 7, 7, '#22222a');
      ell(x, -7, 4, 4, '#c8ccd6');
      P(x - 1, -11, 2, 8, '#8a8c96');
      P(x - 4, -8, 8, 2, '#8a8c96');
    };
    wh(-25);
    if (d < 3) wh(25);
    else P(18, -6, 12, 2, '#3a3440');
    poly(
      [
        [-42, -12],
        [-40, -22],
        [-24, -26],
        [-14, -38],
        [16, -38],
        [30, -26],
        [42, -22],
        [43, -12],
      ],
      WH,
    );
    poly(
      [
        [-12, -27],
        [-9, -36],
        [3, -36],
        [3, -27],
      ],
      d >= 2 ? '#1e1a26' : '#3a4a6a',
      false,
    );
    poly(
      [
        [6, -27],
        [6, -36],
        [14, -36],
        [24, -27],
      ],
      d >= 2 ? '#1e1a26' : '#3a4a6a',
      false,
    );
    if (d < 2) {
      px(-6, -34, '#ffffff');
      px(9, -34, '#ffffff');
    }
    if (d === 1)
      for (let k = 0; k < 5; k++) {
        px(-8 + k, -34 + k, '#ffffff');
        px(10 + k, -30 - k, '#ffffff');
      }
    P(-40, -17, 82, 2, BL);
    P(30, -23, 12, 1, '#bfe6ff');
    P(-42, -21, 6, 1, '#ff4a5a');
    P(-6, -15, 14, 4, '#ffffff');
    P(-5, -14, 12, 2, BL);
    if (d >= 1)
      for (let k = 0; k < 5 * d; k++) {
        const x = -36 + Math.round(hsh(k * 3 + 7) * 72),
          y = -22 + Math.round(hsh(k * 5 + 3) * 9);
        px(x, y, '#8a92a0');
        px(x + 1, y, '#b8c0cc');
      }
    if (d >= 3) P(-2, -26, 16, 12, '#2a2a34');
  },
};
const CARS = { nonno: CAR, cyber: CYBER, byd: BYDC };
CAR.def = 1.7;
CYBER.def = 2.6;
BYDC.def = 1.9;
CAR.maxhp = 340;
CYBER.maxhp = 430;
BYDC.maxhp = 340;

export { CARS };
