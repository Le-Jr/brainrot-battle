/* Modern pixel-art pass for the painted stage layers, so they match the sprites: a limited palette per layer
   (deterministic k-means), dithering only across gradient bands, selective outlines and a top rim light on
   silhouettes, aerial perspective on distant layers and cleanup of stray pixels. */
import { BAYER } from '../core/color.js';

/** Deterministic k-means palette from up to ~6000 opaque samples (luminance-quantile init, no randomness). */
function palette(d, k) {
  const n = d.length / 4,
    stride = Math.max(1, Math.floor(n / 6000)),
    S = [];
  for (let p = 0; p < n; p += stride) if (d[p * 4 + 3] > 0) S.push([d[p * 4], d[p * 4 + 1], d[p * 4 + 2]]);
  if (!S.length) return [[0, 0, 0]];
  const lum = (c) => c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
  S.sort((a, b) => lum(a) - lum(b));
  k = Math.min(k, S.length);
  let C = Array.from({ length: k }, (_, i) => S[Math.floor(((i + 0.5) / k) * S.length)].slice());
  const lab = new Int32Array(S.length);
  for (let it = 0; it < 8; it++) {
    for (let i = 0; i < S.length; i++) {
      let best = 0,
        bd = 1e9;
      for (let j = 0; j < k; j++) {
        const dr = S[i][0] - C[j][0],
          dg = S[i][1] - C[j][1],
          db = S[i][2] - C[j][2],
          dd = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11;
        if (dd < bd) {
          bd = dd;
          best = j;
        }
      }
      lab[i] = best;
    }
    const acc = C.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < S.length; i++) {
      const a = acc[lab[i]];
      a[0] += S[i][0];
      a[1] += S[i][1];
      a[2] += S[i][2];
      a[3]++;
    }
    C = C.map((c, j) =>
      acc[j][3] ? [acc[j][0] / acc[j][3], acc[j][1] / acc[j][3], acc[j][2] / acc[j][3]] : c,
    );
  }
  return C.map((c) => c.map(Math.round));
}

/** Nearest and second-nearest palette entries per 15-bit color, filled on demand. */
function matcher(P) {
  const near = new Int16Array(32768).fill(-1),
    second = new Int16Array(32768),
    mix = new Float32Array(32768);
  const fill = (k, r, g, b) => {
    let b1 = 0,
      d1 = 1e9,
      b2 = 0,
      d2 = 1e9;
    for (let j = 0; j < P.length; j++) {
      const dr = r - P[j][0],
        dg = g - P[j][1],
        db = b - P[j][2],
        dd = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11;
      if (dd < d1) {
        b2 = b1;
        d2 = d1;
        b1 = j;
        d1 = dd;
      } else if (dd < d2) {
        b2 = j;
        d2 = dd;
      }
    }
    near[k] = b1;
    second[k] = b2;
    // 0 = exactly on the nearest color, 0.5 = halfway to the second one
    mix[k] = Math.sqrt(d1) / Math.max(1e-6, Math.sqrt(d1) + Math.sqrt(d2));
  };
  const key = (r, g, b) => {
    const k = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    if (near[k] < 0) fill(k, r, g, b);
    return k;
  };
  return { key, near, second, mix };
}

/**
 * Re-render a layer as modern pixel art.
 * @param {HTMLCanvasElement} c  layer canvas (painted at 2x)
 * @param {object} o
 *   levels  number of brightness bands (hue preserved, no dithering), or
 *   colors  limited k-means palette of this size; dither  ordered dithering between palette bands;
 *   haze [r,g,b] + hazeK  aerial perspective; outline 0..1 darkening of silhouette edges;
 *   rim 0..1 brightening of the pixel row under a top edge; cut  binary alpha
 */
function pixelize(
  c,
  { levels = 0, colors = 24, dither = false, haze = null, hazeK = 0, outline = 0, rim = 0, cut = true } = {},
) {
  const g = c.getContext('2d'),
    w = c.width,
    h = c.height,
    id = g.getImageData(0, 0, w, h),
    d = id.data;
  // binary alpha and aerial perspective first
  for (let i = 0; i < d.length; i += 4) {
    if (cut) d[i + 3] = d[i + 3] > 110 ? 255 : 0;
    if (haze && hazeK && d[i + 3]) {
      const l = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
      for (let k = 0; k < 3; k++) {
        const desat = d[i + k] + (l - d[i + k]) * 0.35 * hazeK;
        d[i + k] = Math.round(desat + (haze[k] - desat) * hazeK);
      }
    }
  }
  // every opaque pixel becomes a packed 0xRRGGBB color; -1 is transparent
  const col = new Int32Array(w * h).fill(-1);
  if (levels) {
    // brightness bands with the hue kept: shade ramps like a hand-made palette, no channel-by-channel blotches
    const step = 255 / (levels - 1),
      snap = (v) => Math.min(255, Math.max(0, Math.round(v / 8) * 8));
    for (let p = 0, i = 0; p < w * h; p++, i += 4) {
      if (!d[i + 3]) continue;
      const l = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
      // bands are spaced evenly in sqrt space, so dark scenes keep their shading steps
      const lq = Math.pow(Math.round((Math.sqrt(l / 255) * 255) / step) * step, 2) / 255,
        k = l > 0.5 ? lq / l : 0;
      col[p] = (snap(d[i] * k) << 16) | (snap(d[i + 1] * k) << 8) | snap(d[i + 2] * k);
    }
  } else {
    const P = palette(d, colors),
      M = matcher(P),
      pack = P.map(([r, gg, b]) => (r << 16) | (gg << 8) | b);
    for (let p = 0, i = 0; p < w * h; p++, i += 4) {
      if (!d[i + 3]) continue;
      const k = M.key(d[i], d[i + 1], d[i + 2]);
      let j = M.near[k];
      if (dither) {
        const x = p % w,
          y = (p / w) | 0,
          th = (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
        if (M.mix[k] * 2 > th + 0.08) j = M.second[k];
      }
      col[p] = pack[j];
    }
  }
  // stray-pixel cleanup (not on dithered layers, where the pattern is intended)
  if (!dither)
    for (let y = 1; y < h - 1; y++)
      for (let x = 1; x < w - 1; x++) {
        const p = y * w + x,
          a = col[p - 1];
        if (col[p] < 0 || a < 0 || a === col[p]) continue;
        if (col[p + 1] === a && col[p - w] === a && col[p + w] === a) col[p] = a;
      }
  for (let p = 0, i = 0; p < w * h; p++, i += 4) {
    const v = col[p];
    if (v < 0) continue;
    let r = (v >> 16) & 255,
      gg = (v >> 8) & 255,
      b = v & 255;
    if (outline || rim) {
      const x = p % w,
        y = (p / w) | 0,
        open = (q, ok) => ok && col[q] < 0;
      const edge =
        open(p - 1, x > 0) || open(p + 1, x < w - 1) || open(p - w, y > 0) || open(p + w, y < h - 1);
      if (edge && outline) {
        // darken towards the sprites' outline purple instead of plain black
        r = r * (1 - outline) + 27 * outline;
        gg = gg * (1 - outline) + 16 * outline;
        b = b * (1 - outline) + 36 * outline;
      } else if (rim && y > 1 && col[p - w] >= 0 && col[p - 2 * w] < 0) {
        r += (255 - r) * rim;
        gg += (248 - gg) * rim;
        b += (226 - b) * rim;
      }
    }
    d[i] = r;
    d[i + 1] = gg;
    d[i + 2] = b;
  }
  g.putImageData(id, 0, 0);
  return c;
}

/** Average color of rows y0..y1 of a canvas (the horizon of the sky, used as haze). */
function averageRows(c, y0, y1) {
  const d = c.getContext('2d').getImageData(0, y0, c.width, y1 - y0).data,
    s = [0, 0, 0];
  let n = 0;
  for (let i = 0; i < d.length; i += 16) {
    if (!d[i + 3]) continue;
    s[0] += d[i];
    s[1] += d[i + 1];
    s[2] += d[i + 2];
    n++;
  }
  return n ? s.map((v) => Math.round(v / n)) : [128, 128, 128];
}

export { averageRows, pixelize };
