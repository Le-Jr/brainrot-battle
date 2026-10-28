import { UI, panel, screenBackdrop, screenHeader, screenFooter, paragraph } from '../ui/theme.js';
/* Jungle studio ident: CRT ignition, original logo reveal, developer credit and arcade warning. */
import { AU } from '../audio/synth.js';
import { ANN, VO } from '../audio/voice.js';
import { W } from '../config.js';
import { txt } from '../core/canvas.js';
import { CONFIRM, anyPressed } from '../core/input.js';

import { go } from '../core/scene.js';
import { BUILDERS, STAGES, buildNextStage } from '../stages/index.js';
import { fade } from '../ui/arcade.js';
import { loadTupinicodeArt, drawTupinicode, studioCaption } from '../ui/tupinicode.js';
import { Title } from './title.js';

const DEV = 'LEANDRO JUNIOR';
const YEAR = 2026;
const WARNING =
  'Este jogo contém níveis PERIGOSOS de brainrot. O uso prolongado pode causar tralalás involuntários, ' +
  'vontade súbita de fazer tung tung tung e um desejo incontrolável por bananas. Jogue com moderação... ou não.';

const Intro = {
  id: 'intro',
  tapStart: true,
  /** Set by the engine when the font and the character atlases are loaded. */
  assetsReady: false,
  enter() {
    this.phase = 'load';
    this.t = 0;
    this.pt = 0;
    loadTupinicodeArt();
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
      if (p === 64) {
        AU.sfx('logo');
      }
      if (p === 90) VO.say('Tupinicode... presents!', ANN);
      if (p === 210) VO.say('Um jogo de Leandro Junior', { role: 'pt', rate: 1.02 });
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
      p = this.pt;
    const power = this.phase === 'load' ? Math.min(1, Math.max(0, (t - 6) / 28)) : 1;
    const reveal = this.phase === 'logo' ? 0.3 + 0.7 * Math.min(1, Math.max(0, (p - 48) / 42)) : 0.3;
    drawTupinicode(t, { power, reveal });
    if (this.phase === 'load') {
      studioCaption('PREPARANDO O CAOS', Math.round(this.progress() * 100) + '%', this.progress());
    } else if (this.phase === 'ready') {
      studioCaption('APERTE START', 'ENTER OU TOQUE NA TELA');
    } else {
      studioCaption(
        p < 200 ? 'APRESENTA' : 'UM JOGO DE ' + DEV,
        p < 200 ? 'DA FLORESTA PARA O ARCADE' : 'FEITO NO BRASIL · ' + YEAR,
      );
      if (p >= 330) fade((p - 330) / 30);
    }
    if (this.phase === 'load' && t < 6) fade(1);
  },
  /** Arcade-style warning card (a tribute to the 90s boot warnings), with a joke instead of legal text. */
  drawWarning() {
    const p = this.pt;
    screenBackdrop();
    screenHeader('AVISO', 'ARCADE EXPERIENCE');
    panel(16, 40, 288, 112, UI.gold);
    txt('ULTRA CAOS', W / 2, 50, 16, UI.gold, 'center');
    paragraph(WARNING, W / 2, 77, 264, { align: 'center', size: 6, lineHeight: 11, maxLines: 6 });
    screenFooter('© ' + YEAR + ' TUPINICODE', 'ENTER CONTINUAR');
    fade(p < 16 ? 1 - p / 16 : p > 284 ? (p - 284) / 16 : 0);
  },
};

export { DEV, Intro, YEAR };
