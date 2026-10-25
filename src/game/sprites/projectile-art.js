import { PROJECTILE_ART } from '../data/projectile-art.js';

const images = {};
function loadProjectileArt(base) {
  return Promise.all(
    Object.keys(PROJECTILE_ART).map(
      (type) =>
        new Promise((resolve) => {
          const image = new Image();
          image.onload = () => {
            images[type] = image;
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
  const index =
    projectile.type === 'boom'
      ? Math.min(art.frames - 1, Math.floor(projectile.t / 4))
      : Math.floor((projectile.t ?? tick) / 3) % art.frames;
  const scale = projectile.sup ? 1.5 : 1;
  const [sx, sy, sw, sh] = art.rects[index];
  const width = projectile.type === 'quake' ? projectile.w : (sw / 2) * scale;
  const height = (sh / 2) * scale;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(projectile.dir < 0 ? -1 : 1, 1);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, sx, sy, sw, sh, -width / 2, -height / 2, width, height);
  ctx.restore();
  return true;
}

export { loadProjectileArt, drawProjectileArt };
