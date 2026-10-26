/** Extract connected silhouettes from generated sheets so extended swords/kicks aren't cut at grid lines. */
import fs from 'node:fs';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { mapLayer, stagePalette } from '../src/game/stages/pixelize.js';
fs.mkdirSync('output/finale/fighters', { recursive: true });
for (const [name, source, targetHeight] of [
  ['boss', 'boss-v2', 138],
  ['bribri', 'bribri', 130],
]) {
  const image = await loadImage(`assets/finale-art/${source}.png`);
  const canvas = createCanvas(image.width, image.height),
    g = canvas.getContext('2d');
  g.drawImage(image, 0, 0);
  const pixels = g.getImageData(0, 0, image.width, image.height),
    d = pixels.data;
  const labels = new Int32Array(image.width * image.height).fill(-1),
    groups = [];
  for (let at = 0; at < labels.length; at++) {
    if (labels[at] !== -1 || d[at * 4 + 3] < 96) continue;
    const id = groups.length,
      queue = [at];
    labels[at] = id;
    let l = image.width,
      r = 0,
      top = image.height,
      bottom = 0;
    for (let q = 0; q < queue.length; q++) {
      const p = queue[q],
        x = p % image.width,
        y = Math.floor(p / image.width);
      l = Math.min(l, x);
      r = Math.max(r, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
      for (const [dx, dy] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ]) {
        const nx = x + dx,
          ny = y + dy,
          n = ny * image.width + nx;
        if (
          nx < 0 ||
          nx >= image.width ||
          ny < 0 ||
          ny >= image.height ||
          labels[n] !== -1 ||
          d[n * 4 + 3] < 96
        )
          continue;
        labels[n] = id;
        queue.push(n);
      }
    }
    const col = Math.min(3, Math.floor((l + r) / 2 / (image.width / 4)));
    const row = Math.min(3, Math.floor((top + bottom) / 2 / (image.height / 4)));
    groups.push({ id, area: queue.length, l, r, top, bottom, cell: row * 4 + col });
  }
  const atlas = createCanvas(1024, 832),
    ag = atlas.getContext('2d');
  const meta = [];
  for (let cell = 0; cell < 16; cell++) {
    const owned = groups.filter((group) => group.cell === cell && group.area >= 120);
    if (!owned.length) throw new Error(`${name} missing pose ${cell}`);
    const ids = new Set(owned.map((group) => group.id));
    const l = Math.min(...owned.map((b) => b.l)),
      r = Math.max(...owned.map((b) => b.r));
    const top = Math.min(...owned.map((b) => b.top)),
      bottom = Math.max(...owned.map((b) => b.bottom));
    const w = r - l + 1,
      h = bottom - top + 1;
    const cut = createCanvas(w, h),
      cg = cut.getContext('2d'),
      data = cg.createImageData(w, h);
    for (let y = top; y <= bottom; y++)
      for (let x = l; x <= r; x++) {
        const p = y * image.width + x;
        if (!ids.has(labels[p])) continue;
        const target = ((y - top) * w + x - l) * 4;
        data.data.set(d.subarray(p * 4, p * 4 + 4), target);
        data.data[target + 3] = 255;
      }
    cg.putImageData(data, 0, 0);
    const ratio = cell === 3 ? 0.72 : cell === 14 ? 0.9 : cell === 15 ? 1.08 : 1;
    const scale =
      cell === 13
        ? Math.min(176 / w, 62 / h)
        : Math.min((targetHeight * ratio) / h, (128 + (meta[0]?.width ?? 120) / 2 - 4) / w);
    const dw = Math.round(w * scale),
      dh = Math.round(h * scale);
    // Fix the rear side of attack poses at the idle's rear; allow forward reach to grow.
    const attacking = [4, 5, 6, 7, 8, 9, 10, 11].includes(cell);
    const idleWidth = meta[0]?.width ?? dw;
    const pivot = attacking ? Math.min(dw - 8, idleWidth * 0.5) : dw / 2;
    const x = (cell % 4) * 256 + Math.round(128 - pivot),
      y = Math.floor(cell / 4) * 208 + 199 - dh;
    ag.imageSmoothingQuality = 'high';
    ag.drawImage(cut, 0, 0, w, h, x, y, dw, dh);
    meta.push({ cell, width: dw, height: dh, components: owned.length });
  }
  mapLayer(atlas, stagePalette([atlas], 64, 8), { cut: true, outline: 0 });
  fs.writeFileSync(`public/stages/finale/${name}.png`, atlas.toBuffer('image/png'));
  fs.writeFileSync(`output/finale/fighters/${name}.png`, atlas.toBuffer('image/png'));
  fs.writeFileSync(`output/finale/fighters/${name}.json`, JSON.stringify(meta, null, 2));
  console.log(name, '16 poses, 1024x832, 64-colour palette');
}
