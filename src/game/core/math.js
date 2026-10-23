/* Small math helpers: random ranges, clamp, deterministic hash noise and value noise. */
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const hsh = (n) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const vn = (x) => {
  const i = Math.floor(x),
    f = x - i,
    u = f * f * (3 - 2 * f);
  return hsh(i) * (1 - u) + hsh(i + 1) * u;
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export { clamp, hsh, pick, rnd, shuffle, vn };
