import { BOSS } from './saturnita.js';
/** Separate identity: does not change normal Saturnita, versus or training. */
export const MEGA_BOSS = {
  ...BOSS,
  id: 'saturnita-mega',
  name: ['SATURNITA', 'MEGA BRAIN'],
  short: 'MEGA SATURNA',
  voice: BOSS.voice,
  call: BOSS.call,
  quote: 'O universo inteiro dançará no meu furacão!',
  col: '#c388ff',
  sp: 'cosmos', spName: 'FÚRIA DO MEGA BRAIN',
  st: { spd: 1.65, pow: 1.48, def: 1.5, reach: 1.3 },
};
