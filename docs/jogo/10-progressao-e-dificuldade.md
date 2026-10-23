# 10 · Progressão, XP e dificuldade

Código: [`src/game/progression/xp.js`](../../src/game/progression/xp.js) e [`src/game/scenes/flow.js`](../../src/game/scenes/flow.js).

## Níveis

Cada personagem tem o próprio XP, salvo no navegador (`localStorage`, chave `brf_xp_v1`).

```
nível(xp) = min(10, 1 + floor(sqrt(xp / 120)))
xp necessário para o nível n = (n − 1)² × 120
```

| Nível | XP total | | Nível | XP total |
|-------|----------|-|-------|----------|
| 1 | 0 | | 6 | 3.000 |
| 2 | 120 | | 7 | 4.320 |
| 3 | 480 | | 8 | 5.880 |
| 4 | 1.080 | | 9 | 7.680 |
| 5 | 1.920 | | 10 | 9.720 |

Cada nível soma **+2,5% de força e +2,5% de defesa**. Um lutador no nível 10 tem 22,5% a mais nos dois atributos.

## XP por luta

```
XP = rounds vencidos × 40
   + (venceu ? 120 + dificuldade × 40 : 30)
   + rounds perfeitos × 80
   + max(0, maior combo − 2) × 15
   + 400 se derrotou o chefe
```

- No **versus 2P**, os dois jogadores ganham XP. No **versus CPU**, só o jogador; a CPU luta com o mesmo nível de XP do lutador do jogador.
- As **fases bônus** pagam à parte (veja [09-fases-bonus-e-memes.md](09-fases-bonus-e-memes.md#xp)).
- O "LEVEL UP!" aparece na tela de resultado, com som e a voz do locutor.

## Dificuldade

Escolhida em **OPÇÕES** (Fácil, Normal, Difícil). Ela define o nível da IA dos rivais (veja a tabela em [04-sistema-de-combate.md](04-sistema-de-combate.md#ia-dos-oponentes)) e o XP de vitória.

## Curva da campanha

| Luta | IA | Boost da IA | Nível do rival |
|------|----|-------------|----------------|
| Rival 1 a 7 | a dificuldade escolhida | `luta / 6` (0 a 1) | 1 a 7 |
| Chefe | sempre **Difícil** | `0,6 + dificuldade × 0,3` | 2 / 5 / 8 |

O jogador luta com o nível de XP do personagem escolhido. Farmar XP nas fases bônus é o jeito de compensar uma dificuldade alta.
