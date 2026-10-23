/* Color helpers: hex/rgb conversion, shading towards warm light or cool shadow, 4x4 Bayer matrix. */
import { clamp } from './math.js';

function hex2rgb(h) {
  h = h.replace('#', '');
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgb2hex(r, g, b) {
  return '#' + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
}
function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
function shade(h, f) {
  const c = hex2rgb(h);
  const r = f >= 0 ? mix(c, [255, 248, 226], f) : mix(c, [36, 16, 58], -f);
  return rgb2hex(r[0], r[1], r[2]);
}
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function rgba(h, a) {
  const c = hex2rgb(h);
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}

export { BAYER, hex2rgb, rgba, shade };
