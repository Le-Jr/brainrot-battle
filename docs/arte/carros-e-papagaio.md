# Carros e papagaio — arte e direção de áudio

Os três carros têm cinco desenhos independentes: íntegro, dano leve, médio, severo e sucata. O papagaio tem repouso, duas articulações de fala, piscada e susto. Os prompts completos de `image_gen` estão em `assets/bonus-art/prompts.json`; cada variante usa a mesma imagem-base como referência.

`node tools/process-bonus-art.js` recorta a transparência, reduz com vizinho mais próximo, ancora as bases e grava `public/atlases/bonus-*.png`. O motor carrega os atlases na inicialização e mantém o desenho procedural como fallback. As colisões, HP e limiares de dano dos carros permanecem os mesmos. Os PNGs originais ficam locais em `assets/bonus-art/`, ignorados pelo Git.

## Diagnóstico do áudio atual

O papagaio usa `speechSynthesis`, papel `pt`, pitch 1,9 e velocidade 1,12. A voz depende das vozes instaladas no navegador. `VO.say` cancela a fala em andamento, então as reações de dano do carro cortam o bordão; o temporizador visual de 150 quadros não representa a duração real do áudio. O bordão é repetido a cada 520 quadros, inclusive podendo começar durante o encerramento.

## Recomendação

Usar um banco de clipes locais: áudio original identificado para o bordão e gravações expressivas para frases novas. Falas fixas podem ser geradas uma vez, revisadas e servidas junto ao jogo. Isso mantém a mesma interpretação entre navegadores e elimina latência de geração durante o combate. O áudio original ainda depende de receber o link ou arquivo exato e definir a atribuição/licença do clipe escolhido; ele não foi incluído nesta atualização.

Para frases novas, testar uma voz de personagem brasileira, aguda e levemente rouca, com pausas exageradas e risada curta. Não apenas elevar o pitch de um narrador neutro. Opções pesquisadas em 25/10/2026:

- [ElevenLabs](https://elevenlabs.io/docs/pt/overview/capabilities/text-to-speech): modelos expressivos, direção emocional e design de voz. Experimentar Eleven v4 ou v3 e comparar a interpretação em português. É minha primeira opção para gravar as piadas previamente.
- [Cartesia Sonic](https://www.cartesia.ai/pt/sonic): português, expressão emocional e risadas; opção para avaliar caso surjam falas dinâmicas durante o jogo.

O resultado cômico precisa de audição e comparação; a lista acima não é uma avaliação auditiva das vozes. Nenhum serviço pago foi conectado e nenhuma chave é necessária para executar o jogo atual.

## Próxima lógica proposta

1. Um canal de voz com prioridade: encerramento > reação importante > bordão ambiente. Não sobrepor falas; descartar bordões vencidos em vez de acumulá-los.
2. Bordão apenas na fase ativa, no máximo duas execuções por rodada, com intervalo mínimo de 12 segundos e sem repetir o mesmo clipe em sequência quando houver variantes.
3. Iniciar bico e legenda no evento real de reprodução; parar em `ended`, erro ou interrupção. Usar o volume instantâneo do clipe para controlar a abertura do bico.
4. Reduzir a música durante a fala e restaurá-la suavemente depois. Volume de voz separado dos efeitos e respeito ao botão de narrador.
5. Pré-carregar os clipes após interação do jogador. Se faltarem, usar a voz do navegador como fallback; impedir que uma solicitação atrasada toque após sair da cena.
6. Se houver API no futuro, gerar no servidor com cache por texto/voz/versão. Nunca colocar a chave no cliente. Para este conjunto pequeno de falas, preferir geração prévia.
