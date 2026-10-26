/** Logical sizes refer to the on-screen object, not its packed atlas crop.
 * Decorative trails are included in size; hit is the normal move's collision box.
 * A stronger move grows only when its actual collision dimensions grow.
 */
export const PROJECTILE_LAYOUT = {
  wave: { size: [22, 18], hit: [18, 18], pivot: [0.65, 0.55] },
  bomb: { size: [10, 8], hit: [8, 8], pivot: [0.6, 0.5] },
  boom: { size: [36, 34], hit: [36, 34], pivot: [0.5, 0.5] },
  banana: { size: [12, 12], hit: [12, 12], pivot: [0.5, 0.5] },
  clock: { size: [14, 14], hit: [14, 14], pivot: [0.5, 0.58] },
  ring: { size: [30, 16], hit: [30, 16], pivot: [0.5, 0.5] },
  meteor: { size: [12, 22], hit: [12, 12], pivot: [0.5, 0.74] },
  quake: { size: [20, 14], hit: [20, 14], pivot: [0.5, 1], ground: true },
};
export function projectileScale(projectile) {
  const layout = PROJECTILE_LAYOUT[projectile.type];
  if (!layout) return 1;
  const width = (projectile.w ?? layout.hit[0]) / layout.hit[0];
  const height = (projectile.h ?? layout.hit[1]) / layout.hit[1];
  return layout.ground ? width : Math.min(width, height);
}

// The game's backbuffer has two physical pixels per logical pixel. Avoid quarter-pixel origins.
const snap = (value) => Math.round(value * 2) / 2;
export function projectileArtBounds(projectile, art, frame) {
  const layout = PROJECTILE_LAYOUT[projectile.type];
  if (!layout) return null;
  const maxWidth = Math.max(...art.rects.map((rect) => rect[2]));
  const maxHeight = Math.max(...art.rects.map((rect) => rect[3]));
  const scale = Math.min(layout.size[0] / maxWidth, layout.size[1] / maxHeight) * projectileScale(projectile);
  const source = art.rects[frame];
  const width = snap(source[2] * scale),
    height = snap(source[3] * scale);
  return {
    source,
    width,
    height,
    left: -snap(width * layout.pivot[0]),
    top: layout.ground ? snap((projectile.h ?? layout.hit[1]) / 2 - height) : -snap(height * layout.pivot[1]),
  };
}
