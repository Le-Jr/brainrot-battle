import assert from 'node:assert/strict';
import fs from 'node:fs';
import { T, main } from './harness.js';
import { prepareFrame, watchCanvasResolution } from '../src/game/core/canvas.js';
import { Intro } from '../src/game/scenes/intro.js';

let resize,
  disconnected = false;
globalThis.ResizeObserver = class {
  constructor(callback) {
    resize = callback;
  }
  observe() {}
  disconnect() {
    disconnected = true;
  }
};
const canvas = { width: 640, height: 360, clientWidth: 1120 };
globalThis.devicePixelRatio = 1;
const detach = watchCanvasResolution(canvas);
assert.equal(canvas.width, 1120);
assert.equal(canvas.height, 630);
canvas.clientWidth = 1920;
resize();
assert.equal(canvas.width, 1920, 'fullscreen uses native Full HD');
assert.equal(canvas.height, 1080);
globalThis.devicePixelRatio = 2;
resize();
assert.equal(canvas.width, 3840, 'retina uses physical pixel density');
canvas.clientWidth = 3000;
resize();
assert.equal(canvas.width, 3840, 'desktop rendering budget is bounded');
globalThis.matchMedia = () => ({ matches: true });
resize();
assert.equal(canvas.width, 1280, 'touch devices retain a smaller rendering budget');
detach();
assert.ok(disconnected, 'observer is cleaned up on destroy');

main.width = 1920;
main.height = 1080;
const g = main.getContext('2d');
const fight = new T.Fight(T.CH[0], T.CH[5], 0, { quiet: true, cpu: false, lv: [1, 1] });
fight.phase = 'fight';
T.Title.enter();
T.Title.phase = 'menu';
T.Title.mt = 40;
Object.assign(Intro, { phase: 'logo', t: 220, pt: 130 });
fs.mkdirSync('output/display', { recursive: true });
for (const [name, scene] of [
  ['intro', Intro],
  ['title', T.Title],
  ['fight', fight],
]) {
  prepareFrame();
  assert.equal(g.getTransform().a, 6);
  assert.equal(g.imageSmoothingEnabled, true);
  scene.draw();
  assert.equal(g.getTransform().a, 6, name + ': scene restores the render transform');
  fs.writeFileSync(`output/display/${name}-1080p.png`, main.toBuffer('image/png'));
}
console.log('ALL OK: desktop, fullscreen, Retina, touch budget, cleanup and real 1080p scenes');
