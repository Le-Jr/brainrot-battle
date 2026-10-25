import { BONUS_ART } from '../data/bonus-art.js';
const images = {};
function loadBonusArt(base) {
  return Promise.all(
    Object.entries(BONUS_ART).map(
      ([id, art]) =>
        new Promise((resolve) => {
          const image = new Image();
          image.onload = () => {
            images[id] = image;
            resolve();
          };
          image.onerror = () => resolve();
          image.src = base + '/' + art.file;
        }),
    ),
  );
}
function hasBonusArt(id) {
  return !!images[id];
}
function drawBonusArt(g, id, frame, x, y, scale = 1) {
  if (!images[id]) return false;
  g.imageSmoothingEnabled = false;
  g.drawImage(
    images[id],
    Math.max(0, Math.min(4, frame)) * 256,
    0,
    256,
    208,
    x - 128 * scale,
    y - 200 * scale,
    256 * scale,
    208 * scale,
  );
  return true;
}
export { loadBonusArt, hasBonusArt, drawBonusArt };
