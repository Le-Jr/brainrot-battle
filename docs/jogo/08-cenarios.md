# 08 · Cenários

São 13 cenários pintados em código quando o jogo carrega: 10 de luta e 3 das fases bônus. Cada um tem a própria música e animações (pássaros, luzes, vapor, chuva…). A técnica de pintura está em [../tecnico/04-pintura-de-cenarios.md](../tecnico/04-pintura-de-cenarios.md).

<p align="center"><img src="../../assets/readme/stages.png" width="100%" alt="Os 13 cenários com lutas acontecendo"></p>

Código: [`src/game/stages/`](../../src/game/stages), um arquivo por cenário.

| # | Arquivo | Nome | Música | Destaques | Animado |
|---|---------|------|--------|-----------|---------|
| 0 | `beach.js` | Spiaggia | `beach` | Pôr do sol com faixas, reflexo no mar, farol, palmeiras, guarda-sol, posto de salva-vidas, areia molhada | Brilho do mar, gaivotas, linha de espuma |
| 1 | `piazza.js` | Piazza | `piazza` | Céu noturno e lua, cúpula e torre, fachadas italianas com venezianas e sacadas, toldos, paralelepípedos, poças de luz quente | Estrelas piscando, varal de lâmpadas |
| 2 | `jungle.js` | Giungla | `jungle` | Raios de sol, copas em camadas, cachoeira com névoa, troncos gigantes, cipós, flores, cogumelos | Água da cachoeira, borboletas |
| 3 | `desert.js` | Deserto | `desert` | Sol do entardecer, mesas, ruína com relógio, cactos, dunas, caveira | Ponteiros do relógio, bola de feno, calor tremulando |
| 4 | `cafe.js` | Caffè | `cafe` | Papel de parede, lousa com o cardápio ("ASSASSINO … ?"), prateleiras com xícaras e garrafas, máquina de espresso cromada, piso xadrez | Neon "ESPRESSO", vapor, cones de luz das luminárias |
| 5 | `villaggio.js` | Villaggio | `sahur` | Lua crescente, silhueta de mesquita, palmeiras, casas de palafita, tambor bedug | Lanternas balançando, vaga-lumes |
| 6 | `cielo.js` | Cielo | `march` | Céu de grande altitude com brilho do sol, mar de nuvens, deck de aviação com o círculo tricolor | Nuvens passando, linhas de vento |
| 7 | `teatro.js` | Teatro | `waltz` | Castelo pintado ao fundo, estrelas penduradas, cortinas de veludo, sanefa dourada, palco envernizado | Holofotes varrendo, ribalta, cabeças da plateia |
| 8 | `piantagione.js` | Piantagione | `banana` | Vulcão com neve, mar, fileiras de bananeiras com cachos, caixotes | Pássaros |
| 9 | `saturno.js` | Saturno | `boss` | Nebulosas, campo de estrelas, a Terra, Saturno com o anel na frente e atrás do planeta, asteroides, chão de crateras | Brilhos, estrela cadente, poeira do anel |
| 10 | `strada.js` | Strada | `bonus` | Prédios em tons pastel, colinas com ciprestes, vespa, calçada, asfalto | Varais de roupa |
| 11 | `cyber.js` | Neon Città | `cyber` | Sol synthwave, skyline em neon, piso de grade neon | Letreiros piscando ("MEME", "RIZZ", "SIGMA"), chuva |
| 12 | `byd.js` | Vila Brasilini | `byd` | Morro de casinhas coloridas, estátua no alto do morro, concessionária "ELÉTRICOS", **calçadão de ondas de Copacabana** | Pássaros (e o papagaio, veja [09](09-fases-bonus-e-memes.md)) |

## Onde cada cenário aparece

- **História:** cada rival luta na própria casa; o chefe luta em Saturno.
- **Versus:** o jogador escolhe qualquer um dos 13 na tela de escolha do cenário (ou ALEATÓRIO, entre os 10 de luta).
- **Treino:** um dos cenários 0 a 10, sorteado.
- **Bônus:** Strada (Nonno), Neon Città (Cybercaminhão) e Vila Brasilini (Bi-ai-di).
- **Título:** os anéis de Saturno, escurecidos, com a câmera passeando devagar.
