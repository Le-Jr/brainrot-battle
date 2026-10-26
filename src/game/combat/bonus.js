import { hudBackdrop } from '../ui/hud.js';
/* Bonus stage: smash a car before the timer runs out, meme reactions and XP payout. */
import { ELON_LINES } from '../audio/elon-lines.js';
import { elon } from '../ui/elon.js';
import { AU } from '../audio/synth.js';
import { ANN, IT, VO } from '../audio/voice.js';
import { CARS } from '../characters/cars.js';
import { W, WORLD } from '../config.js';
import { ctx, txt, vgrad } from '../core/canvas.js';
import { readPad } from '../core/input.js';
import { rnd } from '../core/math.js';
import { FX, spark, updFX } from '../fx/particles.js';
import { bubble, parrot } from '../ui/widgets.js';
import { Car } from './car.js';
import { NOINP } from './constants.js';
import { Fight } from './fight.js';
import { band, comboCounter, lifeBar, namePlate, portraitChip, powerGauge, timerEmblem } from '../ui/hud.js';

const BONUS_STAGE = { nonno: 10, cyber: 11, byd: 12 };
class Bonus extends Fight {
  constructor(ch, lvl, type = 'nonno') {
    super(ch, ch, BONUS_STAGE[type], { cpu: false, lv: [lvl, 1], bonus: true, quiet: true });
    this.type = type;
    this.f[1] = new Car(CARS[type]);
    this.startRound();
  }
  startRound() {
    super.startRound();
    if (this.f[1] && this.f[1].isCar) this.f[1].reset();
    this.timer = this.type === 'cyber' ? 55 : 45;
    this.f[0].x = WORLD / 2 - 60;
    this.f[0].dir = 1;
    this.xp = 0;
    this.cam = (WORLD - W) / 2;
    this.bub = null;
    this.parT = 200;
    this.parTalk = 0;
    this.parReact = 0;
    this.memeN = 0;
    this.elonDamage = 0;
  }
  input() {
    return readPad('p1', 'p1x');
  }
  say(text, o, who = 'car', dur = 130) {
    this.bub = { text, t: dur, who };
    if (o) VO.say(text.replace(/\.\.\./g, ', '), o);
  }
  elonSay(level) {
    this.elonDamage = level;
    const { text } = ELON_LINES[level];
    this.say(text, null, 'elon', 210);
    VO.clip(level, text, {
      role: level === 0 ? 'ann' : 'pt',
      pitch: 0.9 + level * 0.1,
      rate: 1 + level * 0.04,
    });
  }
  onKO(a, d) {
    d.dead = true;
    d.st = 'ko';
    this.phase = 'end';
    this.pt = 0;
    this.res = { w: 0, type: 'destroy' };
    this.xp = 300 + this.timer * 10 + (this.type === 'cyber' ? 150 : 0);
    this.shake = 10;
    AU.sfx('boom');
    spark(d.x, d.y - 20, ['#fff2b0', '#ffb040', '#ff5a2a', '#5a4a50', d.ch.col, '#c8ccd6'], 60, 4, 0.1);
    if (this.type === 'byd') this.say('NÃÃÃO... ERA ZERO KM!', { role: 'pt', pitch: 1.4, rate: 0.85 });
    else if (this.type === 'cyber') this.elonSay(4);
    else this.say('MAMMA MIA! LA MIA MACCHINA!', IT);
  }
  update() {
    this.tick++;
    updFX();
    if (this.shake > 0) this.shake -= 0.5;
    const car = this.f[1];
    for (const f of this.f) {
      if (f.dhpT > 0) f.dhpT--;
      else if (f.dhp > f.hp) f.dhp = Math.max(f.hp, f.dhp - 0.6);
    }
    for (const c of this.combo) if (c) c.t--;
    if (this.bub && --this.bub.t <= 0) this.bub = null;
    if (this.type === 'byd') {
      if (this.parReact > 0) this.parReact--;
      if (this.parTalk > 0) this.parTalk--;
      if (--this.parT <= 0 && !(this.bub && this.bub.who === 'car')) {
        this.parT = 520;
        this.parTalk = 150;
        AU.sfx('squawk');
        this.say(
          'MILK SHAKE DE MORANGO... É MUITO CREMOSO!',
          { role: 'pt', pitch: 1.9, rate: 1.12 },
          'parrot',
          150,
        );
      }
    }
    if (this.superT > 0) {
      this.superT--;
      return;
    }
    if (this.hitstop > 0) {
      this.hitstop--;
      return;
    }
    this.pt++;
    if (this.phase === 'intro') {
      if (this.pt === 2) VO.say('Bonus stage!', ANN);
      if (this.type === 'cyber' && this.pt === 88) this.elonSay(0);
      if (this.pt >= 90) {
        this.phase = 'fight';
        this.pt = 0;
      }
    }
    const fighting = this.phase === 'fight',
      prev = car.hp;
    this.core([fighting ? this.input(0) : NOINP, NOINP]);
    if (car.hp < prev) {
      AU.sfx('metal');
      spark(
        car.x + rnd(-30, 30),
        car.y - rnd(10, 34),
        [car.ch.col, '#c8ccd6', '#9ad6f0', '#3a3440'],
        7,
        2.8,
        0.16,
      );
    }
    const ps = car.poseInfo().pose;
    if (car.state !== ps) {
      if (this.type === 'byd' && car.state !== undefined) this.parReact = 24;
      if (car.state !== undefined && ps !== 'd4') {
        if (this.type === 'cyber') {
          AU.sfx('crack');
          if (!car.dead) this.elonSay(Number(ps.slice(1)));
        } else {
          AU.sfx('glass');
          if (this.type === 'byd') {
            this.say('NÓOOO! MEU BI-AI-DI!', { role: 'pt', pitch: 1.5, rate: 0.8 });
          }
        }
      }
      car.state = ps;
    }
    if (!car.dead && car.hp < car.maxhp * 0.5 && this.tick % 6 === 0)
      FX.parts.push({
        x: car.x + rnd(-20, 20),
        y: car.y - 30,
        vx: rnd(-0.2, 0.2),
        vy: -0.6,
        life: 40,
        c: car.hp < car.maxhp * 0.25 ? '#3a3440' : '#8a8494',
        s: 2,
        g: -0.01,
      });
    if (car.dead && this.tick % 3 === 0)
      FX.parts.push({
        x: car.x + rnd(-24, 24),
        y: car.y - 12,
        vx: rnd(-0.3, 0.3),
        vy: -1,
        life: 30,
        c: ['#ffd23a', '#ff8a2a', '#ff4a2a'][this.tick % 3],
        s: 2,
        g: -0.02,
      });
    if (fighting) {
      this.timerT++;
      if (this.timerT >= 60) {
        this.timerT = 0;
        this.timer--;
        if (this.timer <= 0) {
          this.timer = 0;
          this.phase = 'end';
          this.pt = 0;
          this.res = { w: -1, type: 'time' };
          this.xp = Math.round((1 - car.hp / car.maxhp) * 240);
          VO.say('Time over!', ANN);
        }
      }
    }
    if (this.phase === 'end' && this.pt === 40) {
      const p = this.f[0];
      if (p.st !== 'down') {
        p.st = 'win';
        p.atk = null;
        p.spec = null;
        p.hidden = false;
      }
    }
    if (this.phase === 'end' && this.pt >= 190) this.done = 0;
  }
  drawExtra(cam) {
    if (this.type === 'cyber') {
      elon(W - 30, 136, this.elonDamage, this.bub?.who === 'elon', this.tick);
    }
    if (this.type === 'byd') {
      parrot(10, 108, this.parTalk > 0 && this.bub?.who === 'parrot', this.tick, this.parReact > 0);
      ctx.fillStyle = '#5a3a20';
      ctx.fillRect(18, 125, 3, 40);
    }
    if (this.bub) {
      const car = this.f[1];
      if (this.bub.who === 'elon') bubble(W - 40, 80, this.bub.text, -1, '#e7f6ff');
      else if (this.bub.who === 'parrot') bubble(26, 104, this.bub.text, 1, '#fff8d8');
      else bubble(car.x - cam, car.y - 50, this.bub.text, -1);
    }
  }
  drawHUD() {
    hudBackdrop();
    const P1 = this.f[0],
      car = this.f[1];
    portraitChip(0, P1, this.tick);
    portraitChip(1, car, this.tick);
    lifeBar(0, P1.hp / 100, P1.dhp / 100, this.tick, P1.dhpT > 26);
    lifeBar(1, car.hp / car.maxhp, car.dhp / car.maxhp, this.tick, car.dhpT > 26);
    namePlate(0, P1.ch.short, P1.ch.col, 0, 0, this.tick);
    txt('NV' + P1.lvl, 62, 33, 6, '#ffd23a');
    namePlate(1, car.ch.short, car.ch.col, 0, 0, this.tick);
    powerGauge(0, P1.meter, this.tick);
    comboCounter(0, this.combo[0]);
    timerEmblem(String(this.timer).padStart(2, '0'), this.timer <= 10, this.tick);
  }

  drawBanner() {
    const p = this.phase,
      t = this.pt;
    if (p === 'intro') {
      band(60, 38, t / 10);
      if (t > 4)
        txt('BONUS STAGE', W / 2, 65, 16, vgrad(65, 16, ['#fff7b0', '#ffb03a', '#ff5a2a']), 'center');
      if (t > 30) txt('DESTRUA O ' + this.f[1].ch.short + '!', W / 2, 85, 8, '#ffffff', 'center');
    }
    if (p === 'end' && this.res) {
      const destroyed = this.res.type === 'destroy';
      band(58, 48, t / 8, destroyed ? '90,8,24' : '8,30,80');
      if (destroyed)
        txt('DESTRUÍDO!', W / 2, 64, 16, vgrad(64, 16, ['#ffffff', '#ffd23a', '#ff3a3a']), 'center');
      else txt('TEMPO!', W / 2, 64, 16, vgrad(64, 16, ['#ffffff', '#9adcff', '#45b4ff']), 'center');
      if (t > 50)
        txt('+' + Math.min(this.xp, Math.floor((t - 50) * 8)) + ' XP', W / 2, 86, 12, '#7aff9a', 'center');
    }
  }
}

export { BONUS_STAGE, Bonus };
