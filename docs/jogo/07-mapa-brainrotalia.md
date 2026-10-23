# 07 · Mapa de Brainrotália

Entre uma luta e outra da história, um aviãozinho leva o seu lutador pelo mapa de Brainrotália até a próxima parada.

<p align="center"><img src="../../assets/readme/map.png" width="640" alt="Mapa de Brainrotália com a rota até a próxima parada"></p>

Código: [`src/game/world/map.js`](../../src/game/world/map.js) (geração) e [`src/game/scenes/travel.js`](../../src/game/scenes/travel.js) (cena animada).

## Locais

O índice de cada local é o mesmo índice do cenário correspondente.

| # | Local | Posição (x,y) | Quem mora lá |
|---|-------|---------------|--------------|
| 0 | Spiaggia Tralalà | 212,128 | Tralalero |
| 1 | Piazza Pizzaiola | 136,74 | – |
| 2 | Selva Patapim | 204,60 | Patapim |
| 3 | Deserto Tic-Tac | 80,108 | Lirilì |
| 4 | Caffè Assassino | 122,104 | Assassino |
| 5 | Villaggio Sahur | 66,56 | Tung |
| 6 | Cielo Bombardiro | 110,32 | Bombardiro |
| 7 | Teatro Cappuccina | 164,48 | Ballerina |
| 8 | Isola Bananini | 280,120 | Chimpanzini |
| 9 | Anelli di Saturno | 286,44 | Saturnita |
| 10 | Strada del Nonno | 176,90 | (fase bônus) |

## Como o mapa é gerado

O mapa (320×180) é gerado uma vez e guardado em cache:

1. **Terra:** teste de ponto dentro de polígono contra o continente (`MAINLAND`, em forma de bota) e três ilhas (`ISLES`, incluindo a Isola Bananini).
2. **Distância até a costa:** uma busca em largura de até 7 px a partir da terra. Gera as faixas de água rasa, a espuma e a areia da praia.
3. **Biomas:** cada pixel de terra pega a cor do centro de bioma mais próximo (selva, deserto, aldeia, piazza, teatro, terra de café), com dithering nas bordas. O resto é campo verde com variação de ruído.
4. **Marcos:** montanhas com neve, a copa da Selva Patapim, as cabanas da aldeia, os quarteirões da piazza com a torre, um lago em forma de xícara de café, a cúpula do teatro, estradas pontilhadas e uma palmeira na ilha das bananas.

## O que se mexe

- Brilhos na água, sombras de nuvens e uma barbatana de tubarão rondando a praia.
- Um mini Bombardiro dando voltas no céu com rastro de fumaça.
- Ponteiros girando no deserto, vapor saindo do lago de café, troncos do Tung pulando na aldeia e holofotes varrendo o teatro.
- **Saturno:** um portal brilhando, um anel girando com a cabeça da vaca (olhos piscando em roxo) e **raios roxos** pulsando na direção de cada local ainda hipnotizado.
- **Marcadores:** vermelho na casa do jogador, bandeiras verdes nos locais libertados, anéis roxos pulsantes nos hipnotizados e uma seta branca quicando no destino.
- **Viagem:** uma trajetória em arco com rastro pontilhado, percorrida pelo aviãozinho carregando o sprite do jogador em miniatura.
- **Barra inferior:** "PRÓXIMA PARADA", o nome do lugar, o retrato do rival e "DESAFIO N/7" (ou "CHEFE FINAL"). O narrador diz "*Próxima parada: …*".

A cena dura 220 frames (cerca de 3,7 s). **Enter** pula depois dos primeiros 24 frames.
