/* Scene manager (go/step) and the fixed-timestep render loop. */
import { VO } from '../audio/voice.js';
import { prepareFrame } from './canvas.js';
import { pressedQ } from './input.js';

let inspector = null;
function setInspector(value) {
  inspector = value;
}
function drawScene() {
  scene.draw();
  inspector?.draw(scene);
}

let scene = null,
  tick = 0;
function go(s) {
  VO.stop();
  scene = s;
  if (s.enter) s.enter();
}
function step() {
  tick++;
  if (inspector?.beforeStep(scene)) {
    pressedQ.clear();
    return;
  }
  scene.update();
  pressedQ.clear();
}

/* Fixed 60 Hz logic step with an accumulator (max 4 catch-up steps); rendering on requestAnimationFrame. */
let acc = 0,
  last = 0,
  raf = 0;
function frame(now) {
  acc += Math.min(100, now - last);
  last = now;
  let n = 0;
  while (acc >= 1000 / 60 && n < 4) {
    step();
    acc -= 1000 / 60;
    n++;
  }
  if (n === 4) acc = 0;
  prepareFrame();
  try {
    drawScene();
  } catch (e) {
    console.error(e);
  }
  raf = requestAnimationFrame(frame);
}
function startLoop() {
  if (raf) return;
  acc = 0;
  last = performance.now();
  raf = requestAnimationFrame(frame);
}
function stopLoop() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

export { drawScene, go, scene, setInspector, startLoop, step, stopLoop, tick };
