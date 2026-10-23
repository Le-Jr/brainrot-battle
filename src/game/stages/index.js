/* Stage registry (built once at boot) and the 4-layer parallax renderer. */
import { ctx } from '../core/canvas.js';
import { applyArt } from './art.js';
import { hBeach } from './beach.js';
import { hByd } from './byd.js';
import { hCafe } from './cafe.js';
import { hCielo } from './cielo.js';
import { hCyber } from './cyber.js';
import { hDesert } from './desert.js';
import { hJungle } from './jungle.js';
import { hPiantagione } from './piantagione.js';
import { hPiazza } from './piazza.js';
import { hSaturno } from './saturno.js';
import { hStrada } from './strada.js';
import { hTeatro } from './teatro.js';
import { hVillaggio } from './villaggio.js';

/** Stage builders in stage-id order (characters' home stage, story panels, bonus stages and the map use these ids). */
const BUILDERS = [
  hBeach,
  hPiazza,
  hJungle,
  hDesert,
  hCafe,
  hVillaggio,
  hCielo,
  hTeatro,
  hPiantagione,
  hSaturno,
  hStrada,
  hCyber,
  hByd,
];
/** The painted stages, indexed by stage id. Filled by buildNextStage()/buildStages() at boot. */
const STAGES = [];
/** Paint the next stage (one to two hundred ms each). Returns the loading progress from 0 to 1. */
function buildNextStage() {
  if (STAGES.length < BUILDERS.length) STAGES.push(applyArt(STAGES.length, BUILDERS[STAGES.length]()));
  return STAGES.length / BUILDERS.length;
}
/** Paint every remaining stage at once (tests and tools). */
function buildStages() {
  while (buildNextStage() < 1);
  return STAGES;
}
function drawStage(st, cam, t) {
  const k = st.hd ? 0.5 : 1,
    r = (v) => Math.round(v * 2) / 2;
  ctx.drawImage(st.sky, 0, 0, st.sky.width * k, st.sky.height * k);
  if (st.back) st.back(ctx, cam, t);
  ctx.drawImage(st.far, -r(cam * 0.3), 0, st.far.width * k, st.far.height * k);
  if (st.farA) st.farA(ctx, cam, t);
  ctx.drawImage(st.mid, -r(cam * 0.6), 0, st.mid.width * k, st.mid.height * k);
  if (st.midA) st.midA(ctx, cam, t);
  ctx.drawImage(st.floor, -cam, 0, st.floor.width * k, st.floor.height * k);
}

export { BUILDERS, STAGES, buildNextStage, buildStages, drawStage };
