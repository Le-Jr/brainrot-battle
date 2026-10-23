import { T } from './harness.js';
try {
  for (const c of [...T.CH, T.BOSS]) {
    delete c._prof;
    const P = T.profile(c);
    console.log(
      c.id.padEnd(11),
      'p',
      P.p && [P.p.x0, P.p.x1, P.p.y0, P.p.y1].map(Math.round).join(','),
      'k',
      P.k && [P.k.x0, P.k.x1, P.k.y0, P.k.y1].map(Math.round).join(','),
      'cp',
      P.cp && Math.round(P.cp.x1),
      'ck',
      P.ck && Math.round(P.ck.x1),
      'jk',
      P.jk && Math.round(P.jk.x1),
    );
  }
  // AI vs AI with stats
  const stat = { hits: 0, combos3: 0, ups: 0, throws: 0, ex: 0, sup: 0, cancel: 0 };
  const oh = T.Fight.prototype.applyHit;
  T.Fight.prototype.applyHit = function (a, d, dat, ...r) {
    const res = oh.call(this, a, d, dat, ...r);
    if (res === 'hit') {
      stat.hits++;
      if (a.combo === 3) stat.combos3++;
      if (dat.unblock) stat.throws++;
    }
    return res;
  };
  const oc = T.Fight.prototype.cancelFx;
  T.Fight.prototype.cancelFx = function (f) {
    stat.cancel++;
    return oc.call(this, f);
  };
  const os = T.Fighter.prototype.startSpecial;
  T.Fighter.prototype.startSpecial = function (o, g, k) {
    const r = os.call(this, o, g, k);
    if (r && k === 'ex') stat.ex++;
    if (r && k === 'super') stat.sup++;
    return r;
  };
  const oa = T.Fighter.prototype.startAtk;
  T.Fighter.prototype.startAtk = function (n) {
    if (n === 'up') stat.ups++;
    return oa.call(this, n);
  };
  const all = [...T.CH, T.BOSS];
  let w0 = 0,
    tot = 0,
    frames = 0;
  for (let a = 0; a < 9; a++)
    for (let b = 0; b < 9; b++) {
      if (a === b) continue;
      if ((a + b) % 3) continue;
      const F = new T.Fight(all[a], all[b], all[b].stage || 0, { cpu: true, lvl: 2, lv: [3, 3] });
      F.ai[0] = new T.AI(2);
      let n = 0;
      while (F.done === undefined && n < 60 * 60 * 7) {
        F.update();
        if (n % 4 === 0) F.draw();
        n++;
      }
      tot++;
      frames += n;
      if (F.done === 0) w0++;
      if (F.done === undefined) console.log('NO RESULT', all[a].id, all[b].id);
    }
  console.log('matches', tot, 'p1 wins', w0, 'avg sec', Math.round(frames / tot / 60), JSON.stringify(stat));
  // bonus durability with semi-smart mashing
  for (const type of ['nonno', 'cyber', 'byd']) {
    const B = new T.Bonus(T.CH[0], 1, type);
    T.go(T.FightScene(B, () => {}));
    let n = 0;
    while (B.done === undefined && n < 5000) {
      const k = ['KeyJ', 'KeyK', 'KeyL', 'KeyJ', 'KeyK'][n % 5];
      T.keys.clear();
      T.keys.add('KeyD');
      if (n % 4 === 0) T.pressedQ.add(k);
      T.step();
      if (n % 5 === 0) T.scene.draw();
      n++;
    }
    console.log(
      'bonus',
      type,
      'result',
      B.res && B.res.type,
      'time left',
      B.timer,
      'car hp',
      Math.round(B.f[1].hp),
      '/',
      B.f[1].maxhp,
      'xp',
      B.xp,
    );
  }
  // training
  T.keys.clear();
  const Tr = new T.Training(T.CH[2], T.CH[3]);
  T.go(T.FightScene(Tr, () => {}));
  for (let n = 0; n < 1500; n++) {
    T.keys.clear();
    T.keys.add('KeyD');
    if (n % 6 === 0) T.pressedQ.add(['KeyJ', 'KeyK', 'KeyL'][n % 3]);
    T.step();
    if (n % 5 === 0) T.scene.draw();
  }
  console.log('training ok, dummy hp', Tr.f[1].hp);
  // motion input test: DP and QCF
  const F = new T.Fight(T.CH[0], T.CH[1], 0, { cpu: false });
  F.phase = 'fight';
  const f = F.f[0];
  const seq = [['right'], ['down'], ['down', 'right'], []];
  const mk = (dirs, btn) => {
    const o = { left: false, right: false, up: false, down: false, pp: false, pk: false, ps: false };
    dirs.forEach((d) => (o[d] = true));
    if (btn) o[btn] = true;
    return o;
  };
  for (const s of seq) F.core([mk(s), {}]);
  F.core([mk(['down', 'right'], 'pp'), {}]);
  console.log('DP ->', f.atk && f.atk.n);
  f.atk = null;
  f.st = 'idle';
  f.meter = 60;
  for (let i = 0; i < 10; i++) F.core([mk([]), {}]);
  for (const s of [['down'], ['down', 'right'], ['right']]) F.core([mk(s), {}]);
  F.core([mk(['right'], 'ps'), {}]);
  console.log('QCF ->', f.spec && f.spec.ex, 'meter', f.meter);
  console.log('ALL OK');
} catch (e) {
  console.error('ERR', e.stack);
}
