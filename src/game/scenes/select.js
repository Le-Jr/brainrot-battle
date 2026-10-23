/* Character select for every mode. */
import { AU } from '../audio/synth.js';
import { IT, VO } from '../audio/voice.js';
import { CH } from '../characters/roster.js';
import { Training } from '../combat/training.js';
import { H, W } from '../config.js';
import { ctx, txt, vgrad } from '../core/canvas.js';
import { shade } from '../core/color.js';
import { CONFIRM, CONFIRM2, anyPressed, readPad } from '../core/input.js';
import { clamp, shuffle } from '../core/math.js';
import { go } from '../core/scene.js';
import { XP } from '../progression/xp.js';
import { drawSpr, portrait, sprite } from '../sprites/sprite.js';
import { S } from '../state.js';
import { STORY } from '../story/character-arcs.js';
import { CALL_PANEL, WORLD_PRO } from '../story/world.js';
import { xpBar } from '../ui/widgets.js';
import { CarSelect } from './car-select.js';
import { Cutscene } from './cutscene.js';
import { FightScene } from './fight-scene.js';
import { goTravel } from './flow.js';
import { Title } from './title.js';
import { StageSelect } from './stage-select.js';

/* ---------- character select ---------- */
const Select = {
  id: 'select',
  enter() {
    this.cur = [S.p1, S.mode === 'versus' ? S.p2 : S.p1];
    this.ok = [false, S.mode !== 'versus'];
    this.cpu = S.mode === 'versus' && S.vsCpu;
    this.t = 0;
    this.out = -1;
    AU.play('select');
  },
  update() {
    this.t++;
    if (this.out >= 0) {
      if (--this.out === 0) this.next();
      return;
    }
    if (anyPressed(['Escape', 'Backspace'])) {
      AU.sfx('blip');
      go(Title);
      return;
    }
    const vs = S.mode === 'versus',
      cpu = vs && S.vsCpu,
      p1 = vs && !cpu ? readPad('p1') : readPad('p1', 'p1x');
    const step = (i, p, conf, back) => {
      if (!this.ok[i]) {
        if (p.pleft) {
          this.cur[i] = (this.cur[i] + 7) % 8;
          AU.sfx('blip');
        }
        if (p.pright) {
          this.cur[i] = (this.cur[i] + 1) % 8;
          AU.sfx('blip');
        }
        if (p.pup || p.pdown) {
          this.cur[i] = (this.cur[i] + 4) % 8;
          AU.sfx('blip');
        }
        if (conf) {
          this.ok[i] = true;
          AU.sfx('ok');
          VO.say(CH[this.cur[i]].voice, IT);
        }
      } else if (back) {
        this.ok[i] = false;
        AU.sfx('blip');
      }
    };
    if (cpu) {
      // 1P picks their fighter, then the CPU's; going back from the rival re-opens the first pick
      const i = this.ok[0] ? 1 : 0,
        back = anyPressed(['KeyK', 'T_k']);
      if (i === 1 && back) {
        this.ok[0] = false;
        AU.sfx('blip');
      } else step(i, p1, anyPressed(CONFIRM), false);
    } else {
      step(
        0,
        p1,
        anyPressed(vs ? ['KeyJ', 'Space', 'T_p', 'T_start', 'Enter'] : CONFIRM),
        anyPressed(['KeyK', 'T_k']),
      );
      if (vs) step(1, readPad('p2'), anyPressed(CONFIRM2), anyPressed(['KeyN', 'Period', 'Numpad2']));
    }
    if (this.ok[0] && this.ok[1]) this.out = 50;
  },
  next() {
    S.p1 = this.cur[0];
    S.p2 = this.cur[1];
    const me = CH[S.p1];
    if (S.mode === 'arcade') {
      S.ladder = shuffle(CH.map((c, i) => i).filter((i) => i !== S.p1));
      S.li = 0;
      S.loc = me.stage;
      S.bdone = {};
      const pro = [...WORLD_PRO, ...STORY[me.id].pro, CALL_PANEL];
      pro.music = 'drama';
      go(Cutscene(pro, goTravel));
    } else if (S.mode === 'bonus') go(CarSelect);
    else if (S.mode === 'training') {
      const opp = CH[(S.p1 + 1 + Math.floor(Math.random() * 7)) % 8];
      const F = new Training(me, opp);
      go(FightScene(F, () => go(Select)));
    } else {
      const c2 = CH[S.p2],
        cpu = S.vsCpu;
      go(
        StageSelect(
          me,
          c2,
          cpu
            ? { cpu: true, lvl: S.diff, lv: [XP.lvl(me.id), XP.lvl(me.id)] }
            : { cpu: false, lv: [XP.lvl(me.id), XP.lvl(c2.id)] },
          cpu ? 'VERSUS CPU' : 'VERSUS',
        ),
      );
    }
  },
  draw() {
    const t = this.t,
      vs = S.mode === 'versus';
    ctx.fillStyle = '#120a1c';
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 12) {
      ctx.fillStyle = (y / 12) % 2 ? '#1a1028' : '#160d22';
      ctx.fillRect(0, y, W, 12);
    }
    ctx.fillStyle = 'rgba(255,77,94,.12)';
    ctx.fillRect(0, 0, 128, 126);
    ctx.fillStyle = vs ? 'rgba(69,180,255,.12)' : 'rgba(255,255,255,.04)';
    ctx.fillRect(192, 0, 128, 126);
    txt(
      {
        bonus: 'BÔNUS: QUEM VAI FARMAR XP?',
        training: 'TREINO: ESCOLHA SEU LUTADOR',
        versus: !this.cpu
          ? 'VERSUS'
          : this.ok[0]
            ? 'ESCOLHA O RIVAL (CPU)'
            : 'VERSUS CPU: ESCOLHA SEU LUTADOR',
        arcade: 'ESCOLHA SEU BRAINROT',
      }[S.mode],
      W / 2,
      6,
      8,
      '#ffd23a',
      'center',
    );
    const show = (i, x, d) => {
      const ch = CH[this.cur[i]];
      const done = this.ok[i];
      drawSpr(
        sprite(
          ch,
          done ? 'win' : 'idle',
          Math.floor(t / 7) % 8,
          0,
          i === 1 && this.cur[0] === this.cur[1],
          '',
        ),
        x,
        104,
        d,
      );
      txt(ch.name[0], x, 108, 8, '#ffffff', 'center');
      txt(ch.name[1], x, 117, 8, ch.col, 'center');
    };
    show(0, 64, 1);
    if (vs) {
      show(1, 256, -1);
      txt('VS', W / 2, 58, 16, vgrad(58, 16, ['#ffffff', '#ffd23a', '#ff4d5e']), 'center');
      txt(
        (this.ok[0] ? 'PRONTO' : '1P') + ' NV' + XP.lvl(CH[this.cur[0]].id),
        64,
        20,
        8,
        '#ff8a96',
        'center',
      );
      txt(
        (this.ok[1] ? 'PRONTO' : this.cpu ? 'CPU' : '2P') + ' NV' + XP.lvl(CH[this.cur[this.cpu ? 0 : 1]].id),
        256,
        20,
        8,
        '#9adcff',
        'center',
      );
    } else {
      const ch = CH[this.cur[0]];
      const L = [
        ['VEL', ch.st.spd / 2],
        ['FOR', ch.st.pow / 1.2],
        ['DEF', ch.st.def / 1.2],
        ['ALC', ch.st.reach / 1.25],
      ];
      L.forEach(([n, v], k) => {
        const y = 30 + k * 12;
        txt(n, 128, y, 8, '#cbbfe6');
        ctx.fillStyle = '#2a1838';
        ctx.fillRect(156, y + 1, 40, 6);
        ctx.fillStyle = ch.col;
        ctx.fillRect(156, y + 1, Math.round(40 * clamp(v, 0, 1)), 6);
        ctx.fillStyle = 'rgba(255,255,255,.35)';
        ctx.fillRect(156, y + 1, Math.round(40 * clamp(v, 0, 1)), 1);
      });
      txt('ESPECIAL', 128, 80, 8, '#ffd23a');
      txt(ch.spName, 128, 90, 8, '#ffffff');
      xpBar(ch.id, 128, 106, 40);
      ctx.globalAlpha = 0.5;
      drawSpr(sprite(CH[Math.floor(t / 12) % 8], 'idle', 0, 0, false, 'b'), 262, 104, -1);
      ctx.globalAlpha = 1;
      txt('???', 262, 110, 8, '#9adcff', 'center');
      txt(S.mode === 'training' ? 'BONECO' : 'DESAFIANTES', 262, 20, 8, '#9adcff', 'center');
    }
    for (let i = 0; i < 8; i++) {
      const x = 9 + i * 38,
        y = 130,
        ch = CH[i];
      ctx.fillStyle = '#120a1c';
      ctx.fillRect(x - 1, y - 1, 38, 42);
      ctx.fillStyle = shade(ch.col, -0.55);
      ctx.fillRect(x, y, 36, 40);
      ctx.fillStyle = shade(ch.col, -0.35);
      ctx.fillRect(x, y, 36, 14);
      portrait(ch, x, y, 36, 40);
      txt(String(XP.lvl(ch.id)), x + 35, y + 1, 8, '#ffd23a', 'right');
      const c1 = this.cur[0] === i,
        c2 = vs && (!this.cpu || this.ok[0]) && this.cur[1] === i;
      if (c1) {
        ctx.strokeStyle = (t >> 3) & 1 || this.ok[0] ? '#ff4d5e' : '#ffd0d4';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 36, 40);
        txt('1P', x + 1, y + 31, 8, '#ff4d5e');
      }
      if (c2) {
        ctx.strokeStyle = (t >> 3) & 1 || this.ok[1] ? '#45b4ff' : '#d0ecff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + (c1 ? 3 : 0), y + (c1 ? 3 : 0), 36 - (c1 ? 6 : 0), 40 - (c1 ? 6 : 0));
        txt(this.cpu ? 'CPU' : '2P', x + 35, y + 31, 8, '#45b4ff', 'right');
      }
    }
  },
};

export { Select };
