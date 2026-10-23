# 06 · História e cutscenes

Código: [`src/game/story/`](../../src/game/story) (textos) e [`src/game/scenes/cutscene.js`](../../src/game/scenes/cutscene.js) (exibição).

## A lenda de Brainrotália

> *Muito além da internet existe BRAINROTÁLIA: a terra paralela onde moram os memes mais absurdos já criados.*

Durante séculos todos viveram em paz: bastava um *tralalá*, um *tung tung*, um *bananini*… e o mundo sorria. Até que uma sombra surgiu nos anéis de Saturno: **La Vacca Saturno Saturnita**, trazendo **O ALGORITMO**, um sinal capaz de controlar qualquer meme. Um a um, os brainrots foram hipnotizados: os olhos ficaram roxos, as vozes ocas, e Brainrotália caiu em silêncio.

Só um coração resistiu, o do lutador escolhido. Cada rival derrotado é **libertado** e entrega um dos **7 fragmentos** do sinal. Com os sete, o caminho até Saturno se abre.

## Estrutura de uma campanha

```
Seleção
 └─ Prólogo do mundo (5 painéis) + prólogo do personagem (3) + chamado (1)     música: drama
 └─ para cada um dos 7 rivais (ordem sorteada):
      Mapa (viagem) → chegada + rival hipnotizado + resposta (3 painéis)
      → VS → Luta → Resultado → rival libertado + fragmento N de 7 (2 painéis)
      → depois do 2º, 4º e 6º rival: fase bônus (Nonno, Cybercaminhão, Bi-ai-di)
 └─ Mapa → intro do chefe (4 painéis)                                            música: boss
      → VS → Luta contra Saturnita → Resultado
 └─ Derrota do chefe (3) + final do personagem (3) + epílogo (1)                 música: ending
 └─ Créditos
```

Perder uma luta leva à tela **Continue?**, que refaz a mesma luta.

## Conteúdo

| Tabela | Arquivo | O que tem |
|--------|---------|-----------|
| `WORLD_PRO` | `story/world.js` | Prólogo comum em 5 painéis: o mundo, a paz, a sombra, o monólogo da vaca e a hipnose. |
| `CALL_PANEL` | `story/world.js` | "Apenas um coração resistiu ao sinal…": a ponte para a campanha. |
| `STORY[id].pro` | `story/character-arcs.js` | Prólogo próprio de cada lutador (3 painéis): a vida normal, o que o algoritmo roubou e a partida. |
| `STORY[id].end` | `story/character-arcs.js` | Final próprio (3 painéis): o golpe final, a volta para casa e um epílogo engraçado. |
| `STORY[id].retort` | `story/character-arcs.js` | O que o lutador diz para a vaca antes da luta final. |
| `ARR[cenário]` | `story/encounters.js` | Frase de chegada em cada lugar ("Selva Patapim. As árvores sussurram em uma língua que não é delas."). |
| `OPP[id].hyp` / `.free` | `story/encounters.js` | A fala do rival hipnotizado e a fala dele depois de libertado (sempre com uma pista). |
| `RET[id]` | `story/encounters.js` | Três respostas do jogador, alternadas ao longo da campanha. |
| `RIVAL['a>b']` | `story/encounters.js` | Respostas especiais para rivalidades (veja [05-personagens.md](05-personagens.md#rivalidades)). |
| `bossIntro()` | `story/encounters.js` | Chegada a Saturno, revelação da vaca, ameaça e resposta do jogador. |
| `BOSS_DEFEAT`, `EPILOGUE` | `story/world.js` | O algoritmo trava, os anéis racham, todos acordam… e um último "muuu" ecoa: *CONTINUA?* |

### Os finais

| Lutador | Desfecho |
|---------|----------|
| Tralalero | A maré volta; ele abre a primeira escola de surfe para tubarões de tênis. |
| Tung | Bilhões de pessoas acordam famintas; ele vira o Despertador Oficial do Universo. |
| Bombardiro | Volta soltando fumaça verde, branca e vermelha e vira líder da esquadrilha. |
| Ballerina | O recital acontece sob as estrelas; na última fila, o Assassino enxuga uma lágrima ("era só vapor"). |
| Patapim | Planta uma árvore em cada planeta. Dizem que em Saturno já tem sombra. |
| Chimpanzini | As bananas voltam; ele abre a Bananini Express, com entrega em dez minutos em qualquer planeta. |
| Assassino | Recusa o Desejo Cósmico. De volta ao caffè, outro envelope, desta vez com um nome. |
| Lirilì | O sol nasce na hora certa; ele chega quinze minutos atrasado à própria festa. |

## Como um painel funciona

Cada painel tem um cenário de fundo, uma cor de filtro, uma posição de câmera, os atores em cena, o texto, quem fala e um efeito.

```js
pnx([cenario, filtroOuNull, cameraX], atores, texto, quemFala, efeito)
// ator: [quem, pose, x, y, direção, escala, deitado, hipnotizado]
// quem: 'P' jogador | 'O' rival atual | 'B' chefe | id de um personagem
// quemFala: null (narrador) | 'P' | 'O' | 'B'
// efeito: 'zoom' | 'shake' | 'flash' | 'glitch' | undefined
```

| Efeito | O que acontece |
|--------|----------------|
| `zoom` | A câmera se aproxima devagar (de 110%). |
| `shake` | A tela treme por 40 frames, com um som de impacto. |
| `flash` | Flash branco, com som de explosão. |
| `glitch` | Faixas horizontais deslocadas com tons RGB, com som de rachadura. |
| Ator hipnotizado | Sprite tingido de roxo, uma aura pulsante e partículas roxas subindo. |

- O texto aparece letra por letra (1,3 caractere por frame), quebra em 37 caracteres e ocupa no máximo 4 linhas. O teste `tests/check-texts.js` garante isso para **todas** as combinações de lutador e rival.
- **Enter** completa o texto ou avança; **Esc** pula a cutscene inteira.
- Cada painel é lido em voz alta: o narrador com o tom neutro, o chefe com o tom 0,3 e os personagens com o próprio tom (veja [05-personagens.md](05-personagens.md#personalidade-e-voz)).
