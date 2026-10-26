import { UI, screenBackdrop, screenHeader, screenFooter, panel, fitLabel } from '../ui/theme.js';
import { headShot } from '../ui/portrait.js';
/* Character select for every mode. */
import { AU } from '../audio/synth.js';
import { IT, VO } from '../audio/voice.js';
import { CH as BASE_CH, PLAYABLE as CH, availableRoster } from '../characters/roster.js';
import { UNLOCKS } from '../progression/unlocks.js';
import { Training } from '../combat/training.js';

import { ctx, txt } from '../core/canvas.js';

import { CONFIRM, CONFIRM2, anyPressed, readPad } from '../core/input.js';
import { clamp, shuffle } from '../core/math.js';
import { go } from '../core/scene.js';
import { XP } from '../progression/xp.js';
import { drawSpr, sprite } from '../sprites/sprite.js';
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
    const max = availableRoster().length - 1;
    this.cur = [Math.min(S.p1, max), S.mode === 'versus' ? Math.min(S.p2, max) : Math.min(S.p1, max)];
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
    const count = availableRoster().length;
    const step = (i, p, conf, back) => {
      if (!this.ok[i]) {
        if (p.pleft) {
          this.cur[i] = (this.cur[i] + count - 1) % count;
          AU.sfx('blip');
        }
        if (p.pright) {
          this.cur[i] = (this.cur[i] + 1) % count;
          AU.sfx('blip');
        }
        if (p.pup || p.pdown) {
          this.cur[i] = (this.cur[i] + 4) % count;
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
      S.ladder = shuffle(BASE_CH.map((c, i) => i).filter((i) => i !== S.p1)).slice(0, 7);
      S.li = 0;
      S.loc = me.stage;
      S.bdone = {};
      const pro = [...WORLD_PRO, ...STORY[me.id].pro, CALL_PANEL];
      pro.music = 'drama';
      go(Cutscene(pro, goTravel));
    } else if (S.mode === 'bonus') go(CarSelect);
    else if (S.mode === 'training') {
      const candidates = availableRoster().filter((ch) => ch !== me);
      const opp = candidates[Math.floor(Math.random() * candidates.length)];
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
    screenBackdrop(t);
    const mode = {
      arcade: 'HISTÓRIA',
      versus: this.cpu ? '1P VS CPU' : '1P VS 2P',
      training: 'TREINO',
      bonus: 'BÔNUS',
    }[S.mode];
    screenHeader('LUTADORES', mode + ' · PLAYER SELECT');
    const fighter = (side, x, w) => {
      const ch = CH[this.cur[side]],
        color = side ? UI.p2 : UI.p1;
      panel(x, 37, w, 81, color);
      txt(side ? (this.cpu ? 'CPU' : '2P') : '1P', x + 6, 42, 6, color, 'left', null);
      txt(
        this.ok[side] ? 'PRONTO' : 'NV ' + XP.lvl(ch.id),
        x + w - 6,
        42,
        6,
        this.ok[side] ? UI.gold : UI.muted,
        'right',
        null,
      );
      drawSpr(
        sprite(
          ch,
          this.ok[side] ? 'win' : 'idle',
          Math.floor(t / 7) % 8,
          0,
          side === 1 && this.cur[0] === this.cur[1],
          '',
        ),
        x + w / 2,
        94,
        side ? -1 : 1,
        0.8,
      );
      fitLabel(ch.name[0], x + w / 2, 99, w - 8, 6, UI.white, 'center');
      fitLabel(ch.name[1], x + w / 2, 109, w - 8, 6, UI.gold, 'center');
    };
    if (vs) {
      fighter(0, 10, 126);
      fighter(1, 184, 126);
      txt('VS', 160, 72, 16, UI.gold, 'center');
    } else {
      fighter(0, 10, 96);
      const ch = CH[this.cur[0]];
      panel(116, 37, 194, 81, UI.line);
      [
        ['VEL', ch.st.spd / 2],
        ['FOR', ch.st.pow / 1.2],
        ['DEF', ch.st.def / 1.2],
        ['ALC', ch.st.reach / 1.25],
      ].forEach(([name, value], i) => {
        const y = 44 + i * 11;
        txt(name, 124, y, 6, UI.muted, 'left', null);
        ctx.fillStyle = UI.ink;
        ctx.fillRect(154, y, 146, 7);
        ctx.fillStyle = ch.col;
        ctx.fillRect(155, y + 1, Math.round(144 * clamp(value, 0, 1)), 5);
        ctx.fillStyle = 'rgba(255,255,255,.3)';
        ctx.fillRect(155, y + 1, Math.round(144 * clamp(value, 0, 1)), 1);
      });
      txt('ESPECIAL', 124, 91, 6, UI.gold, 'left', null);
      fitLabel(ch.spName, 184, 91, 118, 6, UI.white);
      xpBar(ch.id, 124, 105, 130);
    }
    CH.forEach((ch, i) => {
      const x = 10 + i * 33,
        y = 126;
      const c1 = this.cur[0] === i,
        c2 = vs && (!this.cpu || this.ok[0]) && this.cur[1] === i;
      panel(x, y, 30, 31, c1 || c2 ? UI.gold : UI.line);
      if (ch.id === 'bribri' && !UNLOCKS.has('bribri')) {
        txt('?', x + 15, y + 2, 16, UI.muted, 'center');
        txt('LOCK', x + 15, y + 23, 6, UI.muted, 'center', null);
        return;
      }
      headShot(ch, x + 3, y + 1, 24, { t: 0 });
      ctx.fillStyle = UI.ink;
      ctx.fillRect(x + 1, y + 22, 28, 8);
      txt(
        c2 ? (this.cpu ? 'CPU' : '2P') : c1 ? '1P' : String(i + 1),
        x + 15,
        y + 23,
        6,
        c2 ? UI.p2 : c1 ? UI.p1 : UI.muted,
        'center',
        null,
      );
      if (c1 && c2) {
        ctx.fillStyle = UI.ink;
        ctx.fillRect(x + 2, y + 1, 16, 10);
        txt('1P', x + 4, y + 3, 6, UI.p1, 'left', null);
      }
      if (c1) {
        ctx.fillStyle = UI.p1;
        ctx.fillRect(x, y, 2, 31);
      }
      if (c2) {
        ctx.fillStyle = UI.p2;
        ctx.fillRect(x + 28, y, 2, 31);
      }
    });
    screenFooter(
      '←→ ESCOLHER',
      this.cpu && this.ok[0] ? 'ENTER RIVAL · K REFAZER' : 'ENTER CONFIRMAR · ESC VOLTAR',
    );
  },
};

export { Select };
