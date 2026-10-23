/* Head-shot portraits cut from the idle sprite: dialog busts, HUD chips and the pause screen. */
import { ctx } from '../core/canvas.js';
import { OX, OY } from '../sprites/primitives.js';
import { profile, sprite } from '../sprites/sprite.js';

/**
 * Draw the head of `ch` into a `size` square at (x, y). The crop is centered on the top of the body measured
 * from the sprite pixels, biased towards the front where the faces are. `flip` mirrors it (right-side players).
 */
function headShot(ch, x, y, size, { tint = '', flip = false, t = 0, alt = false } = {}) {
  const img = sprite(ch, 'idle', Math.floor(t / 9) % 8, 0, alt, tint),
    k = img.hd ? 2 : 1,
    P = profile(ch),
    bw = P.r - P.l,
    cs = Math.min(58, Math.max(36, bw * 0.66)),
    cx = (P.l + P.r) / 2 + bw * 0.18,
    cy = P.t - 4;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.clip();
  if (flip) {
    ctx.translate(x * 2 + size, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(img, (OX + cx - cs / 2) * k, (OY + cy) * k, cs * k, cs * k, x, y, size, size);
  ctx.restore();
}

/** Whole sprite scaled to fit a square (the bonus-stage cars have no head). */
function fitShot(img, x, y, size, flip = false) {
  const k = img.hd ? 2 : 1,
    s = size / (img.width / k);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.clip();
  if (flip) {
    ctx.translate(x * 2 + size, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(img, x, y + size * 0.5 - (img.height / k) * s * 0.75, size, (img.height / k) * s);
  ctx.restore();
}

export { fitShot, headShot };
