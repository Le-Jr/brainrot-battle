/* Web Audio synthesizer (AU): 2-operator FM voices, noise drums, reverb/delay bus, sequencer and SFX. */
import { SET } from '../state.js';
import { TRACKS, chordInfo, mf, noteMidi } from './tracks.js';
import { MUSIC_FILES } from './music-files.js';
import { IMPORTED_MUSIC } from './imported-music.js';
import { loadAudioSettings, saveAudioSettings } from './settings.js';

const AU = {
  ctx: null,
  music: true,
  cur: null,
  track: null,
  step: 0,
  nextT: 0,
  pending: null,
  renderedSource: null,
  loadVersion: 0,
  buffers: new Map(),
  ducking: 1,
  init() {
    if (this.ctx) {
      if (this.ctx.state !== 'running') this.ctx.resume();
      return;
    }
    loadAudioSettings();
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    let c;
    try {
      c = this.ctx = new C();
    } catch (e) {
      return;
    }
    this.master = c.createGain();
    this.master.gain.value = 0.72;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    this.master.connect(comp);
    comp.connect(c.destination);
    this.mg = c.createGain();
    this.mg.gain.value = this.music ? SET.music : 0;
    this.mg.connect(this.master);
    this.sg = c.createGain();
    this.sg.gain.value = SET.effects;
    this.sg.connect(this.master);
    // small room reverb for the "arcade cabinet" feel
    const len = Math.floor(c.sampleRate * 1.1),
      ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    this.rev = c.createConvolver();
    this.rev.buffer = ir;
    const rg = c.createGain();
    rg.gain.value = 0.22;
    this.rev.connect(rg);
    rg.connect(this.mg);
    this.lead = c.createGain();
    this.lead.connect(this.mg);
    this.lead.connect(this.rev);
    const dl = c.createDelay(1);
    dl.delayTime.value = 0.21;
    const fb = c.createGain();
    fb.gain.value = 0.22;
    const dg = c.createGain();
    dg.gain.value = 0.2;
    this.lead.connect(dl);
    dl.connect(fb);
    fb.connect(dl);
    dl.connect(dg);
    dg.connect(this.mg);
    this.p25 = this.pulse(0.25);
    this.p12 = this.pulse(0.125);
    this.p50 = this.pulse(0.5);
    const nlen = c.sampleRate;
    const b = c.createBuffer(1, nlen, c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < nlen; i++) d[i] = Math.random() * 2 - 1;
    this.nb = b;
    if (!this.timer) this.timer = setInterval(() => this.tick(), 25);
    if (this.pending) {
      const p = this.pending;
      this.pending = null;
      this.cur = null;
      this.play(p);
    }
  },
  pulse(duty) {
    const n = 40,
      re = new Float32Array(n),
      im = new Float32Array(n);
    for (let i = 1; i < n; i++) re[i] = (2 * Math.sin(Math.PI * i * duty)) / (Math.PI * i);
    return this.ctx.createPeriodicWave(re, im);
  },
  env(g, t, dur, vol, a, sus) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + a);
    g.gain.setTargetAtTime(vol * sus, t + a, dur * 0.25 + 0.001);
    g.gain.setTargetAtTime(0.0001, t + dur, 0.035);
  },
  osc(type, freq, t, dur, vol, dest, o = {}) {
    const c = this.ctx,
      os = c.createOscillator();
    if (typeof type === 'string') os.type = type;
    else os.setPeriodicWave(type);
    os.frequency.setValueAtTime(freq, t);
    if (o.slide) os.frequency.exponentialRampToValueAtTime(Math.max(20, o.slide), t + (o.st || dur));
    if (o.det) os.detune.value = o.det;
    const g = c.createGain();
    this.env(g, t, dur, vol, o.a || 0.005, o.sus === undefined ? 0.7 : o.sus);
    let src = os;
    if (o.filter) {
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(o.filter, t);
      if (o.fenv) f.frequency.exponentialRampToValueAtTime(Math.max(80, o.fenv), t + dur);
      f.Q.value = o.q || 1;
      os.connect(f);
      src = f;
    }
    src.connect(g);
    g.connect(dest);
    if (o.vib && dur > 0.18) {
      const l = c.createOscillator();
      l.frequency.value = 5.6;
      const lg = c.createGain();
      lg.gain.setValueAtTime(0, t);
      lg.gain.linearRampToValueAtTime(freq * 0.012, t + 0.25);
      l.connect(lg);
      lg.connect(os.frequency);
      l.start(t);
      l.stop(t + dur + 0.3);
    }
    os.start(t);
    os.stop(t + dur + 0.4);
  },
  /* 2-operator FM voice, the core of the YM2151-style arcade sound */
  fm(freq, t, dur, vol, dest, o = {}) {
    const c = this.ctx,
      car = c.createOscillator(),
      mod = c.createOscillator(),
      mg = c.createGain(),
      g = c.createGain();
    car.type = o.ct || 'sine';
    car.frequency.setValueAtTime(freq, t);
    mod.frequency.setValueAtTime(freq * (o.r || 1), t);
    if (o.slide) {
      car.frequency.exponentialRampToValueAtTime(o.slide, t + dur * 0.6);
      mod.frequency.exponentialRampToValueAtTime(o.slide * (o.r || 1), t + dur * 0.6);
    }
    const I = (o.i || 2) * freq;
    mg.gain.setValueAtTime(I, t);
    mg.gain.setTargetAtTime(I * (o.i2 === undefined ? 0.35 : o.i2), t + 0.004, o.id || 0.09);
    mod.connect(mg);
    mg.connect(car.frequency);
    this.env(g, t, dur, vol, o.a || 0.004, o.sus === undefined ? 0.7 : o.sus);
    let src = car;
    if (o.filter) {
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = o.filter;
      car.connect(f);
      src = f;
    }
    src.connect(g);
    g.connect(dest);
    if (o.vib && dur > 0.2) {
      const l = c.createOscillator();
      l.frequency.value = 5.4;
      const lg = c.createGain();
      lg.gain.setValueAtTime(0, t);
      lg.gain.linearRampToValueAtTime(freq * 0.011, t + 0.28);
      l.connect(lg);
      lg.connect(car.frequency);
      l.start(t);
      l.stop(t + dur + 0.3);
    }
    car.start(t);
    mod.start(t);
    car.stop(t + dur + 0.4);
    mod.stop(t + dur + 0.4);
  },
  noise(t, dur, vol, dest, o = {}) {
    const c = this.ctx,
      s = c.createBufferSource();
    s.buffer = this.nb;
    let node = s;
    const add = (type, f, q) => {
      const b = c.createBiquadFilter();
      b.type = type;
      b.frequency.value = f;
      if (q) b.Q.value = q;
      node.connect(b);
      node = b;
    };
    if (o.hp) add('highpass', o.hp);
    if (o.lp) add('lowpass', o.lp);
    if (o.bp) add('bandpass', o.bp, o.q);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + (o.a || 0.002));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    node.connect(g);
    g.connect(dest);
    s.start(t, Math.random() * 0.5);
    s.stop(t + dur + 0.05);
  },
  play(name) {
    if (!this.ctx) {
      this.pending = name;
      return;
    }
    if (this.cur === name && (this.track || this.renderedSource)) return;
    this.stop();
    this.setDucking(1);
    this.cur = name;
    this.track = IMPORTED_MUSIC[name] && typeof Audio !== 'undefined' ? null : TRACKS[name] || null;
    this.step = 0;
    this.nextT = this.ctx.currentTime + 0.08;
    if (IMPORTED_MUSIC[name] && typeof Audio !== 'undefined') this.playImported(name, this.loadVersion);
    else if (MUSIC_FILES[name]) this.loadRendered(name, this.loadVersion);
  },
  playImported(name, version) {
    const audio = new Audio(MUSIC_FILES[name]);
    audio.loop = true;
    audio.preload = 'auto';
    // Stream long tracks through the existing music bus rather than decoding minutes into RAM.
    const node = this.ctx.createMediaElementSource(audio);
    node.connect(this.mg);
    const source = {
      media: audio,
      stop: () => {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      },
      disconnect: () => node.disconnect(),
    };
    this.renderedSource = source;
    const fail = () => {
      if (this.loadVersion !== version || this.renderedSource !== source) return;
      audio.onerror = null;
      source.stop();
      source.disconnect();
      this.renderedSource = null;
      this.track = TRACKS[name];
      this.step = 0;
      this.nextT = this.ctx.currentTime + 0.08;
    };
    audio.onerror = fail;
    audio.play().catch(fail);
  },
  async loadRendered(name, version) {
    try {
      let buffer = this.buffers.get(name);
      if (!buffer) {
        const response = await fetch(MUSIC_FILES[name]);
        if (!response.ok) throw new Error('Music HTTP ' + response.status);
        buffer = await this.ctx.decodeAudioData(await response.arrayBuffer());
        // Bound decoded audio memory on phones; each stereo loop can take several MB.
        if (this.buffers.size >= 3) this.buffers.delete(this.buffers.keys().next().value);
        this.buffers.set(name, buffer);
      }
      if (version !== this.loadVersion || this.cur !== name) return;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = TRACKS[name].loop !== false;
      source.connect(this.mg);
      source.onended = () => {
        source.disconnect();
        if (this.renderedSource === source) this.renderedSource = null;
      };
      // Continue at the scheduled step, preserving the musical position.
      const tr = TRACKS[name],
        d = 60 / tr.bpm / 4;
      const start = Math.max(this.ctx.currentTime + 0.02, this.nextT);
      const offset = (this.step * d) % buffer.duration;
      this.renderedSource = source;
      source.start(start, offset);
      this.track = null;
    } catch {
      // The editable synth score remains available if a download/codec fails.
    }
  },
  stop() {
    this.loadVersion++;
    if (this.renderedSource) {
      this.renderedSource.stop();
      this.renderedSource.disconnect();
      this.renderedSource = null;
    }
    this.track = null;
    this.cur = null;
    this.pending = null;
  },
  setMusic(v) {
    SET.music = v;
    saveAudioSettings();
    this.applyLevels();
  },
  applyLevels() {
    if (this.mg) this.mg.gain.value = this.music ? SET.music * this.ducking : 0;
    if (this.sg) this.sg.gain.value = SET.effects;
  },
  setDucking(value) {
    this.ducking = value;
    this.applyLevels();
  },
  tick() {
    const c = this.ctx,
      tr = this.track;
    if (!c || !tr) return;
    const d = 60 / tr.bpm / 4,
      total = tr.lead.length * (tr.spb || 16);
    if (this.nextT < c.currentTime - 0.3) this.nextT = c.currentTime + 0.05;
    while (this.nextT < c.currentTime + 0.14) {
      const sw = tr.sw && this.step % 2 ? tr.sw * d : 0;
      this.stepAt(tr, this.step, this.nextT + sw, d);
      this.nextT += d;
      this.step++;
      if (this.step >= total) {
        if (tr.loop === false) {
          this.track = null;
          break;
        }
        this.step = 0;
      }
    }
  },
  leadNote(tr, f, t, dur) {
    const L = this.lead;
    switch (tr.lw) {
      case 'guitar':
        this.fm(f, t, dur, 0.13, L, {
          r: 1,
          i: 3.8,
          i2: 0.5,
          id: 0.055,
          ct: 'sawtooth',
          filter: 3300,
          sus: 0.65,
          vib: 1,
        });
        this.fm(f * 1.003, t, dur, 0.045, L, { r: 2, i: 1.4, i2: 0.3, filter: 2600, sus: 0.6 });
        break;
      case 'cathedral':
        for (const [ratio, vol] of [
          [0.5, 0.045],
          [1, 0.09],
          [2, 0.05],
          [3, 0.025],
          [4, 0.012],
        ])
          this.osc('sine', f * ratio, t, dur, vol, L, { sus: 0.95 });
        this.fm(f, t, dur, 0.035, L, { r: 2, i: 1.2, i2: 0.6, sus: 0.85 });
        break;
      case 'cosmic':
        // Detuned FM brass/guitar attack with an octave halo, rather than a reused stage voice.
        this.fm(f, t, dur, 0.12, L, { r: 1, i: 3.2, i2: 0.85, id: 0.12, a: 0.012, sus: 0.78, vib: 1 });
        this.fm(f * 1.004, t, dur, 0.045, L, { r: 2, i: 1.8, i2: 0.4, filter: 3800, sus: 0.65 });
        this.osc('triangle', f * 2, t, dur * 0.85, 0.035, L, { a: 0.025, sus: 0.7 });
        break;
      case 'brass':
        this.fm(f, t, dur, 0.17, L, { r: 1, i: 2.6, i2: 1.1, id: 0.16, a: 0.03, sus: 0.82, vib: 1 });
        this.fm(f * 1.004, t, dur, 0.06, L, { r: 1, i: 1.4, a: 0.04, sus: 0.8 });
        break;
      case 'synlead':
        this.fm(f, t, dur, 0.14, L, {
          r: 2,
          i: 1.3,
          i2: 0.7,
          id: 0.2,
          ct: 'sawtooth',
          filter: 3600,
          sus: 0.8,
          vib: 1,
        });
        this.osc(this.p25, f * 2, t, dur * 0.9, 0.035, L, { sus: 0.6 });
        break;
      case 'epiano':
        this.fm(f, t, dur, 0.2, L, { r: 1, i: 1.6, i2: 0.15, id: 0.25, sus: 0.35 });
        this.fm(f, t, dur * 0.6, 0.05, L, { r: 14, i: 0.5, i2: 0, id: 0.04, sus: 0.1 });
        break;
      case 'organ':
        this.osc('square', f, t, dur, 0.06, L, { sus: 0.95, filter: 3000 });
        this.osc('sine', f * 2, t, dur, 0.08, L, { sus: 0.95 });
        this.osc('triangle', f / 2, t, dur, 0.1, L, { sus: 0.95 });
        this.osc('sine', f * 3, t, dur, 0.03, L, { sus: 0.9 });
        break;
      case 'flute':
        this.osc('triangle', f, t, dur, 0.22, L, { vib: 1, sus: 0.85, a: 0.035 });
        this.osc('sine', f * 2, t, dur, 0.03, L, { sus: 0.6 });
        this.noise(t, 0.06, 0.03, L, { bp: f * 2, q: 3 });
        break;
      case 'reed':
        this.fm(f, t, dur, 0.15, L, {
          r: 2,
          i: 2.4,
          i2: 1.6,
          id: 0.3,
          a: 0.02,
          sus: 0.85,
          vib: 1,
          filter: 3200,
        });
        break;
      case 'accord':
        this.osc('square', f, t, dur, 0.06, L, { det: -9, filter: 2400, sus: 0.9, a: 0.015 });
        this.osc('square', f, t, dur, 0.06, L, { det: 9, filter: 2400, sus: 0.9, a: 0.015 });
        this.osc('sawtooth', f / 2, t, dur, 0.04, L, { filter: 1400, sus: 0.9 });
        break;
      case 'steel':
        this.fm(f, t, dur, 0.2, L, { r: 2.76, i: 1.4, i2: 0, id: 0.12, sus: 0.25 });
        this.osc('sine', f, t, dur * 0.7, 0.08, L, { sus: 0.2 });
        break;
      case 'pluck':
        this.fm(f, t, Math.min(dur, 0.22), 0.2, L, { r: 3, i: 2.2, i2: 0, id: 0.05, sus: 0.2 });
        break;
      default:
        this.osc(this.p25, f, t, dur, 0.16, L, { vib: 1, sus: 0.75 });
        this.osc('triangle', f / 2, t, dur * 0.95, 0.09, L, { sus: 0.8 });
    }
  },
  bassNote(tr, f, t, dur) {
    const M = this.mg;
    switch (tr.bw) {
      case 'slap':
        this.fm(f, t, dur, 0.34, M, { r: 1, i: 5.5, i2: 0.6, id: 0.035, sus: 0.45, filter: 2600 });
        this.noise(t, 0.02, 0.06, M, { bp: 2400 });
        break;
      case 'upright':
        this.fm(f, t, dur * 1.3, 0.36, M, { r: 1, i: 1.2, i2: 0.2, id: 0.06, sus: 0.55, filter: 900 });
        break;
      case '808':
        this.osc('sine', f * 1.6, t, Math.max(dur, 0.5), 0.6, M, { slide: f, st: 0.08, sus: 0.85 });
        break;
      default:
        this.osc('sawtooth', f, t, dur, 0.26, M, { filter: 900, fenv: 300, sus: 0.5 });
        this.osc(this.p50, f / 2, t, dur, 0.1, M, { filter: 500, sus: 0.5 });
    }
  },
  stepAt(tr, s, t, d) {
    const spb = tr.spb || 16,
      half = spb / 2,
      bar = Math.floor(s / spb),
      pos = s % spb,
      M = this.mg;
    const ch = chordInfo(tr.chords[bar % tr.chords.length]);
    const intensity = tr.sections?.[bar % tr.sections.length] ?? 1;
    if (tr.arcade) {
      // Offbeat chord stabs, palm-muted fifths and a call/response countermelody.
      if (intensity >= 0.5 && (pos === 2 || pos === half + 2)) {
        for (const interval of ch.tones.slice(0, 3))
          this.fm(mf(48 + ch.pc + interval), t, d * 1.35, 0.032 * intensity, M, {
            r: 1,
            i: 2.8,
            i2: 0.6,
            id: 0.05,
            filter: 2300,
            sus: 0.3,
          });
      }
      if (intensity >= 0.9 && pos % 4 === 2)
        this.fm(mf(60 + ch.pc + ch.tones[(pos / 2 + bar) % 4]), t, d * 1.5, 0.045, this.lead, {
          r: 1,
          i: 1.7,
          i2: 0.4,
          sus: 0.5,
        });
      if (intensity >= 0.7 && pos % 2 === 0)
        for (const interval of [0, 7])
          this.fm(mf(36 + ch.pc + interval), t, d * 0.7, 0.027, M, {
            r: 1,
            i: 3,
            i2: 0.3,
            filter: 1800,
            sus: 0.2,
          });
    }
    if (pos % 2 === 0) {
      const toks = tr.lead[bar % tr.lead.length].trim().split(/\s+/);
      const i = pos / 2,
        tk = toks[i];
      if (tk && tk !== '-' && tk !== '.') {
        let n = 1;
        while (i + n < half && toks[i + n] === '-') n++;
        const m = noteMidi(tk);
        if (m !== null) this.leadNote(tr, mf(m), t, n * 2 * d * 0.95);
      }
    }
    const bv = tr.bpArr[pos % tr.bpArr.length];
    if (bv !== null && bv !== undefined) {
      let n = 1;
      while (n < 4 && tr.bpArr[(pos + n) % tr.bpArr.length] === null) n++;
      this.bassNote(tr, mf(36 + ch.pc + bv), t, d * n * 0.9);
    }
    if (tr.pad && pos === 0) {
      const dur = d * spb * 0.98;
      for (const k of ch.tones.slice(0, 3))
        for (const det of [-7, 7])
          this.osc('sawtooth', mf(60 + ch.pc + k), t, dur, 0.022, M, {
            det,
            filter: 1700,
            a: 0.18,
            sus: 0.9,
          });
    }
    if (!tr.pad && tr.lw !== 'brass' && tr.lw !== 'organ')
      this.osc(this.p12, mf(60 + ch.pc + ch.tones[s % 4] + (bar % 2 ? 12 : 0)), t, d * 0.7, 0.04, M, {
        sus: 0.3,
      });
    if (tr.energy) {
      const energy = tr.energy[bar % tr.energy.length];
      if (pos === 0) {
        this.fm(mf(48 + ch.pc), t, d * spb * 0.9, 0.035 * energy, M, { r: 1, i: 1.2, a: 0.12, sus: 0.85 });
      }
      if (energy >= 0.8 && pos % 2 === 0)
        this.osc(this.p12, mf(72 + ch.pc + ch.tones[(pos / 2) % 4]), t, d * 0.65, 0.035 * energy, this.lead, {
          sus: 0.25,
        });
      if (bar % 4 === 3 && pos >= 12) {
        this.osc('sine', 180 - (pos - 12) * 18, t, 0.18, 0.25 * energy, M, { slide: 65, sus: 0.2 });
        this.noise(t, 0.06, 0.06 * energy, M, { hp: 3000 });
      }
    }
    const dr = tr.dr,
      at = (k) =>
        (dr[k] || '')[pos] === 'x' &&
        (intensity >= 0.65 ||
          (intensity >= 0.5 ? k !== 'h' || pos % 4 === 0 : ['k', 'c', 'x'].includes(k) && pos === 0));
    if (at('k')) this.osc('sine', 155, t, 0.18, 0.9, M, { slide: 40, st: 0.12, sus: 0.2 });
    const fill =
      intensity >= 0.65 && bar % 8 === 7 && pos >= spb - 6 && tr.loop !== false && tr.fill !== false;
    if (at('s') || fill) {
      this.noise(t, 0.14, fill && !at('s') ? 0.24 : 0.42, M, { hp: 1200 });
      this.osc('triangle', 210, t, 0.07, 0.25, M, { slide: 120, sus: 0.2 });
    }
    if (at('l')) {
      this.noise(t, 0.1, 0.32, M, { bp: 1500, q: 1.4 });
      this.noise(t + 0.012, 0.08, 0.22, M, { bp: 1700, q: 1.4 });
    }
    if (at('h')) this.noise(t, 0.03, 0.09, M, { hp: 7500 });
    if (at('o')) this.noise(t, 0.16, 0.1, M, { hp: 6500 });
    if (at('t')) this.osc('sine', 140, t, 0.24, 0.6, M, { slide: 70, sus: 0.3 });
    if (at('w')) {
      this.osc('square', 1000, t, 0.03, 0.06, M, { sus: 0.1 });
      this.noise(t, 0.025, 0.1, M, { bp: 2000 });
    }
    if (at('c') && bar % 4 === 0) this.noise(t, 0.9, 0.18, M, { hp: 4000 });
    if (at('x') && bar % 2 === 0) this.ohit(mf(60 + ch.pc), ch, t);
  },
  ohit(f, ch, t, dest = this.mg) {
    const M = dest;
    for (const k of [0, ch.minor ? 3 : 4, 7, 12])
      this.fm(f * Math.pow(2, k / 12), t, 0.32, 0.07, M, {
        r: 1,
        i: 3,
        i2: 0.8,
        id: 0.08,
        a: 0.003,
        sus: 0.3,
      });
    this.noise(t, 0.25, 0.25, M, { bp: 900, q: 0.8 });
    this.osc('sine', f / 4, t, 0.3, 0.4, M, { sus: 0.3 });
  },
  sfx(n) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime,
      S = this.sg;
    switch (n) {
      case 'hitL':
        this.noise(t, 0.08, 0.6, S, { lp: 3200 });
        this.osc('square', 230, t, 0.07, 0.2, S, { slide: 70, sus: 0.3 });
        break;
      case 'hitH':
        this.noise(t, 0.18, 0.9, S, { lp: 2200 });
        this.fm(160, t, 0.14, 0.3, S, { r: 1.41, i: 6, i2: 0, id: 0.05, slide: 50, sus: 0.3 });
        this.osc('sine', 95, t, 0.18, 0.6, S, { slide: 35, sus: 0.3 });
        break;
      case 'block':
        this.noise(t, 0.05, 0.4, S, { hp: 2500 });
        this.osc('square', 1250, t, 0.03, 0.1, S, { slide: 800 });
        break;
      case 'whoosh':
        this.noise(t, 0.1, 0.18, S, { bp: 1500, a: 0.02 });
        break;
      case 'jump':
        this.osc(this.p25, 320, t, 0.08, 0.1, S, { slide: 620 });
        break;
      case 'land':
        this.noise(t, 0.05, 0.18, S, { lp: 600 });
        break;
      case 'special':
        this.fm(220, t, 0.26, 0.16, S, { r: 2, i: 3, slide: 880, sus: 0.5 });
        this.noise(t, 0.18, 0.12, S, { bp: 2000 });
        break;
      case 'ex':
        [0, 7, 12].forEach((k, i) =>
          this.fm(520 * Math.pow(2, k / 12), t + i * 0.04, 0.2, 0.12, S, { r: 3, i: 1.5 }),
        );
        this.noise(t, 0.3, 0.14, S, { bp: 3000 });
        break;
      case 'super':
        [0, 4, 7, 12, 16].forEach((k, i) =>
          this.fm(440 * Math.pow(2, k / 12), t + i * 0.05, 0.34, 0.12, S, { r: 1, i: 2 }),
        );
        this.noise(t, 0.5, 0.2, S, { bp: 900 });
        break;
      case 'boom':
        this.noise(t, 0.6, 0.95, S, { lp: 900 });
        this.osc('sine', 85, t, 0.45, 0.8, S, { slide: 30, sus: 0.4 });
        break;
      case 'ko':
        this.fm(520, t, 1, 0.22, S, { r: 1.5, i: 3, slide: 40, sus: 0.8 });
        this.noise(t, 0.7, 0.4, S, { lp: 1100 });
        break;
      case 'blip':
        this.osc(this.p25, 880, t, 0.05, 0.13, S);
        break;
      case 'ok':
        [0, 7, 12].forEach((k, i) =>
          this.osc(this.p25, 660 * Math.pow(2, k / 12), t + i * 0.06, 0.1, 0.15, S),
        );
        break;
      case 'freeze':
        [12, 7, 3, 0].forEach((k, i) =>
          this.osc('triangle', 880 * Math.pow(2, k / 12), t + i * 0.04, 0.14, 0.22, S),
        );
        break;
      case 'tung':
        this.osc('triangle', 240, t, 0.14, 0.55, S, { slide: 170, sus: 0.3 });
        this.noise(t, 0.06, 0.3, S, { bp: 700 });
        break;
      case 'vs':
        this.noise(t, 0.7, 0.5, S, { bp: 600 });
        this.fm(110, t, 0.7, 0.3, S, { r: 1, i: 4, slide: 55 });
        break;
      case 'glass':
        this.noise(t, 0.35, 0.5, S, { hp: 4200 });
        [0, 5, 9].forEach((k, i) =>
          this.osc('triangle', 2400 * Math.pow(2, k / 12), t + i * 0.03, 0.08, 0.12, S),
        );
        break;
      case 'crack':
        this.noise(t, 0.12, 0.45, S, { hp: 3000 });
        this.osc('square', 3200, t, 0.04, 0.08, S, { slide: 1800 });
        break;
      case 'metal':
        this.fm(320, t, 0.14, 0.2, S, { r: 3.5, i: 4, i2: 0.2, id: 0.03, sus: 0.3 });
        this.noise(t, 0.1, 0.35, S, { bp: 1300 });
        break;
      case 'levelup':
        [0, 4, 7, 12, 16, 19, 24].forEach((k, i) =>
          this.osc(this.p25, 523 * Math.pow(2, k / 12), t + i * 0.06, 0.14, 0.15, S),
        );
        break;
      case 'throw':
        this.noise(t, 0.2, 0.4, S, { bp: 500 });
        this.fm(90, t + 0.12, 0.2, 0.4, S, { r: 1, i: 3, slide: 40 });
        break;
      case 'crowd':
        this.noise(t, 1.6, 0.22, S, { bp: 900, q: 0.6, a: 0.35 });
        this.noise(t + 0.1, 1.4, 0.12, S, { bp: 2200, q: 0.8, a: 0.4 });
        break;
      case 'horn':
        [0, 0.0, 4].forEach((k, i) =>
          this.osc('sawtooth', 466 * Math.pow(2, k / 12), t + i * 0.002, 0.5, 0.12, S, {
            filter: 3000,
            sus: 0.9,
          }),
        );
        break;
      case 'slam':
        this.noise(t, 0.5, 0.9, S, { lp: 1400 });
        this.osc('sine', 70, t, 0.5, 0.9, S, { slide: 30, sus: 0.4 });
        this.ohit(523, { minor: true }, t, S);
        break;
      case 'squawk':
        this.fm(1400, t, 0.12, 0.16, S, { r: 1.5, i: 4, slide: 2100, sus: 0.4 });
        this.fm(1900, t + 0.13, 0.1, 0.12, S, { r: 1.5, i: 4, slide: 1300, sus: 0.4 });
        break;
      // ---- intro and menus (arcade boot style) ----
      case 'logo':
        // fast rising brass arpeggio, then a big chord hit with a shimmering tail
        [0, 4, 7, 12, 16, 19, 24].forEach((k, i) =>
          this.fm(262 * Math.pow(2, k / 12), t + i * 0.055, 0.18, 0.12, S, {
            r: 1,
            i: 2.4,
            i2: 1,
            id: 0.12,
            sus: 0.6,
          }),
        );
        [0, 4, 7, 12].forEach((k) =>
          this.fm(523 * Math.pow(2, k / 12), t + 0.42, 0.9, 0.08, S, {
            r: 1,
            i: 3,
            i2: 0.8,
            id: 0.1,
            a: 0.003,
            sus: 0.5,
          }),
        );
        this.osc('sine', 131, t + 0.42, 0.7, 0.45, S, { sus: 0.4 });
        this.noise(t + 0.42, 0.25, 0.3, S, { bp: 900, q: 0.8 });
        [24, 28, 31, 36].forEach((k, i) =>
          this.osc('triangle', 262 * Math.pow(2, k / 12), t + 0.55 + i * 0.07, 0.5, 0.06, S, {
            vib: 1,
            sus: 0.5,
          }),
        );
        this.noise(t + 0.42, 0.9, 0.12, S, { hp: 6000 });
        break;
      case 'power':
        this.osc('sine', 60, t, 0.5, 0.22, S, { slide: 900, st: 0.35, sus: 0.4 });
        this.noise(t, 0.25, 0.1, S, { hp: 3000 });
        break;
      case 'type':
        this.osc(this.p12, 1700 + Math.random() * 500, t, 0.02, 0.035, S, { sus: 0.1 });
        break;
      case 'glitch':
        this.noise(t, 0.12, 0.28, S, { bp: 3000, q: 2 });
        this.osc('square', 90, t, 0.1, 0.1, S, { slide: 2000, st: 0.1 });
        break;
      case 'start':
        [0, 7, 12].forEach((k, i) =>
          this.fm(988 * Math.pow(2, k / 12), t + i * 0.07, 0.3, 0.12, S, {
            r: 3,
            i: 1.2,
            i2: 0,
            id: 0.1,
            sus: 0.3,
          }),
        );
        break;
      case 'count':
        this.fm(196, t, 0.18, 0.22, S, { r: 2, i: 3, i2: 0.4, id: 0.06, sus: 0.3 });
        this.noise(t, 0.08, 0.2, S, { bp: 1800, q: 1.2 });
        this.osc('sine', 98, t, 0.25, 0.35, S, { slide: 60, sus: 0.3 });
        break;
      case 'wipe':
        this.noise(t, 0.22, 0.16, S, { bp: 1200, q: 0.7, a: 0.08 });
        break;
    }
  },
};

export { AU };
