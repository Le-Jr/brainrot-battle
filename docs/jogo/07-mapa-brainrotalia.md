# 07 · Mapa de Brainrotália

Entre uma luta e outra da história, um aviãozinho leva o seu lutador pelo mapa de Brainrotália até a próxima parada.

<p align="center"><img src="../../assets/readme/map.png" width="640" alt="Mapa de Brainrotália com a rota até a próxima parada"></p>

Código: [`src/game/world/map.js`](../../src/game/world/map.js) (geração) e [`src/game/scenes/travel.js`](../../src/game/scenes/travel.js) (cena animada).

## Arte

O mapa é uma ilustração em pixel art gerada a partir do prompt em [../arte/prompts-cenarios.md](../arte/prompts-cenarios.md#mapa-de-brainrotália-map) e convertida pelo mesmo pipeline dos cenários (`npm run stages:art`, saída `public/stages/map/map.png`). O jogo desenha por cima tudo que é interativo: marcadores, rotas, o aviãozinho, Saturno e os raios roxos.

Se a imagem não existir, o jogo usa o mapa gerado em código (continente em forma de bota, biomas e marcos desenhados pixel a pixel).

## Locais

O índice de cada local é o mesmo índice do cenário correspondente. As posições estão em `LOC_ART`, em [`src/game/world/map.js`](../../src/game/world/map.js): se o mapa for regerado, é só atualizar essas coordenadas (em pixels lógicos, 320×180).

| # | Local | Marco na arte | Posição (x,y) |
|---|-------|---------------|---------------|
| 0 | Spiaggia Tralalà | Farol na ponta sudeste | 212,113 |
| 1 | Piazza Pizzaiola | Praça com a torre | 134,70 |
| 2 | Selva Patapim | Cachoeira na selva | 214,59 |
| 3 | Deserto Tic-Tac | Torre do relógio | 77,98 |
| 4 | Caffè Assassino | Lago em forma de xícara | 140,110 |
| 5 | Villaggio Sahur | Casas de palafita | 65,54 |
| 6 | Cielo Bombardiro | Pista nas montanhas | 119,34 |
| 7 | Teatro Cappuccina | Cúpula vermelha | 161,46 |
| 8 | Isola Bananini | Ilha das bananas | 297,107 |
| 9 | Anelli di Saturno | Mar aberto (o jogo desenha Saturno) | 288,38 |
| 10 | Strada del Nonno | Estrada com o carrinho vermelho | 176,86 |

## O que se mexe

- Brilhos no mar aberto (sorteados sobre a água da arte), sombras de nuvens e uma barbatana de tubarão rondando o farol.
- Um mini Bombardiro dando voltas sobre a pista das montanhas, com rastro de fumaça.
- Holofotes varrendo o céu a partir da cúpula do teatro.
- No mapa de reserva (sem arte) também aparecem os ponteiros do deserto, o vapor da xícara e os troncos do Tung na aldeia; na arte, esses marcos já estão desenhados.
- **Saturno:** um portal brilhando, um anel girando com a cabeça da vaca (olhos piscando em roxo) e **raios roxos** pulsando na direção de cada local ainda hipnotizado.
- **Marcadores:** vermelho na casa do jogador, bandeiras verdes nos locais libertados, anéis roxos pulsantes nos hipnotizados e uma seta branca quicando no destino.
- **Viagem:** uma trajetória em arco com rastro pontilhado, percorrida pelo aviãozinho carregando o sprite do jogador em miniatura.
- **Barra inferior:** "PRÓXIMA PARADA", o nome do lugar, o retrato do rival e "DESAFIO N/7" (ou "CHEFE FINAL"). O narrador diz "*Próxima parada: …*".

A cena dura 220 frames (cerca de 3,7 s). **Enter** pula depois dos primeiros 24 frames.
