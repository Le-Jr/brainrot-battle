/* Image-based stage layers (made with tools/process-stage-art.js). A stage with art keeps its procedural
   painting for the layers that have no image, and drops the animation hooks that no longer line up. */
import { STAGE_ART } from '../data/stage-art.js';

/** Stage ids in stage-index order (characters' home stage, story panels, bonus stages and the map use the index). */
const STAGE_IDS = [
  'beach',
  'piazza',
  'jungle',
  'desert',
  'cafe',
  'villaggio',
  'cielo',
  'teatro',
  'piantagione',
  'saturno',
  'strada',
  'cyber',
  'byd',
];
const IMAGES = {};

/** Decode every art layer from `base` (for example "/stages"). A missing image keeps the painted layer. */
function loadStageArt(base) {
  const jobs = [];
  for (const [id, art] of Object.entries(STAGE_ART))
    for (const layer of art.layers)
      jobs.push(
        new Promise((res) => {
          const im = new Image();
          im.onload = () => {
            (IMAGES[id] ||= {})[layer] = im;
            res();
          };
          im.onerror = () => res();
          im.src = `${base}/${id}/${layer}.png`;
        }),
      );
  return Promise.all(jobs);
}

/** Swap the painted layers of stage `index` for its art, when there is any. */
function applyArt(index, st) {
  const id = STAGE_IDS[index],
    imgs = IMAGES[id];
  if (!imgs) return st;
  Object.assign(st, imgs);
  for (const hook of STAGE_ART[id].off) delete st[hook];
  st.art = true;
  return st;
}

export { STAGE_IDS, applyArt, loadStageArt };
