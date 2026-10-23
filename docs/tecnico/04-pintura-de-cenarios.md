# 04 · Pintura dos cenários

Os cenários não são imagens: são **pintados em código** no carregamento do jogo, e depois quantizados para ficar com cara de pixel art.

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

2. **Quantizar** cada camada com `quant(canvas, níveis)`: posterização por canal (14 a 16 níveis) com **dithering Bayer 4×4**, e **alfa binário** nas camadas transparentes. Isso remove o antisserrilhado e deixa as bordas nítidas e os gradientes pontilhados, combinando com os sprites.
3. **Aleatoriedade com semente:** cada cenário chama `setSeed(n)` antes de pintar e usa `rr()` em vez de `Math.random()`. O resultado é idêntico em todo carregamento (e os testes comparam pixels).

## Desempenho

Pintar os 13 cenários leva cerca de 2 s num notebook, uma única vez no boot (`buildStages()` guarda o resultado). Os ganchos de animação são baratos: só retângulos e algumas elipses por quadro.

## Criar um cenário novo

Veja o passo a passo em [07-guia-de-extensao.md](07-guia-de-extensao.md#novo-cenário).
