import { BRIBRI } from '../characters/fighters/bribri.js';
/* Timed cinematic: authored plates, animated cast and a score that follows the story beats. */
import { AU } from '../audio/synth.js';
import { VO } from '../audio/voice.js';
import { BOSS } from '../characters/fighters/saturnita.js';
import { MEGA_BOSS } from '../characters/fighters/saturnita-mega.js';
import { CH, PLAYABLE } from '../characters/roster.js';
import { REDUCED } from '../config.js';
import { ctx, txt, vgrad } from '../core/canvas.js';
import { anyPressed } from '../core/input.js';
import { S, SET } from '../state.js';
import { sprite, drawSpr } from '../sprites/sprite.js';
import { artImage } from '../stages/art.js';
import { STAGES, drawStage } from '../stages/index.js';
import { getMap } from '../world/map.js';
import { UI, paragraph, fitLabel } from '../ui/theme.js';

export function Finale(panels, next, victory = false) {
  return {
    id: 'finale',
    tapStart: true,
    panels,
    victory,
    enter() {
      this.i = 0;
      this.t = 0;
      this.elapsed = 0;
      this.finished = false;
      this.speak();
    },
    finish() {
      if (this.finished) return;
      this.finished = true;
      VO.stop();
      if (AU.mg) AU.mg.gain.value = AU.music ? SET.music : 0;
      next();
    },
    speak() {
      const p = panels[this.i];
      const theme = victory ? 'ending' : this.i >= 5 ? 'laststand' : 'ascension';
      AU.play(theme);
      if (AU.mg) AU.mg.gain.value = AU.music ? SET.music * 0.65 : 0;
      VO.say(p.text, {
        role: 'pt',
        rate: p.voice === 'saturnita' ? 0.9 : 1.02,
        pitch: p.voice === 'saturnita' ? 0.6 : 1,
      });
      if (['storm', 'collapse', 'resolve'].includes(p.shot)) AU.sfx('boom');
      if (p.shot === 'hero') AU.sfx('levelup');
    },
    advance() {
      VO.stop();
      if (this.i === panels.length - 1) return this.finish();
      this.i++;
      this.t = 0;
      this.speak();
    },
    update() {
      if (this.finished) return;
      this.t++;
      this.elapsed++;
      if (this.elapsed > 24 && anyPressed(['Escape', 'T_start'])) return this.finish();
      const p = panels[this.i];
      if (this.t > 24 && anyPressed(['Enter', 'Space', 'NumpadEnter', 'KeyJ', 'KeyZ', 'T_p'])) {
        if (this.t * 0.6 < p.text.length) this.t = Math.ceil(p.text.length / 0.6);
        else this.advance();
        return;
      }
      // Give recordings room to finish. Muted/unsupported audio still progresses automatically.
      const speaking = VO.on && (VO.clipAudio || VO.live.length);
      if (this.t >= p.frames && (!speaking || this.t > p.frames + 900)) this.advance();
    },
    draw() {
      const p = panels[this.i],
        t = this.t,
        shot = p.shot;
      const hero = shot === 'hero' || shot === 'resolve';
      const image = artImage('finale', shot === 'coalition' ? 'coalition' : hero ? 'hero' : 'storm');
      ctx.save();
      ctx.fillStyle = '#0b0319';
      ctx.fillRect(0, 0, 320, 180);
      if (image && shot !== 'ruins' && shot !== 'dawn') {
        const zoom = REDUCED ? 1 : 1 + Math.min(t / 8000, 0.045);
        ctx.translate(160, 70);
        ctx.scale(zoom, zoom);
        ctx.translate(-160, -70);
        ctx.drawImage(image, 0, 0, 320, 180);
      } else if (shot === 'dawn') {
        ctx.drawImage(getMap(), 0, 0, 320, 180);
        ctx.fillStyle = 'rgba(255,208,110,.15)';
        ctx.fillRect(0, 0, 320, 130);
      } else {
        drawStage(STAGES[9], 80, t);
        drawSpr(sprite(BOSS, 'down', 0, 0, false, ''), 220, 128, -1, 1.3, true);
        drawSpr(sprite(PLAYABLE[S.p1], 'idle', Math.floor(t / 7) % 8, 0, false, ''), 76, 130, 1, 1);
      }
      if (['storm', 'world', 'control'].includes(shot)) {
        for (let i = 0; i < CH.length; i++) {
          const angle = (i * Math.PI) / 4 + (REDUCED ? 0 : t / 45);
          const x = 165 + Math.cos(angle) * (70 + i * 3),
            y = 65 + Math.sin(angle) * 22;
          drawSpr(
            sprite(CH[i], 'hit', 0, 0, false, 'p'),
            x,
            y,
            Math.cos(angle) > 0 ? 1 : -1,
            0.3,
            false,
            0.7,
          );
        }
      }
      if (shot === 'storm') drawSpr(sprite(MEGA_BOSS, 'special', 0, 1, false, ''), 165, 125, -1, 1.05);
      if (shot === 'world') {
        ctx.save();
        ctx.globalAlpha = 0.72;
        ctx.drawImage(getMap(), 6, 40, 100, 56);
        ctx.restore();
      }
      if (shot === 'control' || shot === 'resolve') {
        const controlled = shot === 'control';
        drawSpr(
          sprite(
            controlled ? PLAYABLE[S.p1] : BRIBRI,
            controlled ? 'hit' : 'win',
            Math.floor(t / 7) % 8,
            0,
            false,
            controlled ? 'p' : '',
          ),
          246,
          126,
          -1,
          1.15,
        );
        if (controlled) {
          ctx.strokeStyle = '#dd91ff';
          ctx.lineWidth = 1;
          for (const x of [234, 246, 258]) {
            ctx.beginPath();
            ctx.moveTo(160, 26);
            ctx.lineTo(x, 100);
            ctx.stroke();
          }
        }
      }
      if (shot === 'coalition') {
        const progress = Math.min(1, t / 180);
        ctx.save();
        ctx.globalAlpha = 0.35 + progress * 0.4;
        const beam = ctx.createLinearGradient(40, 0, 268, 0);
        beam.addColorStop(0, '#f8cd55');
        beam.addColorStop(1, '#e3ffff');
        ctx.strokeStyle = beam;
        ctx.lineWidth = 2 + progress * 6;
        ctx.beginPath();
        ctx.moveTo(45, 104);
        ctx.lineTo(265, 70);
        ctx.stroke();
        ctx.restore();
        drawSpr(sprite(BRIBRI, 'special', 0, 1, false, ''), 54, 125, 1, 0.65);
        CH.forEach((ch, i) => drawSpr(sprite(ch, 'special', 0, 1, false, ''), 85 + i * 18, 125, 1, 0.3));
      }
      if (shot === 'collapse') {
        ctx.fillStyle = `rgba(255,224,170,${Math.min(0.7, t / 500)})`;
        ctx.fillRect(0, 0, 320, 132);
        drawSpr(sprite(MEGA_BOSS, 'hit', 0, 0, false, ''), 168, 128 + Math.min(25, t / 10), -1, 1.2);
      }
      if (shot === 'dawn')
        PLAYABLE.forEach((ch, i) =>
          drawSpr(
            sprite(ch, 'win', Math.floor(t / 7) % 8, 0, false, ''),
            20 + i * 35,
            126,
            i < 4 ? 1 : -1,
            0.55,
          ),
        );
      ctx.restore();
      // Stable opaque subtitle band; deliberately avoids rapidly flashing fullscreen effects.
      ctx.fillStyle = '#090714';
      ctx.fillRect(0, 0, 320, 18);
      fitLabel(p.title, 10, 6, 260, 6, hero || victory ? UI.gold : '#dea0ff');
      txt(`${this.i + 1}/${panels.length}`, 310, 6, 6, UI.muted, 'right', null);
      ctx.fillStyle = vgrad(126, 54, ['rgba(9,7,20,.96)', '#090714']);
      ctx.fillRect(0, 126, 320, 54);
      ctx.fillStyle = hero || victory ? UI.gold : '#c388ff';
      ctx.fillRect(10, 127, 300, 1);
      txt(p.speaker, 12, 133, 6, hero || victory ? UI.gold : '#ddaaff', 'left', null);
      paragraph(p.text.slice(0, Math.floor(t * 0.6)), 12, 144, 296, {
        size: 6,
        lineHeight: 9,
        maxLines: 2,
        color: UI.white,
      });
      txt('ENTER AVANÇAR', 12, 169, 6, UI.muted, 'left', null);
      txt('ESC PULAR', 308, 169, 6, UI.muted, 'right', null);
      const fade = REDUCED ? 0 : Math.max(0, 1 - t / 24);
      if (fade) {
        ctx.fillStyle = `rgba(0,0,0,${fade})`;
        ctx.fillRect(0, 18, 320, 108);
      }
    },
  };
}
