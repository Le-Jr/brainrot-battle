/* Cutscene panel builders and shared tint colors. */
const DK = 'rgba(14,6,34,.55)',
  RDT = 'rgba(70,0,40,.38)';
const pn = (bg, a, tx, sp) => ({ bg, a, tx, sp });
const solo = (pose, x = 160, dir = 1) => [['P', pose, x, 128, dir, 2]];
const vsBoss = [
  ['P', 'win', 110, 128, 1, 2],
  ['B', 'down', 236, 128, -1, 1, 1],
];
const PRP = 'rgba(70,10,110,.45)',
  BLK = 'rgba(0,0,0,.6)';
const pnx = (bg, a, tx, sp, fx) => ({ bg, a, tx, sp, fx });

export { BLK, DK, PRP, RDT, pn, pnx, solo, vsBoss };
