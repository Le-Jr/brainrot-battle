/* Static "fighter" used by the bonus stages (a car with damage states). */
import { FLOOR, WORLD } from '../config.js';

class Car {
  constructor(def) {
    this.ch = def;
    this.side = 1;
    this.alt = false;
    this.meter = 0;
    this.isCar = true;
    this.renderScale = 1.55;
    this.pw = 1;
    this.df = def.def;
    this.maxhp = def.maxhp;
    this.reset();
  }
  reset() {
    this.x = WORLD / 2 + 40;
    this.y = FLOOR;
    this.vx = 0;
    this.vy = 0;
    this.dir = -1;
    this.hp = this.maxhp || 100;
    this.dhp = this.hp;
    this.dhpT = 0;
    this.st = 'idle';
    this.inv = 0;
    this.frozen = 0;
    this.flash = 0;
    this.combo = 0;
    this.comboTaken = 0;
    this.hidden = false;
    this.trail = [];
    this.inBack = false;
    this.inDown = false;
    this.dead = false;
    this.cblock = false;
    this.atk = null;
    this.spec = null;
    this.state = undefined;
    this.jug = 0;
    this.grab = null;
  }
  update() {
    if (this.flash > 0) this.flash--;
    this.vx = 0;
    this.vy = 0;
    this.y = FLOOR;
    this.comboTaken = 0;
    this.frozen = 0;
    this.inv = 0;
    if (!this.dead) this.st = 'idle';
  }
  hurt() {
    const h = this.ch.hurt;
    const w = h.w * this.renderScale,
      height = h.h * this.renderScale;
    return { x: this.x - w / 2, y: this.y - height, w, h: height };
  }
  bodyW() {
    return this.ch.hurt.w * this.renderScale;
  }
  poseInfo() {
    const p = this.hp / this.maxhp,
      d = this.dead ? 4 : p > 0.75 ? 0 : p > 0.5 ? 1 : p > 0.25 ? 2 : 3;
    return { pose: 'd' + d, f: 0, a: 0 };
  }
}

export { Car };
