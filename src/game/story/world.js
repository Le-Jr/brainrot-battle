/* Shared story panels: world prologue, call to adventure, boss defeat and epilogue. */
import { BLK, PRP, pnx } from './panels.js';

const WORLD_PRO = [
  pnx(
    [9, BLK, 40],
    [],
    'Muito além da internet existe BRAINROTÁLIA: a terra paralela onde moram os memes mais absurdos já criados.',
    null,
    'zoom',
  ),
  pnx(
    [1, null, 120],
    [
      ['tralalero', 'idle', 60, 150, 1, 1],
      ['tung', 'idle', 110, 150, 1, 1],
      ['chimp', 'idle', 160, 150, -1, 1],
      ['ballerina', 'idle', 210, 150, -1, 1],
      ['patapim', 'idle', 260, 150, -1, 1],
    ],
    'Durante séculos, todos viveram em paz. Bastava um tralalá, um tung tung, um bananini... e o mundo sorria.',
  ),
  pnx(
    [9, PRP, 60],
    [['B', 'idle', 160, 140, -1, 2]],
    'Até a noite em que uma sombra surgiu nos anéis de Saturno. Ela trazia o ALGORITMO, um sinal capaz de controlar qualquer meme.',
    null,
    'flash',
  ),
  pnx(
    [9, 'rgba(90,0,60,.5)', 60],
    [['B', 'win', 160, 156, -1, 2.4]],
    'MUUU! Com o ALGORITMO, todos os brainrots vão dançar conforme a MINHA música! Para sempre!',
    'B',
    'shake',
  ),
  pnx(
    [1, PRP, 120],
    [
      ['tralalero', 'hit', 70, 150, 1, 1, 0, 1],
      ['bombardiro', 'idle', 130, 140, 1, 1, 0, 1],
      ['assassino', 'idle', 190, 150, -1, 1, 0, 1],
      ['lirili', 'idle', 250, 150, -1, 1, 0, 1],
    ],
    'Um a um, os brainrots foram hipnotizados. Os olhos ficaram roxos. As vozes, ocas. Brainrotália caiu em silêncio.',
    null,
    'glitch',
  ),
];
const CALL_PANEL = pnx(
  [9, PRP, 80],
  [['P', 'special', 160, 150, 1, 2]],
  'Apenas um coração resistiu ao sinal. Sete rivais hipnotizados no caminho. Uma vaca cósmica no fim. O Torneio Furioso começou.',
  null,
  'flash',
);
const BOSS_DEFEAT = [
  pnx(
    [9, 'rgba(120,0,0,.35)', 80],
    [['B', 'hit', 160, 150, -1, 2]],
    'Impossível... O algoritmo... está... TRAVANDO! Muuu... MUUUUUU!',
    'B',
    'shake',
  ),
  pnx(
    [9, 'rgba(255,255,255,.25)', 80],
    [['B', 'down', 160, 140, -1, 2, 1]],
    'Os anéis de Saturno racharam. Uma luz roxa explodiu pelo céu de Brainrotália, apagando o sinal de uma vez por todas.',
    null,
    'flash',
  ),
  pnx(
    [1, null, 120],
    [
      ['tralalero', 'win', 50, 150, 1, 1],
      ['tung', 'win', 95, 150, 1, 1],
      ['bombardiro', 'win', 140, 140, 1, 1],
      ['chimp', 'win', 185, 150, -1, 1],
      ['lirili', 'win', 230, 150, -1, 1],
      ['ballerina', 'win', 275, 150, -1, 1],
    ],
    'Lá embaixo, os olhos roxos se apagaram. Um a um, os brainrots acordaram. E lembraram de quem os libertou.',
  ),
];
const EPILOGUE = [
  pnx(
    [9, 'rgba(0,0,0,.72)', 40],
    [['B', 'down', 230, 150, -1, 1, 1, 1]],
    'Mas entre os destroços do anel, algo piscou. Um último "muuu" ecoou pelo vácuo... O algoritmo nunca morre de verdade. CONTINUA?',
    null,
    'glitch',
  ),
];

export { BOSS_DEFEAT, CALL_PANEL, EPILOGUE, WORLD_PRO };
