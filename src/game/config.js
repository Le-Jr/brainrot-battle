/** Logical resolution (the backbuffer is 2x), arena width and floor line. */
const W = 320,
  H = 180,
  WORLD = 480,
  FLOOR = 164;
/** Canvas font stack. The page passes the self-hosted Next font family through setFont(). */
let FONT = '"Press Start 2P", monospace';
function setFont(family) {
  FONT = family + ', monospace';
}
const REDUCED =
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;
const GAME = 'BRAINROT BATTAGLIA';

export { FLOOR, FONT, GAME, H, REDUCED, W, WORLD, setFont };
