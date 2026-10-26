/** 5×7 arcade bitmap lettering. Small labels stay on the pixel grid instead of shrinking a display font. */
const GLYPHS = {
  A: [14, 17, 17, 31, 17, 17, 17],
  B: [30, 17, 17, 30, 17, 17, 30],
  C: [14, 17, 16, 16, 16, 17, 14],
  D: [30, 17, 17, 17, 17, 17, 30],
  E: [31, 16, 16, 30, 16, 16, 31],
  F: [31, 16, 16, 30, 16, 16, 16],
  G: [14, 17, 16, 23, 17, 17, 15],
  H: [17, 17, 17, 31, 17, 17, 17],
  I: [14, 4, 4, 4, 4, 4, 14],
  J: [7, 2, 2, 2, 18, 18, 12],
  K: [17, 18, 20, 24, 20, 18, 17],
  L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17],
  N: [17, 25, 25, 21, 19, 19, 17],
  O: [14, 17, 17, 17, 17, 17, 14],
  P: [30, 17, 17, 30, 16, 16, 16],
  Q: [14, 17, 17, 17, 21, 18, 13],
  R: [30, 17, 17, 30, 20, 18, 17],
  S: [15, 16, 16, 14, 1, 1, 30],
  T: [31, 4, 4, 4, 4, 4, 4],
  U: [17, 17, 17, 17, 17, 17, 14],
  V: [17, 17, 17, 17, 17, 10, 4],
  W: [17, 17, 17, 21, 21, 21, 10],
  X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4],
  Z: [31, 1, 2, 4, 8, 16, 31],
  0: [14, 17, 19, 21, 25, 17, 14],
  1: [4, 12, 4, 4, 4, 4, 14],
  2: [14, 17, 1, 2, 4, 8, 31],
  3: [30, 1, 1, 14, 1, 1, 30],
  4: [2, 6, 10, 18, 31, 2, 2],
  5: [31, 16, 16, 30, 1, 1, 30],
  6: [14, 16, 16, 30, 17, 17, 14],
  7: [31, 1, 2, 4, 8, 8, 8],
  8: [14, 17, 17, 14, 17, 17, 14],
  9: [14, 17, 17, 15, 1, 1, 14],
  '.': [0, 0, 0, 0, 0, 12, 12],
  ',': [0, 0, 0, 0, 4, 4, 8],
  ':': [0, 4, 4, 0, 4, 4, 0],
  ';': [0, 4, 4, 0, 4, 4, 8],
  '!': [4, 4, 4, 4, 4, 0, 4],
  '?': [14, 17, 1, 2, 4, 0, 4],
  '-': [0, 0, 0, 31, 0, 0, 0],
  '+': [0, 4, 4, 31, 4, 4, 0],
  '/': [1, 2, 2, 4, 8, 8, 16],
  '(': [2, 4, 8, 8, 8, 4, 2],
  ')': [8, 4, 2, 2, 2, 4, 8],
  '<': [1, 2, 4, 8, 4, 2, 1],
  '>': [16, 8, 4, 2, 4, 8, 16],
  '=': [0, 0, 31, 0, 31, 0, 0],
  "'": [4, 4, 8, 0, 0, 0, 0],
  '"': [10, 10, 0, 0, 0, 0, 0],
  '%': [17, 2, 4, 4, 8, 16, 17],
  '[': [14, 8, 8, 8, 8, 8, 14],
  ']': [14, 2, 2, 2, 2, 2, 14],
  _: [0, 0, 0, 0, 0, 0, 31],
  '←': [0, 4, 8, 31, 8, 4, 0],
  '→': [0, 4, 2, 31, 2, 4, 0],
  '↑': [4, 14, 21, 4, 4, 4, 0],
  '↓': [0, 4, 4, 4, 21, 14, 4],
  '↘': [0, 16, 8, 5, 3, 7, 0],
  '½': [16, 16, 2, 4, 10, 2, 3],
  '©': [14, 17, 23, 21, 23, 17, 14],
  '*': [0, 21, 14, 31, 14, 21, 0],
  '·': [0, 0, 0, 4, 0, 0, 0],
  '…': [0, 0, 0, 0, 0, 0, 21],
  ' ': [0, 0, 0, 0, 0, 0, 0],
};
const cache = new Map();
function glyphImage(character, color) {
  const key = character + color;
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas');
  c.width = 7;
  c.height = 11;
  const g = c.getContext('2d');
  g.fillStyle = color;
  const [base, mark] = character.normalize('NFD');
  const rows = GLYPHS[base] || GLYPHS['?'];
  rows.forEach((row, y) => {
    for (let x = 0; x < 5; x++) if (row & (1 << (4 - x))) g.fillRect(x, y + 3, 1, 1);
  });
  if (mark === '\u0301') {
    g.fillRect(3, 0, 1, 1);
    g.fillRect(2, 1, 1, 1);
  }
  if (mark === '\u0300') {
    g.fillRect(1, 0, 1, 1);
    g.fillRect(2, 1, 1, 1);
  }
  if (mark === '\u0302') {
    g.fillRect(2, 0, 1, 1);
    g.fillRect(1, 1, 1, 1);
    g.fillRect(3, 1, 1, 1);
  }
  if (mark === '\u0303') {
    g.fillRect(1, 0, 2, 1);
    g.fillRect(3, 1, 2, 1);
  }
  if (mark === '\u0327') g.fillRect(2, 10, 1, 1);
  if (cache.size > 512) cache.clear();
  cache.set(key, c);
  return c;
}
export function pixelText(g, text, x, y, size, color, align, shadow) {
  const chars = Array.from(text.toUpperCase());
  const width = chars.length * size;
  const left = Math.round(x - (align === 'center' ? width / 2 : align === 'right' ? width : 0));
  chars.forEach((char, i) => {
    if (shadow) g.drawImage(glyphImage(char, shadow), left + i * size + 1, y - 2);
    g.drawImage(glyphImage(char, color), left + i * size, y - 3);
  });
}
