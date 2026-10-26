/* Special move behaviour per type (SPEC): projectiles, rushes, spins and the teleport slash. */
import { AU } from '../audio/synth.js';
import { FLOOR, W, WORLD } from '../config.js';
import { clamp } from '../core/math.js';
import { popup, spark } from '../fx/particles.js';
import { profile } from '../sprites/sprite.js';

const SPEC = {
  wave(f, o, g) {
    const s = f.spec;
    s.t++;
    if (s.t === 8) g.spawn(f, 'wave');
    if (s.t >= 26) f.endSpec();
  },
  bomb(f, o, g) {
    const s = f.spec;
    s.t++;
    if (s.t === 9) g.spawn(f, 'bomb');
    if (s.t >= 28) f.endSpec();
  },
  banana(f, o, g) {
    const s = f.spec;
    s.t++;
    if (s.t === 7) g.spawn(f, 'banana');
    if (s.t >= 24) f.endSpec();
  },
  clock(f, o, g) {
    const s = f.spec;
    s.t++;
    if (s.t === 10) g.spawn(f, 'clock');
    if (s.t >= 30) f.endSpec();
  },
  quake(f, o, g) {
    const s = f.spec;
    s.t++;
    if (s.t === 12) {
      g.spawn(f, 'quake');
      g.shake = Math.max(g.shake, 5);
      AU.sfx('boom');
      spark(f.x + f.dir * 10, FLOOR, ['#7a5a3a', '#5f8a35', '#a8d070'], 14, 2.4);
    }
    if (s.t >= 30) f.endSpec();
  },
  bat(f, o, g) {
    const s = f.spec;
    s.t++;
    const dur = s.sup ? 46 : 30;
    if (s.t >= 6 && s.t < dur - 6) {
      f.vx = f.dir * (s.sup ? 6 : 5.2);
      const P = profile(f.ch);
      s.box = { x: f.dir > 0 ? f.x + P.l : f.x - P.r - 24, y: f.y + P.t, w: P.r - P.l + 24, h: -P.t * 0.8 };
      s.max = s.sup ? 3 : s.ex ? 2 : 1;
      s.rehit = 8;
      s.data = {
        dmg: s.sup ? 10 : 12,
        stun: 20,
        bstun: 14,
        push: 3.5,
        lvl: 'mid',
        kd: !s.sup || s.hits >= 2,
        heavy: 1,
        chip: 1,
      };
      if ((s.t - 6) % 8 === 0) {
        popup(f.x + f.dir * 12, f.y - 62, 'TUNG!', '#ffd36a');
        AU.sfx('tung');
      }
    } else {
      s.box = null;
      f.vx *= 0.75;
    }
    if (s.t >= dur) f.endSpec();
  },
  spin(f, o, g) {
    const s = f.spec;
    s.t++;
    const dur = s.sup ? 58 : 36;
    s.max = s.sup ? 6 : s.ex ? 5 : 4;
    s.rehit = 8;
    if (s.t >= 4 && s.t < dur - 4) {
      f.vx = f.dir * (s.sup ? 3.4 : 3);
      s.box = { x: f.x - 22, y: f.y - 50, w: 44, h: 48 };
      s.data = {
        dmg: s.sup ? 5 : 4,
        stun: 14,
        bstun: 8,
        push: 1.2,
        lvl: 'mid',
        kd: s.hits >= s.max - 1,
        chip: 1,
      };
      if (s.t % 8 === 4) AU.sfx('whoosh');
    } else {
      s.box = null;
      f.vx *= 0.7;
    }
    if (s.t >= dur) f.endSpec();
  },
  ring(f, o, g) {
    const s = f.spec;
    s.t++;
    if (s.t === 10) {
      if (s.sup) g.spawn(f, 'meteor', o);
      else g.spawn(f, 'ring');
    }
    if (s.t >= 30) f.endSpec();
  },
  aegis(f, o, g) {
    const s = f.spec;
    s.t++;
    if (s.t >= 5 && s.t <= 11) f.inv = Math.max(f.inv, 2);
    const active = s.t >= 8 && s.t < (s.sup ? 39 : s.ex ? 29 : 24);
    if (active) {
      f.vx = f.dir * (s.sup ? 4.4 : 3.8);
      s.box = { x: f.x + (f.dir > 0 ? 0 : -40), y: f.y - 54, w: 40, h: 48 };
      s.max = s.sup ? 4 : s.ex ? 2 : 1;
      s.rehit = 8;
      s.data = {
        dmg: s.sup ? 7 : s.ex ? 8 : 13,
        stun: 17,
        bstun: 12,
        push: 2.5,
        lvl: 'mid',
        chip: 1,
        kd: s.hits >= s.max - 1,
        heavy: true,
      };
      if (s.t % 8 === 0) {
        AU.sfx('whoosh');
        spark(f.x + f.dir * 20, f.y - 36, ['#fff3be', '#f8cd55', '#ff9c42'], 6, 1.5);
      }
    } else {
      s.box = null;
      f.vx *= 0.6;
    }
    if (s.t >= (s.sup ? 48 : 35)) f.endSpec();
  },
  cosmos(f, o, g) {
    const s = f.spec;
    s.t++;
    if (s.t === 1) {
      s.mode = (f.cosmicCount || 0) % 3;
      f.cosmicCount = (f.cosmicCount || 0) + 1;
    }
    if ((s.mode === 0 || s.sup) && (s.t === 9 || (s.sup && s.t === 22))) {
      g.spawn(f, 'ring', o);
      AU.sfx('whoosh');
    }
    if ((s.mode === 2 || s.sup) && s.t === 13) {
      g.spawn(f, 'meteor', o);
      AU.sfx('special');
    }
    if ((s.mode === 1 || s.sup) && s.t >= 8 && s.t < 30) {
      f.vx = f.dir * 3.2;
      s.box = { x: f.x - 25, y: f.y - 58, w: 50, h: 56 };
      s.max = s.sup ? 3 : 2;
      s.rehit = 10;
      s.data = {
        dmg: 8,
        stun: 18,
        bstun: 12,
        push: 3,
        lvl: 'mid',
        chip: 1,
        kd: s.hits >= s.max - 1,
        heavy: true,
      };
    } else {
      s.box = null;
      f.vx *= 0.65;
    }
    if (s.t >= 42) f.endSpec();
  },
  slash(f, o, g) {
    const s = f.spec;
    s.t++;
    if (s.t < 10) {
      f.hidden = true;
      f.inv = 3;
      if (s.t === 1) spark(f.x, f.y - 24, ['#3a3440', '#6a6070', '#ffffff'], 14, 1.8, -0.02);
    }
    if (s.t === 10) {
      const side = f.x < o.x ? 1 : -1;
      f.x = clamp(o.x + side * 28, g.cam + 14, g.cam + W - 14);
      f.x = clamp(f.x, 14, WORLD - 14);
      f.dir = o.x >= f.x ? 1 : -1;
      f.hidden = false;
      spark(f.x, f.y - 24, ['#3a3440', '#6a6070', '#ffffff'], 14, 1.8, -0.02);
      AU.sfx('whoosh');
    }
    if (s.t >= 12 && s.t < 20) {
      s.box = { x: f.x + f.dir * 16 - 17, y: f.y - 52, w: 34, h: 46 };
      s.max = 1;
      s.data = { dmg: s.sup ? 28 : 12, stun: 20, bstun: 14, push: 3, lvl: 'mid', kd: 1, heavy: 1, chip: 1 };
    } else s.box = null;
    if (s.t >= 32) f.endSpec();
  },
};

export { SPEC };
