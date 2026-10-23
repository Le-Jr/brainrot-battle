# 02 · Motor: loop, cenas, entrada e estado

## API pública

```ts
import { createGame } from '@/game';

const game = createGame({
  canvas,                       // <canvas width=640 height=360>
  fontFamily: pixelFont.style.fontFamily,
  assetBase: '/atlases',        // padrão
  autoStart: true,              // inicia o requestAnimationFrame quando carregar
  keyboardTarget: window,       // null desliga o teclado (usado nos testes)
  intro: true,                  // abertura Tupinicode antes do título (false nos testes)
});

await game.ready;               // fonte + atlas carregados
game.setMusic(false);
game.setNarrator(true);
game.pressButton('T_p');        // botões virtuais do toque
game.releaseButton('T_p');
const off = game.on('voice', (ligado) => { /* narrador mudou nas OPÇÕES */ });
game.destroy();
```

## Boot

1. `initCanvas(canvas)` liga o contexto 2D principal e desliga a suavização de imagem.
2. Com `intro` (padrão), `go(Intro)` e o loop começa **na hora**: a tela de carregamento já anima enquanto o resto chega.
3. Espera a fonte (no máximo 2,5 s) **e** decodifica os 9 atlas de `/atlases/<id>.png`. Depois roda `XP.load()`, `VO.init()` e `buildLogo()` e marca `Intro.assetsReady`.
4. A `Intro` pinta os cenários com `buildNextStage()`, **um por quadro** (25 a 45 ms cada, cerca de 0,4 s no total), e mostra o progresso no CRT.
5. Sem a abertura (`intro: false`, usado nos testes e nas ferramentas), `buildStages()` pinta tudo de uma vez e o jogo começa direto no `Title`.

## Loop de passo fixo

[`core/scene.js`](../../src/game/core/scene.js)

```js
function frame(now) {
  acc += Math.min(100, now - last);
  while (acc >= 1000 / 60 && n < 4) { step(); acc -= 1000 / 60; n++; }
  ctx.setTransform(2, 0, 0, 2, 0, 0);   // tudo é desenhado em 320×180 lógicos
  scene.draw();
  raf = requestAnimationFrame(frame);
}
function step() { tick++; scene.update(); pressedQ.clear(); }
```

- A lógica roda sempre a **60 passos por segundo**, seja qual for a taxa do monitor, com no máximo 4 passos de recuperação por quadro.
- `pressedQ` guarda as teclas que desceram desde o último passo: é assim que o jogo detecta "acabou de apertar".

## Cenas

Uma cena é um objeto simples com `update()`, `draw()` e, opcionalmente, `enter()`. `go(cena)` troca a cena atual. Toda cena tem um `id` (usado nos testes e útil para depurar). Cenas com parâmetros são fábricas:

| Cena | Arquivo | Tipo |
|------|---------|------|
| `Intro` | `scenes/intro.js` | objeto (carregamento, logo, crédito, aviso) |
| `Title` | `scenes/title.js` | objeto (slam, START, menu) |
| `Options`, `Moves` | `scenes/options.js`, `scenes/moves.js` | objeto |
| `Select`, `CarSelect` | `scenes/select.js`, `scenes/car-select.js` | objeto |
| `VS(c1, c2, cenário, opts, rótulo)` | `scenes/vs.js` | fábrica |
| `FightScene(fight, aoTerminar)` | `scenes/fight-scene.js` | fábrica (pausa + Tab) |
| `Result(f, lado, opts, xp)` | `scenes/result.js` | fábrica |
| `Travel(de, para, próximo)` | `scenes/travel.js` | fábrica |
| `Cutscene(painéis, próximo, rival)` | `scenes/cutscene.js` | fábrica |
| `BonusResult(...)` | `scenes/bonus-result.js` | fábrica |
| `Continue`, `Ending` | `scenes/continue.js`, `scenes/ending.js` | objeto |

O encadeamento da campanha (viagem → cutscene → VS → luta → resultado → bônus → …) fica em [`scenes/flow.js`](../../src/game/scenes/flow.js): `goTravel`, `goVs`, `arcadeNext`, `startBonus` e `onMatch`.

## Entrada

[`core/input.js`](../../src/game/core/input.js)

- `keys`: teclas seguradas agora (`KeyboardEvent.code`). `pressedQ`: teclas que desceram neste passo.
- Os botões de toque são "teclas virtuais" (`T_left`, `T_p`, `T_start`…), então o resto do código não distingue teclado de toque.
- `PADS` mapeia ações para teclas: `p1` (WASD + JKL + toque), `p1x` (setas + ZXC), `p2` (setas + BNM/Numpad).
- `readPad('p1', 'p1x')` devolve `{ left, right, up, down, p, k, s }` (segurado) e `{ pleft, …, pp, pk, ps }` (acabou de apertar).
- Listas prontas: `CONFIRM`, `CONFIRM2` (2P), `START`.
- `attachKeyboard(window)` adiciona os listeners e devolve a função que os remove. As teclas de jogo têm `preventDefault()` (para a página não rolar), exceto quando o foco está num botão da página.

## Estado

[`state.js`](../../src/game/state.js)

| Objeto | Campos |
|--------|--------|
| `SET` | `music` (volume da música, 0 a 0,63) |
| `S` | `mode` (`arcade`/`versus`/`bonus`/`training`), `diff` (0 a 2), `p1`, `p2` (índices no elenco), `ladder` e `li` (ordem sorteada dos rivais e a luta atual, 0 a 7, onde 7 é o chefe), `loc` (posição no mapa), `bdone` (bônus já jogados), `car` (último carro do modo bônus) |
| `DEBUG` | `showBox` (visualizador de hitboxes, tecla Tab) |

## Eventos motor → página

[`events.js`](../../src/game/events.js) é um barramento mínimo (`on`/`emit`). Hoje só existe o evento `voice`, emitido quando o narrador é ligado ou desligado em OPÇÕES, para o botão NARRADOR da página acompanhar.
