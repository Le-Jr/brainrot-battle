import { T } from './harness.js';
const w = (s, n) => {
  const out = [];
  let line = '';
  for (const x of s.split(' ')) {
    if (line && (line + x).length > n) {
      out.push(line.trimEnd());
      line = '';
    }
    line += x + ' ';
  }
  if (line.trim()) out.push(line.trimEnd());
  return out;
};
const all = [];
const add = (arr) => arr.forEach((p) => all.push(p.tx));
add(T.WORLD_PRO);
add([T.CALL_PANEL]);
for (const c of T.CH) {
  add(T.STORY[c.id].pro);
  add(T.STORY[c.id].end);
  for (const o of T.CH)
    if (o !== c) {
      add(T.preFight(c, o, 0));
      add(T.preFight(c, o, 1));
      add(T.preFight(c, o, 2));
      add(T.freedScene(c, o, 3));
    }
  T.S.p1 = T.CH.indexOf(c);
  add(T.bossIntro());
}
const bad = [...new Set(all)].filter((s) => w(s, 37).length > 4);
console.log(bad.length);
bad.forEach((s) => console.log(w(s, 37).length, s));
