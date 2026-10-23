/* Story-mode flow: travel, fights, bonus slots, XP awards and the ending. */
import { AU } from '../audio/synth.js';
import { BOSS } from '../characters/fighters/saturnita.js';
import { CH } from '../characters/roster.js';
import { Bonus } from '../combat/bonus.js';
import { go } from '../core/scene.js';
import { XP } from '../progression/xp.js';
import { S } from '../state.js';
import { STORY } from '../story/character-arcs.js';
import { bossIntro, preFight } from '../story/encounters.js';
import { BOSS_DEFEAT, EPILOGUE } from '../story/world.js';
import { BonusResult } from './bonus-result.js';
import { Cutscene } from './cutscene.js';
import { Ending } from './ending.js';
import { FightScene } from './fight-scene.js';
import { Result } from './result.js';
import { Travel } from './travel.js';
import { VS } from './vs.js';

/* ---------- arcade flow ---------- */
const lvP = () => XP.lvl(CH[S.p1].id);
function goTravel() {
  const dest = S.li < 7 ? CH[S.ladder[S.li]].stage : 9;
  go(
    Travel(S.loc, dest, () => {
      S.loc = dest;
      if (S.li < 7) {
        const opp = CH[S.ladder[S.li]];
        go(Cutscene(preFight(CH[S.p1], opp, S.li), goVs, opp));
      } else go(Cutscene(bossIntro(), goVs));
    }),
  );
}
function goVs() {
  const me = CH[S.p1];
  if (S.li < 7) {
    const opp = CH[S.ladder[S.li]];
    go(
      VS(
        me,
        opp,
        opp.stage,
        { cpu: true, lvl: S.diff, boost: S.li / 6, lv: [lvP(), 1 + S.li] },
        'LUTA ' + (S.li + 1) + '/7',
      ),
    );
  } else
    go(
      VS(
        me,
        BOSS,
        9,
        { cpu: true, lvl: 2, boost: 0.6 + S.diff * 0.3, lv: [lvP(), 2 + S.diff * 3] },
        'CHEFE FINAL',
      ),
    );
}
const BSLOT = { 2: 'nonno', 4: 'cyber', 6: 'byd' };
function arcadeNext() {
  const b = BSLOT[S.li];
  if (b && !S.bdone[b]) {
    S.bdone[b] = 1;
    startBonus(CH[S.p1], b, arcadeNext);
    return;
  }
  if (S.li >= 8) {
    const e = [...BOSS_DEFEAT, ...STORY[CH[S.p1].id].end, ...EPILOGUE];
    e.music = 'ending';
    go(Cutscene(e, () => go(Ending)));
    return;
  }
  goTravel();
}
function startBonus(ch, type, next) {
  const B = new Bonus(ch, XP.lvl(ch.id), type);
  go(
    FightScene(B, (F) => {
      const gain = F.xp,
        up = XP.add(ch.id, gain);
      go(BonusResult(ch, F.res.type === 'destroy', gain, up, next, type));
    }),
  );
}
function onMatch(F, opts) {
  const w = F.done,
    gains = [0, 0],
    ups = [false, false];
  const award = (i) => {
    const won = w === i;
    let g =
      F.wins[i] * 40 +
      (won ? 120 + S.diff * 40 : 30) +
      F.perfects[i] * 80 +
      Math.max(0, F.bestCombo - 2) * 15;
    if (won && i === 0 && F.f[1].ch === BOSS) g += 400;
    gains[i] = g;
    ups[i] = XP.add(F.f[i].ch.id, g);
  };
  award(0);
  if (!opts.cpu) award(1);
  AU.play('win');
  go(
    Result(F.f[w], w, opts, {
      gains,
      ups,
      f: F.f,
      stage: F.stage,
      wins: F.wins,
      perfects: F.perfects,
      combo: F.bestCombo,
      rounds: F.round,
    }),
  );
}

export { arcadeNext, goTravel, goVs, onMatch, startBonus };
