/** Authored 4x4 sheets: every attack has anticipation, contact and recovery. */
import { artImage } from '../stages/art.js';
import { OX, OY } from './primitives.js';
const layerFor = (ch) => (ch.id === 'saturnita-mega' ? 'boss' : ch.id === 'bribri' ? 'bribri' : null);
export function hasFinaleArt(ch) {
  const layer = layerFor(ch);
  return !!layer && !!artImage('finale', layer);
}
export function drawFinaleArt(g, ch, pose, frame, attack) {
  const image = artImage('finale', layerFor(ch));
  const phase = attack === 1 ? 1 : attack === 0.25 ? 2 : 0;
  let cell = 0,
    dy = 0,
    rotate = 0,
    crouch = false;
  if (pose === 'walk') {
    cell = [1, 2, 1, 2][Math.floor(frame / 2) % 4];
    dy = [0, -1, -2, 1][Math.floor(frame / 2) % 4];
  } else if (pose === 'crouch' || pose === 'cblock') cell = 3;
  else if (['punch', 'cpunch', 'jpunch'].includes(pose)) {
    cell = 4 + phase;
    crouch = pose === 'cpunch';
  } else if (['kick', 'ckick', 'jkick'].includes(pose)) {
    cell = 7 + phase;
    crouch = pose === 'ckick';
  } else if (pose === 'special') cell = attack === 1 ? 11 : 10;
  else if (pose === 'hit' || pose === 'fall') {
    cell = 12;
    rotate = pose === 'fall' ? -0.3 - frame * 0.1 : 0;
  } else if (pose === 'down') cell = 13;
  else if (pose === 'jump') cell = 14;
  else if (pose === 'win') {
    cell = 15;
    dy = frame >= 4 ? -2 : 0;
  } else if (pose === 'idle') dy = frame >= 4 ? -1 : 0;
  else if (pose === 'block') {
    cell = 3;
    crouch = false;
  }
  g.save();
  g.translate(OX * 2, OY * 2 + dy);
  if (crouch) g.scale(1, 0.7);
  if (rotate) {
    g.translate(0, -60);
    g.rotate(rotate);
    g.translate(0, 60);
  }
  g.drawImage(image, (cell % 4) * 256, Math.floor(cell / 4) * 208, 256, 208, -128, -199, 256, 208);
  g.restore();
}
