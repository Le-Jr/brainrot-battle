/* Local test cabinet. Overlay pauses the current scene without re-entering or restarting it. */
import { isLocalHost } from './local.js';
import { AU } from '../audio/synth.js';
import { VO } from '../audio/voice.js';
import { TRACKS } from '../audio/tracks.js';
import { PLAYABLE as CH } from '../characters/roster.js';
import { UNLOCKS } from '../progression/unlocks.js';
import { BOSS } from '../characters/fighters/saturnita.js';
import { MEGA_BOSS } from '../characters/fighters/saturnita-mega.js';
import { Fight } from '../combat/fight.js';
import { FinalFight } from '../combat/final-fight.js';
import { Training } from '../combat/training.js';
import { ctx, txt } from '../core/canvas.js';
import { keys, pressedQ, menuPad, anyPressed, CONFIRM } from '../core/input.js';
import { go, setInspector } from '../core/scene.js';
import { XP } from '../progression/xp.js';
import { S, SET, DEBUG } from '../state.js';
import { STAGES, buildStages } from '../stages/index.js';
import { ASCENSION } from '../story/finale.js';
import { WORLD_PRO, CALL_PANEL } from '../story/world.js';
import { STORY } from '../story/character-arcs.js';
import { FightScene } from '../scenes/fight-scene.js';
import { Finale } from '../scenes/finale.js';
import { Cutscene } from '../scenes/cutscene.js';
import { Travel } from '../scenes/travel.js';
import { Intro } from '../scenes/intro.js';
import { Ending } from '../scenes/ending.js';
import { Title } from '../scenes/title.js';
import { onMatch, startBonus, arcadeNext } from '../scenes/flow.js';
import { UI, panel, menuRow, fitLabel } from '../ui/theme.js';

export function installLocalInspector({ hostname, target, onAvailability = () => {} }) {
  if (!isLocalHost(hostname)) return null;
  DEBUG.local = true;
  const roster = [...CH, BOSS, MEGA_BOSS];
  const config = { player: S.p1, opponent: 1, stage: 9, level: 5, difficulty: S.diff };
  let savedRun = null,
    savedHitboxes = false;
  const ui = {
    open: false,
    tab: 0,
    row: 0,
    scene: null,
    musicBefore: null,
    audition: false,
    begin() {
      if (DEBUG.testing) return;
      savedRun = JSON.parse(JSON.stringify(S));
      savedHitboxes = DEBUG.showBox;
      XP.beginSandbox();
      UNLOCKS.beginSandbox();
      DEBUG.testing = true;
    },
    toggle() {
      if (this.open) this.close();
      else {
        this.musicBefore = AU.cur;
        this.audition = false;
        this.open = true;
        this.row = 0;
        keys.clear();
        pressedQ.clear();
        VO.clipAudio?.pause();
        if (VO.live.length && typeof speechSynthesis !== 'undefined') speechSynthesis.pause();
        if (AU.mg) AU.mg.gain.value = 0;
      }
    },
    close(resume = true) {
      this.open = false;
      if (this.audition) {
        AU.play(this.musicBefore);
        VO.stop();
        this.audition = false;
      }
      keys.clear();
      pressedQ.clear();
      if (AU.mg) AU.mg.gain.value = AU.music ? SET.music * (this.scene?.pause ? 0.35 : 1) : 0;
      if (resume) {
        VO.clipAudio?.play()?.catch(() => {});
        if (VO.live.length && typeof speechSynthesis !== 'undefined') speechSynthesis.resume();
      } else VO.stop();
    },
    exit() {
      this.close(false);
      XP.endSandbox();
      UNLOCKS.endSandbox();
      if (savedRun) Object.assign(S, savedRun);
      DEBUG.testing = false;
      DEBUG.god = false;
      DEBUG.infiniteMeter = false;
      DEBUG.freezeTimer = false;
      DEBUG.freezeCpu = false;
      DEBUG.showBox = savedHitboxes;
      savedRun = null;
      go(Title);
    },
    prepare() {
      if (!DEBUG.testing) {
        this.begin();
        DEBUG.god = true;
        DEBUG.infiniteMeter = true;
        DEBUG.freezeTimer = true;
      }
      buildStages();
      Object.assign(S, {
        mode: 'arcade',
        p1: config.player,
        p2: config.opponent % CH.length,
        diff: config.difficulty,
        ladder: CH.slice(0, 8)
          .map((_, i) => i)
          .filter((i) => i !== config.player)
          .slice(0, 7),
        li: 7,
        loc: 9,
        bdone: { nonno: 1, cyber: 1, byd: 1 },
      });
      XP.data[CH[config.player].id] = (config.level - 1) ** 2 * 120;
      this.close(false);
    },
    returnMenu() {
      ui.open = true;
      ui.row = 0;
      if (AU.mg) AU.mg.gain.value = 0;
    },
    finalFight() {
      S.li = 8;
      const f = new FinalFight(CH[config.player], {
        cpu: true,
        lvl: config.difficulty,
        boost: 0.55 + config.difficulty * 0.2,
        lv: [config.level, 3 + config.difficulty * 3],
      });
      go(FightScene(f, (fight) => onMatch(fight, f.opts)));
    },
    launch(id) {
      if (['win', 'lose', 'restart'].includes(id)) {
        const f = this.scene?.F;
        if (!f || f.opts.bonus || f.opts.dummy) return;
        this.begin();
        this.close(false);
        this.scene.pause = false;
        this.scene.out = 0;
        if (id === 'restart') {
          f.round = 1;
          f.wins = [0, 0];
          f.perfects = [0, 0];
          f.bestCombo = 0;
          f.done = undefined;
          f.f.forEach((fighter) => {
            fighter.meter = 0;
          });
          f.startRound();
        } else {
          const w = id === 'win' ? 0 : 1;
          f.f[1 - w].hp = 0;
          f.f[1 - w].st = 'ko';
          f.wins[w] = 2;
          f.res = { w, type: 'ko' };
          f.phase = 'end';
          f.pt = 150;
          f.done = w;
        }
        return;
      }
      this.prepare();
      const player = CH[config.player];
      if (id === 'final') this.finalFight();
      else if (id === 'ascension') {
        S.li = 8;
        go(Finale(ASCENSION, () => ui.finalFight()));
      } else if (id === 'boss') {
        const f = new Fight(player, BOSS, 9, { cpu: true, lvl: config.difficulty, lv: [config.level, 5] });
        go(FightScene(f, (fight) => onMatch(fight, f.opts)));
      } else if (id === 'victory') {
        S.li = 9;
        arcadeNext();
      } else if (id === 'fight') {
        S.mode = 'versus';
        S.vsCpu = true;
        const opts = { cpu: true, lvl: config.difficulty, lv: [config.level, config.level] };
        const opponent = roster[config.opponent];
        const f =
          opponent === MEGA_BOSS
            ? new FinalFight(player, { ...opts, campaignFinale: false })
            : new Fight(player, opponent, config.stage, opts);
        go(FightScene(f, (fight) => onMatch(fight, f.opts)));
      } else if (['cyber', 'nonno', 'byd'].includes(id)) startBonus(player, id, this.returnMenu);
      else if (id === 'training') {
        const f = new Training(player, roster[config.opponent]);
        f.stage = STAGES[config.stage];
        go(FightScene(f, this.returnMenu));
      } else if (id === 'map') {
        S.li = 2;
        go(Travel(player.stage, roster[config.opponent].stage, this.returnMenu));
      } else if (id === 'prologue')
        go(Cutscene([...WORLD_PRO, ...STORY[player.id].pro, CALL_PANEL], this.returnMenu));
      else if (id === 'intro') go(Intro);
      else if (id === 'credits') go(Ending);
      else go(Title);
    },
    items() {
      if (this.tab === 2)
        return [
          ...Object.entries(TRACKS).map(([id, tr]) => ({
            label: tr.title || id.toUpperCase(),
            value: 'OUVIR',
            action: () => {
              this.audition = true;
              AU.init();
              AU.play(id);
              if (AU.mg) AU.mg.gain.value = AU.music ? SET.music : 0;
            },
          })),
          ...[
            ['LOCUTOR', 'Round one... Fight!', 'ann'],
            ['HISTÓRIA', 'Muito além da internet existe Brainrotália.', 'pt'],
            ['NOME DO PERSONAGEM', CH[config.player].voice, 'it'],
          ].map(([label, text, role]) => ({
            label,
            value: 'OUVIR',
            action: () => {
              this.audition = true;
              VO.say(text, { role });
            },
          })),
        ];
      if (this.tab === 0)
        return [
          ['LUTA FINAL · FASE 2', 'final'],
          ['CUTSCENE MEGA BRAIN', 'ascension'],
          ['SATURNITA · FASE 1', 'boss'],
          ['DESFECHO / SALVAÇÃO', 'victory'],
          ['LUTA LIVRE', 'fight'],
          ...(this.scene?.F && !this.scene.F.opts.bonus && !this.scene.F.opts.dummy
            ? [
                ['VENCER LUTA ATUAL', 'win'],
                ['PERDER LUTA ATUAL', 'lose'],
                ['REINICIAR LUTA ATUAL', 'restart'],
              ]
            : []),
          ['BÔNUS CYBERTRUCK', 'cyber'],
          ['BÔNUS NONNO', 'nonno'],
          ['BÔNUS BI-AI-DI', 'byd'],
          ['TREINO', 'training'],
          ['MAPA', 'map'],
          ['PRÓLOGO DO JOGADOR', 'prologue'],
          ['INTRO DO JOGO', 'intro'],
          ['CRÉDITOS', 'credits'],
          ['MENU PRINCIPAL', 'title'],
        ].map(([label, id]) => ({ label, value: 'ABRIR', action: () => this.launch(id) }));
      const choose = (label, key, values, labels = values) => ({
        label,
        value: labels[config[key]],
        change: (d) => {
          config[key] = (config[key] + d + values.length) % values.length;
        },
      });
      const toggle = (label, key, inverted = false) => ({
        label,
        value: (inverted ? !DEBUG[key] : DEBUG[key]) ? 'SIM' : 'NÃO',
        change: () => {
          this.begin();
          DEBUG[key] = !DEBUG[key];
        },
      });
      return [
        choose(
          'JOGADOR',
          'player',
          CH,
          CH.map((ch) => ch.short),
        ),
        choose(
          'RIVAL',
          'opponent',
          roster,
          roster.map((ch) => ch.short),
        ),
        choose(
          'CENÁRIO',
          'stage',
          STAGES,
          STAGES.map((st) => st.name),
        ),
        {
          label: 'NÍVEL P1',
          value: String(config.level),
          change: (d) => {
            config.level = ((config.level - 1 + d + 10) % 10) + 1;
          },
        },
        choose('DIFICULDADE', 'difficulty', [0, 1, 2], ['FÁCIL', 'NORMAL', 'DIFÍCIL']),
        toggle('GOD MODE', 'god'),
        toggle('ESPECIAL INFINITO', 'infiniteMeter'),
        toggle('RELÓGIO PARADO', 'freezeTimer'),
        toggle('IA ATIVA', 'freezeCpu', true),
        toggle('HITBOXES', 'showBox'),
        {
          label: 'BRI BRI (TESTE)',
          value: UNLOCKS.has('bribri') ? 'LIVRE' : 'BLOQUEADO',
          action: () => {
            this.begin();
            UNLOCKS.unlock('bribri');
          },
        },
        { label: 'ENCERRAR TESTES', value: 'SAIR', action: () => this.exit() },
      ];
    },
    beforeStep(scene) {
      this.scene = scene;
      if (anyPressed(['F2'])) {
        this.toggle();
        return true;
      }
      if (this.open) {
        const pad = menuPad();
        if (anyPressed(['Escape', 'Backspace', 'T_start'])) {
          this.close();
          return true;
        }
        if (anyPressed(['Tab', 'KeyQ', 'KeyE', 'T_k'])) {
          this.tab = (this.tab + 1) % 3;
          this.row = 0;
          return true;
        }
        const items = this.items();
        if (pad.pup) this.row = (this.row + items.length - 1) % items.length;
        if (pad.pdown) this.row = (this.row + 1) % items.length;
        const item = items[this.row];
        if (pad.pleft || pad.pright) item.change?.(pad.pleft ? -1 : 1);
        if (anyPressed(CONFIRM) || anyPressed(['T_s'])) item.action ? item.action() : item.change?.(1);
        return true;
      }
      const f = scene.F;
      if (DEBUG.testing && f && f.done === undefined) {
        if (DEBUG.infiniteMeter) f.f[0].meter = 100;
        if (DEBUG.freezeTimer) f.timerT = 0;
      }
      return false;
    },
    draw() {
      if (!this.open) {
        // An explicit local label makes active cheats visible while reviewing the game.
        ctx.fillStyle = 'rgba(5,8,18,.85)';
        ctx.fillRect(2, 174, 132, 6);
        txt(
          DEBUG.testing ? 'F2 TESTES · XP ISOLADO' : 'F2 PAINEL LOCAL',
          4,
          174,
          6,
          DEBUG.testing ? UI.gold : UI.muted,
          'left',
          null,
        );
        return;
      }
      ctx.fillStyle = 'rgba(5,8,18,.96)';
      ctx.fillRect(0, 0, 320, 180);
      panel(8, 7, 304, 166, UI.gold);
      txt('PAINEL LOCAL', 18, 15, 10, UI.white);
      txt('F2 FECHAR', 301, 17, 6, UI.gold, 'right', null);
      fitLabel(
        ['DESTINOS · ACESSO DIRETO', 'AJUSTES · ENTER OU ← → ALTERAR', 'ÁUDIO · MÚSICAS E VOZES'][this.tab],
        18,
        33,
        284,
        6,
        UI.p2,
      );
      const items = this.items(),
        start = Math.max(0, Math.min(this.row - 3, items.length - 6));
      items.slice(start, start + 6).forEach((item, i) =>
        menuRow(item.label, 16, 47 + i * 16, 288, this.row === start + i, {
          value: item.value,
          height: 15,
        }),
      );
      txt(`${this.row + 1}/${items.length}`, 300, 146, 6, UI.muted, 'right', null);
      fitLabel(
        `${CH[config.player].short} · NV ${config.level} · ${DEBUG.god ? 'GOD ON' : 'GOD OFF'}`,
        18,
        146,
        250,
        6,
        UI.gold,
      );
      txt('TAB/CHUTE ABAS · ↑↓ ITEM · ENTER OK · ESC', 160, 160, 6, UI.muted, 'center', null);
    },
    destroy() {
      if (DEBUG.testing) {
        XP.endSandbox();
        UNLOCKS.endSandbox();
        if (savedRun) Object.assign(S, savedRun);
      }
      Object.assign(DEBUG, {
        local: false,
        testing: false,
        god: false,
        infiniteMeter: false,
        freezeTimer: false,
        freezeCpu: false,
        showBox: savedHitboxes,
      });
      setInspector(null);
      target?.removeEventListener('keydown', onKey, true);
      onAvailability(false);
    },
  };
  const onKey = (e) => {
    if (
      e.code === 'F2' ||
      (ui.open && ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    )
      e.preventDefault();
  };
  buildStages();
  setInspector(ui);
  target?.addEventListener('keydown', onKey, true);
  onAvailability(true);
  return ui;
}
