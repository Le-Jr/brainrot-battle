/* Narrator: picks the most expressive installed voice per role (neural/"Natural" voices first),
   queues lines instead of cancelling them, and works around Chrome's dropped-after-cancel and
   garbage-collected-utterance bugs. Voices can be chosen in OPÇÕES. */
const VPREF = {
  ann: [
    /Andrew.*Natural/i,
    /Guy.*Natural/i,
    /Christopher.*Natural/i,
    /Brian.*Natural/i,
    /Eric.*Natural/i,
    /Davis.*Natural/i,
    /Natural/i,
    /Google UK English Male/i,
    /Daniel/i,
    /Alex/i,
    /Google US English/i,
  ],
  pt: [
    /Antonio.*Natural/i,
    /Francisca.*Natural/i,
    /Thalita.*Natural/i,
    /Natural/i,
    /Google portugu/i,
    /Luciana/i,
    /Felipe/i,
  ],
  it: [
    /Diego.*Natural/i,
    /Giuseppe.*Natural/i,
    /Isabella.*Natural/i,
    /Elsa.*Natural/i,
    /Natural/i,
    /Google italiano/i,
    /Luca/i,
    /Alice/i,
  ],
};
const VLANG = { ann: 'en', pt: 'pt', it: 'it' };
const VO = {
  on: true,
  voices: [],
  live: [],
  lastStart: 0,
  choice: { ann: '', pt: '', it: '' },
  init() {
    try {
      const c = JSON.parse(localStorage.getItem('brb_voice') || '{}');
      Object.assign(this.choice, c);
    } catch (e) {}
    if (!('speechSynthesis' in window)) return;
    const load = () => {
      try {
        const v = speechSynthesis.getVoices();
        if (v && v.length) this.voices = v;
      } catch (e) {}
    };
    load();
    try {
      if (speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', load);
      else speechSynthesis.onvoiceschanged = load;
    } catch (e) {}
    setInterval(() => {
      try {
        if (speechSynthesis.paused) speechSynthesis.resume();
        if (speechSynthesis.speaking && performance.now() - this.lastStart > 15000) {
          speechSynthesis.cancel();
          this.live = [];
        }
      } catch (e) {}
    }, 2000);
  },
  list(role) {
    if (!this.voices.length) {
      try {
        this.voices = speechSynthesis.getVoices() || [];
      } catch (e) {}
    }
    const b = VLANG[role];
    return this.voices.filter((v) => (v.lang || '').toLowerCase().startsWith(b));
  },
  pick(role) {
    const L = this.list(role);
    if (!L.length) return null;
    if (this.choice[role]) {
      const c = L.find((v) => v.name === this.choice[role]);
      if (c) return c;
    }
    for (const re of VPREF[role]) {
      const v = L.find((v) => re.test(v.name));
      if (v) return v;
    }
    return L[0];
  },
  cycle(role) {
    const L = this.list(role);
    if (!L.length) return '';
    const cur = this.pick(role);
    const i = (L.indexOf(cur) + 1) % L.length;
    this.choice[role] = L[i].name;
    try {
      localStorage.setItem('brb_voice', JSON.stringify(this.choice));
    } catch (e) {}
    return L[i].name;
  },
  label(role) {
    const v = this.pick(role);
    return v
      ? v.name
          .replace(/Microsoft |Google |Online |\(Natural\)| - .*$/g, '')
          .trim()
          .slice(0, 16)
      : 'SEM VOZ';
  },
  speakNow(text, o) {
    try {
      const role = o.role || 'pt';
      const u = new SpeechSynthesisUtterance(text);
      const v = this.pick(role);
      u.lang = v ? v.lang : { ann: 'en-US', pt: 'pt-BR', it: 'it-IT' }[role];
      if (v) u.voice = v;
      const natural = v && /Natural|Neural/i.test(v.name);
      u.pitch = o.pitch === undefined ? 1 : natural ? 1 + (o.pitch - 1) * 0.6 : o.pitch;
      u.rate = o.rate === undefined ? 1 : o.rate;
      u.volume = 1;
      const done = () => {
        this.live = this.live.filter((x) => x !== u);
      };
      u.onstart = () => {
        this.lastStart = performance.now();
      };
      u.onend = done;
      u.onerror = done;
      this.live.push(u);
      this.lastStart = performance.now();
      speechSynthesis.speak(u);
    } catch (e) {}
  },
  say(text, o = {}) {
    if (!this.on || !text || !('speechSynthesis' in window)) return;
    try {
      if (speechSynthesis.speaking || speechSynthesis.pending) {
        speechSynthesis.cancel();
        this.live = [];
        setTimeout(() => this.speakNow(text, o), 110);
      } else this.speakNow(text, o);
    } catch (e) {}
  },
  queue(text, o = {}) {
    if (!this.on || !text || !('speechSynthesis' in window)) return;
    try {
      if (speechSynthesis.pending) return;
    } catch (e) {}
    this.speakNow(text, o);
  },
  stop() {
    try {
      if ('speechSynthesis' in window) speechSynthesis.cancel();
    } catch (e) {}
    this.live = [];
  },
};
const ANN = { role: 'ann', pitch: 0.7, rate: 1.08 };
const IT = { role: 'it', pitch: 0.9, rate: 1.05 };

export { ANN, IT, VO };
