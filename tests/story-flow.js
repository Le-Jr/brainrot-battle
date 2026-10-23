import { T } from './harness.js';
const press = (c) => T.pressedQ.add(c);
const run = (n, fn) => {
  for (let i = 0; i < n; i++) {
    if (fn) fn(i);
    T.step();
    T.scene.draw();
  }
};
try {
  console.log('HD loaded', Object.keys(T.HD));
  for (const c of [...T.CH, T.BOSS]) {
    const P = T.profile(c);
    console.log(
      c.id.padEnd(11),
      'body',
      Math.round(P.l),
      Math.round(P.r),
      'top',
      Math.round(P.t),
      'crouch',
      Math.round(P.ct),
      'p',
      P.p && [P.p.x0, P.p.x1, P.p.y0, P.p.y1].map(Math.round).join(','),
      'k',
      P.k && [P.k.x0, P.k.x1, P.k.y0, P.k.y1].map(Math.round).join(','),
      'ck',
      P.ck && Math.round(P.ck.x1),
    );
  }
  // title: logo slam -> attract (APERTE START) -> menu -> HISTÓRIA
  run(50);
  press('Enter');
  run(15);
  press('Enter');
  run(3);
  console.log('select?', T.scene === T.Select);
  press('KeyJ');
  run(60);
  let last = '';
  for (let i = 0; i < 60000; i++) {
    const sc = T.scene;
    const nm =
      sc === T.Ending
        ? 'Ending'
        : sc.F
          ? sc.F instanceof T.Bonus
            ? 'Bonus:' + sc.F.type
            : 'Fight'
          : sc.id === 'vs'
            ? 'VS'
            : sc.id === 'cutscene'
              ? 'Cut'
              : sc.id === 'travel'
                ? 'Map'
                : 'Other';
    if (nm !== last) {
      console.log(i, nm, 'li', T.S.li);
      last = nm;
    }
    if (nm === 'Ending') {
      console.log('ENDING OK');
      break;
    }
    if (sc.F && sc.F.done === undefined && sc.F.phase === 'fight') {
      if (sc.F instanceof T.Bonus) {
        run(300, (j) => {
          if (j % 5 === 0) press('KeyK');
        });
      } else {
        run(100, (j) => {
          if (j % 5 === 0) press('KeyL');
        });
        sc.F.res = { w: 0, type: 'ko' };
        sc.F.phase = 'end';
        sc.F.pt = 149;
        sc.F.wins = [2, 0];
      }
    }
    if (i % 9 === 0) press('Enter');
    T.step();
    T.scene.draw();
  }
  console.log('ALL OK');
} catch (e) {
  console.error('ERR', e.stack);
}
