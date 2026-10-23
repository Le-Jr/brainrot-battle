# 04 · Sistema de combate

O combate imita o *feeling* de *Street Fighter II*: rodando sempre a 60 atualizações por segundo, com golpes que têm início, frames ativos e recuperação, defesa alta/baixa, correntes, cancelamentos em especial, juggle e uma barra de especial com três níveis de uso.

Código: [`src/game/combat/`](../../src/game/combat).

## Rounds

- Cronômetro de **99 segundos**. Vence quem ganhar **2 rounds** (no máximo 5 rounds, se houver empates).
- **K.O.** dispara uma câmera lenta de 80 frames antes do fim do round.
- **Tempo esgotado:** vence quem tiver mais vida; vida igual dá empate.
- **Perfeito:** vencer o round com a vida cheia. O locutor anuncia e o XP ganho aumenta.

## Golpes normais

Tempos em frames (60 por segundo). O dano é multiplicado pela **força** do atacante e dividido pela **defesa** de quem apanha.

| Golpe | Comando | Início / ativo / recuperação | Dano | Altura | Notas |
|-------|---------|------------------------------|------|--------|-------|
| Soco | Soco | 3 / 3 / 8 | 5 | média | Rápido, começa correntes |
| Chute | Chute | 6 / 4 / 13 | 8 | média | Pesado |
| Soco agachado | ↓ + Soco | 3 / 3 / 8 | 4 | média | |
| Rasteira | ↓ + Chute | 6 / 4 / 16 | 7 | **baixa** | Derruba |
| Soco no ar | Soco no pulo | 3 / 7 | 6 | **alta** | |
| Chute no ar | Chute no pulo | 4 / 9 | 8 | **alta** | |
| Soco forte | → + Soco | 8 / 4 / 15 | 10 | **alta** | Investe para frente, alcance +8 px |
| Uppercut | → ↓ ↘ + Soco | 3 / 9 / 30 | 11 | média | Invencível nos primeiros frames, lança para juggle |
| Agarrão | Perto + → + Chute | – | 13 | indefensável | Só funciona com os dois no chão |

## Defesa

- Segure **para trás** para defender. Golpes **baixos** só são defendidos agachado; golpes **altos** só em pé; os **médios** de qualquer jeito.
- Defender gasta um pouco de vida nos especiais (**chip damage**, 1 ponto, sem nunca matar) e empurra os dois lutadores.
- No ar não dá para defender.

## Combos

| Mecânica | Como funciona |
|----------|---------------|
| **Correntes** | Quando um golpe encosta no rival (acertando ou sendo defendido), apertar outro botão emenda o próximo golpe na hora. Tabela em [03-controles-e-comandos.md](03-controles-e-comandos.md#correntes-e-cancelamentos). |
| **Cancelamento** | Soco, soco agachado, chute e soco forte podem ser cancelados num especial, EX ou Super assim que conectam. Aparece um anel azul no lugar. |
| **Buffer** | O último botão fica guardado por 10 frames. |
| **Juggle** | O uppercut lança o rival e deixa mais **2 acertos** no ar. Fora isso, qualquer golpe no ar derruba. |
| **Escalonamento** | Cada acerto do combo causa `max(30%, 100% − 11% × acertos já recebidos)` do dano. Combos longos perdem força. |
| **Locutor** | Aos 3, 5, 7 e 10 acertos aparecem **COMBO!**, **SUPER COMBO!**, **ULTRA COMBO!** e **BRAINROT COMBO!!**. |

## Barra de especial

- Acertar enche `dano × 1,3`, apanhar enche `dano × 0,8`. Defender também dá um pouco (+3 para quem atacou, +2 para quem defendeu).
- **50%** paga um **EX** (↓ ↘ →). **100%** dispara o **Super** (basta apertar Especial com a barra cheia).
- A barra pisca nas cores do arco-íris quando está em MAX.

## Especiais

Só um projétil de cada lutador fica na tela por vez. Projéteis que se chocam se anulam (bombas e meteoros explodem).

| Tipo | Dono | Normal | EX | Super |
|------|------|--------|----|-------|
| `wave` | Tralalero | Onda (10 de dano) | Derruba | Onda gigante (24), derruba |
| `bat` | Tung | Investida com o taco (12) | Até 2 acertos | Até 3 acertos rápidos |
| `bomb` | Bombardiro | Bomba em arco (11), explode no chão | 2 bombas | 3 bombas |
| `spin` | Ballerina | Pirueta com até 4 acertos (4 cada) | Até 5 acertos | Até 6 acertos (5 cada) |
| `quake` | Patapim | Onda de terra **baixa** (11) | Mais rápida | Gigante (24) |
| `banana` | Chimpanzini | Bananarangue que volta (9) | Mais rápido | Gigante (22), derruba |
| `slash` | Assassino | Some, reaparece atrás do rival e corta (12) | Mais dano | Corte de 28 |
| `clock` | Lirilì | Relógio lento que **congela** o rival por 52 frames (7) | Congela 70 frames | Congela 90 frames (18) |
| `ring` | Saturnita | Anel cósmico (11) | Mais rápido | **Chuva de 3 meteoros** sobre o rival |

## Hitboxes medidas dos sprites

As caixas de colisão saem do próprio desenho, para que o golpe acerte onde ele aparece:

1. **Hurtbox (corpo):** o retângulo opaco da pose parada, encolhido 12% de cada lado. A altura agachado vem da pose agachada.
2. **Caixa de ataque:** os pixels da pose de ataque que passam da frente do corpo. A caixa vai do corpo até o pixel mais distante, numa faixa em volta da ponta do membro.
3. Se uma pose não tem membro visível, o jogo usa os valores reserva de `ATK`.
4. A **separação** entre os lutadores usa os centros das hurtboxes, então ninguém fica um dentro do outro.

Aperte **Tab** em qualquer luta para ver as hurtboxes em azul e as caixas de ataque ativas em vermelho.

## Sensação de impacto

- **Hit-stop:** 4 frames na defesa, 6 num acerto leve e 9 num acerto pesado.
- **Tremor de tela** proporcional ao golpe (desligado com "reduzir movimento").
- Faíscas, anel de impacto, texto flutuante, rastro do golpe (*smear*) e flash branco no lutador atingido.
- **EX:** flash azul-claro na tela. **Super:** a tela escurece e aparece uma faixa na cor do personagem com o nome do golpe.

## IA dos oponentes

A CPU decide de tempos em tempos (o "tempo de reação") e segue regras por nível:

| Nível | Reação (frames) | Chance de defender | Agressividade | Uso de especial | Anti-aéreo | Continua correntes |
|-------|-----------------|--------------------|---------------|-----------------|------------|--------------------|
| Fácil | 24 a 48 | 22% | 35% | 25% | 8% | 15% |
| Normal | 14 a 28 | 50% | 55% | 35% | 30% | 45% |
| Difícil | 7 a 14 | 78% | 72% | 45% | 55% | 80% |

Ela também:

- defende **alto ou baixo** conforme o golpe que está vindo (e decide uma vez por ameaça);
- usa o **uppercut como anti-aéreo** quando você pula perto;
- **agarra** quando você fica colado;
- continua as próprias correntes (soco → chute/soco forte, soco agachado → rasteira, chute → especial ou uppercut);
- gasta a barra em **EX e Super**;
- fica mais forte ao longo da campanha (bônus de `+12%` de defesa e `+10%` de correntes por ponto de *boost*).
