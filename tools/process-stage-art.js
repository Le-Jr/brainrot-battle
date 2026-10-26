// Stage art pipeline: AI/hand-made stage images -> game-ready parallax layers.
//
// Input : assets/stage-art/<id>/{sky,far,mid,floor}.(png|jpg) + assets/stage-art/stages.json (placement)
// Output: public/stages/<id>/<layer>.png   (HD layers: sky 640, far 736, mid 832, floor 960 x 360; map 640)
//         src/game/data/stage-art.js       (which stages/layers have art and which animation hooks to drop)
// Steps per layer: crop a panel out of a layer sheet, cut the magenta background and haze, keep/clip/drop
// regions, scale and place it on the layer (ground line at y=272), tile it horizontally if asked, then the same limited palette + outline pass used by the painted
// stages (stages/pixelize.js), so art, sprites and HUD share one look.
// Usage: npm run stages:art
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { mapLayer, stagePalette } from '../src/game/stages/pixelize.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'assets', 'stage-art');
const OUT = path.join(ROOT, 'public', 'stages');
const LAYER_W = { sky: 640, far: 736, mid: 832, floor: 960, map: 640 };
const H = 360;

/** Background test: pure magenta and the pink blends around it (pink sunsets are kept: they are not this purple-pink). */
const isKey = (r, g, b) => r > 140 && b > 140 && g < 0.55 * Math.min(r, b);

function prepareSource(img, o) {
  // 'crop' picks one panel of a layer sheet (several layers in one image); every other fraction is then relative to it
  const [cx0, cy0, cx1, cy1] = o.crop || [0, 0, 1, 1],
    ox = Math.round(cx0 * img.width),
    oy = Math.round(cy0 * img.height),
    sw = Math.round(cx1 * img.width) - ox,
    sh = Math.round(cy1 * img.height) - oy,
    c = createCanvas(sw, sh),
    g = c.getContext('2d');
  g.drawImage(img, ox, oy, sw, sh, 0, 0, sw, sh);
  const id = g.getImageData(0, 0, sw, sh),
    d = id.data,
    rects = (a) => a && a.map(([x0, y0, x1, y1]) => [x0 * sw, y0 * sh, x1 * sw, y1 * sh]),
    inside = (r, x, y) => r.some(([a, b, c2, e]) => x >= a && x < c2 && y >= b && y < e),
    keep = rects(o.keep),
    cut = rects(o.drop);
  for (let y = 0; y < sh; y++)
    for (let x = 0; x < sw; x++) {
      const i = (y * sw + x) * 4;
      let drop = o.key && isKey(d[i], d[i + 1], d[i + 2]);
      if (o.clipBelow !== undefined && y >= o.clipBelow * sh) drop = true;
      if (o.clipAbove !== undefined && y < o.clipAbove * sh) drop = true;
      // 'haze': above this row, drop washed-out pixels (fog the generator painted behind grass blades)
      if (
        o.haze !== undefined &&
        y < o.haze * sh &&
        Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) < 70
      )
        drop = true;
      if (keep && !inside(keep, x, y)) drop = true;
      if (cut && inside(cut, x, y)) drop = true;
      if (drop) d[i + 3] = 0;
    }
  g.putImageData(id, 0, 0);
  return c;
}

function buildLayer(name, img, o) {
  const [LW, LH] = o.resolution || [LAYER_W[name], H];
  const out = createCanvas(LW, LH),
    g = out.getContext('2d'),
    src = prepareSource(img, o),
    s = o.width / src.width,
    w = src.width * s,
    h = src.height * s,
    y = o.anchor[1] - o.anchor[0] * src.height * s,
    x = o.x ?? (LW - w) / 2;
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  if (!o.tile) g.drawImage(src, x, y, w, h);
  else
    for (let k = Math.floor(-x / w) - 1; x + k * w < LW; k++) {
      const flip = o.tile === 'mirror' && k % 2 !== 0;
      g.save();
      g.translate(x + k * w + (flip ? w : 0), y);
      g.scale(flip ? -1 : 1, 1);
      g.drawImage(src, 0, 0, w, h);
      g.restore();
    }
  const opaque = name === 'sky' || name === 'map';
  if (opaque) {
    // the sky must cover the whole layer: fill any uncovered row with the nearest painted one
    const id = g.getImageData(0, 0, LW, H),
      d = id.data,
      row = LW * 4,
      painted = [];
    for (let yy = 0; yy < LH; yy++) if (d[yy * row + Math.floor(LW / 2) * 4 + 3] > 0) painted.push(yy);
    for (let yy = 0; yy < LH && painted.length; yy++) {
      const from =
        yy < painted[0] ? painted[0] : yy > painted[painted.length - 1] ? painted[painted.length - 1] : yy;
      if (from !== yy) d.copyWithin(yy * row, from * row, from * row + row);
    }
    for (let i = 0; i < d.length; i += 4) d[i + 3] = 255;
    g.putImageData(id, 0, 0);
  }
  mapLayer(out, stagePalette([out], o.colors || 64, 8), { cut: !opaque, outline: o.outline || 0 });
  return out;
}

const config = JSON.parse(fs.readFileSync(path.join(SRC, 'stages.json'), 'utf8'));
const manifest = {};
// Optional ids make it possible to rebuild the map without touching every arena.
const only = process.argv.slice(2);
for (const [id, st] of Object.entries(config)) {
  if (id.startsWith('_')) continue;
  if (only.length && !only.includes(id)) {
    const layers = Object.keys(st.layers).filter((name) => fs.existsSync(path.join(OUT, id, name + '.png')));
    if (layers.length) manifest[id] = { layers, off: st.off || [] };
    continue;
  }
  fs.mkdirSync(path.join(OUT, id), { recursive: true });
  const done = [];
  for (const [name, o] of Object.entries(st.layers)) {
    if (o.blank) {
      // the art covers this depth already: an empty layer hides the procedural painting
      fs.writeFileSync(
        path.join(OUT, id, name + '.png'),
        createCanvas(LAYER_W[name], H).toBuffer('image/png'),
      );
      done.push(name);
      console.log(`${id}/${name}.png`, 'blank');
      continue;
    }
    const file = path.join(SRC, id, o.src);
    if (!fs.existsSync(file)) {
      // the sources are not in git: keep a layer that was already processed on another machine
      const kept = fs.existsSync(path.join(OUT, id, name + '.png'));
      console.warn(`skip ${id}/${name}: ${o.src} not found${kept ? ' (keeping the processed layer)' : ''}`);
      if (kept) done.push(name);
      continue;
    }
    const layer = buildLayer(name, await loadImage(fs.readFileSync(file)), o);
    fs.writeFileSync(path.join(OUT, id, name + '.png'), layer.toBuffer('image/png'));
    done.push(name);
    console.log(`${id}/${name}.png`, layer.width + 'x' + layer.height);
  }
  if (done.length) manifest[id] = { layers: done, off: st.off || [] };
}
const lines = [
  '/* Generated by tools/process-stage-art.js: stages with image layers in public/stages/<id>/ and the procedural',
  '   animation hooks that are dropped because they no longer line up with the art. */',
  'const STAGE_ART = ' + JSON.stringify(manifest, null, 2).replace(/"(\w+)":/g, '$1:') + ';',
  '',
  'export { STAGE_ART };',
  '',
];
fs.writeFileSync(path.join(ROOT, 'src', 'game', 'data', 'stage-art.js'), lines.join('\n'));
console.log('manifest:', Object.keys(manifest).join(', '));
