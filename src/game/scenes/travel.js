/* Travel scene: animated flight across the Brainrotália map. */
import { AU } from '../audio/synth.js';
import { VO } from '../audio/voice.js';
import { BOSS } from '../characters/fighters/saturnita.js';
import { CH } from '../characters/roster.js';
import { H, W } from '../config.js';
import { ctx, fe, txt } from '../core/canvas.js';
import { shade } from '../core/color.js';
import { CONFIRM, anyPressed } from '../core/input.js';
import { clamp } from '../core/math.js';
import { drawSpr, sprite } from '../sprites/sprite.js';
import { S } from '../state.js';
import { DECOR, LOC, MAPW, getMap, minePlane } from '../world/map.js';
import { headShot } from '../ui/portrait.js';

function Travel(from, to, next) {
  return {
    id: 'travel',
    tapStart: true,
    enter() {
      this.t = 0;
      AU.play('travel');
      setTimeout(() => VO.say('Próxima parada: ' + LOC[to].say, { role: 'pt', rate: 1.05 }), 300);
    },
    update() {
      this.t++;
      if (this.t > 220 || (this.t > 24 && anyPressed(CONFIRM))) next();
    },
    draw() {
      const t = this.t;
      ctx.drawImage(getMap(), 0, 0, W, H);
      for (const [x, y, ph] of MAPW)
        if (Math.sin(t * 0.06 + ph) > 0.8) {
          ctx.fillStyle = '#d8f0ff';
          ctx.fillRect(x, y, 2, 1);
        }
      for (let k = 0; k < 3; k++) {
        const x = ((t * 0.25 + k * 130) % (W + 80)) - 40,
          y = 30 + k * 40;
        fe(ctx, Math.round(x), y, 16, 6, 'rgba(0,20,40,.14)');
      }
      const fa = t / 12,
        [fx, fy] = DECOR.fin;
      ctx.fillStyle = '#8a94a8';
      ctx.fillRect(Math.round(fx + Math.cos(fa) * 12), Math.round(fy + Math.sin(fa) * 3), 2, 3);
      ctx.fillRect(Math.round(fx + Math.cos(fa) * 12) + 1, Math.round(fy - 1 + Math.sin(fa) * 3), 1, 1);
      const [px0, py0] = DECOR.plane,
        bx = px0 + Math.sin(t / 40) * 30,
        by = py0 + Math.sin(t / 20) * 5;
      for (let k = 1; k < 8; k++) {
        ctx.fillStyle = `rgba(255,255,255,${(0.5 - k * 0.06).toFixed(2)})`;
        ctx.fillRect(
          Math.round(px0 + Math.sin((t - k * 3) / 40) * 30),
          Math.round(py0 + Math.sin((t - k * 3) / 20) * 5) + 1,
          2,
          1,
        );
      }
      minePlane(bx, by, Math.cos(t / 40) > 0 ? 1 : -1, t);
      if (DECOR.clock) {
        const ha = t / 20,
          [cx, cy] = DECOR.clock;
        ctx.fillStyle = '#120a1c';
        for (let k = 0; k < 3; k++) {
          ctx.fillRect(Math.round(cx + Math.cos(ha) * k), Math.round(cy + Math.sin(ha) * k), 1, 1);
          ctx.fillRect(
            Math.round(cx + Math.cos(ha / 12) * k * 0.7),
            Math.round(cy + Math.sin(ha / 12) * k * 0.7),
            1,
            1,
          );
        }
      }
      if (DECOR.steam)
        for (let k = 0; k < 4; k++) {
          const p = (t * 0.4 + k * 8) % 24;
          ctx.fillStyle = `rgba(255,255,255,${(0.6 - p / 40).toFixed(2)})`;
          ctx.fillRect(
            Math.round(DECOR.steam[0] + Math.sin(p / 4 + k) * 2),
            Math.round(DECOR.steam[1] - p),
            1,
            2,
          );
        }
      if (DECOR.logs)
        for (let k = 0; k < 3; k++) {
          const j = Math.abs(Math.sin(t / 8 + k * 1.3)) * 3;
          ctx.fillStyle = '#b97f48';
          ctx.fillRect(DECOR.logs[0] + k * 9, Math.round(DECOR.logs[1] - j), 2, 4);
        }
      for (const s of [-1, 1]) {
        const a = -Math.PI / 2 + Math.sin(t / 30) * 0.5 * s,
          [sx, sy] = DECOR.spots;
        ctx.fillStyle = 'rgba(255,246,210,.6)';
        for (let r = 2; r < 16; r += 2)
          ctx.fillRect(Math.round(sx + s * 4 + Math.cos(a) * r), Math.round(sy + Math.sin(a) * r), 1, 1);
      }
      const SL = LOC[9],
        stops = S.ladder.map((i) => CH[i].stage),
        beaten = stops.slice(0, S.li);
      for (let r = 22; r > 0; r -= 3) {
        fe(
          ctx,
          SL.x,
          SL.y,
          r,
          Math.round(r * 0.7),
          `rgba(${120 + r * 3},40,${180 + r},${(0.05 + (22 - r) * 0.008).toFixed(3)})`,
        );
      }
      for (const si of stops) {
        if (beaten.includes(si)) continue;
        const L = LOC[si];
        const n = Math.hypot(L.x - SL.x, L.y - SL.y) / 3;
        for (let k = 0; k < n; k++) {
          if ((k + Math.floor(t / 3)) % 5 > 1) continue;
          const f = k / n;
          ctx.fillStyle = 'rgba(200,90,255,.75)';
          ctx.fillRect(Math.round(SL.x + (L.x - SL.x) * f), Math.round(SL.y + (L.y - SL.y) * f), 1, 1);
        }
      }
      fe(ctx, SL.x, SL.y, 8, 8, '#120a1c');
      fe(ctx, SL.x, SL.y, 7, 7, '#e8b06a');
      for (let y = -5; y <= 5; y += 3) ((ctx.fillStyle = '#c8904a'), ctx.fillRect(SL.x - 6, SL.y + y, 12, 1));
      for (let a = 0; a < 6.28; a += 0.08) {
        const x = Math.round(SL.x + Math.cos(a + t / 30) * 14),
          y = Math.round(SL.y + Math.sin(a + t / 30) * 4);
        if (Math.sin(a + t / 30) < 0 && Math.hypot(x - SL.x, y - SL.y) < 7) continue;
        ctx.fillStyle = '#ecdcb0';
        ctx.fillRect(x, y, 1, 1);
      }
      fe(ctx, SL.x, SL.y - 10, 4, 3, '#f4f0ea');
      ctx.fillStyle = '#2a2230';
      ctx.fillRect(SL.x - 2, SL.y - 11, 1, 1);
      ctx.fillRect(SL.x + 2, SL.y - 11, 1, 1);
      ctx.fillStyle = '#f0a0b4';
      ctx.fillRect(SL.x - 1, SL.y - 8, 3, 1);
      ctx.fillStyle = '#b060ff';
      if ((t >> 3) & 1) {
        ctx.fillRect(SL.x - 2, SL.y - 11, 1, 1);
        ctx.fillRect(SL.x + 2, SL.y - 11, 1, 1);
      }
      const mark = (L, col, r = 1) => {
        ctx.fillStyle = '#120a1c';
        ctx.fillRect(L.x - r - 1, L.y - r - 1, r * 2 + 3, r * 2 + 3);
        ctx.fillStyle = col;
        ctx.fillRect(L.x - r, L.y - r, r * 2 + 1, r * 2 + 1);
      };
      stops.forEach((si) => {
        const L = LOC[si];
        if (beaten.includes(si)) {
          mark(L, '#2fbf5a');
          ctx.fillStyle = '#120a1c';
          ctx.fillRect(L.x, L.y - 8, 1, 7);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(L.x + 1, L.y - 8, 4, 3);
          ctx.fillStyle = '#2fbf5a';
          ctx.fillRect(L.x + 1, L.y - 8, 2, 3);
        } else {
          const p = (Math.sin(t / 8 + si) + 1) / 2;
          fe(ctx, L.x, L.y, 3 + Math.round(p * 2), 2 + Math.round(p), 'rgba(180,70,255,.35)');
          mark(L, '#b060ff');
        }
      });
      mark(LOC[CH[S.p1].stage], '#ff4d5e');
      const A = LOC[from],
        B = LOC[to],
        p = clamp((t - 24) / 120, 0, 1),
        e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2,
        dist = Math.hypot(B.x - A.x, B.y - A.y);
      const pos = (k) => [
        A.x + (B.x - A.x) * k,
        A.y + (B.y - A.y) * k - Math.sin(k * Math.PI) * Math.min(40, dist * 0.35 + 8),
      ];
      for (let k = 0; k <= e; k += 0.03) {
        const q = pos(k);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.round(q[0]), Math.round(q[1]), 1, 1);
      }
      const ar = Math.round(Math.abs(Math.sin(t / 6)) * 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(B.x - 1, B.y - 9 - ar, 3, 3);
      ctx.fillRect(B.x, B.y - 6 - ar, 1, 2);
      const q = pos(e),
        dd = B.x >= A.x ? 1 : -1;
      minePlane(q[0], q[1] + 6, dd, t);
      drawSpr(sprite(CH[S.p1], 'idle', 0, 0, false, ''), q[0], q[1] + 3, dd, 0.28);
      ctx.fillStyle = 'rgba(12,6,22,.9)';
      ctx.fillRect(0, 0, W, 16);
      txt('BRAINROTÁLIA', 6, 4, 8, '#ff6ad5');
      txt('FRAGMENTOS ' + S.li + '/7', W - 6, 4, 8, '#b060ff', 'right');
      const opp = S.li < 7 ? CH[S.ladder[S.li]] : BOSS;
      ctx.fillStyle = 'rgba(12,6,22,.9)';
      ctx.fillRect(0, 146, W, 34);
      ctx.fillStyle = '#ffd23a';
      ctx.fillRect(0, 146, W, 1);
      ctx.fillStyle = '#120a1c';
      ctx.fillRect(5, 149, 30, 28);
      ctx.fillStyle = shade(opp.col, -0.5);
      ctx.fillRect(6, 150, 28, 26);
      headShot(opp, 7, 150, 26, { flip: true, t });
      txt('PRÓXIMA PARADA', 42, 151, 8, '#ffd23a');
      txt(B.n, 42, 163, 8, '#ffffff');
      txt(S.li < 7 ? 'DESAFIO ' + (S.li + 1) + '/7' : 'CHEFE FINAL', W - 6, 151, 8, '#ff8a96', 'right');
      txt(opp.short, W - 6, 163, 8, opp.col, 'right');
    },
  };
}

export { Travel };
