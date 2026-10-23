# 04 · Pintura dos cenários

Os cenários não são imagens: são **pintados em código** no carregamento do jogo, e depois convertidos em pixel art moderna, no mesmo estilo dos sprites.

Código: [`src/game/stages/toolkit.js`](../../src/game/stages/toolkit.js) (ferramentas) e um arquivo por cenário em [`src/game/stages/`](../../src/game/stages).

## Camadas e parallax

Cada cenário tem quatro camadas pintadas em **resolução 2×**:

| Camada | Tamanho (px) | Velocidade de rolagem |
|--------|--------------|-----------------------|
| `sky` | 640×360 | 0 (fixa) |
| `far` | 736×360 | 0,3 |
| `mid` | 832×360 | 0,6 |
| `floor` | 960×360 | 1,0 |

`drawStage(st, cam, t)` em [`stages/index.js`](../../src/game/stages/index.js) desenha as quatro camadas com o deslocamento da câmera multiplicado pela velocidade de cada uma.

### Ganchos de animação

Além das camadas fixas, cada cenário pode ter funções chamadas a cada quadro:

| Gancho | Quando roda |
|--------|-------------|
| `back(ctx, cam, t)` | Depois do céu (estrelas piscando, nuvens, gaivotas) |
| `farA(ctx, cam, t)` | Depois da camada distante (cachoeira, vapor, poeira do anel) |
| `midA(ctx, cam, t)` | Depois da camada do meio (lâmpadas, lanternas, holofotes, varais) |
| `front(ctx, cam, t)` | **Na frente dos lutadores** (espuma, borboletas, plateia, chuva) |

Os ganchos desenham em pixels nativos dentro de `HDC(ctx, fn)`, que aplica `scale(.5, .5)` temporariamente. Por isso os deslocamentos de parallax neles são `cam × fator × 2`. A linha do chão nas camadas pintadas é y=272, e os lutadores pisam em y=328 (`FLOOR × 2`).

## A técnica de "pixel art moderna"

1. **Pintar livremente** com o Canvas 2D: gradientes (`lg`), brilhos (`glow`), arcos, curvas e as ferramentas do kit:

   | Ferramenta | Para quê |
   |------------|----------|
   | `ridge` | Cordilheiras com ruído fbm, neve e luz na borda |
   | `cloud` | Nuvens em camadas de 3 ou 4 tons |
   | `leafBlob`, `frond`, `palmHD` | Folhagens, folhas de palmeira e palmeiras inteiras |
   | `building` | Prédios com janelas acesas, venezianas, sacadas com plantas, cornija e oclusão na base |
   | `win` | Janelas acesas ou apagadas |
   | `perspTiles` | Piso em perspectiva (xadrez do café) |
   | `speck` | Pontilhado de textura (areia, grama, asfalto) |

2. **Direção de arte** em `finish()` → `pixelStage()`, em [`stages/pixelize.js`](../../src/game/stages/pixelize.js). O objetivo é o cenário conversar com os sprites e o HUD, em vez de competir com os lutadores:

   | Etapa | O que faz |
   |-------|-----------|
   | **Profundidade** | Céu e camada distante perdem saturação e contraste e vão em direção à cor do horizonte; o meio, um pouco; o chão, nada. Os lutadores (com contorno escuro) ficam na frente. |
   | **Volume automático** | Para cada silhueta, a distância até a borda vira uma "normal". Bordas viradas para cima e para a esquerda ganham luz quente; para baixo e para a direita, sombra roxa. É a mesma iluminação dos sprites: nuvens, folhas, palmeiras e prédios ganham volume. |
   | **Sombras com mudança de matiz** | Tons escuros puxam para o roxo e tons claros para o dourado, a mesma família de cores do HUD. |
   | **Paleta limitada** | Uma paleta só para as camadas far/mid/floor (k-means determinístico, 40 cores) mais até 10 cores de destaque escolhidas pela distância e saturação, para os detalhes pequenos (toldos, placas) não sumirem. O céu tem paleta própria (28 cores) com dithering Bayer, para os degradês e brilhos não formarem anéis. |
   | **Acabamento** | Contorno de 1 px nas silhuetas, no roxo do contorno dos sprites (`#1b1024`); luz de borda logo abaixo de cada topo; limpeza de pixels soltos; alfa binário. |

3. **Aleatoriedade com semente:** cada cenário chama `setSeed(n)` antes de pintar e usa `rr()` em vez de `Math.random()`. O resultado é idêntico em todo carregamento (e os testes comparam pixels).

## Desempenho

Pintar e converter os 13 cenários leva cerca de 1,3 s, uma única vez no boot: a tela de carregamento pinta um cenário por quadro e `buildStages()` guarda o resultado. Os ganchos de animação são baratos: só retângulos e algumas elipses por quadro.

## Cenários com arte (imagens)

Um cenário pode trocar qualquer camada pintada por uma imagem. O fluxo:

1. A arte fica em `assets/stage-art/<id>/` (gerada a partir dos prompts em [../arte/prompts-cenarios.md](../arte/prompts-cenarios.md)).
2. `npm run stages:art` ([`tools/process-stage-art.js`](../../tools/process-stage-art.js)) lê `assets/stage-art/stages.json`, recorta o magenta, posiciona a camada (linha do chão em y=272), repete na horizontal se precisar e aplica `stagePalette()` + `mapLayer()` (paleta de 64 cores, contorno). Saída: `public/stages/<id>/<camada>.png` e o manifesto [`src/game/data/stage-art.js`](../../src/game/data/stage-art.js).
3. No boot, `loadStageArt()` ([`stages/art.js`](../../src/game/stages/art.js)) carrega as imagens junto com os atlas. `buildNextStage()` pinta o cenário procedural normalmente e `applyArt()` troca as camadas que têm imagem e remove os ganchos de animação listados em `off`.

Assim cada cenário pode ganhar arte aos poucos, camada por camada, sem quebrar os outros.

## Criar um cenário novo

Veja o passo a passo em [07-guia-de-extensao.md](07-guia-de-extensao.md#novo-cenário).
