/* Keyboard and virtual-button state, pad maps for P1/P2 and the per-step "just pressed" queue. */
import { AU } from '../audio/synth.js';

const keys = new Set(),
  pressedQ = new Set();
const GAMEKEYS = new Set([
  'Tab',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Space',
  'Enter',
  'NumpadEnter',
  'Slash',
  'Comma',
  'Period',
  'Backspace',
]);
const PADS = {
  p1: {
    left: ['KeyA', 'T_left'],
    right: ['KeyD', 'T_right'],
    up: ['KeyW', 'T_up'],
    down: ['KeyS', 'T_down'],
    p: ['KeyJ', 'T_p'],
    k: ['KeyK', 'T_k'],
    s: ['KeyL', 'T_s'],
  },
  p1x: {
    left: ['ArrowLeft'],
    right: ['ArrowRight'],
    up: ['ArrowUp'],
    down: ['ArrowDown'],
    p: ['KeyZ'],
    k: ['KeyX'],
    s: ['KeyC'],
  },
  p2: {
    left: ['ArrowLeft'],
    right: ['ArrowRight'],
    up: ['ArrowUp'],
    down: ['ArrowDown'],
    p: ['KeyB', 'Comma', 'Numpad1'],
    k: ['KeyN', 'Period', 'Numpad2'],
    s: ['KeyM', 'Slash', 'Numpad3'],
  },
};
function readPad(...names) {
  const o = {};
  for (const a of ['left', 'right', 'up', 'down', 'p', 'k', 's']) {
    let h = false,
      pr = false;
    for (const n of names)
      for (const c of PADS[n][a]) {
        if (keys.has(c)) h = true;
        if (pressedQ.has(c)) pr = true;
      }
    o[a] = h;
    o['p' + a] = pr;
  }
  return o;
}
const anyPressed = (list) => list.some((c) => pressedQ.has(c));
const CONFIRM = ['Enter', 'Space', 'NumpadEnter', 'KeyJ', 'KeyZ', 'T_p', 'T_start'];
const CONFIRM2 = ['KeyB', 'Comma', 'Numpad1', 'NumpadEnter'];
const START = ['Enter', 'NumpadEnter', 'Escape', 'T_start'];
const menuPad = () => readPad('p1', 'p1x');

/** Listen to the keyboard on `target` (window by default). Returns a function that removes the listeners. */
function attachKeyboard(target = window) {
  const down = (e) => {
    if (e.target && e.target.tagName === 'BUTTON' && (e.code === 'Enter' || e.code === 'Space')) return;
    if (GAMEKEYS.has(e.code)) e.preventDefault();
    if (!keys.has(e.code)) pressedQ.add(e.code);
    keys.add(e.code);
    AU.init();
  };
  const up = (e) => keys.delete(e.code);
  const blur = () => keys.clear();
  target.addEventListener('keydown', down);
  target.addEventListener('keyup', up);
  target.addEventListener('blur', blur);
  return () => {
    target.removeEventListener('keydown', down);
    target.removeEventListener('keyup', up);
    target.removeEventListener('blur', blur);
  };
}
/** Virtual buttons used by the touch pad: T_left, T_right, T_up, T_down, T_p, T_k, T_s, T_start. */
function pressVirtual(code) {
  AU.init();
  if (!keys.has(code)) pressedQ.add(code);
  keys.add(code);
}
function releaseVirtual(code) {
  keys.delete(code);
}

export {
  CONFIRM,
  CONFIRM2,
  START,
  anyPressed,
  attachKeyboard,
  keys,
  menuPad,
  pressVirtual,
  pressedQ,
  readPad,
  releaseVirtual,
};
