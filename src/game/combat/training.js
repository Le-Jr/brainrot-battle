/* Training mode: dummy opponent, infinite health, combo damage readout. */
import { W } from '../config.js';
import { txt } from '../core/canvas.js';
import { updFX } from '../fx/particles.js';
import { XP } from '../progression/xp.js';
import { NOINP } from './constants.js';
import { Fight } from './fight.js';

class Training extends Fight {
  constructor(ch, opp) {
    super(ch, opp, Math.floor(Math.random() * 11), { dummy: true, lv: [XP.lvl(ch.id), 1], quiet: true });
    this.idleT = 0;
    this.show = 0;
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
    if (this.phase === 'intro') {
      this.phase = 'fight';
    }
    const d = this.f[1];
    if (d.st === 'ko') {
      d.st = 'down';
      d.isKO = false;
    }
    this.core([this.input(0), NOINP]);
    if (d.hp < 1) d.hp = 1;
    const busy = ['hitstun', 'down', 'blockstun'].includes(d.st);
    if (busy) this.idleT = 0;
    else if (++this.idleT === 50) {
      if (this.lastDmg) {
        this.show = { dmg: this.lastDmg, t: 150 };
      }
      this.lastDmg = 0;
      for (const f of this.f) {
        f.hp = 100;
        f.dhp = 100;
      }
    }
    this.f[0].meter = Math.min(100, this.f[0].meter + 0.15);
    if (this.show && this.show.t > 0) this.show.t--;
  }
  onKO() {}
  drawBanner() {
    txt('TREINO', W / 2, 30, 8, '#4af0ff', 'center');
    txt('ESC: PAUSA   TAB: HITBOXES', W / 2, 150, 8, 'rgba(255,255,255,.7)', 'center');
    if (this.show && this.show.t > 0)
      txt('DANO DO COMBO: ' + this.show.dmg, W / 2, 44, 8, '#ffd23a', 'center');
  }
}

export { Training };
