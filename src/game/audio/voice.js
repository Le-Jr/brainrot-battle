/* Offline Chatterbox clips first; installed browser voices are a fallback. */
import { VOICE_CLIPS } from '../data/voice-clips.js';
import { voiceKey } from './voice-key.js';
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
  clipToken: 0,
  clipAudio: null,
  clipProtected: false,
  pendingLines: [],
  fallbackTimer: null,
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
    if (Object.keys(VOICE_CLIPS).length) return 'CHATTERBOX';
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
        const active = this.live.includes(u);
        this.live = this.live.filter((x) => x !== u);
        if (active) this.drain();
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
  clip(id, text, o = {}) {
    this.say(text, o);
  },
  startLine(text, o, token) {
    if (!this.on || token !== this.clipToken) return;
    const files = o.meme ? [o.meme] : VOICE_CLIPS[voiceKey(text, o.role || 'pt')];
    if (!files || typeof Audio === 'undefined') {
      this.fallback(text, o, token);
      return;
    }
    const play = (index) => {
      if (!this.on || token !== this.clipToken) return;
      if (index === files.length) {
        this.clipAudio = null;
        this.clipProtected = false;
        this.drain();
        return;
      }
      const audio = new Audio((o.meme ? '/audio/memes/' : '/audio/voices/') + files[index]);
      audio.volume = Math.max(0, Math.min(1, o.volume ?? 1));
      this.clipAudio = audio;
      this.clipProtected = !!o.meme;
      let failed = false;
      const fail = () => {
        if (failed || token !== this.clipToken) return;
        failed = true;
        audio.pause();
        this.clipAudio = null;
        this.clipProtected = false;
        this.fallback(text, o, token);
      };
      audio.onended = () => {
        if (!failed) play(index + 1);
      };
      audio.onerror = fail;
      try {
        audio.play().catch(fail);
      } catch {
        fail();
      }
    };
    play(0);
  },
  fallback(text, o, token) {
    if (!this.on || token !== this.clipToken) return;
    if (!('speechSynthesis' in window)) {
      this.drain();
      return;
    }
    // Chrome can drop the first utterance immediately after cancellation.
    this.fallbackTimer = setTimeout(() => {
      if (this.on && token === this.clipToken) this.speakNow(text, o);
    }, 110);
  },
  say(text, o = {}) {
    // Combat calls yield to an original meme; explicit scene exit/mute still stops it.
    if (this.clipProtected && this.clipAudio) return;
    this.stop();
    if (!this.on || !text) return;
    this.startLine(text, o, this.clipToken);
  },
  queue(text, o = {}) {
    if (!this.on || !text) return;
    if (this.clipAudio || this.live.length || this.fallbackTimer) {
      if (this.pendingLines.length < 2) this.pendingLines.push({ text, o });
    } else this.startLine(text, o, this.clipToken);
  },
  drain() {
    this.fallbackTimer = null;
    if (!this.on || this.clipAudio || this.live.length) return;
    const next = this.pendingLines.shift();
    if (next) this.startLine(next.text, next.o, this.clipToken);
  },
  stopClip() {
    this.clipProtected = false;
    this.clipToken++;
    clearTimeout(this.fallbackTimer);
    this.fallbackTimer = null;
    this.pendingLines = [];
    if (this.clipAudio) {
      this.clipAudio.pause();
      this.clipAudio.onended = null;
      this.clipAudio.onerror = null;
      this.clipAudio = null;
    }
  },
  stop() {
    this.stopClip();
    try {
      if ('speechSynthesis' in window) speechSynthesis.cancel();
    } catch (e) {}
    this.live = [];
  },
};
const ANN = { role: 'ann', pitch: 0.7, rate: 1.08 };
const IT = { role: 'it', pitch: 0.9, rate: 1.05 };

export { ANN, IT, VO };
