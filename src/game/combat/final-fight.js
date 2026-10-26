import { BRIBRI } from '../characters/fighters/bribri.js';
/* Last stand: a real best-of-three match, with fair, telegraphed cosmic barrages. */
import { Fight } from './fight.js';
import { MEGA_BOSS } from '../characters/fighters/saturnita-mega.js';
import { CH } from '../characters/roster.js';
import { AU } from '../audio/synth.js';
import { FLOOR, REDUCED } from '../config.js';
import { ctx, mk, txt } from '../core/canvas.js';
import { clamp } from '../core/math.js';
import { artImage } from '../stages/art.js';
import { drawSpr, sprite } from '../sprites/sprite.js';
import { UI } from '../ui/theme.js';

export class FinalFight extends Fight {
  constructor(player, opts) {
    super(opts.campaignFinale === false ? player : BRIBRI, MEGA_BOSS, 9, {
      ...opts,
      finale: true,
      originalHero: player.id,
    });
    const storm = artImage('finale', 'storm');
    if (storm) {
      const sky = mk(640, 360),
        empty = mk(1, 1);
      sky.getContext('2d').drawImage(storm, 0, 0, 640, 360);
      this.stage = {
        ...this.stage,
        sky,
        far: empty,
        mid: empty,
        back: null,
        farA: null,
        midA: null,
        front: null,
      };
    }
    this.stage = { ...this.stage, music: 'laststand', name: 'NÚCLEO DO MEGA BRAIN' };
  }
  startRound() {
    super.startRound();
    this.stormClock = 0;
    this.stormCycle = 0;
    this.warning = null;
    // Bri Bri takes over the final duel; the original campaign hero remains in S.p1.
    this.f[0].meter = 100;
    this.f[1].meter = 50;
  }
  update() {
    const active = this.phase === 'fight' && !this.hitstop && !this.superT;
    super.update();
    if (this.phase !== 'fight') {
      this.warning = null;
      return;
    }
    if (!active) return;
    this.stormClock++;
    if (this.stormClock === (this.f[1].hp < 40 ? 160 : 210)) {
      this.warning = { x: clamp(this.f[0].x, 30, 450), remaining: 72, cycle: this.stormCycle++ };
      AU.sfx('special');
    }
    if (this.warning && --this.warning.remaining <= 0) {
      this.releaseStorm(this.warning);
      this.warning = null;
      this.stormClock = 0;
    }
  }
  releaseStorm(warning) {
    const owner = this.f[1];
    // A single marked column: move out, jump away or block. No input reversal or suction.
    for (let i = 0; i < 3; i++)
      this.projs.push({
        o: owner,
        type: ['wave', 'banana', 'clock'][(warning.cycle + i) % 3],
        finalStorm: true,
        acc: 0,
        t: 0,
        x: warning.x,
        y: -18 - i * 40,
        vx: 0,
        vy: 2.6,
        w: 12,
        h: 12,
        dir: owner.dir,
        dead: false,
        hit: false,
        data: { dmg: 7 * owner.pw, stun: 14, bstun: 12, push: 2, lvl: 'mid', chip: 0, kd: false },
      });
    AU.sfx('whoosh');
  }
  core(inps) {
    for (const p of this.projs)
      if (p.finalStorm) {
        p.y += p.vy;
        if (p.y > FLOOR) p.dead = true;
      }
    super.core(inps);
  }
  drawExtra(cam) {
    // Captured brainrots orbit behind the HUD, outside the fighters' main silhouettes.
    for (let i = 0; i < 4; i++) {
      const angle = (REDUCED ? 0 : this.tick / 50) + (i * Math.PI) / 2;
      const x = 160 + Math.cos(angle) * 85,
        y = 75 + Math.sin(angle) * 18;
      drawSpr(
        sprite(CH[(i + this.stormCycle) % CH.length], 'hit', 0, 0, false, 'p'),
        x,
        y,
        1,
        0.24,
        false,
        0.42,
      );
    }
    if (this.warning) {
      const x = this.warning.x - cam;
      ctx.fillStyle = 'rgba(211,107,255,.15)';
      ctx.fillRect(x - 11, 34, 22, FLOOR - 34);
      ctx.fillStyle = '#e6b5ff';
      ctx.fillRect(x - 12, FLOOR - 2, 24, 2);
      ctx.fillStyle = '#f8cd55';
      ctx.fillRect(x - 12, FLOOR - 5, 24 * (1 - this.warning.remaining / 72), 2);
      txt('SAIA DO ALVO!', 160, 42, 6, UI.gold, 'center');
    }
    if (this.phase === 'intro') txt('FASE 2/2 · VONTADE LIBERTA', 160, 40, 6, UI.gold, 'center');
  }
}
