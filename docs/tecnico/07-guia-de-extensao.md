# 07 · Guia de extensão

Receitas para as features mais prováveis. Depois de qualquer mudança: `npm run lint && npm test`. Se a mudança for visual de propósito, `npm run test:snapshot:update`.

## Novo personagem

1. **Arte:** coloque uma folha 1536×1024 transparente, grade 4×3, em `assets/sprite-sheets/<id>.png` (ordem das poses em [03-renderizacao-e-sprites.md](03-renderizacao-e-sprites.md#arte-original)).
2. **Pipeline:** adicione o id em `SHEETS` de `tools/process_sprites.py` com a altura alvo (ou em `WIDE` se for largo) e rode `npm run sprites`.
3. **Definição:** crie `src/game/characters/fighters/<id>.js` seguindo os existentes:
   ```js
   const novo = {
     id: 'novo', name: ['LINHA 1', 'LINHA 2'], short: 'NOVO',
     voice: 'Nome em italiano!', call: 'Grito do Super!', col: '#hex',
     stage: 0,            // índice do cenário de casa
     sp: 'wave',          // chave em SPEC (combat/specials.js)
     spName: 'NOME DO ESPECIAL',
     st: { spd: 1.6, pow: 1, def: 1, reach: 1 },
     hurt: { w: 30, h: 60 }, // só para posicionar retratos e popups
     quote: 'Frase de vitória.', shout: 'GRITO!',
     draw(p) { /* desenho procedural de reserva (pode ser simples) */ },
   };
   export { novo };
   ```
4. **Elenco:** importe e adicione em `CH` (`characters/roster.js`) e coloque o tom de voz em `VP`. Adicione a linha do quadril em `HIP` (`sprites/hd.js`).
5. **História:** entradas em `STORY` (`story/character-arcs.js`), `OPP` e `RET` (`story/encounters.js`). Rode `node tests/check-texts.js`.
6. **Atenção:** a tela de seleção e a escada da campanha assumem **8** lutadores (grade 8×1, `% 8`, "7 fragmentos"). Para crescer o elenco, ajuste `scenes/select.js` (layout e navegação), `scenes/flow.js`/`scenes/travel.js` (o 7 do "DESAFIO N/7") e `story/encounters.js` ("N de 7").

## Novo especial

1. Escreva o comportamento em `SPEC` (`combat/specials.js`). Ele recebe `(lutador, oponente, luta)` e roda a cada quadro enquanto `f.spec` existir; chame `f.endSpec()` no fim.
2. Para golpes corpo a corpo, preencha `s.box` (caixa de ataque), `s.data` (dano, atordoamento, empurrão, altura, `kd` para derrubar) e `s.max`/`s.rehit` (acertos).
3. Para projéteis, chame `g.spawn(f, 'tipo')`, adicione o caso em `Fight.spawn` (`combat/fight.js`), o desenho em `drawProj` (`combat/projectiles.js`) e o tipo em `PROJ_SP` (`combat/constants.js`), que limita a um projétil por vez.

## Novo cenário

1. Crie `src/game/stages/<nome>.js` com uma função `hNome()`:
   ```js
   function hNome() {
     setSeed(141);               // semente única
     const L = layers();         // sky 640, far 736, mid 832, floor 960 (todas 360 de altura)
     let g = L.sky.getContext('2d');
     // … pintar com lg, glow, ridge, cloud, building, palmHD, speck …
     return finish(L, {
       name: 'NOME', music: 'faixa',
       back(c, cam, t) { HDC(c, (c) => { /* animação no céu */ }); },
       front(c, cam, t) { HDC(c, (c) => { /* animação na frente */ }); },
     });
   }
   ```
2. Adicione `hNome()` **no fim** da lista em `buildStages()` (`stages/index.js`), para não mudar os índices existentes (personagens, mapa, bônus e história apontam para eles).
3. Se ele for a casa de alguém, ajuste `stage` no personagem, `LOC` em `world/map.js` (posição no mapa) e `ARR` em `story/encounters.js` (frase de chegada).

## Nova música

1. Adicione uma entrada em `TRACKS` (`audio/tracks.js`) no formato descrito em [05-audio-e-narracao.md](05-audio-e-narracao.md#formato-das-músicas).
2. Use pelo nome: `music: 'nome'` num cenário, `panels.music = 'nome'` numa cutscene ou `AU.play('nome')` numa cena.

## Novo efeito sonoro

Adicione um `case` em `AU.sfx()` (`audio/synth.js`) combinando `osc`, `fm` e `noise`, e chame `AU.sfx('nome')`.

## Nova cena / tela

```js
const Galeria = {
  id: 'gallery',
  enter() { this.t = 0; AU.play('select'); },
  update() { this.t++; if (anyPressed(['Escape', 'Backspace'])) go(Title); },
  draw() { ctx.fillStyle = '#120a1c'; ctx.fillRect(0, 0, W, H); txt('GALERIA', W / 2, 8, 16, '#ffd23a', 'center'); },
};
```

Para colocá-la no menu, adicione um item em `MENU` (`scenes/title.js`) e trate o `id` na escolha do menu. Exporte a cena também em `scenes/all.js` se quiser usá-la nos testes.

## Novo modo de jogo

Siga o modelo de `Training` e `Bonus`: estenda `Fight` (`combat/fight.js`) e sobrescreva `update()`, `onKO()`, `drawHUD()` ou `drawBanner()` conforme a regra. Crie o fluxo em `scenes/select.js` (método `next()`) e use `FightScene(luta, aoTerminar)` para ganhar pausa e hitboxes de graça.

## Conversar com a página (React)

1. Emita um evento no motor: `emit('nomeDoEvento', dados)` (`events.js`).
2. Declare o tipo em `GameEvents` (`src/game/index.d.ts`).
3. Assine no `GameCabinet`: `game.on('nomeDoEvento', …)` dentro do `handleReady`.

No sentido contrário, adicione um método ao objeto devolvido por `createGame()` em `src/game/index.js` e o tipo em `GameHandle`.

## Gamepad (exemplo de integração)

`readPad()` (`core/input.js`) lê só `keys`/`pressedQ`. O jeito mais simples de suportar controle é ler `navigator.getGamepads()` uma vez por passo (antes de `scene.update()` em `step()`, `core/scene.js`) e traduzir botões e eixos em teclas virtuais com `pressVirtual`/`releaseVirtual`, como o toque já faz.
