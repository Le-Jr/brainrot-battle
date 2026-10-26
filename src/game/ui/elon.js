import { ctx, txt } from '../core/canvas.js';
import { drawBonusArt } from '../sprites/bonus-art.js';

/** Generated cartoon sprite, using the same atlas renderer as the BYD parrot. */
export function elon(x, y, damage, talk, tick) {
  const panic = damage >= 3;
  const bob = panic ? Math.round(Math.sin(tick * 0.6) * 2) : talk ? (tick >> 3) & 1 : 0;
  const pace = panic ? Math.round(Math.sin(tick * 0.12) * 5) : 0;
  drawBonusArt(ctx, 'elon', damage, Math.round(x + pace), Math.round(y + bob), 0.5);
  txt('ELON', x, y + 5, 6, '#c6eaff', 'center');
  txt('VOZ IA', x, y + 14, 6, '#c6eaff', 'center');
}
