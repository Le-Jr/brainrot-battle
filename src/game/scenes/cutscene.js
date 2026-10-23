/* Story cutscenes: panel rendering, effects, typewriter text and narration. */
import { AU } from '../audio/synth.js';
import { VO } from '../audio/voice.js';
import { BOSS } from '../characters/fighters/saturnita.js';
import { CH, VP } from '../characters/roster.js';
import { H, REDUCED, W } from '../config.js';
import { ctx, cv, txt, wrap } from '../core/canvas.js';
import { anyPressed } from '../core/input.js';
import { rnd } from '../core/math.js';
import { tick } from '../core/scene.js';
import { FX } from '../fx/particles.js';
import { drawSpr, sprite } from '../sprites/sprite.js';
import { STAGES, drawStage } from '../stages/index.js';
import { S } from '../state.js';

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
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, 9);
}
function Cutscene(panels, next, opp) {
  return {
    id: 'cutscene',
    tapStart: true,
    enter() {
      this.i = 0;
      this.t = 0;
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
      const p = panels[this.i],
        shown = Math.floor(this.t * 1.3);
      if (anyPressed(['Escape', 'T_start'])) {
        VO.stop();
        next();
        return;
      }
      if (anyPressed(['Enter', 'Space', 'NumpadEnter', 'KeyJ', 'KeyZ', 'T_p'])) {
        if (shown < p.tx.length) this.t = Math.ceil(p.tx.length / 1.3) + 1;
        else {
          this.i++;
          this.t = 0;
          if (this.i >= panels.length) {
            VO.stop();
            next();
            return;
          }
          AU.sfx('blip');
          this.speak();
        }
      }
    },
    draw() {
      const p = panels[this.i],
        shown = Math.floor(this.t * 1.3);
      drawPanel(p, this.t, opp);
      ctx.fillStyle = 'rgba(10,5,20,.93)';
      ctx.fillRect(4, 128, 312, 50);
      const sc =
        p.sp === 'B' ? BOSS.col : p.sp === 'O' && opp ? opp.col : p.sp === 'P' ? CH[S.p1].col : '#ffd23a';
      ctx.fillStyle = sc;
      ctx.fillRect(4, 128, 312, 1);
      if (p.sp) {
        const nm = p.sp === 'B' ? BOSS.short : p.sp === 'O' && opp ? opp.short : CH[S.p1].short;
        ctx.fillStyle = 'rgba(10,5,20,.93)';
        ctx.fillRect(10, 117, nm.length * 8 + 8, 12);
        txt(nm, 14, 119, 8, sc, 'left', null);
      }
      let left = shown;
      wrap(p.tx, 37)
        .slice(0, 4)
        .forEach((l, i) => {
          if (left <= 0) return;
          txt(l.slice(0, left), 10, 134 + i * 10, 8, p.sp ? '#ffffff' : '#f1e9ff', 'left', null);
          left -= l.length + 1;
        });
      if (shown >= p.tx.length && (this.t >> 4) % 2) {
        ctx.fillStyle = '#ffd23a';
        for (let k = 0; k < 4; k++) ctx.fillRect(304 + k, 165 + k, 1, 8 - 2 * k);
      }
      ctx.globalAlpha = 0.75;
      txt(this.i + 1 + '/' + panels.length + '  ESC: PULAR', W - 6, 1, 8, '#ffffff', 'right', null);
      ctx.globalAlpha = 1;
    },
  };
}

export { Cutscene };
