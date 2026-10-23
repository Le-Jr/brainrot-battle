/* Bonus stage: smash a car before the timer runs out, meme reactions and XP payout. */
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
    this.memeN = 0;
  }
  input() {
    return readPad('p1', 'p1x');
  }
  say(text, o, who = 'car', dur = 130) {
    this.bub = { text, t: dur, who };
    if (o) VO.say(text.replace(/\.\.\./g, ', '), o);
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
    else if (this.type === 'cyber')
      this.say('É... TEM ESPAÇO PRA MELHORAR.', { role: 'pt', pitch: 0.9, rate: 0.95 });
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
      if (car.state !== undefined && ps !== 'd4') {
        if (this.type === 'cyber') {
          AU.sfx('crack');
          const L = ['OPS...', '...BEM, PELO MENOS NÃO ATRAVESSOU.', 'VIDRO BLINDADO, ELES DISSERAM...'];
          if (this.memeN < 3) this.say(L[this.memeN], { role: 'pt', pitch: 0.9, rate: 0.92 });
          this.memeN++;
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
    if (this.type === 'byd') {
      parrot(10, 108, this.parTalk > 0, this.tick);
      ctx.fillStyle = '#5a3a20';
      ctx.fillRect(18, 125, 3, 40);
    }
    if (this.bub) {
      const car = this.f[1];
      if (this.bub.who === 'parrot') bubble(26, 104, this.bub.text, 1, '#fff8d8');
      else bubble(car.x - cam, car.y - 50, this.bub.text, -1);
    }
  }
  drawHUD() {
    const P1 = this.f[0],
      car = this.f[1];
    const bar = (x0, v, dv, right, col) => {
      const w = 128;
      ctx.fillStyle = '#120a1c';
      ctx.fillRect(x0 - 2, 7, w + 4, 12);
      ctx.fillStyle = '#c98a2a';
      ctx.fillRect(x0 - 1, 8, w + 2, 10);
      ctx.fillStyle = '#3a1020';
      ctx.fillRect(x0, 9, w, 8);
      const hw = Math.round(w * v),
        dw = Math.round(w * dv);
      ctx.fillStyle = '#e8343f';
      ctx.fillRect(right ? x0 + w - dw : x0 + hw, 9, dw - hw, 8);
      ctx.fillStyle = col;
      ctx.fillRect(right ? x0 + w - hw : x0, 9, hw, 8);
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      ctx.fillRect(right ? x0 + w - hw : x0, 9, hw, 2);
    };
    bar(8, P1.hp / 100, P1.dhp / 100, false, '#ffd23a');
    bar(184, car.hp / car.maxhp, car.dhp / car.maxhp, true, '#9adcff');
    txt(P1.ch.short + '  NV' + P1.lvl, 8, 22, 8, '#ffb0b8');
    txt(car.ch.short, 312, 22, 8, '#9adcff', 'right');
    ctx.fillStyle = '#120a1c';
    ctx.fillRect(145, 5, 30, 22);
    ctx.fillStyle = '#2a1838';
    ctx.fillRect(146, 6, 28, 20);
    txt(
      String(this.timer).padStart(2, '0'),
      160,
      9,
      16,
      this.timer <= 10 && (this.tick >> 3) & 1 ? '#ff4d5e' : '#ffffff',
      'center',
      null,
    );
    const full = P1.meter >= 100;
    ctx.fillStyle = '#120a1c';
    ctx.fillRect(7, 170, 74, 6);
    ctx.fillStyle = '#2a1838';
    ctx.fillRect(8, 171, 72, 4);
    ctx.fillStyle = full ? ['#ff6ad5', '#45b4ff', '#ffd23a', '#7aff9a'][(this.tick >> 2) % 4] : '#45b4ff';
    ctx.fillRect(8, 171, Math.round((72 * P1.meter) / 100), 4);
    const c = this.combo[0];
    if (c && c.t > 0) txt(c.n + ' HITS!', 8, 38, 8, c.t > 60 ? '#ffffff' : '#ffd23a');
  }
  drawBanner() {
    const p = this.phase,
      t = this.pt;
    if (p === 'intro') {
      txt('BONUS STAGE', W / 2, 62, 16, vgrad(62, 16, ['#fff7b0', '#ffb03a', '#ff5a2a']), 'center');
      if (t > 30) txt('DESTRUA O ' + this.f[1].ch.short + '!', W / 2, 88, 8, '#ffffff', 'center');
    }
    if (p === 'end' && this.res) {
      if (this.res.type === 'destroy')
        txt('DESTRUÍDO!', W / 2, 60, 24, vgrad(60, 24, ['#ffffff', '#ffd23a', '#ff3a3a']), 'center');
      else txt('TEMPO!', W / 2, 64, 24, vgrad(64, 24, ['#ffffff', '#9adcff', '#45b4ff']), 'center');
      if (t > 50)
        txt('+' + Math.min(this.xp, Math.floor((t - 50) * 8)) + ' XP', W / 2, 100, 16, '#7aff9a', 'center');
    }
  }
}

export { BONUS_STAGE, Bonus };
