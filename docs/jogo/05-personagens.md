# 05 · Personagens

Oito lutadores jogáveis e um chefe. Todos usam sprites HD desenhados à mão (veja [../tecnico/03-renderizacao-e-sprites.md](../tecnico/03-renderizacao-e-sprites.md)).

Código: [`src/game/characters/`](../../src/game/characters), um arquivo por lutador em `fighters/`.

## Atributos

Os atributos são multiplicadores: **VEL** é a velocidade de caminhada em px/frame; **FOR**, **DEF** e **ALC** multiplicam o dano causado, dividem o dano recebido e esticam o alcance dos golpes. Cada nível de XP soma **+2,5%** de força e de defesa.

| Lutador | VEL | FOR | DEF | ALC | Especial | Casa |
|---------|-----|-----|-----|-----|----------|------|
| <img src="../../assets/readme/chars/tralalero.png" width="72" alt=""> **Tralalero Tralala** | 1,7 | 1,0 | 1,0 | 1,0 | ONDA TRALALA | Spiaggia |
| <img src="../../assets/readme/chars/tung.png" width="72" alt=""> **Tung Tung Tung Sahur** | 1,5 | 1,15 | 0,95 | 1,25 | TACO SAHUR | Villaggio |
| <img src="../../assets/readme/chars/bombardiro.png" width="72" alt=""> **Bombardiro Crocodilo** | 1,3 | 1,2 | 1,1 | 1,1 | BOMBA | Cielo |
| <img src="../../assets/readme/chars/ballerina.png" width="72" alt=""> **Ballerina Cappuccina** | 2,0 | 0,85 | 0,9 | 1,0 | PIRUETA | Teatro |
| <img src="../../assets/readme/chars/patapim.png" width="72" alt=""> **Brr Brr Patapim** | 1,4 | 1,1 | 1,05 | 1,15 | TERREMOTO | Giungla |
| <img src="../../assets/readme/chars/chimp.png" width="72" alt=""> **Chimpanzini Bananini** | 1,9 | 0,9 | 0,95 | 0,9 | BANANARANGUE | Piantagione |
| <img src="../../assets/readme/chars/assassino.png" width="72" alt=""> **Cappuccino Assassino** | 1,9 | 1,0 | 0,9 | 1,15 | TELEPORTE | Caffè |
| <img src="../../assets/readme/chars/lirili.png" width="72" alt=""> **Lirilì Larilà** | 1,2 | 1,2 | 1,2 | 1,1 | RELÓGIO | Deserto |
| <img src="../../assets/readme/chars/saturnita.png" width="72" alt=""> **La Vacca Saturno Saturnita** (chefe) | 1,35 | 1,3 | 1,45 | 1,3 | ANEL CÓSMICO | Saturno |

## Fichas

### Tralalero Tralala
Tubarão de tênis com três pés, dono da Spiaggia Tralalà. Equilibrado e rápido, com um projétil confiável.
- **Especial:** onda que viaja pelo chão. **Super:** onda gigante que derruba.
- **Bordão:** *"Tralalero tralala! Le mie scarpe corrono piu veloci di te."*

### Tung Tung Tung Sahur
Tronco de madeira com um taco, que acorda a aldeia para o sahur. Bom alcance e força.
- **Especial:** investida com o taco ("TUNG!"). **Super:** três pancadas seguidas.
- **Bordão:** *"Tung tung tung... hai risposto troppo tardi."*

### Bombardiro Crocodilo
Crocodilo-avião, piloto mais temido da Itália. Lento e forte, controla espaço com bombas.
- **Especial:** bomba em arco que explode ao tocar o chão. **EX:** 2 bombas. **Super:** 3 bombas.
- **Bordão:** *"Missione compiuta. Bombardiro vola via!"*

### Ballerina Cappuccina
Bailarina com cabeça de xícara de cappuccino. A mais rápida do elenco, mas frágil.
- **Especial:** pirueta que avança dando vários acertos. **Super:** até 6 acertos.
- **Bordão:** *"Un passo di danza e sei a terra. Che eleganza!"*

### Brr Brr Patapim
Guardião da floresta com pés enormes e nariz comprido. Resistente e com alcance.
- **Especial:** terremoto que corre pelo chão e precisa ser defendido **agachado**.
- **Bordão:** *"Brr brr patapim! La foresta ha parlato."*

### Chimpanzini Bananini
Macaco que mora dentro de uma banana. Muito rápido, com pouco alcance.
- **Especial:** bananarangue que vai e volta. **Super:** banana gigante que derruba.
- **Bordão:** *"Bananini per tutti! Tranne che per te."*

### Cappuccino Assassino
Copo de café ninja com duas katanas. Não fala quase nada.
- **Especial:** some numa nuvem de fumaça, reaparece atrás do rival e corta. **Super:** corte de 28 de dano.
- **Bordão:** *"Silenzioso come la schiuma. Letale come un espresso."*

### Lirilì Larilà
Elefante-cacto de sandálias que controla o tempo. O mais lento, mas o mais resistente do elenco.
- **Especial:** relógio lento que **congela** o rival, abrindo espaço para um combo.
- **Bordão:** *"Il tempo e mio. Tu sei solo in ritardo."*

### La Vacca Saturno Saturnita (chefe)
Vaca cósmica com o corpo de Saturno, dona do ALGORITMO. Não é jogável.
- **Especial:** anel cósmico. **Super:** chuva de três meteoros em cima do rival.
- No modo história, luta com IA no nível difícil e com nível de personagem 2, 5 ou 8 (conforme a dificuldade).
- **Fala:** *"Muuu... Isto não acabou. O algoritmo sempre volta."*

## Personalidade e voz

Na história, cada personagem fala com um tom de voz diferente (o *pitch* da síntese de voz).

| Personagem | Pitch | Tom nas cutscenes |
|------------|-------|-------------------|
| Tralalero | 1,2 | Marrento e esportivo ("Prepara, que lá vem tênis!") |
| Tung | 0,75 | Sombrio e ritmado ("Tung. Tung. Tung.") |
| Bombardiro | 0,65 | Militar italiano ("Missione ricevuta") |
| Ballerina | 1,6 | Elegante e teatral |
| Patapim | 0,55 | Guardião da terra |
| Chimpanzini | 1,4 | Elétrico e obcecado por banana |
| Assassino | 0,45 | Silencioso: quase todas as falas são "..." |
| Lirilì | 0,85 | Relojoeiro convencido |
| Saturnita | 0,3 | Vaca cósmica megalomaníaca |

## Rivalidades

Algumas lutas têm falas especiais (`RIVAL` em [`story/encounters.js`](../../src/game/story/encounters.js)):

| Quem joga | Contra | Fala |
|-----------|--------|------|
| Ballerina | Assassino | "Você de novo, Assassino?! Desta vez nem o algoritmo vai te proteger de mim!" |
| Assassino | Ballerina | "... Ballerina. Me perdoe. Mais uma vez." |
| Tralalero | Bombardiro | "Bombardiro, você já foi meu parceiro de céu e mar! Volta pra gente!" |
| Chimpanzini | Tung | "Tung, sou eu, o Bananini! A gente dividia banana no sahur, lembra?!" |

## Espelho

Quando os dois jogadores escolhem o mesmo lutador no versus, o 2P aparece com as cores trocadas (os canais RGB são rotacionados).
