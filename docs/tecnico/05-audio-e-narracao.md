# 05 · Áudio, música e narração

Todo o som é sintetizado na hora: **não existe nenhum arquivo de áudio** no projeto. O `AudioContext` é criado na primeira tecla ou clique (`AU.init()`), porque os navegadores bloqueiam áudio antes de uma interação.

Código: [`src/game/audio/`](../../src/game/audio).

| Arquivo | Conteúdo |
|---------|----------|
| `synth.js` | `AU`: o sintetizador, o sequenciador e os efeitos sonoros |
| `tracks.js` | As 21 músicas, os padrões de baixo e a leitura de notas e acordes |
| `voice.js` | `VO`: o narrador por síntese de voz |
| `announcer.js` | `hype()`: as falas do locutor com plateia e buzina |

## Cadeia de sinal

```
vozes ─► bus do lead ─┬─► ganho da música (mg) ─► master ─► compressor ─► saída
                      ├─► delay (210 ms, realimentação 0,22)
                      └─► reverb de convolução (resposta de 1,1 s gerada)
baixo/bateria/pad ───────► mg
efeitos (SFX) ───────────► sg ─► master
```

## Instrumentos

O som "arcade" vem de vozes **FM de 2 operadores**, a família de chips Yamaha YM2151 usada nos arcades dos anos 90.

| Nome | Técnica | Som |
|------|---------|-----|
| `brass` | FM r=1, índice 2,6→1,1 | Metais estilo SF2 |
| `synlead` | FM r=2 com portadora dente-de-serra, filtrado | Lead brilhante |
| `epiano` | FM r=1 mais um "tine" r=14 | Piano elétrico |
| `organ` | Aditivo (quadrada + senoides + triangular) | Órgão do chefe |
| `flute` | Triangular + ruído de sopro | Valsa e história |
| `reed` | FM r=2, índice alto | Faixas árabes e de encantador de serpente |
| `accord` | Duas quadradas desafinadas | Acordeão da tarantela |
| `steel` | FM r=2,76, decaimento rápido | Steel drum (calipso) |
| `pluck` | FM r=3, curto | Gancho de funk carioca |
| Baixo `slap` | FM r=1, índice 5,5→0,6 em 35 ms | Slap clássico |
| Baixo `upright`, `808`, `saw` | | Jazz, funk carioca, padrão |
| Bateria | Bumbo senoidal, caixa de ruído filtrado, chimbal, palma, tons, clave, prato | |
| `ohit` | Acorde FM + rajada de ruído | Orchestra hit |
| Pad | 3 notas em dente-de-serra desafinadas, ataque lento | Cordas |

## Formato das músicas

```js
nome: {
  bpm, spb /* passos por compasso: 16 ou 12 */, sw /* swing */,
  lw /* instrumento do lead */, bw /* do baixo */, bp /* padrão de baixo */, pad /* cordas */,
  chords: ['Am', 'F', …],                 // um acorde por compasso
  lead: ['A4 - C5 E5 A5 - G5 E5', …],     // colcheias por compasso: '-' segura, '.' pausa
  dr: { k, s, h, o, t, w, c, x, l },      // trilhas de bateria de 16 passos
}
// k bumbo, s caixa, h chimbal, o chimbal aberto, t tom, w clave, c prato, x orchestra hit, l palma
```

Os padrões de baixo (`BP`) são 16 intervalos em semitons a partir da tônica de cada acorde (`funk`, `rock`, `drive`, `gallop`, `walk`, `march`, `arab`, `saw16`, `sub`, `dark`, `tar`, `waltz`, `calypso`, `tribal`, `oct`). O sequenciador olha 140 ms à frente e roda a cada 25 ms. A cada 8 compassos entra uma virada de caixa (menos nas faixas de história).

## As 21 músicas

| Faixa | Onde toca | Estilo |
|-------|-----------|--------|
| `title` | Título | Hino épico em lá menor, 16 compassos, orchestra hits |
| `select` | Seleção | Funk em ré menor, baixo slap |
| `beach` | Spiaggia | Surf-funk em mi menor |
| `piazza` | Piazza | Tarantela em 12/8 (acordeão) |
| `jungle` | Giungla | Metais tribais, viradas de tom |
| `desert` | Deserto | Frígio dominante com palheta |
| `cafe` | Caffè | Jazz noir com swing e walking bass |
| `sahur` | Villaggio | Percussão do Oriente Médio |
| `march` | Cielo | Marcha militar |
| `waltz` | Teatro | Valsa de balé em menor, 3/4 |
| `banana` | Piantagione | Calipso com steel drum |
| `boss` | Saturno | Órgão, orchestra hits, baixo galopante |
| `bonus` | Strada (carro do Nonno) | Rock empolgado |
| `cyber` | Neon Città (Cybercaminhão) | Synthwave |
| `byd` | Vila Brasilini (Bi-ai-di) | Funk carioca (tamborzão) |
| `travel` | Mapa | Loop de viagem animado |
| `story` | Cutscenes | Flauta e cordas lentas |
| `drama` | Prólogo | Metais lentos em dó menor, tímpanos |
| `ending` | Final | Metais triunfantes |
| `win` | Resultado | Vinheta que toca uma vez |
| `cont` | Continue | Loop triste |

## Efeitos sonoros

`AU.sfx(nome)`: `hitL` `hitH` `block` `whoosh` `jump` `land` `special` `ex` `super` `boom` `ko` `blip` `ok` `freeze` `tung` `vs` `glass` `crack` `metal` `levelup` `throw` `crowd` `horn` `slam` `squawk`.

## Narração

| Papel | Idioma | Usado em |
|-------|--------|----------|
| `ann` | Inglês | Locutor ("Round one!", "Fight!", "K.O.!", combos) |
| `pt` | Português | Cutscenes, mapa, memes das fases bônus |
| `it` | Italiano | Nomes dos personagens, falas de vitória, gritos do Super |

- **Escolha da voz:** `VPREF` ordena as vozes instaladas, preferindo as neurais ("Natural" no Edge, as do Google no Chrome). O jogador pode trocar a voz de cada papel em **OPÇÕES**, e a escolha fica salva em `brb_voice`.
- **Correções de confiabilidade:** as falas entram numa fila em vez de cortar a anterior; depois de um `cancel()`, a próxima fala espera 110 ms (o Chrome descarta falas emitidas logo após um cancelamento); as referências das falas ficam guardadas para não serem coletadas pelo *garbage collector*; e um vigia retoma a fila se ela pausar ou travar.
- **Locutor:** `hype(chave)` sorteia uma frase de `HYPE` e toca o som de plateia (ou a buzina no "Fight!").
- **Limitação:** a qualidade depende das vozes instaladas no aparelho. No celular costumam ser mais robóticas.
