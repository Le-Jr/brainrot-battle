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
      → VS → Saturnita, fase 1/2 → Resultado
 └─ Ascensão do Mega Brain (8 quadros animados)                            música: ascension → laststand
      → Bri Bri assume como jogador → VS → Saturnita Mega Brain, fase 2/2 → Resultado
 └─ Ataque coletivo e planeta livre (4 quadros) + finais individuais (9 × 3)    música: ending
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
| `ASCENSION`, `FINAL_VICTORY` | `story/finale.js` | Segunda forma, ameaça global, auxílio do Bri Bri e salvação definitiva após a segunda vitória. |

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

- **Visual:** barras de cinema em cima (com pontinhos de progresso dos painéis e "ESC: PULAR") e uma faixa de diálogo embaixo com borda dourada. Quem fala aparece num **retrato emoldurado**: o jogador à esquerda, o rival ou o chefe à direita (o rival hipnotizado com o retrato roxo pulsando), com uma placa inclinada na cor do personagem. Entre um painel e outro há um fade pelo preto.
- O texto aparece letra por letra (1,3 caractere por frame), quebra em 37 caracteres e ocupa no máximo 4 linhas. O teste `tests/check-texts.js` garante isso para **todas** as combinações de lutador e rival.
- **Enter** completa o texto ou avança; **Esc** pula a cutscene inteira.
- Cada painel é lido em voz alta: o narrador com o tom neutro, o chefe com o tom 0,3 e os personagens com o próprio tom (veja [05-personagens.md](05-personagens.md#personalidade-e-voz)).


## Segunda e última fase: Mega Brain

A vitória sobre a Saturnita normal quebra sua casca. Ela usa a força total do Mega Brain e seus poderes cósmicos para juntar os brainrots num furacão que ameaça o planeta. Até o lutador escolhido perde a vontade por um momento. **Bri Bri Bicus Dicus de Bicus de Dicus** assume como personagem jogável e enfrenta a Mega Vaca na última luta. O personagem escolhido inicialmente permanece como protagonista da campanha, sem ser substituído no estado da história. Depois da vitória, todos os brainrots unem seus poderes numa cutscene própria para destruir o Mega Brain e romper o controle da vaca. Cada um dos nove heróis recebe então um epílogo separado, começando pelo personagem escolhido.

O Bri Bri foi adaptado aqui como herói final jogável. Seu visual de ave gladiadora, armadura dourada, capa vermelha e colar de frutas usa a descrição de referência do [PlayBrainrot](https://www.playbrainrot.org/en/character/brri-brri-bicus-dicus/). A participação e a história desta campanha são próprias do jogo.

- `scenes/finale.js`: oito quadros de transformação e quatro de vitória coletiva; zoom suave, atores orbitando, hipnose visual, legendas em duas linhas e narração Chatterbox local. Os quadros avançam automaticamente e aguardam o áudio; Enter completa/avança, Esc ou Start pula após 24 frames. Movimento reduzido desliga o zoom e a órbita.
- `combat/final-fight.js`: luta separada em melhor de três, arena cósmica, Bri Bri contra Mega Vaca, barra de especial cheia para o jogador no começo de cada round e ataques de energia de vários brainrots. Um alvo fixo anuncia cada coluna de projéteis por cerca de 1,2 s. Dá para sair da coluna ou defender. Os comandos permanecem normais durante a luta.
- Perder permite usar Continue diretamente na segunda forma, novamente como Bri Bri. Reiniciar a luta limpa projéteis, alvos e placares. Pular a transformação nunca pula a batalha. O final só é liberado após as duas vitórias (`S.li`: 7 → 8 → 9).
- `audio/finale-tracks.js`: composições originais **Mega Brain — O Último Sinal** (96 BPM) e **Vontade Livre — Last Stand** (176 BPM), com voz FM própria, camadas crescentes, bateria e tema heroico. A música abaixa durante a narração e respeita volume e mute.

As três artes foram geradas com a ferramenta integrada. Os prompts cinematográficos estão em [`assets/finale-art/prompts.json`](../../assets/finale-art/prompts.json), a vitória coletiva em [`coalition-prompt.json`](../../assets/finale-art/coalition-prompt.json) e os novos lutadores em [`fighter-prompts.json`](../../assets/finale-art/fighter-prompts.json). Os masters ficam em `assets/finale-art/` e as artes distribuídas em `public/stages/finale/`: três fundos de 1280×720 e duas folhas de 1024×832, com 16 poses cada, de Bri Bri e da Mega Vaca. `npm run sprites:finale` reconstrói as artes a partir dos masters; o manifesto de cenários as carrega junto dos outros assets.

Validação e prévias:

```sh
npm run test:finale
npm run render:finale
npm run render:finale:audio # requer Chromium; renderiza o sintetizador real em WAV
npm run render:finale:video # requer WAVs anteriores e FFmpeg; filme com trilha e vozes
```

As prévias ficam em `output/finale/`. `tests/story-flow.js` percorre a campanha e exige as duas formas antes dos créditos; `tests/finale.js` cobre Continue, desbloqueio do final, alvos, colisões, legendas e partitura.


### Personagem especial desbloqueável

Ao vencer a **segunda forma** na história, Bri Bri é desbloqueado e salvo em `localStorage` (`brb_unlocks_v1`). Ele ocupa o nono slot da seleção; antes disso, o slot mostra `LOCK` e não aceita confirmação. Depois, pode ser usado em História, Versus, Treino e Bônus, com seu próprio prólogo e final. A história continua com sete rivais originais, mesmo quando Bri Bri é escolhido.

Bri Bri tem força 1,38, defesa 1,32, velocidade 1,95 e o **Escudo da Liberdade**, uma investida com curta proteção inicial e um super de quatro acertos. A Mega Vaca tem força 1,48, defesa 1,5, velocidade 1,65 e **Fúria do Mega Brain**: alterna varredura de anéis, investida gravitacional e chuva de meteoros. O super combina os ataques. Ela acelera as colunas de energia quando fica abaixo de 40% de vida, mantendo o aviso visual.

Os dois sprites têm poses próprias de caminhada, agachamento, soco (preparação/acerto/recuperação), chute (três fases), especial (carga/lançamento), dano, queda, salto e vitória. A paleta de 64 cores e a escala seguem os outros lutadores. `tests/secret-fighter.js` verifica as animações, golpes, desbloqueio e seleção nos quatro modos.

O painel local permite experimentar Bri Bri e liberar seu slot apenas na sessão de testes. Ganhar uma luta de teste, uma luta livre ou apenas assistir ao desfecho não grava o desbloqueio real.
