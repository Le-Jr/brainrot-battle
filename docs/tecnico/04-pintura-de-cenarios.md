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

2. **Converter em pixel art** em `finish()`, com [`stages/pixelize.js`](../../src/game/stages/pixelize.js):

   | Camada | Tratamento |
   |--------|------------|
   | `sky` | Posterização com **dithering Bayer 4×4** (`quant`): o degradê do céu fica em faixas pontilhadas. |
   | `far` | **Faixas de brilho** (12) sem dithering, **perspectiva atmosférica** (30% em direção à cor do horizonte, um pouco dessaturada) e contorno suave. |
   | `mid` | Faixas de brilho (16), um toque de névoa, **contorno** de 1 px nas silhuetas e **luz de borda** na linha logo abaixo de cada topo. |
   | `floor` | Faixas de brilho (16), contorno e luz de borda. |

   - **Faixas de brilho com o matiz preservado:** a luminância de cada pixel é arredondada para N faixas (espaçadas em raiz quadrada, para cenas escuras não perderem os degraus) e a cor é reescalada mantendo o matiz. Assim os degradês viram rampas de sombra limpas, como numa paleta feita à mão. A posterização canal por canal criava manchas com mudança de cor.
   - **Contorno seletivo:** pixels opacos vizinhos de pixels transparentes escurecem em direção ao roxo do contorno dos sprites (`#1b1024`), em vez de preto puro.
   - **Limpeza:** pixels soltos, cercados pela mesma cor nos 4 lados, assumem essa cor.
   - **Alfa binário** em todas as camadas transparentes, sem antisserrilhado.
   - `pixelize()` também aceita uma paleta limitada (`colors`, k-means determinístico) com dithering entre faixas, para usos futuros.
3. **Aleatoriedade com semente:** cada cenário chama `setSeed(n)` antes de pintar e usa `rr()` em vez de `Math.random()`. O resultado é idêntico em todo carregamento (e os testes comparam pixels).

## Desempenho

Pintar e converter os 13 cenários leva cerca de 0,5 s, uma única vez no boot: a tela de carregamento pinta um cenário por quadro e `buildStages()` guarda o resultado. Os ganchos de animação são baratos: só retângulos e algumas elipses por quadro.

## Criar um cenário novo

Veja o passo a passo em [07-guia-de-extensao.md](07-guia-de-extensao.md#novo-cenário).
