/* XP and levels per character, saved in localStorage. */
const lvlOf = (x) => Math.min(10, 1 + Math.floor(Math.sqrt(x / 120)));
const xpAt = (l) => (l - 1) * (l - 1) * 120;
const XP = {
  data: {},
  load() {
    try {
      this.data = JSON.parse(localStorage.getItem('brf_xp_v1') || '{}') || {};
    } catch (e) {
      this.data = {};
    }
  },
  save() {
    try {
      localStorage.setItem('brf_xp_v1', JSON.stringify(this.data));
    } catch (e) {}
  },
  get(id) {
    return this.data[id] || 0;
  },
  lvl(id) {
    return lvlOf(this.get(id));
  },
  prog(id) {
    const x = this.get(id),
      l = lvlOf(x);
    return l >= 10 ? 1 : (x - xpAt(l)) / (xpAt(l + 1) - xpAt(l));
  },
  add(id, n) {
    const b = this.lvl(id);
    this.data[id] = this.get(id) + Math.max(0, Math.round(n));
    this.save();
    return this.lvl(id) > b;
  },
};

export { XP };
