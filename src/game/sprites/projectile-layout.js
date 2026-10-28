/** Arcade presentation sizes, calibrated beside the 50–70px-tall fighters.
 * Logical sizes refer to the on-screen object, not its packed atlas crop.
 * Sizes are target envelopes; pixel-grid rounding can slightly exceed them.
 * Decorative trails are included in size; hit is the normal move's collision box.
 * A stronger move grows only when its actual collision dimensions grow.
 */
export const PROJECTILE_LAYOUT = {
  wave: { size: [72, 44], hit: [18, 18], pivot: [0.65, 0.55] },
  bomb: { size: [42, 28], hit: [8, 8], pivot: [0.6, 0.5] },
  boom: { size: [72, 72], hit: [36, 34], pivot: [0.5, 1], ground: true },
  banana: { size: [48, 44], hit: [12, 12], pivot: [0.5, 0.5] },
  clock: { size: [44, 48], hit: [14, 14], pivot: [0.5, 0.58] },
  ring: { size: [72, 40], hit: [30, 16], pivot: [0.5, 0.5] },
  meteor: { size: [48, 72], hit: [12, 12], pivot: [0.5, 0.74] },
  quake: { size: [60, 36], hit: [20, 14], pivot: [0.5, 1], ground: true },
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
  const targetScale =
    Math.min(layout.size[0] / maxWidth, layout.size[1] / maxHeight) * projectileScale(projectile);
  // One source pixel must cover a whole number of backbuffer pixels. Scaling
  // width and height independently makes thin outlines uneven and distorts art.
  const scale = Math.max(0.5, snap(targetScale));
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
