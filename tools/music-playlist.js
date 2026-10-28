import fs from 'node:fs';
import path from 'node:path';
import { IMPORTED_MUSIC } from '../src/game/audio/imported-music.js';

/** Both an HTTP-accessible playlist and a portable local preview. */
export function writeMusicPlaylist(report, out, published) {
  report = report.map((track) => ({ ...track, ...IMPORTED_MUSIC[track.name] }));
  for (const [name, music] of Object.entries(IMPORTED_MUSIC))
    if (!report.some((track) => track.name === name)) report.push({ name, ...music });
  const escape = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
  const render = (base) => {
    const cards = [...report]
      .sort((a, b) => (b.name === 'laststand') - (a.name === 'laststand'))
      .map((t) => {
        const file = t.url ? t.url.split('/').at(-1) : t.name + '.ogg';
        const detail = t.source
          ? t.alternative
            ? 'Alternativa importada'
            : 'Faixa importada'
          : `${t.bpm} BPM · ${t.bars} compassos`;
        return `<article id="${t.name}"><h2 id="title-${t.name}">${escape(t.title)}</h2><p>${detail} · ${t.duration.toFixed(1)} s</p><audio aria-labelledby="title-${t.name}" controls loop preload="none" src="${base}${file}"></audio><p><a href="${base}${file}" download>Baixar faixa</a></p></article>`;
      })
      .join('\n');
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Brainrot Battaglia — Trilha Arcade</title><style>body{background:#121220;color:#eee;font:17px/1.5 system-ui;max-width:900px;margin:32px auto;padding:20px}article{border-top:1px solid #445;padding:20px 0}h1{font-size:clamp(24px,5vw,36px)}h2{font-size:20px}p{color:#ccd}audio{width:100%}a{color:#ffd66b;display:inline-block;min-height:44px}a:focus-visible,audio:focus-visible{outline:3px solid #ffd66b;outline-offset:4px}</style></head><body><main><h1>Brainrot Battaglia — Trilha Arcade</h1><p>${report.length} faixas · músicas importadas e versões locais. Aperte Play para ouvir; cada faixa se repete. Se o jogo estiver aberto em outra aba, desligue a música nele para ouvir apenas esta página.</p>${cards}</main><script>document.addEventListener('play',e=>{if(e.target.tagName==='AUDIO')document.querySelectorAll('audio').forEach(a=>{if(a!==e.target)a.pause()})},true)</script></body></html>`;
  };
  fs.writeFileSync(path.join(published, 'index.html'), render('./'));
  fs.writeFileSync(path.join(out, 'index.html'), render('../../public/audio/music/'));
}

if (process.argv[1]?.endsWith('/music-playlist.js')) {
  writeMusicPlaylist(
    JSON.parse(fs.readFileSync('public/audio/music/report.json', 'utf8')),
    path.resolve('output/music'),
    path.resolve('public/audio/music'),
  );
}
