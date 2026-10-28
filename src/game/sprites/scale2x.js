import { mk } from '../core/canvas.js';

/** Edge-aware Scale2x: smooth pixel-art diagonals without blurring their palette. */
export function scale2x(image) {
  const source = mk(image.width, image.height),
    g = source.getContext('2d');
  g.drawImage(image, 0, 0);
  const data = g.getImageData(0, 0, image.width, image.height);
  const pixels = new Uint32Array(data.data.buffer);
  const out = mk(image.width * 2, image.height * 2),
    target = out.getContext('2d');
  const result = target.createImageData(out.width, out.height),
    dest = new Uint32Array(result.data.buffer);
  const w = image.width,
    h = image.height;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const e = pixels[y * w + x],
        b = pixels[Math.max(0, y - 1) * w + x],
        d = pixels[y * w + Math.max(0, x - 1)],
        f = pixels[y * w + Math.min(w - 1, x + 1)],
        next = pixels[Math.min(h - 1, y + 1) * w + x];
      const i = y * 2 * out.width + x * 2;
      const edge = b !== next && d !== f;
      dest[i] = edge && d === b ? d : e;
      dest[i + 1] = edge && b === f ? f : e;
      dest[i + out.width] = edge && d === next ? d : e;
      dest[i + out.width + 1] = edge && next === f ? f : e;
    }
  target.putImageData(result, 0, 0);
  return out;
}
