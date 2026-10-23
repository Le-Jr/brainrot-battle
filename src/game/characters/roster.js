/* The playable roster (select-screen order) and each fighter's story voice pitch. */
import { assassino } from './fighters/assassino.js';
import { ballerina } from './fighters/ballerina.js';
import { bombardiro } from './fighters/bombardiro.js';
import { chimp } from './fighters/chimp.js';
import { lirili } from './fighters/lirili.js';
import { patapim } from './fighters/patapim.js';
import { tralalero } from './fighters/tralalero.js';
import { tung } from './fighters/tung.js';

/** Playable roster. The order matters: it is the select-screen grid and S.p1/S.p2 index into it. */
const CH = [tralalero, tung, bombardiro, ballerina, patapim, chimp, assassino, lirili];
/** Voice pitch per character for story narration. */
const VP = {
  tralalero: 1.2,
  tung: 0.75,
  bombardiro: 0.65,
  ballerina: 1.6,
  patapim: 0.55,
  chimp: 1.4,
  assassino: 0.45,
  lirili: 0.85,
};

export { CH, VP };
