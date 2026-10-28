/* Fighter state machine: movement, attacks, motion inputs, input buffer, throws and physics. */
import { AU } from '../audio/synth.js';
import { FLOOR, W, WORLD } from '../config.js';
import { clamp } from '../core/math.js';
import { popup, spark } from '../fx/particles.js';
import { profile } from '../sprites/sprite.js';
import { ATK, CHAIN, GRAV, JUMPV, PROJ_SP, SPCANCEL } from './constants.js';
import { SPEC, directionalSpecial } from './specials.js';

class Fighter {
  constructor(ch, side, alt, lvl = 1) {
    this.ch = ch;
    this.side = side;
    this.alt = alt;
    this.lvl = lvl;
    this.meter = 0;
    this.reset();
  }
  reset() {
    this.x = WORLD / 2 + (this.side ? 56 : -56);
    this.y = FLOOR;
    this.vx = 0;
    this.vy = 0;
    this.dir = this.side ? -1 : 1;
    this.hp = 100;
    this.dhp = 100;
    this.dhpT = 0;
    this.st = 'idle';
    this.t = 0;
    this.t2 = 0;
    this.atk = null;
    this.spec = null;
    this.stunT = 0;
    this.inv = 0;
    this.frozen = 0;
    this.flash = 0;
    this.combo = 0;
    this.comboTaken = 0;
    this.jug = 0;
    this.hidden = false;
    this.cblock = false;
    this.downT = 0;
    this.isKO = false;
    this.trail = [];
    this.walkDir = 1;
    this.inDown = false;
    this.inBack = false;
    this.inFwd = false;
    this.buf = [];
    this.grab = null;
    this.bb = null;
    this.tap = null;
    this.heldHorizontal = 0;
    this.dashT = 0;
  }
  get spd() {
    return this.ch.st.spd;
  }
  get pw() {
    return this.ch.st.pow * (1 + 0.025 * (this.lvl - 1));
  }
  get df() {
    return this.ch.st.def * (1 + 0.025 * (this.lvl - 1));
  }
  get crouching() {
    return (
      this.st === 'crouch' ||
      (this.spec && this.spec.variant === 'down') ||
      (this.atk && this.atk.d.crouch) ||
      (this.st === 'blockstun' && this.cblock)
    );
  }
  hurt() {
    const P = profile(this.ch);
    let t = this.crouching ? P.ct : P.t;
    if (this.st === 'down' || this.st === 'ko') t = -14;
    const l = this.dir > 0 ? this.x + P.l : this.x - P.r,
      r = this.dir > 0 ? this.x + P.r : this.x - P.l;
    return { x: l, y: this.y + t, w: r - l, h: -t };
  }
  bodyW() {
    const P = profile(this.ch);
    return P.r - P.l;
  }
  atkBox() {
    const d = this.atk.d,
      P = profile(this.ch),
      re = this.ch.st.reach;
    let b;
    if (['up', 'uk'].includes(this.atk.n)) b = { x0: P.r - 12, x1: P.r + 12, y0: P.t - 16, y1: P.t * 0.45 };
    else {
      const pr = P[d.key];
      if (pr) b = { x0: pr.x0, x1: pr.x1 + (d.ext || 0) + (re - 1) * 8, y0: pr.y0, y1: pr.y1 };
      else {
        const hs = -P.t / 58,
          cx = d.fx * re;
        b = {
          x0: cx - (d.w * re) / 2,
          x1: cx + (d.w * re) / 2 + (d.ext || 0),
          y0: d.fy * hs - d.h / 2,
          y1: d.fy * hs + d.h / 2,
        };
      }
    }
    const x0 = this.dir > 0 ? this.x + b.x0 : this.x - b.x1,
      x1 = this.dir > 0 ? this.x + b.x1 : this.x - b.x0;
    return { x: x0, y: this.y + b.y0, w: x1 - x0, h: b.y1 - b.y0 };
  }
  dirCode(inp) {
    const f = this.inFwd,
      b = this.inBack,
      u = inp.up,
      d = inp.down;
    return d ? (f ? 3 : b ? 1 : 2) : u ? (f ? 9 : b ? 7 : 8) : f ? 6 : b ? 4 : 5;
  }
  record(code) {
    const L = this.buf;
    if (!L.length || L[L.length - 1].d !== code) L.push({ d: code, t: this.t });
    if (L.length > 14) L.shift();
  }
  motion(seq, win = 18) {
    const L = this.buf;
    let i = seq.length - 1;
    for (let j = L.length - 1; j >= 0 && i >= 0; j--) {
      if (this.t - L[j].t > win) break;
      if (L[j].d === seq[i]) i--;
    }
    return i < 0;
  }
  startAtk(n) {
    this.atk = { n, d: ATK[n], t: 0, t0: this.t, hit: false, conn: false };
    if (!ATK[n].air) {
      this.st = 'attack';
      this.vx = 0;
    }
    AU.sfx('whoosh');
  }
  trySpecial(o, g, inp) {
    const qcf = inp.qcf || this.motion([2, 3, 6]);
    const variant = inp.down ? 'down' : inp.up ? 'up' : 'forward';
    if (this.meter >= 100) return this.startSpecial(o, g, 'super', variant);
    if (qcf && this.meter >= 50) return this.startSpecial(o, g, 'ex', variant);
    return this.startSpecial(o, g, '', variant);
  }
  startSpecial(o, g, kind, variant = 'forward') {
    const type = this.ch.sp,
      sup = kind === 'super',
      ex = kind === 'ex';
    if (variant === 'forward' && PROJ_SP.has(type) && g.projs.some((p) => p.o === this && p.type !== 'boom'))
      return false;
    if (sup) {
      this.meter = 0;
      g.superFlash(this);
    } else if (ex) {
      this.meter -= 50;
      g.exFlash(this);
    } else {
      AU.sfx('special');
      popup(this.x, this.y - this.ch.hurt.h - 10, this.ch.shout, this.ch.col);
    }
    this.spec = {
      type,
      variant,
      t: 0,
      sup,
      ex,
      hits: 0,
      last: -99,
      box: null,
      data: null,
      max: 1,
      rehit: 99,
    };
    this.st = 'special';
    this.vx = 0;
    this.atk = null;
    return true;
  }
  endSpec() {
    this.spec = null;
    this.st = this.y < FLOOR ? 'jump' : 'idle';
    this.hidden = false;
    this.vx = 0;
  }
  canThrow(o) {
    if (o.y < FLOOR || this.y < FLOOR || o.inv > 0 || o.isCar) return false;
    if (!['idle', 'walk', 'crouch', 'attack', 'blockstun'].includes(o.st)) return false;
    return Math.abs(o.x - this.x) < (this.bodyW() + o.bodyW()) / 2 + 10;
  }
  poseInfo(tk) {
    let pose = 'idle',
      f = (tk >> 2) & 1,
      a = 0;
    switch (this.st) {
      case 'idle':
        f = Math.floor(tk / 7) % 8;
        if (this.landT > 0) {
          pose = 'crouch';
          f = 1;
        }
        break;
      case 'dash':
      case 'walk':
        pose = 'walk';
        f = (((Math.floor(tk / 5) * this.walkDir) % 8) + 8) % 8;
        if (this.landT > 0) {
          pose = 'crouch';
          f = 1;
        }
        break;
      case 'crouch':
        pose = 'crouch';
        f = 0;
        break;
      case 'jump':
        if (this.atk) {
          pose = this.atk.n === 'jp' ? 'jpunch' : 'jkick';
          a = this.atk.t < this.atk.d.st ? 0.5 : 1;
        } else {
          pose = 'jump';
          f = this.vy < -2 ? 0 : this.vy > 2 ? 2 : 1;
        }
        break;
      case 'attack':
        if (this.atk) {
          const n = this.atk.n,
            d = this.atk.d;
          pose = { p: 'punch', k: 'kick', cp: 'cpunch', ck: 'ckick', hp: 'punch', up: 'jpunch', uk: 'jkick' }[
            n
          ];
          a =
            this.atk.t < d.st
              ? 0.5
              : this.atk.t < d.st + d.ac + (['up', 'uk'].includes(n) ? 12 : 0)
                ? 1
                : 0.25;
          if (['up', 'uk'].includes(n) && this.atk.t >= d.st + d.ac + 12) {
            pose = 'jump';
            f = this.vy > 2 ? 2 : 1;
          }
        }
        break;
      case 'throw':
        pose = this.t2 < 10 ? 'punch' : 'kick';
        a = 1;
        break;
      case 'blockstun':
        pose = this.cblock ? 'cblock' : 'block';
        break;
      case 'hitstun':
        pose = 'hit';
        f = (this.stunT >> 1) & 1;
        break;
      case 'special':
        pose = this.spec.variant === 'up' ? 'jpunch' : this.spec.variant === 'down' ? 'ckick' : 'special';
        // Match the anticipation/release artwork to the existing gameplay release frame.
        a =
          this.spec.t >=
          (this.spec.variant === 'up'
            ? 6
            : this.spec.variant === 'down'
              ? 9
              : { wave: 8, bomb: 9, banana: 7, clock: 10, quake: 12, bat: 6, spin: 4, ring: 10, slash: 10 }[
                  this.spec.type
                ] || 8)
            ? 1
            : 0.5;
        break;
      case 'down':
      case 'ko':
        if (this.y < FLOOR - 2) {
          pose = 'fall';
          f = Math.min(4, Math.floor((this.vy + 5) / 2));
        } else if (this.st === 'down' && this.downT > 26) {
          pose = 'crouch';
          f = 2;
        } else pose = 'down';
        break;
      case 'win':
        pose = 'win';
        f = Math.floor(tk / 7) % 8;
        break;
    }
    return { pose, f, a };
  }
  neutralAct(inp, o, g) {
    if (inp.ps && this.trySpecial(o, g, inp)) return true;
    if (inp.pp) {
      if ((!inp.down && inp.up) || inp.dp || this.motion([6, 2, 3])) {
        this.startAtk('up');
        popup(this.x, this.y - this.ch.hurt.h - 8, 'UPPER!', '#ffd23a');
        return true;
      }
      this.startAtk(inp.down ? 'cp' : this.inFwd ? 'hp' : 'p');
      return true;
    }
    if (inp.pk) {
      if (inp.up && !inp.down) {
        this.startAtk('uk');
        return true;
      }
      if (this.inFwd && !inp.down && this.canThrow(o)) {
        this.doGrab(o);
        return true;
      }
      this.startAtk(inp.down ? 'ck' : 'k');
      return true;
    }
    return false;
  }
  doGrab(o) {
    this.st = 'throw';
    this.t2 = 0;
    this.vx = 0;
    this.grab = o;
    o.st = 'hitstun';
    o.stunT = 40;
    o.atk = null;
    o.spec = null;
    o.hidden = false;
    o.vx = 0;
    AU.sfx('whoosh');
    popup(this.x, this.y - this.ch.hurt.h - 8, 'AGARRÃO!', '#ff8a3a');
  }
  update(inp, o, g) {
    this.t++;
    // Count physical direction edges, never key-repeat or a held direction.
    const horizontal = inp.left === inp.right ? 0 : inp.left ? -1 : inp.right ? 1 : 0;
    const edge = horizontal && horizontal !== this.heldHorizontal;
    this.heldHorizontal = horizontal;
    const neutral = ['idle', 'walk', 'crouch'].includes(this.st) && this.y === FLOOR;
    let dash = 0;
    if (!neutral || inp.down || inp.up) this.tap = null;
    else if (edge) {
      if (this.tap && this.tap.dir === horizontal && this.t - this.tap.t <= 12) {
        dash = horizontal;
        this.tap = null;
      } else this.tap = { dir: horizontal, t: this.t };
    }
    if (this.flash > 0) this.flash--;
    if (this.inv > 0) this.inv--;
    if (this.landT > 0) this.landT--;
    const air = this.y < FLOOR;
    this.inDown = !!inp.down;
    const setDirs = () => {
      this.inBack = this.dir > 0 ? !!inp.left : !!inp.right;
      this.inFwd = this.dir > 0 ? !!inp.right : !!inp.left;
    };
    if (neutral) this.dir = o.x >= this.x ? 1 : -1;
    setDirs();
    this.record(this.dirCode(inp));
    if (inp.pp || inp.pk || inp.ps)
      this.bb = {
        b: inp.pp ? 'pp' : inp.pk ? 'pk' : 'ps',
        t: this.t,
        down: !!inp.down,
        up: !!inp.up,
        fwd: this.inFwd,
        dp: !!(inp.dp || this.motion([6, 2, 3])),
        qcf: !!(inp.qcf || this.motion([2, 3, 6])),
      };
    switch (this.st) {
      case 'idle':
      case 'walk':
      case 'crouch': {
        if (!air) {
          this.dir = o.x >= this.x ? 1 : -1;
          setDirs();
        }
        if (this.neutralAct(inp, o, g)) break;
        if (dash) {
          this.st = 'dash';
          this.dashT = 12;
          this.walkDir = dash === this.dir ? 1 : -1;
          this.vx = dash * this.spd * (this.walkDir === 1 ? 2.8 : 2.4);
          AU.sfx('whoosh');
          spark(this.x, FLOOR, [this.ch.col, '#ffffff'], 5, 1.4, 0.05);
          break;
        }
        if (inp.up) {
          this.st = 'jump';
          this.vy = -JUMPV;
          this.vx = this.inFwd ? this.dir * this.spd * 1.3 : this.inBack ? -this.dir * this.spd * 1.15 : 0;
          AU.sfx('jump');
          break;
        }
        if (inp.down) {
          this.st = 'crouch';
          this.vx *= 0.6;
          break;
        }
        if (this.inFwd) {
          this.st = 'walk';
          this.vx = this.dir * this.spd;
          this.walkDir = 1;
        } else if (this.inBack) {
          this.st = 'walk';
          this.vx = -this.dir * this.spd * 0.8;
          this.walkDir = -1;
        } else {
          this.st = 'idle';
          this.vx *= 0.6;
        }
        break;
      }
      case 'dash':
        if (--this.dashT <= 0) {
          this.st = 'idle';
          this.vx = 0;
        }
        break;
      case 'attack': {
        const a = this.atk,
          B = this.bb;
        if (a && a.conn && B && this.t - B.t <= 10 && B.t > a.t0) {
          if (B.b === 'ps') {
            if (SPCANCEL.has(a.n) && this.trySpecial(o, g, { qcf: B.qcf, up: B.up, down: B.down })) {
              this.bb = null;
              g.cancelFx(this);
              break;
            }
          } else {
            const nx =
              B.b === 'pp'
                ? (B.up && !B.down) || B.dp
                  ? 'up'
                  : B.down
                    ? 'cp'
                    : B.fwd
                      ? 'hp'
                      : 'p'
                : B.up && !B.down
                  ? 'uk'
                  : B.down
                    ? 'ck'
                    : 'k';
            const ch = CHAIN[a.n];
            if (ch && ch.includes(nx)) {
              this.bb = null;
              this.startAtk(nx);
              g.cancelFx(this);
            }
          }
        }
        if (this.atk && this.atk.n === 'hp' && this.atk.t < this.atk.d.st) this.vx = this.dir * 2.2;
        else if (this.atk && this.atk.n === 'hp') this.vx *= 0.7;
        if (this.atk && ['up', 'uk'].includes(this.atk.n) && this.atk.t === this.atk.d.st) {
          this.vy = -4.8;
          this.vx = this.dir * 1.3;
          this.y -= 1;
        }
        break;
      }
      case 'throw':
        this.t2++;
        if (this.t2 === 10 && this.grab) {
          const v = this.grab;
          v.x = clamp(this.x - this.dir * 20, g.cam + 14, g.cam + W - 14);
          AU.sfx('throw');
          g.applyHit(
            this,
            v,
            { dmg: 13 * this.pw, kd: 1, heavy: 1, unblock: 1, push: 3, lvl: 'mid' },
            this.x,
          );
          this.grab = null;
        }
        if (this.t2 >= 24) {
          this.st = 'idle';
          this.grab = null;
        }
        break;
      case 'jump':
        if (!this.atk) {
          if (inp.pp) this.startAtk('jp');
          else if (inp.pk) this.startAtk('jk');
        }
        break;
      case 'hitstun':
      case 'blockstun':
        this.stunT--;
        this.vx *= 0.85;
        if (this.stunT <= 0) {
          this.st = this.inDown ? 'crouch' : 'idle';
          this.cblock = false;
          this.frozen = 0;
        }
        break;
      case 'special':
        if (!directionalSpecial(this, o, g)) SPEC[this.spec.type](this, o, g);
        break;
      case 'down':
        if (!air && this.vy === 0) {
          this.downT++;
          this.vx *= 0.8;
          this.jug = 0;
          if (this.downT > 34) {
            this.st = 'idle';
            this.inv = 26;
            this.downT = 0;
            this.comboTaken = 0;
          }
        }
        break;
      case 'ko':
        if (!air) this.vx *= 0.85;
        break;
      case 'win':
        this.vx *= 0.7;
        break;
    }
    if (this.st !== 'hitstun' && this.st !== 'down' && this.st !== 'ko') this.comboTaken = 0;
    if (this.frozen > 0) this.frozen--;
    if (this.atk) {
      this.atk.t++;
      const d = this.atk.d;
      if (!d.air && this.atk.t >= d.st + d.ac + d.rc) {
        const wasCrouch = d.crouch;
        this.atk = null;
        if (this.st === 'attack')
          this.st = this.y < FLOOR ? 'jump' : this.inDown && wasCrouch ? 'crouch' : 'idle';
      } else if (d.air && this.atk.t >= d.st + d.ac + 10) this.atk = null;
    }
    if (
      (this.spec &&
        (this.spec.variant === 'up' ||
          this.spec.variant === 'down' ||
          this.spec.type === 'bat' ||
          this.spec.type === 'slash' ||
          this.spec.type === 'spin')) ||
      (this.atk && ['up', 'uk'].includes(this.atk.n))
    ) {
      this.trail.push([this.x, this.y]);
      if (this.trail.length > 5) this.trail.shift();
    } else if (this.trail.length) this.trail.shift();
    this.x += this.vx;
    this.y += this.vy;
    if (this.y < FLOOR) this.vy += GRAV;
    if (this.y >= FLOOR) {
      const fell = this.vy > 0;
      this.y = FLOOR;
      if (fell) {
        const v = this.vy;
        this.vy = 0;
        if (this.st === 'jump') {
          this.st = 'idle';
          this.atk = null;
          this.vx = 0;
          this.landT = 6;
          AU.sfx('land');
          spark(this.x, FLOOR, ['#d8c8b0', '#a89880'], 4, 1, 0.05);
        } else if (this.st === 'attack' && this.atk && ['up', 'uk'].includes(this.atk.n)) {
          this.vx = 0;
          AU.sfx('land');
        } else if (this.st === 'down' || this.st === 'ko') {
          this.jug = 0;
          if (v > 2.5) {
            this.vy = -v * 0.35;
            g.shake = Math.max(g.shake, 3);
          }
          spark(this.x, FLOOR, ['#d8c8b0', '#a89880'], 8, 1.6, 0.05);
          AU.sfx('land');
        } else if (this.st === 'hitstun') {
          this.st = 'down';
          this.downT = 0;
        }
      }
    }
  }
}

export { Fighter };
