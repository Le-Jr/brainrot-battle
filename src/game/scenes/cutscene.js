import { UI, screenFooter } from '../ui/theme.js';
/* Story cutscenes: panel rendering, effects, typewriter text and narration. */
import { AU } from '../audio/synth.js';
import { VO } from '../audio/voice.js';
import { BOSS } from '../characters/fighters/saturnita.js';
import { CH, VP } from '../characters/roster.js';
import { H, REDUCED, W } from '../config.js';
import { shade } from '../core/color.js';
import { ctx, cv, txt, vgrad, wrap } from '../core/canvas.js';
import { anyPressed } from '../core/input.js';
import { rnd } from '../core/math.js';
import { tick } from '../core/scene.js';
import { FX } from '../fx/particles.js';
import { drawSpr, sprite } from '../sprites/sprite.js';
import { STAGES, drawStage } from '../stages/index.js';
import { S } from '../state.js';
import { blink, fade, frameBox, letterbox, plate } from '../ui/arcade.js';
import { headShot } from '../ui/portrait.js';

/* ---------- cutscenes ---------- */
function actorCh(w, opp) {
  return w === 'P' ? CH[S.p1] : w === 'B' ? BOSS : w === 'O' ? opp : CH.find((c) => c.id === w);
}
function drawPanel(p, t, opp) {
  const [si, tint, cam] = p.bg,
    st = STAGES[si],
    c = cam === undefined ? 80 : cam;
  ctx.save();
  if (p.fx === 'shake' && t < 40 && !REDUCED) ctx.translate(Math.round(rnd(-3, 3)), Math.round(rnd(-2, 2)));
  if (p.fx === 'zoom') {
    const k = 1 + Math.max(0, 0.1 - t * 0.0012);
    ctx.translate(160, 90);
    ctx.scale(k, k);
    ctx.translate(-160, -90);
  }
  drawStage(st, c, tick);
  if (st.front) st.front(ctx, c, tick);
  if (tint) {
    ctx.fillStyle = tint;
    ctx.fillRect(-10, -10, W + 20, H + 20);
  }
  for (const a of p.a) {
    const [who, pose, x, y, dir, sc, lying, hyp] = a;
    const ch = actorCh(who, opp);
    if (!ch) continue;
    const fr = pose === 'idle' || pose === 'win' || pose === 'walk' ? Math.floor(tick / 7) % 8 : 0;
    if (hyp) {
      const pulse = 0.35 + Math.sin(tick / 6) * 0.2;
      drawSpr(
        sprite(ch, pose, fr, 0, false, 'p'),
        x + Math.round(Math.sin(tick / 5) * 2),
        y,
        dir,
        (sc || 2) * 1.04,
        !!lying,
        pulse,
      );
    }
    drawSpr(sprite(ch, pose, fr, 0, false, hyp ? 'p' : ''), x, y, dir, sc || 2, !!lying);
    if (hyp && tick % 3 === 0)
      FX.parts.push({
        x: x + rnd(-20, 20),
        y: y - rnd(10, 90),
        vx: 0,
        vy: -0.5,
        life: 30,
        c: '#c070ff',
        s: 2,
        g: -0.01,
      });
  }
  for (const q of FX.parts) {
    q.x += q.vx;
    q.y += q.vy;
    q.life--;
    ctx.fillStyle = q.c;
    ctx.fillRect(Math.round(q.x), Math.round(q.y), q.s, q.s);
  }
  FX.parts = FX.parts.filter((q) => q.life > 0);
  ctx.restore();
  if (p.fx === 'glitch' && tick % 7 < 3) {
    for (let k = 0; k < 4; k++) {
      const y = Math.floor(rnd(10, 120)),
        h = Math.floor(rnd(2, 7)),
        off = Math.round(rnd(-8, 8));
      ctx.drawImage(cv, 0, y * 2, 640, h * 2, off, y, W, h);
      ctx.fillStyle = k % 2 ? 'rgba(255,0,180,.18)' : 'rgba(0,255,255,.15)';
      ctx.fillRect(0, y, W, h);
    }
  }
  if (p.fx === 'flash' && t < 22) {
    ctx.fillStyle = `rgba(255,255,255,${(1 - t / 22).toFixed(2)})`;
    ctx.fillRect(0, 0, W, H);
  }
  letterbox(12, 0);
}

/** Speaker portrait: the head of the idle sprite in an arcade frame. Right-side speakers face the center. */
function bust(ch, x, y, tint, right, t) {
  const S2 = 46;
  frameBox(x, y, S2, S2, ch.col, vgrad(y, S2, [shade(ch.col, -0.45), shade(ch.col, -0.75)]));
  headShot(ch, x + 1, y + 1, S2 - 2, { tint, flip: right, t });
  if (tint === 'p') {
    ctx.fillStyle = `rgba(176,96,255,${(0.12 + Math.sin(t / 6) * 0.08).toFixed(3)})`;
    ctx.fillRect(x, y, S2, S2);
  }
}
function Cutscene(panels, next, opp) {
  return {
    id: 'cutscene',
    tapStart: true,
    enter() {
      this.i = 0;
      this.t = 0;
      this.tr = 0;
      FX.parts = [];
      AU.play(panels.music || 'story');
      this.speak();
    },
    speak() {
      const p = panels[this.i],
        sp = p.sp;
      let o = { role: 'pt', rate: 1.04, pitch: 1 };
      if (sp === 'B') o = { role: 'pt', pitch: 0.3, rate: 0.86 };
      else if (sp === 'P') o = { role: 'pt', pitch: VP[CH[S.p1].id] || 1, rate: 1.06 };
      else if (sp === 'O' && opp) o = { role: 'pt', pitch: (VP[opp.id] || 1) * 0.9, rate: 0.95 };
      if (p.fx === 'flash' || p.fx === 'shake') AU.sfx(p.fx === 'shake' ? 'slam' : 'boom');
      if (p.fx === 'glitch') AU.sfx('crack');
      VO.say(p.tx.replace(/"/g, ''), o);
    },
    update() {
      this.t++;
      if (this.tr > 0) {
        // fade through black between panels; the next panel starts at the darkest point
        this.tr--;
        if (this.tr === 8) {
          this.i++;
          this.t = 0;
          this.speak();
        }
        return;
      }
      const p = panels[this.i],
        shown = Math.floor(this.t * 1.3);
      if (anyPressed(['Escape', 'T_start'])) {
        VO.stop();
        next();
        return;
      }
      if (anyPressed(['Enter', 'Space', 'NumpadEnter', 'KeyJ', 'KeyZ', 'T_p'])) {
        if (shown < p.tx.length) this.t = Math.ceil(p.tx.length / 1.3) + 1;
        else if (this.i + 1 >= panels.length) {
          VO.stop();
          next();
        } else {
          AU.sfx('blip');
          VO.stop();
          this.tr = 16;
        }
      }
    },
    draw() {
      const p = panels[this.i],
        shown = Math.floor(this.t * 1.3),
        sp = p.sp,
        who = sp === 'B' ? BOSS : sp === 'O' ? opp : sp === 'P' ? CH[S.p1] : null,
        right = sp === 'B' || sp === 'O',
        sc = who ? who.col : '#f8cd55';
      drawPanel(p, this.t, opp);
      // dialog band
      ctx.fillStyle = vgrad(120, 46, ['rgba(8,4,18,.96)', 'rgba(14,6,28,.97)']);
      ctx.fillRect(0, 120, W, 46);
      ctx.fillStyle = '#f8cd55';
      ctx.fillRect(10, 120, W - 20, 1);
      ctx.fillStyle = '#8a5a10';
      ctx.fillRect(10, 121, W - 20, 1);
      ctx.fillStyle = sc;
      ctx.fillRect(10, 164, W - 20, 1);
      if (who) {
        const hyp = sp === 'O' && p.a.some((a) => a[0] === 'O' && a[7]);
        bust(who, right ? W - 56 : 10, 62, hyp ? 'p' : '', right, tick);
        const nm = who.short,
          pw = nm.length * 6 + 16,
          px = right ? W - 56 - pw : 56;
        plate(px - 1, 108, pw + 2, 12, '#050812', 5);
        plate(px, 109, pw, 10, vgrad(109, 10, [shade(sc, 0.35), sc, shade(sc, -0.35)]), 5);
        txt(nm, px + 9, 111, 6, '#ffffff', 'left', '#080e20');
      }
      let left = shown;
      wrap(p.tx, 48)
        .slice(0, 4)
        .forEach((l, i) => {
          if (left <= 0) return;
          txt(l.slice(0, left), 16, 126 + i * 10, 6, who ? '#ffffff' : '#fff3d6', 'left', null);
          left -= l.length + 1;
        });
      if (shown >= p.tx.length && blink(this.t, 32)) {
        ctx.fillStyle = '#f8cd55';
        for (let k = 0; k < 4; k++)
          ctx.fillRect(304 + k, 155 + k + (blink(this.t, 16) ? 1 : 0), 1, 8 - 2 * k);
      }
      // top bar: progress dots and skip hint
      panels.forEach((_, i) => {
        ctx.fillStyle = i === this.i ? '#f8cd55' : i < this.i ? '#8a5a10' : '#203455';
        ctx.fillRect(W / 2 - panels.length * 3 + i * 6, 5, 3, 3);
      });
      ctx.globalAlpha = 0.7;
      txt('STORY MODE', 10, 4, 6, UI.gold, 'left', null);
      txt('ESC PULAR', W - 10, 4, 6, UI.white, 'right', null);
      ctx.globalAlpha = 1;
      screenFooter('BRAINROTÁLIA', 'ENTER AVANÇAR · ESC PULAR');
      if (this.tr > 0) fade(1 - Math.abs(this.tr - 8) / 8);
    },
  };
}

export { Cutscene };
