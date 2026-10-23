// Runs the real engine modules inside Node with a real 2D canvas (@napi-rs/canvas) and minimal DOM stubs.
// Tests drive the game by stepping frames (T.step) and injecting key presses (T.pressedQ / T.keys).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, Image as NImage } from '@napi-rs/canvas';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// Image loads files from public/ (the engine requests /atlases/<id>.png)
class Img {
  set src(v) {
    // @napi-rs/canvas decodes asynchronously: only report the load once the pixels are ready
    const im = new NImage();
    im.onload = () => {
      this.width = im.width;
      this.height = im.height;
      if (this.onload) this.onload();
    };
    im.onerror = (e) => this.onerror && this.onerror(e);
    this._i = im;
    im.src = fs.readFileSync(path.join(ROOT, 'public', v));
  }
  get src() {
    return '';
  }
}
const store = {};
Object.assign(globalThis, {
  window: globalThis,
  Image: Img,
  document: { createElement: () => createCanvas(1, 1), fonts: null },
  matchMedia: () => ({ matches: false }),
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => {},
  localStorage: { getItem: (k) => store[k] || null, setItem: (k, v) => (store[k] = v) },
});
// drawImage must unwrap our Img wrapper
const proto = Object.getPrototypeOf(createCanvas(1, 1).getContext('2d'));
const drawImage = proto.drawImage;
proto.drawImage = function (img, ...a) {
  return drawImage.call(this, img && img._i ? img._i : img, ...a);
};

const G = '../src/game/';
const [
  engine,
  scene,
  input,
  state,
  roster,
  boss,
  cars,
  fight,
  fighter,
  ai,
  training,
  bonus,
  fightScene,
  xp,
  sprite,
  hd,
  scenes,
  story,
  stages,
  fx,
] = await Promise.all(
  [
    'index.js',
    'core/scene.js',
    'core/input.js',
    'state.js',
    'characters/roster.js',
    'characters/fighters/saturnita.js',
    'characters/cars.js',
    'combat/fight.js',
    'combat/fighter.js',
    'combat/ai.js',
    'combat/training.js',
    'combat/bonus.js',
    'scenes/fight-scene.js',
    'progression/xp.js',
    'sprites/sprite.js',
    'sprites/hd.js',
    'scenes/all.js',
    'story/all.js',
    'stages/index.js',
    'fx/particles.js',
  ].map((p) => import(G + p)),
);

const main = createCanvas(640, 360);
await engine.createGame({ canvas: main, autoStart: false, keyboardTarget: null }).ready;

export const T = {
  ...scenes,
  ...story,
  S: state.S,
  go: scene.go,
  step: scene.step,
  get scene() {
    return scene.scene;
  },
  keys: input.keys,
  pressedQ: input.pressedQ,
  CH: roster.CH,
  BOSS: boss.BOSS,
  CARS: cars.CARS,
  Fight: fight.Fight,
  Fighter: fighter.Fighter,
  AI: ai.AI,
  Training: training.Training,
  Bonus: bonus.Bonus,
  FightScene: fightScene.FightScene,
  XP: xp.XP,
  profile: sprite.profile,
  sprite: sprite.sprite,
  HD: hd.HD,
  STG: () => stages.STAGES,
  FX: fx.FX,
  setShow: (v) => (state.DEBUG.showBox = v),
};
export { main, createCanvas };
