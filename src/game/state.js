/* Mutable run state shared by the scenes: settings (SET), the current run (S) and debug toggles (DEBUG). */
const SET = { music: 0.3, effects: 0.6, voice: 0.85, crt: false };
const S = {
  mode: 'arcade',
  vsCpu: true,
  diff: 1,
  ladder: [],
  li: 0,
  p1: 0,
  p2: 1,
  loc: 0,
  bdone: {},
  car: 'nonno',
};
const DEBUG = {
  showBox: false,
  local: false,
  testing: false,
  god: false,
  infiniteMeter: false,
  freezeTimer: false,
  freezeCpu: false,
};

export { DEBUG, S, SET };
