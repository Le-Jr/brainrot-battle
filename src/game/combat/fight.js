import { hudBackdrop } from '../ui/hud.js';
/* A match: rounds, timer, hit resolution, projectiles, camera, HUD and banners. */
import { hype } from '../audio/announcer.js';
import { AU } from '../audio/synth.js';
import { IT, VO } from '../audio/voice.js';
import { FLOOR, H, REDUCED, W, WORLD } from '../config.js';
import { ctx, fe, txt, vgrad } from '../core/canvas.js';
import { readPad } from '../core/input.js';
import { clamp, rnd } from '../core/math.js';
import { FX, drawFX, popup, spark, updFX } from '../fx/particles.js';
import { HD } from '../sprites/hd.js';
import { drawSpr, sprite } from '../sprites/sprite.js';
import { STAGES, drawStage } from '../stages/index.js';
import { DEBUG } from '../state.js';
import { sparkle } from '../ui/arcade.js';
import {
  band,
  comboCounter,
  lifeBar,
  namePlate,
  portraitChip,
  powerGauge,
  timerEmblem,
  winnerPlate,
} from '../ui/hud.js';
import { AI } from './ai.js';
import { NOINP, overlap } from './constants.js';
import { Fighter } from './fighter.js';
import { drawProj } from './projectiles.js';

class Fight {
  constructor(c1, c2, stageIdx, opts) {
    const lv = opts.lv || [1, 1];
    this.f = [new Fighter(c1, 0, false, lv[0]), new Fighter(c2, 1, c1 === c2, lv[1])];
    this.perfects = [0, 0];
    this.stage = STAGES[stageIdx];
    this.opts = opts;
    this.ai = [null, opts.cpu ? new AI(opts.lvl, opts.boost || 0) : null];
    this.round = 1;
    this.wins = [0, 0];
    this.tick = 0;
    this.shake = 0;
    this.cam = (WORLD - W) / 2;
    this.bestCombo = 0;
    FX.parts = [];
    FX.pops = [];
    FX.rings = [];
    this.startRound();
  }
  startRound() {
    for (const f of this.f) f.reset();
    this.projs = [];
    this.timer = 99;
    this.timerT = 0;
    this.phase = 'intro';
    this.pt = 0;
    this.cam = (WORLD - W) / 2;
    this.hitstop = 0;
    this.superT = 0;
    this.slowT = 0;
    this.combo = [null, null];
    this.res = null;
    this.order = [0, 1];
    this.flashT = 0;
  }
  input(i) {
    if (DEBUG.local && DEBUG.testing && DEBUG.freezeCpu && this.ai[i]) return NOINP;
    if (this.ai[i]) return this.ai[i].think(this.f[i], this.f[1 - i], this);
    if (this.opts.dummy && i === 1) return NOINP;
    if (this.opts.cpu || this.opts.dummy) return readPad('p1', 'p1x');
    return readPad(i === 0 ? 'p1' : 'p2');
  }
  superFlash(f) {
    this.superT = 44;
    this.superWho = f;
    AU.sfx('super');
    VO.say(f.ch.call || f.ch.voice, IT);
    popup(f.x, f.y - f.ch.hurt.h - 14, 'SUPER!', '#ff6ad5', 16);
  }
  exFlash(f) {
    AU.sfx('ex');
    this.hitstop = Math.max(this.hitstop, 6);
    this.flashT = 8;
    popup(f.x, f.y - f.ch.hurt.h - 12, 'EX!', '#4af0ff', 16);
    spark(f.x, f.y - 30, ['#4af0ff', '#ffffff', '#9adcff'], 18, 2.6, -0.02);
  }
  cancelFx(f) {
    FX.rings.push({ x: f.x + f.dir * 14, y: f.y - 36, t: 0, c: '#4af0ff' });
  }
  spawn(f, type, o) {
    const s = f.spec.sup,
      ex = f.spec.ex,
      d = f.dir,
      P = (q) => {
        const p = Object.assign(
          { o: f, type, t: 0, vx: 0, vy: 0, dead: false, hit: false, sup: s || ex, dir: d },
          q,
        );
        if (ex) p.vx *= 1.25;
        this.projs.push(p);
        return p;
      };
    const dm = f.pw * (ex ? 1.35 : 1);
    switch (type) {
      case 'wave':
        P({
          x: f.x + d * 22,
          y: f.y - 30,
          vx: d * (s ? 3.6 : 3.2),
          w: s ? 26 : 18,
          h: s ? 32 : 18,
          data: {
            dmg: (s ? 24 : 10) * dm,
            stun: 18,
            bstun: 14,
            push: 3,
            lvl: 'mid',
            chip: 1,
            kd: s || ex,
            heavy: s,
          },
        });
        break;
      case 'bomb':
        for (const v of s ? [1.6, 2.6, 3.6] : ex ? [2, 3.2] : [2.6])
          P({
            x: f.x + d * 16,
            y: f.y - 36,
            vx: d * v,
            vy: -3.4,
            w: 8,
            h: 8,
            data: {
              dmg: (s ? 9 : 11) * dm,
              stun: 18,
              bstun: 12,
              push: 3,
              lvl: 'mid',
              kd: 1,
              heavy: 1,
              chip: 1,
            },
          });
        break;
      case 'banana':
        P({
          x: f.x + d * 18,
          y: f.y - 32,
          vx: d * (s ? 4.4 : 3.8),
          acc: -d * (s ? 0.09 : 0.1),
          w: s ? 16 : 12,
          h: s ? 16 : 12,
          data: { dmg: (s ? 22 : 9) * dm, stun: 16, bstun: 11, push: 2.5, lvl: 'mid', chip: 1, kd: s },
        });
        break;
      case 'clock':
        P({
          x: f.x + d * 20,
          y: f.y - 36,
          vx: d * 2.2,
          w: s ? 22 : 14,
          h: s ? 22 : 14,
          data: {
            dmg: (s ? 18 : 7) * dm,
            freeze: s ? 90 : ex ? 70 : 52,
            stun: 18,
            bstun: 12,
            push: 1,
            lvl: 'mid',
            chip: 1,
          },
        });
        break;
      case 'ring':
        P({
          x: f.x + d * 24,
          y: f.y - 38,
          vx: d * 3.4,
          w: 30,
          h: 16,
          data: { dmg: 11 * dm, stun: 18, bstun: 13, push: 3, lvl: 'mid', chip: 1 },
        });
        break;
      case 'meteor':
        [-36, 0, 36].forEach((off, k) =>
          P({
            x: clamp(o.x + off, this.cam + 10, this.cam + W - 10),
            y: -10 - k * 26,
            vx: 0,
            vy: 2.4,
            w: 12,
            h: 12,
            data: { dmg: 10 * dm, stun: 18, bstun: 12, push: 2.5, lvl: 'mid', kd: 1, heavy: 1, chip: 1 },
          }),
        );
        break;
      case 'quake':
        P({
          x: f.x + d * 20,
          y: FLOOR - 7,
          vx: d * (s ? 3.6 : 3),
          w: s ? 28 : 20,
          h: 14,
          data: {
            dmg: (s ? 24 : 11) * dm,
            stun: 18,
            bstun: 12,
            push: 2.5,
            lvl: 'low',
            kd: 1,
            heavy: 1,
            chip: 1,
          },
        });
        break;
    }
  }
  explode(p) {
    const b = {
      o: p.o,
      type: 'boom',
      t: 0,
      x: p.x,
      y: FLOOR - 16,
      vx: 0,
      vy: 0,
      w: 36,
      h: 34,
      dead: false,
      hit: false,
      data: p.data,
    };
    this.projs.push(b);
    this.shake = Math.max(this.shake, 6);
    AU.sfx('boom');
    spark(p.x, FLOOR - 8, ['#fff2b0', '#ffb040', '#ff5a2a', '#5a4a50'], 26, 3, 0.06);
  }
  applyHit(a, d, dat, srcX, hy) {
    if (DEBUG.local && DEBUG.testing && DEBUG.god && d.side === 0) return false;
    if (d.inv > 0 || d.st === 'ko' || d.hidden) return false;
    if (d.st === 'down' && !(d.jug > 0 && d.y < FLOOR - 3)) return false;
    if (d.atk && d.atk.n === 'up' && d.atk.t <= d.atk.d.st + 4 && !dat.unblock) return false;
    const air = d.y < FLOOR - 1,
      back = d.inBack,
      can = !dat.unblock && back && !air && ['idle', 'walk', 'crouch', 'blockstun'].includes(d.st);
    let blocked = false;
    if (can) {
      const cr = d.inDown;
      blocked = dat.lvl === 'low' ? cr : dat.lvl === 'high' ? !cr : true;
    }
    const pd = Math.sign(d.x - srcX) || a.dir;
    const h = d.hurt(),
      cx = pd > 0 ? h.x + 3 : h.x + h.w - 3,
      cy = hy !== undefined ? clamp(hy, h.y + 2, h.y + h.h - 2) : h.y + Math.min(h.h * 0.4, 20);
    const nearWall = d.x <= Math.max(16, this.cam + 16) || d.x >= Math.min(WORLD - 16, this.cam + W - 16);
    if (blocked) {
      d.st = 'blockstun';
      d.stunT = dat.bstun || 10;
      d.cblock = d.inDown;
      d.vx = pd * dat.push * 0.9;
      if (nearWall) a.vx = -pd * dat.push * 0.7;
      if (dat.chip) d.hp = Math.max(1, d.hp - dat.chip);
      this.hitstop = 4;
      AU.sfx('block');
      spark(cx, cy, ['#9adcff', '#ffffff', '#4ab4ff'], 8, 2);
      a.meter = Math.min(100, a.meter + 3);
      d.meter = Math.min(100, d.meter + 2);
      return 'block';
    }
    const juggle = d.st === 'down';
    if (juggle) d.jug--;
    const scale = Math.max(0.3, 1 - d.comboTaken * 0.11);
    const dmg = Math.max(1, Math.round((dat.dmg * scale) / d.df));
    const inCombo = d.st === 'hitstun' || d.frozen > 0 || air || juggle;
    d.hp = Math.max(0, d.hp - dmg);
    d.dhpT = 30;
    d.comboTaken++;
    a.combo = inCombo ? a.combo + 1 : 1;
    if (a.combo >= 2) {
      this.combo[a.side] = { n: a.combo, t: 70 };
      this.bestCombo = Math.max(this.bestCombo, a.combo);
      const lbl = { 3: 'COMBO!', 5: 'SUPER COMBO!', 7: 'ULTRA COMBO!', 10: 'BRAINROT COMBO!!' }[a.combo];
      if (lbl) {
        popup(W / 2 + this.cam, 50, lbl, a.combo >= 7 ? '#ff6ad5' : '#ffd23a', a.combo >= 5 ? 16 : 8);
        if (!a.isCar && !this.opts.quiet)
          hype(a.combo >= 7 ? 'combo7' : a.combo >= 5 ? 'combo5' : 'combo3', true);
      }
    }
    a.meter = Math.min(100, a.meter + dmg * 1.3);
    d.meter = Math.min(100, d.meter + dmg * 0.8);
    d.atk = null;
    d.spec = null;
    d.hidden = false;
    d.flash = 8;
    d.cblock = false;
    d.grab = null;
    if (d.hp <= 0) {
      d.st = 'ko';
      d.isKO = true;
      d.vy = -4.2;
      d.vx = pd * 2.4;
      this.onKO(a, d);
    } else if (dat.launch) {
      d.st = 'down';
      d.downT = 0;
      d.vy = -5.2;
      d.vx = pd * 1.2;
      d.jug = 2;
      d.frozen = 0;
    } else if (dat.kd || air || juggle) {
      d.st = 'down';
      d.downT = 0;
      d.vy = juggle ? -3 : -3.6;
      d.vx = pd * 2.4;
      d.frozen = 0;
      if (!juggle) d.jug = dat.kd ? 0 : 1;
    } else if (dat.freeze) {
      d.st = 'hitstun';
      d.stunT = dat.freeze;
      d.frozen = dat.freeze;
      d.vx = pd * 0.6;
      AU.sfx('freeze');
    } else {
      d.st = 'hitstun';
      d.stunT = dat.stun;
      d.vx = pd * dat.push;
      if (nearWall) a.vx = -pd * dat.push * 0.8;
    }
    const heavy = dat.heavy || dmg >= 10;
    this.hitstop = heavy ? 9 : 6;
    this.shake = Math.max(this.shake, heavy ? 5 : 2);
    FX.rings.push({ x: cx, y: cy, t: 0, c: '#ffd23a' });
    spark(cx, cy, ['#ffffff', '#fff07a', '#ffb03a', '#ff6a3a'], heavy ? 16 : 10, heavy ? 3.4 : 2.4);
    AU.sfx(heavy ? 'hitH' : 'hitL');
    this.order = [d.side, a.side];
    this.lastDmg = (this.lastDmg || 0) + dmg;
    return 'hit';
  }
  onKO(a, d) {
    this.phase = 'ko';
    this.slowT = 0;
    this.res = { w: a.side, type: 'ko' };
    AU.sfx('ko');
    hype('ko');
    this.shake = 8;
  }
  update() {
    this.tick++;
    updFX();
    if (this.shake > 0) this.shake -= 0.5;
    if (this.flashT > 0) this.flashT--;
    for (const f of this.f) {
      if (f.dhpT > 0) f.dhpT--;
      else if (f.dhp > f.hp) f.dhp = Math.max(f.hp, f.dhp - 0.6);
    }
    for (const c of this.combo) if (c) c.t--;
    if (this.superT > 0) {
      this.superT--;
      return;
    }
    if (this.hitstop > 0) {
      this.hitstop--;
      return;
    }
    if (this.phase === 'ko') {
      this.slowT++;
      if (this.slowT >= 80) {
        this.phase = 'end';
        this.pt = 0;
        this.endRound();
      } else if (this.slowT % 3 !== 0) return;
    }
    this.pt++;
    if (this.phase === 'intro') {
      if (this.pt === 2) hype(this.round >= 3 ? 'final' : 'round');
      if (this.pt === 62) hype('fight', true);
      if (this.pt >= 96) {
        this.phase = 'fight';
        this.pt = 0;
      }
    }
    const fighting = this.phase === 'fight';
    if (this.phase === 'end' && this.pt === 40 && this.res.w >= 0) {
      const w = this.f[this.res.w];
      if (w.st !== 'ko' && w.st !== 'down') {
        w.st = 'win';
        w.atk = null;
        w.spec = null;
        w.hidden = false;
      }
    }
    this.core([fighting ? this.input(0) : NOINP, fighting ? this.input(1) : NOINP]);
    if (fighting && !this.opts.dummy) {
      this.timerT++;
      if (this.timerT >= 60) {
        this.timerT = 0;
        this.timer--;
        if (this.timer <= 0) {
          this.timer = 0;
          const a = this.f[0].hp,
            b = this.f[1].hp;
          this.res = { w: a > b ? 0 : b > a ? 1 : -1, type: 'time' };
          this.phase = 'end';
          this.pt = 0;
          this.endRound();
          hype('time');
        }
      }
    }
    if (this.phase === 'end' && this.pt === 70 && this.res && this.res.perfect) hype('perfect', true);
    if (this.phase === 'end' && this.pt === 150) {
      const w = this.res.w;
      if (w >= 0 && this.wins[w] >= 2) {
        this.done = w;
      } else if (this.round >= 5) {
        this.done = this.wins[0] >= this.wins[1] ? 0 : 1;
      } else {
        this.round++;
        this.startRound();
      }
    }
  }
  core(inps) {
    for (let i = 0; i < 2; i++) this.f[i].update(inps[i], this.f[1 - i], this);
    for (let i = 0; i < 2; i++) {
      const a = this.f[i],
        d = this.f[1 - i];
      if (a.atk && !a.atk.hit) {
        const ad = a.atk.d,
          t = a.atk.t;
        if (t >= ad.st && t < ad.st + ad.ac) {
          const ab = a.atkBox();
          if (overlap(ab, d.hurt())) {
            a.atk.hit = true;
            const r = this.applyHit(
              a,
              d,
              Object.assign({}, ad, { dmg: ad.dmg * a.pw }),
              a.x,
              ab.y + ab.h / 2,
            );
            if (r) a.atk.conn = true;
          }
        }
      }
      const s = a.spec;
      if (s && s.box && s.hits < s.max && this.tick - s.last >= s.rehit && overlap(s.box, d.hurt())) {
        const r = this.applyHit(
          a,
          d,
          Object.assign({}, s.data, { dmg: s.data.dmg * a.pw * (s.ex ? 1.3 : 1) }),
          a.x,
        );
        if (r) {
          s.hits++;
          s.last = this.tick;
        }
      }
    }
    for (const p of this.projs) {
      if (p.dead) continue;
      p.t++;
      if (p.type === 'bomb' || p.type === 'meteor') {
        p.vy += p.type === 'bomb' ? 0.16 : 0.1;
        p.x += p.vx;
        p.y += p.vy;
        if (p.type === 'meteor' && p.t % 2 === 0)
          FX.parts.push({
            x: p.x + rnd(-2, 2),
            y: p.y - 4,
            vx: 0,
            vy: -0.3,
            life: 12,
            c: p.t % 4 ? '#ff8a2a' : '#ffd23a',
            s: 2,
            g: 0,
          });
        if (p.y >= FLOOR - 4) {
          p.dead = true;
          this.explode(p);
          continue;
        }
      } else if (p.type === 'banana') {
        p.vx += p.acc;
        p.x += p.vx;
        if (p.vx * p.dir < 0 && Math.abs(p.x - p.o.x) < 14) p.dead = true;
        if (p.t > 170) p.dead = true;
      } else if (p.type === 'boom') {
        if (p.t > 12) p.dead = true;
      } else {
        p.x += p.vx;
        if (p.type === 'quake' && p.t % 3 === 0) spark(p.x, FLOOR - 2, ['#7a5a3a', '#5f8a35'], 2, 1.2);
      }
      if (p.x < this.cam - 50 || p.x > this.cam + W + 50) p.dead = true;
      if (p.dead) continue;
      const d = this.f[1 - p.o.side];
      if (!p.hit && overlap({ x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h }, d.hurt())) {
        const r = this.applyHit(p.o, d, p.data, p.x - (p.vx || 0) * 4, p.y);
        if (r) {
          p.hit = true;
          if (p.type === 'bomb' || p.type === 'meteor') {
            p.dead = true;
            this.explode(p);
            this.projs[this.projs.length - 1].hit = true;
          } else if (p.type !== 'boom') p.dead = true;
        }
      }
    }
    for (const a of this.projs)
      for (const b of this.projs) {
        if (a === b || a.dead || b.dead || a.o === b.o || a.type === 'boom' || b.type === 'boom') continue;
        if (Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2) {
          a.dead = b.dead = true;
          spark((a.x + b.x) / 2, (a.y + b.y) / 2, ['#ffffff', '#ffd23a', '#9adcff'], 16, 2.6);
          AU.sfx('hitL');
          for (const q of [a, b]) if (q.type === 'bomb' || q.type === 'meteor') this.explode(q);
        }
      }
    this.projs = this.projs.filter((p) => !p.dead);
    const [a, b] = this.f;
    if (
      !a.hidden &&
      !b.hidden &&
      a.st !== 'ko' &&
      b.st !== 'ko' &&
      a.st !== 'down' &&
      b.st !== 'down' &&
      a.st !== 'throw' &&
      b.st !== 'throw'
    ) {
      const ha = a.hurt(),
        hb = b.hurt(),
        ca = ha.x + ha.w / 2,
        cb = hb.x + hb.w / 2,
        minD = (ha.w + hb.w) * 0.4,
        dx = cb - ca;
      if (Math.abs(dx) < minD && Math.abs(a.y - b.y) < 34) {
        const s = dx === 0 ? a.dir : Math.sign(dx),
          push = (minD - Math.abs(dx)) / 2;
        if (b.isCar) a.x -= s * push * 2;
        else {
          a.x -= s * push;
          b.x += s * push;
        }
      }
    }
    const tc = clamp((a.x + b.x) / 2 - W / 2, 0, WORLD - W);
    this.cam += (tc - this.cam) * 0.18;
    for (const f of this.f) {
      if (f.isCar) continue;
      f.x = clamp(f.x, Math.max(14, this.cam + 12), Math.min(WORLD - 14, this.cam + W - 12));
    }
  }
  endRound() {
    const w = this.res.w;
    if (w >= 0) {
      this.wins[w]++;
      if (this.f[w].hp >= 100) {
        this.res.perfect = true;
        this.perfects[w]++;
      }
    }
  }
  drawExtra() {}
  draw() {
    const st = this.stage,
      sh = this.shake > 0 && !REDUCED ? Math.round(rnd(-this.shake, this.shake) * 0.6) : 0,
      cam = Math.round(this.cam);
    ctx.save();
    ctx.translate(sh, Math.round(sh * 0.5));
    drawStage(st, cam, this.tick);
    for (const f of this.f) {
      if (f.hidden) continue;
      const w = Math.round(f.bodyW() * 0.5),
        hh = f.y < FLOOR ? Math.max(1, 3 - Math.round((FLOOR - f.y) / 30)) : 3;
      fe(
        ctx,
        f.x - cam,
        FLOOR + 1,
        Math.max(4, w - Math.round((FLOOR - f.y) / 8)),
        hh - 1,
        'rgba(30,10,40,.4)',
      );
    }
    const sup = this.superT > 0;
    if (sup) {
      ctx.fillStyle = 'rgba(10,0,20,.62)';
      ctx.fillRect(-4, -4, W + 8, H + 8);
    }
    for (const i of this.order) {
      const f = this.f[i];
      if (f.hidden) continue;
      const pi = f.poseInfo(this.tick);
      let dir = f.dir;
      if (f.ch.id === 'ballerina' && f.st === 'special') dir = (this.tick >> 2) & 1 ? -dir : dir;
      const lying = (f.st === 'down' || f.st === 'ko') && !f.isCar && !HD[f.ch.id];
      for (let k = 0; k < f.trail.length; k++) {
        const tr = f.trail[k];
        drawSpr(
          sprite(f.ch, pi.pose, pi.f, pi.a, f.alt, ''),
          tr[0] - cam,
          tr[1],
          dir,
          1,
          false,
          0.12 + k * 0.05,
        );
      }
      const tint = f.flash > 0 && f.flash & 2 ? 'w' : f.frozen > 0 ? 'b' : '';
      const alpha = f.inv > 0 && f.st !== 'special' && this.tick & 2 ? 0.45 : 1;
      drawSpr(
        sprite(f.ch, pi.pose, pi.f, pi.a, f.alt, tint),
        f.x - cam,
        f.y,
        dir,
        f.renderScale || 1,
        lying,
        alpha,
      );
      if (f.atk && f.atk.t >= f.atk.d.st && f.atk.t < f.atk.d.st + f.atk.d.ac + 2) {
        const b = f.atkBox(),
          tx = (f.dir > 0 ? b.x + b.w - 3 : b.x + 3) - cam,
          ty = b.y + b.h / 2,
          k = f.atk.t - f.atk.d.st;
        for (let j = 0; j < 3; j++) {
          ctx.fillStyle = `rgba(255,255,255,${(0.5 - j * 0.14 - k * 0.06).toFixed(2)})`;
          const L = 18 - j * 4;
          ctx.fillRect(
            Math.round(f.dir > 0 ? tx - L - k * 2 : tx + k * 2),
            Math.round(ty + (j - 1) * 3),
            L,
            1,
          );
        }
      }
      if (f.frozen > 0 && !lying) {
        ctx.fillStyle = 'rgba(200,240,255,.9)';
        for (let k = 0; k < 4; k++) {
          const yy = f.y - 10 - ((this.tick * 0.6 + k * 13) % 50);
          ctx.fillRect(Math.round(f.x - cam - 10 + k * 7), Math.round(yy), 1, 3);
        }
      }
      if (DEBUG.showBox) {
        const h = f.hurt();
        ctx.strokeStyle = 'rgba(80,160,255,.9)';
        ctx.lineWidth = 1;
        ctx.strokeRect(h.x - cam + 0.5, h.y + 0.5, h.w, h.h);
        if (f.atk && f.atk.t >= f.atk.d.st && f.atk.t < f.atk.d.st + f.atk.d.ac) {
          const b = f.atkBox();
          ctx.strokeStyle = 'rgba(255,60,60,.95)';
          ctx.strokeRect(b.x - cam + 0.5, b.y + 0.5, b.w, b.h);
        }
      }
    }
    for (const p of this.projs) drawProj(p, cam, this.tick);
    if (st.front) st.front(ctx, cam, this.tick);
    drawFX(cam);
    this.drawExtra(cam);
    ctx.restore();
    if (this.flashT > 0) {
      ctx.fillStyle = `rgba(120,230,255,${(this.flashT / 16).toFixed(2)})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (sup) this.drawSuper();
    this.drawHUD();
    this.drawBanner();
  }
  drawSuper() {
    const f = this.superWho,
      t = 44 - this.superT,
      c = f.ch.col;
    const y = 62;
    const slide = Math.min(1, t / 8);
    ctx.fillStyle = c;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(0, y, W, 46);
    ctx.globalAlpha = 1;
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      const lx = ((i * 41 + t * 9) % (W + 40)) - 20;
      ctx.fillRect(Math.round(lx), y + 4 + ((i * 7) % 38), 18, 1);
    }
    ctx.fillStyle = '#120a1c';
    ctx.fillRect(0, y, W, 2);
    ctx.fillRect(0, y + 44, W, 2);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y + 2, W, 42);
    ctx.clip();
    const px_ = f.side ? W - 70 + Math.round((1 - slide) * 80) : 70 - Math.round((1 - slide) * 80);
    drawSpr(sprite(f.ch, 'special', 0, 0, f.alt, ''), px_, y + 108, f.side ? -1 : 1, 2);
    ctx.restore();
    txt('SUPER', f.side ? 100 : W - 100, y + 8, 16, '#ffffff', 'center');
    txt(f.ch.spName, f.side ? 100 : W - 100, y + 28, 8, '#fff07a', 'center');
  }
  drawHUD() {
    hudBackdrop();
    for (let i = 0; i < 2; i++) {
      const F = this.f[i];
      portraitChip(i, F, this.tick);
      lifeBar(i, F.hp / 100, F.dhp / 100, this.tick, F.dhpT > 26);
      namePlate(i, F.ch.short, F.ch.col, this.wins[i], 2, this.tick);
      powerGauge(i, F.meter, this.tick);
      comboCounter(i, this.combo[i]);
    }
    const warn = !this.opts.dummy && this.timer <= 10;
    timerEmblem(this.opts.dummy ? '--' : String(this.timer).padStart(2, '0'), warn, this.tick);
  }

  drawBanner() {
    const p = this.phase,
      t = this.pt;
    if (p === 'intro') {
      if (t < 60) {
        // ROUND n: a band opens from the center, the title slides in, everything fades before FIGHT!
        const a = t < 52 ? 1 : 1 - (t - 52) / 8;
        ctx.globalAlpha = a;
        band(64, 26, t / 10);
        const label = this.round >= 3 ? 'FINAL ROUND' : 'ROUND ' + this.round,
          sx = Math.round((1 - Math.min(1, (t - 4) / 10)) * 200);
        if (t > 4) txt(label, W / 2 - sx, 69, 16, vgrad(69, 16, ['#fff7b0', '#ffb03a', '#ff5a2a']), 'center');
        if (t > 16) sparkle(W / 2 + label.length * 8 + 4, 68, ((t - 16) % 30) / 30);
        ctx.globalAlpha = 1;
      } else {
        const k = Math.max(1, 2.4 - (t - 60) / 5);
        band(62, 32, 1, t < 64 ? '255,255,255' : '90,8,24');
        ctx.save();
        ctx.translate(W / 2, 78);
        ctx.scale(k, k);
        txt('FIGHT!', 0, -12, 24, vgrad(-12, 24, ['#ffffff', '#ffd23a', '#ff4d5e']), 'center');
        ctx.restore();
      }
    }
    if ((p === 'ko' || p === 'end') && this.res) {
      if (this.res.type === 'ko') {
        const tt = p === 'ko' ? this.slowT : 80 + t;
        if (tt > 4) band(62, 32, (tt - 4) / 8, '90,8,24');
        if (tt > 6 && (tt < 70 ? (tt >> 2) & 1 : true))
          txt('K.O.', W / 2, 66, 24, vgrad(66, 24, ['#ffffff', '#ffd23a', '#ff3a3a']), 'center');
      } else if (p === 'end') {
        band(64, 26, t / 8, '8,30,80');
        txt('TEMPO!', W / 2, 69, 16, vgrad(69, 16, ['#ffffff', '#9adcff', '#45b4ff']), 'center');
      }
      if (p === 'end' && t > 50) {
        const w = this.res.w;
        winnerPlate(
          w < 0 ? 'EMPATE' : this.f[w].ch.short + ' VENCE',
          w < 0 ? '#8a8aa8' : this.f[w].ch.col,
          this.res.perfect,
          t,
        );
      }
    }
  }
}

export { Fight };
