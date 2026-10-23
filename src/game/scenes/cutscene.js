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
import { drawSpr, profile, sprite } from '../sprites/sprite.js';
import { STAGES, drawStage } from '../stages/index.js';
import { S } from '../state.js';
import { OX, OY } from '../sprites/primitives.js';
import { blink, fade, frameBox, letterbox, plate } from '../ui/arcade.js';

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
  const S2 = 46,
    img = sprite(ch, 'idle', Math.floor(t / 9) % 8, 0, false, tint),
    k = img.hd ? 2 : 1;
  frameBox(x, y, S2, S2, ch.col, vgrad(y, S2, [shade(ch.col, -0.45), shade(ch.col, -0.75)]));
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 1, y + 1, S2 - 2, S2 - 2);
  ctx.clip();
  if (right) {
    ctx.translate(x * 2 + S2, 0);
    ctx.scale(-1, 1);
  }
  // crop around the head: the top of the measured body, biased towards the front (faces look forward)
  const P = profile(ch),
    bw = P.r - P.l,
    cs = Math.min(58, Math.max(36, bw * 0.66)),
    cx = (P.l + P.r) / 2 + bw * 0.18,
    cy = P.t - 4;
  ctx.drawImage(img, (OX + cx - cs / 2) * k, (OY + cy) * k, cs * k, cs * k, x, y + 1, S2, S2);
  ctx.restore();
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
        sc = who ? who.col : '#ffd23a';
      drawPanel(p, this.t, opp);
      // dialog band
      ctx.fillStyle = vgrad(126, 54, ['rgba(8,4,18,.96)', 'rgba(14,6,28,.97)']);
      ctx.fillRect(0, 126, W, 54);
      ctx.fillStyle = '#ffd23a';
      ctx.fillRect(0, 126, W, 1);
      ctx.fillStyle = '#8a5a10';
      ctx.fillRect(0, 127, W, 1);
      ctx.fillStyle = sc;
      ctx.fillRect(0, 179, W, 1);
      if (who) {
        const hyp = sp === 'O' && p.a.some((a) => a[0] === 'O' && a[7]);
        bust(who, right ? W - 52 : 6, 78, hyp ? 'p' : '', right, tick);
        const nm = who.short,
          pw = nm.length * 8 + 16,
          px = right ? W - 56 - pw : 56;
        plate(px - 1, 114, pw + 2, 12, '#05020a', 5);
        plate(px, 115, pw, 10, vgrad(115, 10, [shade(sc, 0.35), sc, shade(sc, -0.35)]), 5);
        txt(nm, px + 9, 116, 8, '#ffffff', 'left', '#120a1c');
      }
      let left = shown;
      wrap(p.tx, 37)
        .slice(0, 4)
        .forEach((l, i) => {
          if (left <= 0) return;
          txt(l.slice(0, left), 10, 134 + i * 10, 8, who ? '#ffffff' : '#f1e9ff', 'left', null);
          left -= l.length + 1;
        });
      if (shown >= p.tx.length && blink(this.t, 32)) {
        ctx.fillStyle = '#ffd23a';
        for (let k = 0; k < 4; k++)
          ctx.fillRect(304 + k, 167 + k + (blink(this.t, 16) ? 1 : 0), 1, 8 - 2 * k);
      }
      // top bar: progress dots and skip hint
      panels.forEach((_, i) => {
        ctx.fillStyle = i === this.i ? '#ffd23a' : i < this.i ? '#8a5a10' : '#2a1838';
        ctx.fillRect(6 + i * 6, 4, 4, 4);
      });
      ctx.globalAlpha = 0.7;
      txt('ESC: PULAR', W - 6, 2, 8, '#ffffff', 'right', null);
      ctx.globalAlpha = 1;
      if (this.tr > 0) fade(1 - Math.abs(this.tr - 8) / 8);
    },
  };
}

export { Cutscene };
