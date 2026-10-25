# 06 · Ferramentas, testes e qualidade

## Scripts do `package.json`

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento do Next (Turbopack) em `http://localhost:3000` |
| `npm run build` / `npm start` | Build de produção (a página é estática) e servidor |
| `npm run lint` | ESLint (regras do Next + `no-undef` e `no-import-assign` no motor) |
| `npm run typecheck` | `tsc --noEmit` na casca React |
| `npm run format` / `format:check` | Prettier |
| `npm test` | Os quatro testes headless abaixo |
| `npm run test:snapshot:update` | Aceita uma mudança visual intencional (regrava `tests/snapshots.json`) |
| `npm run render` | Gera `tests/out-poses.png` e `tests/out-stages.png` para conferir no olho |
| `npm run readme:art` | Regera as imagens do README em `assets/readme/` |
| `npm run sprites` | Pipeline de sprites (Python) |
| `npm run stages:art` | Pipeline da arte dos cenários: `assets/stage-art/` → `public/stages/` |

## Testes headless

O harness ([`tests/harness.js`](../../tests/harness.js)) importa os **módulos reais do motor** dentro do Node, com um canvas 2D de verdade (**@napi-rs/canvas**) e stubs mínimos de `document`, `Image`, `localStorage` e `requestAnimationFrame`. Os testes controlam o jogo avançando quadros (`T.step()`) e injetando teclas (`T.pressedQ`, `T.keys`).

| Teste | O que verifica |
|-------|----------------|
| `story-flow.js` | Joga uma campanha inteira: título → seleção → prólogo → 7× (mapa, pré-luta, VS, luta, resultado, libertação) → 3 fases bônus → chefe → final. Imprime cada troca de cena. |
| `combat-suite.js` | Imprime os perfis de colisão dos 9 personagens; roda 24 lutas CPU × CPU com estatísticas (acertos, combos de 3+, uppercuts, agarrões, EX, Supers, cancelamentos); confere que dá para destruir cada carro e quanto tempo sobra; roda o treino; testa os comandos → ↓ ↘ e ↓ ↘ →. |
| `check-texts.js` | Garante que todo texto de cutscene cabe em 4 linhas de 37 caracteres, para todas as combinações de lutador e rival. |
| `visual-snapshot.js` | **Rede de regressão:** hash de todas as poses de todos os personagens (9 × 17 poses × 8 quadros × 3 fases) e de 13 lutas CPU × CPU com aleatoriedade fixa (uma por cenário), comparados com `tests/snapshots.json`. Qualquer mudança de pixel ou de resultado aparece. |

> O texto fica fora dos hashes do snapshot, porque depende das fontes instaladas em cada máquina. O `check-texts.js` cobre o texto.

Resultados na migração para Next.js: a campanha chegou ao final; nas 24 lutas, cada lado venceu cerca de metade (o resultado varia, a IA usa aleatoriedade); os três carros foram destruídos com 18 a 26 s sobrando; todo texto coube; e os snapshots bateram com a versão original (veja abaixo).

## Regressão contra a versão original

A migração do arquivo único para módulos foi verificada comparando, com a mesma semente aleatória, a versão original ([`legacy/index.html`](../../legacy/index.html)) e a nova:

- **perfis de colisão** dos 9 personagens: idênticos;
- **hash de todas as poses** (9 × 17 × 8 × 3 sprites): idêntico;
- **13 lutas CPU × CPU**, uma por cenário, 900 quadros cada, com hash de um quadro por segundo: quadros e vida finais idênticos.

Ou seja: a reorganização não mudou nenhum pixel nem nenhuma decisão do jogo.

## Testes no navegador

O jogo também foi aberto no Chromium headless (Playwright), em produção e em desenvolvimento (com o duplo efeito do `StrictMode`): sem erros de JavaScript, sem listeners duplicados, com o botão NARRADOR sincronizado nos dois sentidos com a opção do jogo e sem rolagem horizontal em 390 px de largura.

## Pipeline de sprites

O pipeline atual usa quadros individuais gerados com uma referência fixa por personagem:

```bash
npm run sprites              # personagens: 19 quadros, folha 5×4 e atlas horizontal
npm run sprites:projectiles  # oito artefatos, três quadros cada
node tests/sprite-art.js     # fases distintas, agachamento, disparo e efeitos
```

As entradas ficam em `assets/sprite-art/`; os prompts completos e o roteiro de poses estão em [../arte/prompts-sprites.md](../arte/prompts-sprites.md). Os PNGs originais são locais, como os originais dos cenários. As folhas empacotadas, atlas e metadados são versionados.

### Pipeline legado

[`tools/process_sprites.py`](../../tools/process_sprites.py) transforma as folhas 4×3 em atlas:

```bash
pip install pillow numpy scipy
npm run sprites:legacy
```

1. **Separa as poses pela forma, não por caixa:** alfa acima de 128, dilatação de 2 px, rotulação dos componentes conectados. Mantém as 12 partes grandes e prende os fragmentos pequenos (brilhos, linhas de movimento) à pose mais próxima. Cada pose é recortada com **a própria máscara**, então as vizinhas nunca vazam. Se não achar 12, tenta de novo com menos dilatação.
2. **Escala:** altura alvo por personagem (ou largura, para os largos: Tralalero, Bombardiro e Saturnita) na resolução 2× do jogo, com filtro Lanczos.
3. **Limpeza:** alfa binário, contorno escuro de 1 px (`#1b1024`) e paleta de 64 cores compartilhada por personagem (median cut, sem dithering).
4. **Âncoras:** centro de baixo. O X vem do centro do topo do corpo (cabeça/tronco); as molduras de ataque 5 a 7 alinham pela borda de trás, a de apanhar pela da frente, e os personagens largos sempre pela de trás. Isso impede o corpo de "pular" entre as molduras.
5. **Saída:** `public/atlases/<id>.png` (um atlas horizontal por personagem) e `src/game/data/atlas-frames.js` com `[x, y, w, h, âncoraX, âncoraY]` de cada moldura.

## Imagens do README

`npm run readme:art` usa o mesmo harness para renderizar o título, os cartões dos personagens, a grade de cenários e algumas telas, com aleatoriedade fixa. Como o Skia não lê woff2, o script baixa uma vez o TTF da Press Start 2P (licença SIL OFL) para `node_modules/.cache/`.

## Qualidade de código

- **ESLint** com `eslint-config-next` (core-web-vitals + TypeScript). No motor, `no-undef` pega qualquer importação faltando e `no-import-assign` impede que um módulo reatribua uma variável importada (o estado compartilhado mutável tem setters: `setSeed`, `setTarget`, `setFont`, `initCanvas`).
- **Prettier** em todo o código (`printWidth` 110, aspas simples). O arquivo gerado `src/game/data/` fica de fora.
- **TypeScript estrito** na casca React; a fronteira com o motor é tipada em `src/game/index.d.ts`.
