# Sprites e artefatos animados — regeneração

O checkup identificou caminhada de dois desenhos, agachamento por compressão da pose parada, ataques sem recuperação própria e projéteis desenhados com primitivas. Esta atualização usa os nove personagens existentes como referência de identidade.

Os prompts completos estão em [`assets/sprite-art/prompts.json`](../../assets/sprite-art/prompts.json). A ferramenta usada é `image_gen`, com fundo transparente. Cada personagem tem uma pose de referência (`reference.png`, extraída do atlas anterior), um novo `idle.png` e poses geradas a partir desse idle fixo. Não encadear referências de um quadro para outro.

Cada quadro combina `style`, a descrição de `characters[id]` e a instrução de `poses[pose]`. Preservar rosto, anatomia, paleta e acessórios. Os quadros são revisados juntos antes de empacotar o atlas.

Conjunto: idle; caminhada em quatro fases; soco e chute com preparação, impacto e recuperação; agachamento; defesa; pulo; preparação e liberação do especial; reação de acerto; caído; vitória.

Artefatos: onda do Tralalero, bomba e explosão do Bombardiro, banana do Chimpanzini, relógio do Lirilì, anel e meteoro da Saturnita e terremoto do Patapim. Taco, katanas e acessórios permanecem nos sprites dos respectivos personagens.

Os originais ficam em `assets/sprite-art/<id>/` e os arquivos consumidos pelo jogo em `public/atlases/`.

Entrega de 25/10/2026: 171 quadros de personagens e 24 quadros de artefatos, integrados ao motor. A bomba solta foi removida do quadro de disparo do Bombardiro para evitar duplicação; o enquadramento do chute foi ampliado para garantir alcance mensurável. Os golpes baixos e aéreos ainda usam transformações dos novos quadros de ataque, e a queda usa rotação da reação de acerto.

`npm run sprites` e `npm run sprites:projectiles` reempacotam os originais locais. `node tools/render-sprite-art.js` cria a prévia animada em `output/sprite-art/preview.html` e o inventário com SHA-256 em `docs/arte/geracao-sprites-2026-10-25.json`. Os PNGs originais de alta resolução são locais e ignorados pelo Git; atlases e folhas empacotadas são versionados.
