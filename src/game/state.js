/* Mutable run state shared by the scenes: settings (SET), the current run (S) and debug toggles (DEBUG). */
const SET = { music: 0.42, crt: false };
const S = { mode: 'arcade', diff: 1, ladder: [], li: 0, p1: 0, p2: 1, loc: 0, bdone: {}, car: 'nonno' };
const DEBUG = { showBox: false };

export { DEBUG, S, SET };
