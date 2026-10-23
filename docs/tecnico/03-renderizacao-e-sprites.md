# 03 · Renderização, sprites e hitboxes

## Modelo de renderização

- O canvas tem **640×360** pixels. No começo de cada quadro, `ctx.setTransform(2,0,0,2,0,0)`: o jogo inteiro trabalha em **320×180 pixels lógicos**.
- A suavização de imagem fica sempre desligada, e o CSS usa `image-rendering: pixelated`, para os pixels continuarem nítidos em qualquer tamanho de tela.
- O conteúdo **HD** (atlas dos personagens e cenários) é guardado em 2× e desenhado pela metade, aproveitando a resolução cheia de 640×360. Um canvas marcado com `hd` (sprites) ou `st.hd` (cenários) é desenhado com fator 0,5.
- O texto usa `txt()` em [`core/canvas.js`](../../src/game/core/canvas.js): contorno de 8 direções e, nos tamanhos grandes, uma sombra extra.
- A Press Start 2P não tem maiúsculas acentuadas. `txt()` troca `Á É Í Ó Ú Â Ê Ô Ã Õ À…` pela letra base e desenha o acento em pixel art em cima (a fonte é monoespaçada, então cada letra ocupa exatamente `size` px).
- Elementos de interface no estilo arcade (placas inclinadas, molduras, brilhos de estrela, texto com franja cromática, glitch, cortinas) ficam em [`ui/arcade.js`](../../src/game/ui/arcade.js).

## Arte original

Cada personagem tem uma folha em `assets/sprite-sheets/<id>.png`: PNG transparente de 1536×1024 com uma grade 4×3 de 12 poses, virado para a direita.

| Índice | Pose | Índice | Pose |
|--------|------|--------|------|
| 0 | Parado | 6 | Soco (ativo) |
| 1 | Parado alternativo / guarda | 7 | Chute |
| 2 | Andando A | 8 | Defesa |
| 3 | Andando B | 9 | Especial |
| 4 | Pulo | 10 | Apanhando |
| 5 | Soco (preparação) | 11 | Caído |

O pipeline que transforma a folha em atlas está em [06-ferramentas-e-testes.md](06-ferramentas-e-testes.md#pipeline-de-sprites).

## Sprites em tempo de execução

[`sprites/hd.js`](../../src/game/sprites/hd.js) e [`sprites/sprite.js`](../../src/game/sprites/sprite.js)

`sprite(ch, pose, frame, a, alt, tint)` desenha uma pose num canvas de 256×208 (a versão 2× da caixa lógica de 128×104, com a âncora em 128,200) e guarda em cache.

- `tint`: `'w'` flash branco de acerto, `'b'` azul de congelado, `'p'` roxo de hipnose.
- `alt`: paleta com os canais rotacionados, para o espelho.
- A tela de VS pré-renderiza as poses dos dois lutadores (`warmList`) para a luta não engasgar.

`hdPick(pose, frame, a)` converte a pose do jogo numa das 12 molduras **mais uma transformação**. É isso que faz 12 desenhos parecerem animação fluida:

| Pose do jogo | Moldura | Transformação |
|--------------|---------|---------------|
| idle (8 quadros) | 0 | Respiração: as pernas comprimem até 5% |
| walk (8 quadros) | 2 / 3 | O corpo sobe e desce de 0 a 3 px |
| crouch | 0 | **Só as pernas** comprimidas a 50% (o tronco desce sem distorcer) |
| aterrissar / levantar | 0 | Pernas a 78% / 66% |
| cblock, cpunch | 8, 5/6 | Pernas a 50% |
| ckick (rasteira) | 7 | Pernas a 50% + rotação de 0,55 rad |
| punch | 5 → 6 → 5 | Preparação, impacto, recuperação 3 px para trás |
| kick | 0 → 7 | Engatilha (pernas 86%, leve inclinação) → chute |
| jump | 4 | Inclina −0,12 subindo, 0 no topo, +0,12 descendo |
| jpunch / jkick | 6 / 7 | Inclinação no ar |
| hit | 10 | Treme ±2 px |
| fall | 10 | Gira para trás aos poucos (arco da queda) |
| down | 11 | Moldura própria de caído |
| win (8 quadros) | 1 → 4 | Pulinho de −10/−18 px |

A divisão entre pernas e tronco usa `HIP[id]`, a linha do quadril como fração da altura do sprite (0,5 a 0,64).

### Desenhos procedurais

Antes das folhas de sprite existirem, todos os personagens eram desenhados em código: um esqueleto (`rig()`) mais primitivas de pixel art (`ell`, `limbs`, `poly`, `rbox`, `eye`, `blade`) em [`sprites/primitives.js`](../../src/game/sprites/primitives.js). Essas funções `draw(p)` continuam em cada arquivo de lutador:

- são usadas pelos **três carros** das fases bônus;
- servem de **reserva** se o atlas de um personagem não carregar.

## Efeitos em cima dos sprites

- **Smear:** três rastros brancos atrás da ponta do membro durante os frames ativos.
- **Rastros:** imagens fantasmas na investida do Tung, no corte do Assassino, na pirueta e no uppercut.
- **Sombra:** uma elipse do tamanho do corpo, que diminui com a altura do pulo.
- **Tela de corte do Super:** a pose de especial em 2× numa faixa da cor do personagem.
- **Invencibilidade:** o lutador pisca semitransparente depois de levantar.

## Hitboxes medidas dos pixels

`profile(ch)` em [`sprites/sprite.js`](../../src/game/sprites/sprite.js) mede, uma vez por personagem:

1. A **hurtbox** a partir dos pixels opacos da pose parada (encolhida 12% de cada lado) e a altura agachado a partir da pose agachada.
2. Uma **caixa de ataque por golpe** (`p`, `k`, `cp`, `ck`, `jp`, `jk`): os pixels da pose de ataque que passam da frente do corpo. A caixa vai do corpo até o pixel mais distante, com altura de ±5 px em volta da ponta (os 12 px mais à frente).
3. Golpes sem membro visível ficam `null` e caem nos valores reserva da tabela `ATK`.

Com isso, trocar a arte de um personagem atualiza as hitboxes sozinho.
