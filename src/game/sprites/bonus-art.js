import { BONUS_ART } from '../data/bonus-art.js';
import { scale2x } from './scale2x.js';
const images = {};
const cars = new Set(['car', 'cyber', 'byd']);
function loadBonusArt(base) {
  return Promise.all(
    Object.entries(BONUS_ART).map(
      ([id, art]) =>
        new Promise((resolve) => {
          const image = new Image();
          image.onload = () => {
            images[id] = cars.has(id) ? scale2x(image) : image;
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
  const density = images[id].width / (256 * 5);
  g.save();
  g.imageSmoothingEnabled = cars.has(id) || id === 'elon';
  g.imageSmoothingQuality = 'high';
  g.drawImage(
    images[id],
    Math.max(0, Math.min(4, frame)) * 256 * density,
    0,
    256 * density,
    208 * density,
    x - 128 * scale,
    y - 200 * scale,
    256 * scale,
    208 * scale,
  );
  g.restore();
  return true;
}
export { loadBonusArt, hasBonusArt, drawBonusArt };
