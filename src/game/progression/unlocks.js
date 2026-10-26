/** Special characters are unlocked only by a completed story match; tests use a memory-only copy. */
export const UNLOCKS = {
  data: {},
  saved: null,
  load() {
    try {
      const value = JSON.parse(localStorage.getItem('brb_unlocks_v1') || '{}');
      this.data = { bribri: value?.bribri === true };
    } catch {
      this.data = {};
    }
  },
  has(id) {
    return this.data[id] === true;
  },
  unlock(id) {
    if (this.has(id)) return false;
    this.data[id] = true;
    if (!this.saved) {
      try {
        localStorage.setItem('brb_unlocks_v1', JSON.stringify(this.data));
      } catch {
        /* memory unlock still works */
      }
    }
    return true;
  },
  beginSandbox() {
    if (!this.saved) {
      this.saved = this.data;
      this.data = { ...this.data };
    }
  },
  endSandbox() {
    if (this.saved) {
      this.data = this.saved;
      this.saved = null;
    }
  },
};
