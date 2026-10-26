/* The final playable hero. Full authored animation sheet plus a minimal missing-art fallback. */
import { P, ell, limbs, arm, rig, OUTC } from '../../sprites/primitives.js';
export const BRIBRI = {
  id: 'bribri',
  name: ['BRI BRI', 'BICUS DICUS'],
  short: 'BRI BRI',
  voice: 'Bri Bri Bicus Dicus de Bicus de Dicus!',
  call: 'Bri Bri! Scudo della libertà!',
  shout: 'LIBERTÀ!',
  col: '#f8cd55',
  stage: 7,
  sp: 'aegis',
  spName: 'ESCUDO DA LIBERDADE',
  st: { spd: 1.95, pow: 1.38, def: 1.32, reach: 1.35 },
  hurt: { w: 30, h: 65 },
  quote: 'Nenhum brainrot vai se curvar. Bri Bri!',
  draw(p) {
    const r = rig(p, 20, 20, 4);
    limbs([r.hip, r.kB, r.fB], 3, '#b98b57');
    arm(r, 0, 3, '#e5b747', -10);
    ell(r.sh[0], r.sh[1] + 10, 11, 14, '#dbaa39');
    ell(r.sh[0], r.sh[1] - 8, 10, 10, '#9d8060');
    P(r.sh[0] + 6, r.sh[1] - 9, 10, 5, '#f8cd55');
    P(r.sh[0] - 7, r.sh[1] - 20, 16, 4, '#bd3540');
    ell(r.hF[0] + 8, r.hF[1], 9, 12, '#e9bd49');
    P(r.hF[0] + 12, r.hF[1] - 1, 18, 3, OUTC);
  },
};
