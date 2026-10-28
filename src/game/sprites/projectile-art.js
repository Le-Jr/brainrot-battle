import { projectileArtBounds } from './projectile-layout.js';
import { PROJECTILE_ART } from '../data/projectile-art.js';
import { scale2x } from './scale2x.js';

const ART_DENSITY = 4;

const images = {};
function loadProjectileArt(base) {
  return Promise.all(
    Object.keys(PROJECTILE_ART).map(
      (type) =>
        new Promise((resolve) => {
          const image = new Image();
          image.onload = () => {
            // Reconstruct diagonal contours once at load time, rather than
            // magnifying the tiny atlas on every desktop frame.
            images[type] = scale2x(scale2x(image));
            resolve();
          };
          image.onerror = () => resolve();
          image.src = base + '/projectile-' + type + '.png';
        }),
    ),
  );
}

function drawProjectileArt(ctx, projectile, x, y, tick) {
  const art = PROJECTILE_ART[projectile.type],
    image = images[projectile.type];
  if (!art || !image) return false;
  const age = Math.max(0, projectile.t ?? tick ?? 0);
  const index =
    projectile.type === 'boom'
      ? Math.min(art.frames - 1, Math.floor(age / 4))
      : Math.floor(age / 3) % art.frames;
  const bounds = projectileArtBounds(projectile, art, index);
  if (!bounds) return false;
  const {
    source: [sx, sy, sw, sh],
    left,
    top,
    width,
    height,
  } = bounds;
  ctx.save();
  ctx.translate(Math.round(x * 2) / 2, Math.round(y * 2) / 2);
  ctx.scale(projectile.dir < 0 ? -1 : 1, 1);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    image,
    sx * ART_DENSITY,
    sy * ART_DENSITY,
    sw * ART_DENSITY,
    sh * ART_DENSITY,
    left,
    top,
    width,
    height,
  );
  ctx.restore();
  return true;
}

export { loadProjectileArt, drawProjectileArt };
