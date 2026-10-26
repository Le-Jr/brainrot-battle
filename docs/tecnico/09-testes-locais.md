# Painel local de testes e God Mode

Abra o jogo em `http://localhost:3000` com `npm run dev` (ou no endereço local de `npm run start`). Clique em **TESTES (F2)** acima do jogo ou pressione **F2**. Não precisa terminar a campanha nem usar o console do navegador.

O painel só fica disponível nos hosts `localhost`, `127.0.0.1` e loopback IPv6. Um domínio publicado ou IP da rede local não recebe o botão, os atalhos ou a instalação do inspetor. Não existe parâmetro de URL para contornar isso.

## Acesso imediato à última fase

1. Abra o painel com **F2**.
2. Confirme **LUTA FINAL · FASE 2**, o primeiro item, com **Enter**.
3. Você joga como **Bri Bri** contra a Mega Vaca. A luta começa com **God Mode**, **especial infinito** e **relógio parado**, por padrão.

Para assistir à transformação antes da luta, escolha **CUTSCENE MEGA BRAIN**. Para ver a libertação do planeta e o final do personagem, escolha **DESFECHO / SALVAÇÃO**.

## Navegação

- **Tab**, **Q**, **E** ou o botão virtual **Chute** alternam entre **Destinos**, **Ajustes** e **Áudio**.
- **↑/↓** ou **W/S** escolhem o item; a lista rola para mostrar os demais.
- **←/→** ou **A/D** alteram valores. **Enter**, **Soco** ou o botão virtual **Especial** confirmam.
- **F2**, **Esc** ou **Start** fecham o painel e retomam a mesma cena, sem reiniciá-la.

## Destinos

- Saturnita fase 1, luta final fase 2, transformação e desfecho.
- Luta livre com personagem, rival e cenário selecionados; treino.
- Cybertruck, Nonno e Bi-ai-di, com os sprites, reações e resultados reais.
- Mapa, prólogo do personagem, intro do jogo, créditos e menu principal.
- Durante uma luta normal: **vencer**, **perder** e **reiniciar** a luta atual. Vencer/perder passa pela tela real de resultado e pelo Continue, quando aplicável.

## Ajustes

Selecione jogador (incluindo Bri Bri), rival, cenário, nível do jogador (1–10) e dificuldade. Esses valores valem ao abrir o próximo destino; as opções de God Mode, especial infinito, relógio parado, IA ativa e hitboxes também se aplicam à luta atual.

God Mode impede dano, chip e K.O. do jogador 1. A IA pode ser desligada separadamente; projéteis já lançados e os ataques ambientais da fase final continuam existindo, permitindo inspecioná-los. Desative God Mode para testar dano e reações do jogador. Use o comando **perder luta atual** para chegar ao Continue imediatamente.

Ao abrir um destino sem configurar opções, os três recursos principais são ligados automaticamente. Se você já tiver alterado uma opção, suas escolhas serão preservadas.

## Música e vozes

A aba **Áudio** permite ouvir todas as músicas do sintetizador, incluindo `ascension` e `laststand`, e testar locutor, narração e o nome do jogador selecionado. O volume e o botão de música continuam sendo respeitados.

## Progresso isolado

A sessão usa uma cópia do XP em memória. Ganhos e níveis aparecem normalmente nas telas, mas não são escritos no `localStorage`. O rótulo **F2 TESTES · XP ISOLADO** permanece visível durante os testes.

Em **Ajustes → Encerrar testes**, as opções são desligadas, o XP e o estado da campanha anteriores são restaurados e o jogo volta ao menu principal. Fechar o painel apenas retoma o jogo, mantendo os testes ativos. Recarregar a página descarta a sessão de teste.

## Verificação

```sh
npm run test:local
```

`tests/local-tests.js` verifica o bloqueio por hostname, a pausa sem reinício, o acesso à fase 2, God Mode, especial e relógio, o Continue, os destinos e o isolamento de XP. `tools/review-local-tests-browser.js` valida o build em Chromium na porta 3011, incluindo o layout móvel e um hostname não local.

Em **Ajustes → Bri Bri (teste)**, você pode liberar temporariamente o nono slot da seleção. O desbloqueio também fica isolado: somente vencer a segunda forma numa campanha normal libera o personagem de forma permanente. A luta final da história sempre usa Bri Bri; na luta livre do painel, você pode escolher outro lutador para enfrentar a Mega Vaca.
