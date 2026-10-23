/* CPU opponent: per-difficulty reaction, blocking, anti-air, chains and meter use. */
import { FLOOR } from '../config.js';
import { PROJ_SP } from './constants.js';

class AI {
  constructor(lvl, boost = 0) {
    this.lvl = lvl;
    this.boost = boost;
    this.wait = 20;
    this.move = null;
    this.moveT = 0;
    this.def = null;
    this.chainT = 0;
  }
  think(me, op, g) {
    const L = [
      { r: 24, b: 0.22, ag: 0.35, sp: 0.25, aa: 0.08, ch: 0.15 },
      { r: 14, b: 0.5, ag: 0.55, sp: 0.35, aa: 0.3, ch: 0.45 },
      { r: 7, b: 0.78, ag: 0.72, sp: 0.45, aa: 0.55, ch: 0.8 },
    ][this.lvl];
    const blockP = Math.min(0.93, L.b + this.boost * 0.12);
    const o = {
      left: false,
      right: false,
      up: false,
      down: false,
      p: false,
      k: false,
      s: false,
      pp: false,
      pk: false,
      ps: false,
      pup: false,
    };
    const dx = op.x - me.x,
      d = Math.abs(dx),
      F = dx >= 0 ? 'right' : 'left',
      B = dx >= 0 ? 'left' : 'right';
    if (me.st === 'attack' && me.atk && me.atk.conn && !me.atk.aiTried) {
      me.atk.aiTried = true;
      if (Math.random() < L.ch + this.boost * 0.1) {
        const n = me.atk.n;
        if (n === 'p') {
          if (Math.random() < 0.5) o.pk = true;
          else {
            o.pp = true;
            o[F] = true;
          }
        } else if (n === 'cp') {
          o.down = true;
          o.pk = true;
        } else if ((n === 'k' || n === 'hp') && me.meter < 100 && Math.random() < 0.5) {
          o.ps = true;
          if (me.meter >= 50) {
            o.qcf = true;
          }
        } else if (n === 'hp' || n === 'k') {
          o.pp = true;
          o.dp = true;
        }
      }
      return o;
    }
    if (!['idle', 'walk', 'crouch', 'jump', 'blockstun'].includes(me.st)) {
      this.def = null;
      return o;
    }
    const inc = g.projs.find(
      (p) => p.o === op && Math.sign(p.vx || 1) === Math.sign(me.x - p.x) && Math.abs(p.x - me.x) < 100,
    );
    if (
      me.y >= FLOOR &&
      op.y < FLOOR - 14 &&
      d < 64 &&
      Math.sign(op.vx || dx * -1) !== Math.sign(dx) &&
      me.st !== 'blockstun' &&
      Math.random() < L.aa * 0.25
    ) {
      o.pp = true;
      o.dp = true;
      return o;
    }
    const threat = (op.atk && d < 80) || (op.st === 'special' && d < 130) || inc;
    if (threat && me.y >= FLOOR) {
      if (this.def === null) this.def = Math.random() < blockP;
      if (this.def) {
        o[B] = true;
        if ((op.atk && op.atk.d.lvl === 'low') || (inc && inc.data.lvl === 'low')) o.down = true;
        return o;
      }
    } else this.def = null;
    if (me.st === 'jump') {
      if (d < 52 && me.vy > -1.5 && !me.atk && Math.random() < 0.5) o.pk = true;
      return o;
    }
    if (this.moveT > 0) {
      this.moveT--;
      if (this.move === 'fwd') o[F] = true;
      else if (this.move === 'back') o[B] = true;
      else if (this.move === 'crouch') o.down = true;
    }
    if (this.wait > 0) {
      this.wait--;
      return o;
    }
    this.wait = L.r + Math.floor(Math.random() * L.r);
    const ranged = PROJ_SP.has(me.ch.sp),
      r = Math.random();
    if (me.meter >= 100 && d < (ranged ? 240 : 96) && r < 0.6) {
      o.ps = true;
      return o;
    }
    if (me.meter >= 50 && d < (ranged ? 220 : 90) && r < 0.18) {
      o.ps = true;
      o.qcf = true;
      return o;
    }
    if (d < 36 && op.y >= FLOOR && ['idle', 'walk', 'crouch'].includes(op.st) && r < 0.22 + this.lvl * 0.06) {
      o.pk = true;
      o[F] = true;
      return o;
    }
    if (d > 110) {
      if (ranged && r < L.sp) o.ps = true;
      else if (r < 0.1 + L.ag * 0.1) {
        o.up = true;
        o[F] = true;
      } else {
        this.move = 'fwd';
        this.moveT = this.wait;
      }
    } else if (d > 50) {
      if (r < L.sp * 0.7) o.ps = true;
      else if (r < L.sp * 0.7 + 0.15) {
        o.up = true;
        o[F] = true;
      } else {
        this.move = 'fwd';
        this.moveT = this.wait;
      }
    } else {
      if (r < L.ag) {
        const q = Math.random();
        if (q < 0.28) o.pp = true;
        else if (q < 0.48) o.pk = true;
        else if (q < 0.62) {
          o.pp = true;
          o[F] = true;
        } else if (q < 0.78) {
          o.down = true;
          o.pp = true;
        } else if (q < 0.93) {
          o.down = true;
          o.pk = true;
        } else o.ps = true;
        this.wait = Math.floor(this.wait * 0.6);
      } else if (r < L.ag + 0.15) {
        this.move = 'back';
        this.moveT = 12;
      } else {
        this.move = 'crouch';
        this.moveT = 10;
      }
    }
    return o;
  }
}

export { AI };
