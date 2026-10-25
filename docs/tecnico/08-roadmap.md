# 08 · Limitações conhecidas e roadmap

## Limitações conhecidas

| Área | Limitação | Caminho possível |
|------|-----------|------------------|
| Animação | Os personagens têm 19 quadros próprios, incluindo caminhada de quatro fases, ataques com três fases e agachamento. Ataques baixos/aéreos e quedas ainda usam transformações. | Acrescentar quadros específicos de rasteira, ataques aéreos e queda. |
| Vozes | A síntese de voz depende das vozes instaladas; no celular costumam ser robóticas. | Gravar ou licenciar falas e tocá-las de `public/audio/`. |
| Áudio dos memes | Os clipes originais do TikTok não são usados. | Tocar arquivos fornecidos no lugar da voz sintetizada. |
| Tempo de boot | Cerca de 0,4 s para pintar os 13 cenários (já escondido pela tela de carregamento animada). | Pré-renderizar os cenários para PNG no build. |
| Mapa | Ainda em resolução 1×. | Repintar com o kit HD dos cenários. |
| Online | Só versus local. | Netcode com rollback sobre WebRTC (precisa de servidor de sinalização). |
| Controles | Só teclado e toque. | Gamepad API (veja [07-guia-de-extensao.md](07-guia-de-extensao.md#gamepad-exemplo-de-integração)). |
| Elenco | Tela de seleção e campanha fixas em 8 lutadores. | Generalizar a grade e os contadores (veja o guia de extensão). |
| Tipos | O motor é JavaScript. | Migrar módulo a módulo para TypeScript, começando por `core/`, `combat/constants.js` e `state.js`. |

## Ideias

- Normais de comando por personagem e um segundo especial (por exemplo, com meia-lua para trás).
- Interrupções "Here comes a new challenger!" no meio da campanha (a frase já existe em `HYPE.challenger`).
- Finais ilustrados com arte em tela cheia.
- Cores alternativas liberadas por nível e um personagem secreto depois de vencer o chefe no difícil.
- Gravação de replays (as entradas já são determinísticas por quadro, menos a aleatoriedade da IA).
- Modo galeria: sprites, teste de músicas e visualizador de cutscenes.
- Placar de recordes por personagem (maior combo, menor tempo na campanha).
- PWA para jogar offline e instalar no celular.
