/* Boot sequence: loading on the Tupinicode CRT, press start, studio logo with the developer credit, arcade warning. */
import { AU } from '../audio/synth.js';
import { ANN, VO } from '../audio/voice.js';
import { H, REDUCED, W } from '../config.js';
import { ctx, txt, vgrad, wrap } from '../core/canvas.js';
import { CONFIRM, anyPressed } from '../core/input.js';
import { rnd } from '../core/math.js';
import { go } from '../core/scene.js';
import { BUILDERS, STAGES, buildNextStage } from '../stages/index.js';
import { blink, fade, frameBox, glitchBands, plate, sparkle } from '../ui/arcade.js';
import {
  buildTupinicodeArt,
  drawStudioLogo,
  drawTupinicode,
  screenLine,
  screenWindow,
} from '../ui/tupinicode.js';
import { Title } from './title.js';

const DEV = 'LEANDRO JUNIOR';
const YEAR = 2026;
const WARNING =
  'Este jogo contém níveis PERIGOSOS de brainrot. O uso prolongado pode causar tralalás involuntários, ' +
  'vontade súbita de fazer tung tung tung e um desejo incontrolável por bananas. Jogue com moderação... ou não.';

/** Text typed so far: one character every `rate` frames, starting at frame `from`. */
const typed = (s, t, from, rate = 2) => s.slice(0, Math.max(0, Math.floor((t - from) / rate)));
const binary = (t, seed) =>
  Array.from({ length: 5 }, (_, i) => ((Math.floor(t / 6) * 7 + i * 13 + seed) % 5 < 2 ? '1' : '0')).join('');

const Intro = {
  id: 'intro',
  tapStart: true,
  /** Set by the engine when the font and the character atlases are loaded. */
  assetsReady: false,
  enter() {
    this.phase = 'load';
    this.t = 0;
    this.pt = 0;
    this.shake = 0;
    buildTupinicodeArt();
  },
  setPhase(p) {
    this.phase = p;
    this.pt = 0;
  },
  progress() {
    if (!this.assetsReady) return 0.08;
    return 0.15 + 0.85 * (STAGES.length / BUILDERS.length);
  },
  update() {
    this.t++;
    this.pt++;
    if (this.shake > 0) this.shake--;
    if (this.phase === 'load') {
      if (this.t === 4) AU.sfx('power');
      // one stage per frame keeps the animation alive while everything is painted
      if (this.assetsReady && this.t > 24 && buildNextStage() >= 1 && this.pt > 40) this.setPhase('ready');
      return;
    }
    if (this.phase === 'ready') {
      // audio is only allowed after a user gesture, so the studio jingle waits for START
      if (anyPressed(CONFIRM) || (AU.ctx && this.pt > 30)) {
        AU.sfx('start');
        this.setPhase('logo');
      }
      return;
    }
    if (anyPressed(['Escape'])) return this.finish();
    if (this.phase === 'logo') {
      const p = this.pt;
      if (p < 60 && p % 3 === 0) AU.sfx('type');
      if (p === 64) {
        AU.sfx('logo');
        if (!REDUCED) this.shake = 10;
      }
      if (p === 66 || p === 76) AU.sfx('glitch');
      if (p === 90) VO.say('Tupinicode... presents!', ANN);
      if (p === 210) VO.say('Um jogo de Leandro Junior', { role: 'pt', rate: 1.02 });
      if (p > 200 && p < 240 && p % 3 === 0) AU.sfx('type');
      if (anyPressed(CONFIRM) && p < 330) this.pt = 330;
      if (p >= 360) this.setPhase('warn');
      return;
    }
    if (this.phase === 'warn') {
      if (anyPressed(CONFIRM) && this.pt < 280) this.pt = 280;
      if (this.pt >= 300) this.finish();
    }
  },
  finish() {
    VO.stop();
    go(Title);
  },
  draw() {
    if (this.phase === 'warn') return this.drawWarning();
    const t = this.t,
      p = this.pt,
      sh = this.shake > 0 ? Math.round(rnd(-this.shake, this.shake) * 0.5) : 0;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(sh, 0);
    const power = this.phase === 'load' ? Math.min(1, Math.max(0, (t - 6) / 22)) : 1;
    drawTupinicode(t, { power, screen: (c, x, y, w) => this.drawScreen(c, x, y, w) });
    // the studio logo
    if (this.phase === 'logo' && p >= 60) {
      const k = Math.min(1, (p - 60) / 8),
        scale = 1 + (1 - k) * 1.4;
      drawStudioLogo(134, scale);
      if (p > 70) sparkle(40 + ((p * 3) % 240), 138 + Math.sin(p / 7) * 6, ((p * 3) % 60) / 60);
      const sub = p < 200 ? 'A P R E S E N T A' : 'UM JOGO DE ' + DEV;
      const a = p < 200 ? Math.min(1, (p - 96) / 20) : Math.min(1, (p - 206) / 16);
      if (a > 0) {
        ctx.globalAlpha = a;
        txt(sub, W / 2, 162, 8, p < 200 ? '#c8ffd4' : '#ffd23a', 'center');
        ctx.globalAlpha = 1;
      }
    }
    if (this.phase === 'load' && t > 28) {
      ctx.globalAlpha = 0.7;
      txt('TUPINICODE', W / 2, 150, 8, '#3a8a4a', 'center', null);
      ctx.globalAlpha = 1;
    }
    if (this.phase === 'ready' && blink(t, 40))
      txt('APERTE ENTER OU TOQUE NA TELA', W / 2, 152, 8, '#ffffff', 'center');
    ctx.restore();
    // impact flash and glitches
    if (this.phase === 'logo') {
      if (p >= 64 && p < 74) fade(1 - (p - 64) / 10, '220,255,230');
      if ((p >= 64 && p < 84 && p % 2) || (p > 100 && p % 97 < 3)) glitchBands(5, 120, 176, 10);
      if (p >= 330) fade((p - 330) / 30);
    }
    if (this.phase === 'load' && t < 6) fade(1);
  },
  /** CRT contents for each phase, in HD pixels. */
  drawScreen(c, x, y, w) {
    const t = this.t,
      p = this.pt;
    if (this.phase === 'load' || this.phase === 'ready') {
      screenWindow(c, x, y, w, 'tupinicode.exe');
      const k = this.progress(),
        done = this.phase === 'ready';
      if (!done) {
        screenLine(c, 'CARREGANDO' + '...'.slice(0, (t >> 4) % 4), x + 14, y + 32);
        const bw = w - 28,
          n = Math.floor((bw - 4) / 10);
        c.strokeStyle = '#62ff8e';
        c.lineWidth = 2;
        c.strokeRect(x + 14, y + 58, bw, 18);
        c.fillStyle = '#62ff8e';
        for (let i = 0; i < Math.round(n * k); i++) c.fillRect(x + 18 + i * 10, y + 62, 8, 10);
        screenLine(c, Math.round(k * 100) + '%', x + 14, y + 86);
        const status = !this.assetsReady
          ? 'carregando sprites'
          : STAGES.length < BUILDERS.length
            ? `pintando cenários ${STAGES.length}/${BUILDERS.length}`
            : 'afinando sintetizador';
        screenLine(c, '> ' + status, x + 14, y + 112, '#9dffb8', 8);
      } else {
        screenLine(c, 'PRONTO!', x + 14, y + 32);
        screenLine(c, 'APERTE', x + 14, y + 60);
        if (blink(t, 32)) screenLine(c, 'START', x + 14, y + 84, '#d8ffe0');
        screenLine(c, '> enter / toque', x + 14, y + 112, '#9dffb8', 8);
      }
      return;
    }
    // logo phase: binary, studio name, then the developer credit
    screenWindow(c, x, y, w, p < 200 ? 'tupinicode.exe' : 'créditos.txt');
    if (p < 200) {
      const l1 = typed('10101', p, 0),
        l2 = typed('TUPINICODE', p, 12),
        l3 = typed('01010', p, 36);
      screenLine(c, p > 60 ? binary(t, 1) : l1, x + 14, y + 34);
      screenLine(c, l2, x + 14, y + 62, p >= 64 && p < 90 && p % 4 < 2 ? '#ffffff' : '#62ff8e');
      screenLine(c, p > 60 ? binary(t, 3) : l3, x + 14, y + 90);
    } else {
      screenLine(c, typed('> autor:', p, 200, 1.5), x + 14, y + 34, '#9dffb8');
      screenLine(c, typed('LEANDRO', p, 214), x + 14, y + 62);
      screenLine(c, typed('JUNIOR', p, 228), x + 14, y + 90);
    }
    if (blink(t, 30)) {
      c.fillStyle = '#62ff8e';
      c.fillRect(x + 14, y + 114, 12, 4);
    }
  },
  /** Arcade-style warning card (a tribute to the 90s boot warnings), with a joke instead of legal text. */
  drawWarning() {
    const p = this.pt;
    ctx.fillStyle = vgrad(0, H, ['#070a2a', '#0c1450', '#070a2a']);
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 4) {
      ctx.fillStyle = 'rgba(0,0,0,.18)';
      ctx.fillRect(0, y, W, 2);
    }
    frameBox(22, 22, 276, 130, '#ffd23a', 'rgba(6,10,40,.9)');
    plate(110, 14, 100, 16, vgrad(14, 16, ['#ff6a5a', '#d8343f', '#8a1424']), 6);
    txt('AVISO', W / 2 + 3, 18, 8, blink(p, 24) ? '#ffffff' : '#ffd23a', 'center');
    const lines = wrap(WARNING, 33),
      top = 30 + Math.round((122 - lines.length * 12) / 2);
    lines.forEach((l, i) => txt(l, W / 2, top + i * 12, 8, '#e8ecff', 'center', null));
    sparkle(214, 16, (p % 50) / 50);
    txt(`© ${YEAR} TUPINICODE · ${DEV}`, W / 2, 164, 8, '#7a86c8', 'center', null);
    fade(p < 20 ? 1 - p / 20 : p > 280 ? (p - 280) / 20 : 0);
  },
};

export { DEV, Intro, YEAR };
