# Prompts dos cenários (arte por IA)

Prompts para gerar a arte dos 13 cenários em outra IA de imagem (Midjourney, ChatGPT/DALL·E, Gemini/Imagen, Flux, Leonardo…), no estilo dos sprites e do HUD. A arte gerada vai substituir a pintura procedural, que fica como reserva para cenários sem imagem.

> Os prompts estão em **inglês** porque os geradores de imagem seguem melhor. As explicações estão em português.

## Como gerar

1. **Master primeiro.** Gere o prompt **MASTER** de cada cenário (a cena inteira). Gere 2 a 4 variações e escolha a melhor: ela é a referência de estilo e de composição daquele cenário.
2. **Camadas depois.** Gere as 4 camadas (**SKY**, **FAR**, **MID**, **FLOOR**) **anexando o master como imagem de referência** (image prompt / style reference / "edite esta imagem"). Isso mantém as cores e as formas iguais entre as camadas.
3. **Referência de estilo global (opcional, recomendado):** anexe também a imagem da Tupinicode (selva com o CRT) ou um sprite do jogo (`assets/sprite-sheets/*.png`) como referência de estilo.
4. **Fundo magenta:** FAR, MID e FLOOR devem vir sobre **magenta chapado #FF00FF** em tudo que não for o objeto. O pipeline recorta o magenta e vira transparência. O SKY é opaco (sem magenta).
5. **Proporção:** use a mais larga disponível. Ideal: SKY **16:9**, FAR **2:1**, MID **21:9**, FLOOR **21:9** (ou 3:1). Se a ferramenta só tiver 16:9, tudo bem: as camadas FAR, MID e FLOOR são pedidas **emendáveis na horizontal** (seamless), e o pipeline repete e corta.
6. **Resolução:** gere grande (1920 px de largura ou mais). O pipeline reduz para a grade do jogo (~640 pixels de arte na largura), então peça pixels "grossos" e nítidos.

### Onde salvar

```
assets/stage-art/<id>/master.png
assets/stage-art/<id>/sky.png
assets/stage-art/<id>/far.png
assets/stage-art/<id>/mid.png
assets/stage-art/<id>/floor.png
```

| id | Cenário | id | Cenário |
|----|---------|----|---------|
| `beach` | Spiaggia Tralalà | `cielo` | Cielo Bombardiro |
| `piazza` | Piazza Pizzaiola | `teatro` | Teatro Cappuccina |
| `jungle` | Selva Patapim (Giungla) | `piantagione` | Isola Bananini |
| `desert` | Deserto Tic-Tac | `saturno` | Anelli di Saturno |
| `cafe` | Caffè Assassino | `strada` | Strada del Nonno |
| `villaggio` | Villaggio Sahur | `cyber` | Neon Città |
| | | `byd` | Vila Brasilini |

### Regras de composição (já estão nos prompts)

| Faixa da altura | O que fica ali |
|-----------------|----------------|
| 0–15% | Atrás do HUD (barras de vida e cronômetro): só céu, nada importante. |
| 15–75% | Cenário: silhuetas distantes, prédios, árvores. O centro (35–65% da largura) mais calmo, porque é onde os lutadores ficam. |
| 75% | **Linha do chão.** Tudo do cenário "pousa" aqui. |
| 75–100% | Chão. Os pés dos lutadores ficam em ~91%. Textura rica, mas legível. |

### O que NÃO pintar

O jogo anima por cima: **pássaros, borboletas, vaga-lumes, chuva, partículas, brilho das estrelas**. Também **não coloque texto** em placas e letreiros (as IAs erram as letras); deixe as placas lisas. **Nenhum personagem, pessoa ou animal**: os lutadores ficam na frente.

### Negative prompt (para ferramentas que aceitam)

```
blurry, soft focus, smooth gradients, airbrush, 3D render, photorealistic, vector art, flat design, anti-aliased edges, painterly brush strokes, noise, JPEG artifacts, text, letters, words, logo, watermark, signature, people, characters, animals, birds, UI, frame, border, tilted camera, fisheye, depth of field
```

---

## Bloco de estilo (já incluído em cada prompt)

```
Modern HD pixel art, background for a 2D arcade fighting game (Neo Geo / King of Fighters era, modern indie quality). Side view, flat eye-level camera. Crisp hand-placed pixels, no anti-aliasing, no blur, limited palette (about 48 colors), hue-shifted shading (shadows lean purple #2c164a, highlights lean warm gold #ffecc4), light from the upper left, 1-pixel dark purple outline (#1b1024) on object silhouettes, rich material texture, about 640 art pixels across the full width. No characters, no people, no animals, no text, no UI, no watermark.
```

---

## 0 · Spiaggia Tralalà (`beach`)

Praia do Tralalero ao pôr do sol. Paleta: céu `#1d1450 → #9a3a82 → #e8606a → #ffd486`, mar `#2a76bd`, areia `#f6d49a / #c88a52`. Música surf-funk: clima quente e vibrante.

**MASTER**
```
Modern HD pixel art, background for a 2D arcade fighting game (Neo Geo / King of Fighters era, modern indie quality). Side view, flat eye-level camera. Crisp hand-placed pixels, no anti-aliasing, limited palette, hue-shifted shading (purple shadows, warm gold highlights), light from the upper left, 1-pixel dark purple outline on object silhouettes, about 640 art pixels across the width. No characters, no people, no animals, no text, no UI.
Scene: a tropical Italian beach at sunset. Sky banded from deep indigo to magenta, coral and gold; a big setting sun low on the right third with horizontal cut bands, its golden reflection on a calm blue sea. Distant purple headland with a small lighthouse on the far right. Midground: two curved palm trees on the left and right, a red-and-white striped beach parasol, a wooden lifeguard tower with a red flag, a small wooden beach hut. Ground: golden sand with ripples, scattered shells and pebbles, a wet darker sand band with a white foam line along the top edge of the ground. The ground starts at 75% of the image height. Keep the top 15% clear (sky only) and the center less busy. Wide 21:9 composition.
```

**SKY** (16:9, opaco)
```
[Use the master image as reference.] Modern HD pixel art sky layer only, 16:9, fully opaque. Sunset sky banded from deep indigo at the top through magenta and coral to gold at the horizon, soft thin horizontal clouds lit pink, big setting sun on the right third with horizontal cut bands, calm blue sea below the horizon at 64–75% height with a shimmering golden sun reflection. Subtle ordered dithering between color bands is fine. No land, no objects, no characters, no text.
```

**FAR** (2:1, magenta)
```
[Use the master image as reference.] Modern HD pixel art, far background layer isolated on a flat solid magenta (#FF00FF) background; every empty pixel is pure #FF00FF. Horizontally seamless tileable. A long low purple headland and gentle hills silhouetted against the sunset, occupying 55–75% of the height, slightly hazy and low contrast, with a small white-and-red lighthouse with a glowing lamp on one hill. Crisp pixels, no anti-aliasing, 1-pixel dark purple outline. No characters, no text.
```

**MID** (21:9, magenta)
```
[Use the master image as reference.] Modern HD pixel art, midground layer isolated on flat solid magenta (#FF00FF). Horizontally seamless tileable. Two tall curved coconut palm trees with detailed fronds and coconuts (left and right thirds), a red-and-white striped beach parasol, a wooden lifeguard tower with a red flag, a small wooden beach hut with a thatched roof. All objects stand on an invisible ground line at 78% of the height; keep the center third mostly empty. Warm rim light from the sunset, purple shadows, 1-pixel dark purple outline. No characters, no text.
```

**FLOOR** (21:9, magenta acima do chão)
```
[Use the master image as reference.] Modern HD pixel art, ground layer: flat solid magenta (#FF00FF) above the ground. The beach ground starts at exactly 75% of the image height and fills to the bottom, seen from a slightly elevated side angle. Horizontally seamless tileable. Top edge: a thin white foam line and a band of wet darker sand; below it golden sand with wind ripples, small shells, starfish and pebbles, warm sunset highlights, purple shadows. Readable, not noisy, where the fighters stand (around 90% height). No characters, no text.
```

---

## 1 · Piazza Pizzaiola (`piazza`)

Praça italiana à noite, com varal de luzes. Paleta: céu `#070722 → #2e2468 → #a85a7e`, fachadas terracota `#c8704a`, ocre `#e0a060`, venezianas verdes `#2f6b4a`, janelas acesas `#ffcf6a`. Clima de tarantela, aconchegante.

**MASTER**
```
Modern HD pixel art, background for a 2D arcade fighting game (Neo Geo / King of Fighters era, modern indie quality). Side view, flat eye-level camera. Crisp hand-placed pixels, no anti-aliasing, limited palette, hue-shifted shading (purple shadows, warm gold highlights), light from the upper left, 1-pixel dark purple outline on object silhouettes, about 640 art pixels across the width. No characters, no people, no animals, no text, no UI.
Scene: a cozy Italian town piazza at night. Deep indigo starry sky with a big full moon in the upper left. Distant skyline silhouette with a church dome and a bell tower with a few lit windows. Midground: a continuous row of three- and four-storey Italian façades in terracotta, ochre and salmon plaster with green wooden shutters, small balconies with potted plants, red-and-white striped awnings, arched wooden doors, warm yellow lit windows, and festoon string lights hanging between the buildings. Ground: a cobblestone piazza with rounded stones and warm pools of window light. The ground starts at 75% of the image height. Wide 21:9 composition.
```

**SKY** (16:9, opaco)
```
[Use the master image as reference.] Modern HD pixel art night sky layer only, 16:9, fully opaque. Deep indigo to violet gradient, a dusky magenta glow near the horizon, many small stars, a big detailed full moon with craters in the upper left with a soft halo. Subtle ordered dithering on the gradient. No buildings, no text.
```

**FAR** (2:1, magenta)
```
[Use the master image as reference.] Modern HD pixel art far layer on flat solid magenta (#FF00FF), horizontally seamless tileable. A dark blue-violet Italian skyline silhouette: rooftops, chimneys, a large church dome and a tall bell tower, a few tiny warm lit windows, occupying 40–75% of the height, low contrast and hazy. 1-pixel dark outline. No text.
```

**MID** (21:9, magenta)
```
[Use the master image as reference.] Modern HD pixel art midground layer on flat solid magenta (#FF00FF), horizontally seamless tileable. A continuous row of three- and four-storey Italian façades in terracotta, ochre and salmon plaster with visible plaster texture, green wooden shutters, small iron balconies with potted geraniums, red-and-white striped awnings over the shop doors, arched wooden doors, cornices with roof tiles, warm yellow lit windows and dark ones, and festoon string lights with colored bulbs hanging between the buildings. Buildings rest on a ground line at 78% of the height and occupy 15–78%. Moonlight from the upper left. 1-pixel dark purple outline. No text on signs.
```

**FLOOR** (21:9, magenta acima do chão)
```
[Use the master image as reference.] Modern HD pixel art ground layer: flat solid magenta (#FF00FF) above the ground. A cobblestone piazza starting at exactly 75% of the height down to the bottom, rounded grey-violet stones getting larger toward the bottom (gentle perspective), a curb line at the top edge, warm yellow pools of light from windows, a drain grate. Horizontally seamless tileable. Clean and readable where the fighters stand. No text.
```

---

## 2 · Selva Patapim (`jungle`)

Floresta tropical de dia, casa do Patapim. Paleta: céu `#4ab0d8 → #d4f2c8`, folhagem `#1e5a2a / #2e8a3a / #6cc04a`, troncos `#6a4a30`, flores `#ff4a6a`. Exuberante, úmido, raios de sol.

**MASTER**
```
Modern HD pixel art, background for a 2D arcade fighting game (Neo Geo / King of Fighters era, modern indie quality). Side view, flat eye-level camera. Crisp hand-placed pixels, no anti-aliasing, limited palette, hue-shifted shading (purple shadows, warm gold highlights), light from the upper left, 1-pixel dark purple outline on object silhouettes, about 640 art pixels across the width. No characters, no people, no animals, no text, no UI.
Scene: a lush tropical rainforest in daylight. Bright cyan sky barely visible through the canopy, golden god rays slanting from the upper right. Background: layered misty jungle canopy and a tall white waterfall in the center falling into mist. Midground: two or three giant tree trunks with thick buttress roots, hanging vines and lianas, big ferns and broad leaves, red tropical flowers. Ground: grass edge with moss, roots, small red-and-white mushrooms and fallen leaves. The ground starts at 75% of the image height. Wide 21:9 composition.
```

**SKY** (16:9, opaco)
```
[Use the master image as reference.] Modern HD pixel art sky layer only, 16:9, fully opaque. Bright cyan to pale mint sky, a soft sun glow in the upper right, faint golden god rays slanting down. Subtle dithering on the gradient. No trees, no text.
```

**FAR** (2:1, magenta)
```
[Use the master image as reference.] Modern HD pixel art far layer on flat solid magenta (#FF00FF), horizontally seamless tileable. Layered misty jungle canopy (rounded tree crowns in blue-green, lighter and hazier with distance) occupying 25–75% of the height, with a tall narrow white waterfall in the center falling into a cloud of mist at the bottom. Low contrast, aerial haze. 1-pixel outline only on the nearest shapes. No text.
```

**MID** (21:9, magenta)
```
[Use the master image as reference.] Modern HD pixel art midground layer on flat solid magenta (#FF00FF), horizontally seamless tileable. Three giant rainforest tree trunks with bark texture and thick buttress roots, reaching above the top of the image, hanging vines and lianas with small leaves, clusters of big ferns and broad monstera leaves at the base, a few red tropical flowers. Objects rest on a ground line at 78% of the height; keep the center third open. Sunlight from the upper left, purple shadows, 1-pixel dark purple outline. No text.
```

**FLOOR** (21:9, magenta acima do chão)
```
[Use the master image as reference.] Modern HD pixel art ground layer: flat solid magenta (#FF00FF) above the ground. Jungle floor starting at exactly 75% of the height: a top edge of grass blades and moss, then dark rich soil with roots, fallen leaves, small red-and-white mushrooms and pebbles, getting darker toward the bottom. Horizontally seamless tileable. Readable where the fighters stand. No text.
```

---

## 3 · Deserto Tic-Tac (`desert`)

Deserto ao entardecer, casa do Lirilì Larilà (o elefante-cacto do relógio). Paleta: céu `#1a1036 → #8a3068 → #ffa04c → #ffd884`, mesas `#8a3e5e`, areia `#f0aa62 / #b0683c`. Quente, misterioso, o tempo parado.

**MASTER**
```
Modern HD pixel art, background for a 2D arcade fighting game (Neo Geo / King of Fighters era, modern indie quality). Side view, flat eye-level camera. Crisp hand-placed pixels, no anti-aliasing, limited palette, hue-shifted shading (purple shadows, warm gold highlights), light from the upper left, 1-pixel dark purple outline on object silhouettes, about 640 art pixels across the width. No characters, no people, no animals, no text, no UI.
Scene: a desert at dusk. Sky banded from deep purple to magenta, orange and gold, a huge setting sun low on the left third with cut bands. Background: flat-topped mesas and buttes in dusty rose and mauve, rolling dunes, and a ruined stone clock tower with a big round clock face. Midground: tall saguaro cacti with arms, desert rocks and dry shrubs. Ground: rippled orange sand with cracks, small stones and an animal skull. The ground starts at 75% of the image height. Wide 21:9 composition.
```

**SKY** (16:9, opaco)
```
[Use the master image as reference.] Modern HD pixel art sky layer only, 16:9, fully opaque. Dusk sky banded from deep purple through magenta and orange to pale gold at the horizon, thin streaked clouds lit pink, a huge setting sun low on the left third with horizontal cut bands. Subtle dithering between bands. No land, no text.
```

**FAR** (2:1, magenta)
```
[Use the master image as reference.] Modern HD pixel art far layer on flat solid magenta (#FF00FF), horizontally seamless tileable. Flat-topped mesas and buttes with layered rock strata in dusty rose and mauve, rolling dunes in front of them, and a ruined sandstone clock tower with a big round white clock face (with hands) near the center-right, occupying 35–75% of the height, hazy and low contrast. No text.
```

**MID** (21:9, magenta)
```
[Use the master image as reference.] Modern HD pixel art midground layer on flat solid magenta (#FF00FF), horizontally seamless tileable. Tall green saguaro cacti with arms, spines and a pink flower on top, small barrel cacti, sandstone rocks and dry tumbleweed shrubs, resting on a ground line at 78% of the height; keep the center third open. Warm rim light from the sunset, purple shadows, 1-pixel dark purple outline. No text.
```

**FLOOR** (21:9, magenta acima do chão)
```
[Use the master image as reference.] Modern HD pixel art ground layer: flat solid magenta (#FF00FF) above the ground. Desert sand starting at exactly 75% of the height: wind ripples, darker cracked patches, small stones, a bleached animal skull, warm orange highlights and purple shadows. Horizontally seamless tileable. Readable where the fighters stand. No text.
```

---

## 4 · Caffè Assassino (`cafe`)

Interior de um bar de espresso italiano, sombrio e elegante. Aqui o "céu" é a **parede do fundo**. Paleta: parede bordô `#3a1f2e / #5c3448`, lambri verde `#245a4a`, madeira `#7a4a2a`, cromado `#e8ecf4`, piso xadrez `#2b2531 / #e9e1d2`, luz âmbar `#ffe2a0`. Clima de filme noir.

**MASTER**
```
Modern HD pixel art, background for a 2D arcade fighting game (Neo Geo / King of Fighters era, modern indie quality). Side view, flat eye-level camera. Crisp hand-placed pixels, no anti-aliasing, limited palette, hue-shifted shading (purple shadows, warm gold highlights), 1-pixel dark purple outline on object silhouettes, about 640 art pixels across the width. No characters, no people, no animals, no text, no UI.
Scene: the interior of a moody Italian espresso bar at night. Back wall with burgundy diamond-pattern wallpaper above dark green wooden wainscot panels, a framed blank chalkboard menu, shelves with white espresso cups and colorful liqueur bottles, a blank neon sign frame on the wall. A long wooden bar counter with a shiny chrome espresso machine in the center. Brass pendant lamps hanging from the ceiling casting warm cones of light, red bar stools. Floor: black-and-white checkered tiles in gentle perspective. The floor starts at 75% of the image height. Warm amber light, film-noir mood. Wide 21:9 composition.
```

**SKY = parede do fundo** (16:9, opaco)
```
[Use the master image as reference.] Modern HD pixel art back wall of an Italian espresso bar, 16:9, fully opaque. Burgundy wallpaper with a diamond pattern on the upper part, a dark molding, dark green wooden wainscot panels on the lower part, a framed blank chalkboard menu (no text) in the center, warm amber light falling from above. No furniture in front, no text.
```

**FAR** (2:1, magenta)
```
[Use the master image as reference.] Modern HD pixel art far layer on flat solid magenta (#FF00FF), horizontally seamless tileable. Wall shelves full of white espresso cups and saucers and colorful liqueur bottles, a long dark wooden bar counter at 62–75% of the height with a big shiny chrome espresso machine in the center, a blank pink neon sign frame on the wall (no letters). 1-pixel dark outline. No text.
```

**MID** (21:9, magenta)
```
[Use the master image as reference.] Modern HD pixel art midground layer on flat solid magenta (#FF00FF), horizontally seamless tileable. Three brass pendant lamps hanging from the top edge on thin cords, and red-cushioned chrome bar stools standing on a ground line at 78% of the height; keep the center third open. Warm amber highlights, purple shadows, 1-pixel dark purple outline. No text.
```

**FLOOR** (21:9, magenta acima do chão)
```
[Use the master image as reference.] Modern HD pixel art floor layer: flat solid magenta (#FF00FF) above the floor. Black-and-white checkered tiles starting at exactly 75% of the height down to the bottom, in gentle one-point perspective (tiles grow toward the bottom), polished with soft warm reflections of the lamps, a dark baseboard along the top edge. Horizontally seamless tileable. No text.
```

---

## 5 · Villaggio Sahur (`villaggio`)

Aldeia indonésia de madrugada, na hora do sahur, casa do Tung Tung Tung Sahur. Paleta: céu `#050818 → #1e2460 → #5a3e7a`, madeira `#7a4a2a / #3a2416`, telhados `#8a3a2a`, lanternas `#e04a2a / #ffcf6a`. Tranquilo, misterioso, de madrugada.

**MASTER**
```
Modern HD pixel art, background for a 2D arcade fighting game (Neo Geo / King of Fighters era, modern indie quality). Side view, flat eye-level camera. Crisp hand-placed pixels, no anti-aliasing, limited palette, hue-shifted shading (purple shadows, warm gold highlights), 1-pixel dark purple outline on object silhouettes, about 640 art pixels across the width. No characters, no people, no animals, no text, no UI.
Scene: a Southeast Asian village before dawn. Deep navy starry sky with a thin crescent moon in the upper right. Background: dark rolling hills, palm tree silhouettes and a mosque silhouette with a dome and two minarets with a few warm lit windows. Midground: wooden stilt houses with steep red-brown tiled roofs, carved wooden walls, warm glowing windows, hanging red paper lanterns, and a big traditional bedug drum on a wooden stand. Ground: packed dirt path with grass tufts and small stones. The ground starts at 75% of the image height. Calm, mysterious mood. Wide 21:9 composition.
```

**SKY** (16:9, opaco)
```
[Use the master image as reference.] Modern HD pixel art night sky layer only, 16:9, fully opaque. Deep navy to indigo gradient with a faint violet glow at the horizon, many small stars, a thin bright crescent moon with a soft halo in the upper right. Subtle dithering. No land, no text.
```

**FAR** (2:1, magenta)
```
[Use the master image as reference.] Modern HD pixel art far layer on flat solid magenta (#FF00FF), horizontally seamless tileable. Dark blue rolling hills, coconut palm silhouettes, and a mosque silhouette with a dome and two slender minarets with a few warm lit windows, occupying 40–75% of the height, hazy and low contrast. No text.
```

**MID** (21:9, magenta)
```
[Use the master image as reference.] Modern HD pixel art midground layer on flat solid magenta (#FF00FF), horizontally seamless tileable. Three wooden stilt houses with steep red-brown tiled roofs, carved wooden plank walls, warm glowing windows and a dark doorway, hanging red paper lanterns on poles, and a big traditional bedug drum (a large barrel drum with a leather head) on a wooden stand. Everything rests on a ground line at 78% of the height; keep the center third open. Warm lantern light, purple shadows, 1-pixel dark purple outline. No text.
```

**FLOOR** (21:9, magenta acima do chão)
```
[Use the master image as reference.] Modern HD pixel art ground layer: flat solid magenta (#FF00FF) above the ground. Packed dirt village path starting at exactly 75% of the height: grass tufts along the top edge, small stones, footprints, dark earth with faint warm lantern light, getting darker toward the bottom. Horizontally seamless tileable. No text.
```

---

## 6 · Cielo Bombardiro (`cielo`)

Céu em grande altitude, sobre um mar de nuvens, com um convés de aviação. Casa do Bombardiro. Paleta: céu `#1a58c4 → #78b8f4 → #f2faff`, nuvens `#ffffff / #b8d0ec`, convés `#8a966e / #525c40`, tricolor `#2fa04a #f4f4f4 #e03a3a`. Clima de marcha militar, épico.

**MASTER**
```
Modern HD pixel art, background for a 2D arcade fighting game (Neo Geo / King of Fighters era, modern indie quality). Side view, flat eye-level camera. Crisp hand-placed pixels, no anti-aliasing, limited palette, hue-shifted shading (cool blue-purple shadows, warm highlights), 1-pixel dark outline on object silhouettes, about 640 art pixels across the width. No characters, no people, no animals, no text, no UI.
Scene: high above the clouds in bright daylight. Deep blue sky fading to pale blue, a dazzling sun with glare in the upper right. Background: an endless sea of fluffy white clouds at the horizon. Midground: big puffy cumulus clouds with pixel-art shading, and on the right the tall tail fin of a military aircraft painted with green, white and red vertical stripes. Ground: the olive-green metal deck of a flying aircraft carrier, riveted plates, white painted lines and a large green-white-red roundel marking. The deck starts at 75% of the image height. Wide 21:9 composition.
```

**SKY** (16:9, opaco)
```
[Use the master image as reference.] Modern HD pixel art sky layer only, 16:9, fully opaque. Deep blue at the top fading to pale blue and almost white near the horizon, a dazzling sun with a pixel-art glare in the upper right, a few thin high cirrus streaks. Subtle dithering. No clouds near the bottom, no text.
```

**FAR** (2:1, magenta)
```
[Use the master image as reference.] Modern HD pixel art far layer on flat solid magenta (#FF00FF), horizontally seamless tileable. An endless sea of fluffy white clouds forming the horizon, from 62% to 85% of the height, with soft blue shading, hazy and low contrast. No text.
```

**MID** (21:9, magenta)
```
[Use the master image as reference.] Modern HD pixel art midground layer on flat solid magenta (#FF00FF), horizontally seamless tileable. Two or three big puffy cumulus clouds with 3–4 tone pixel-art shading (white highlights, light blue mid tones, blue-purple shadows) at 30–75% of the height, and near the right edge the tall tail fin of a military aircraft painted with green, white and red vertical stripes, resting on the ground line at 78%. Keep the center third open. 1-pixel dark outline. No text.
```

**FLOOR** (21:9, magenta acima do chão)
```
[Use the master image as reference.] Modern HD pixel art ground layer: flat solid magenta (#FF00FF) above the deck. The olive-green metal deck of a flying aircraft carrier starting at exactly 75% of the height: riveted steel plates, a light edge line on top, white dashed runway lines, and a large green-white-red roundel marking slightly right of center, seen from a slightly elevated angle. Horizontally seamless tileable. No text.
```

---

## 7 · Teatro Cappuccina (`teatro`)

Palco de teatro à noite, casa da Ballerina Cappuccina. O "céu" é o **cenário pintado no fundo do palco**. Paleta: fundo `#160c2a → #6e3a6a`, cortinas `#c8203a / #5e0a1a`, dourado `#ffd23a`, palco `#c8884a / #7a4a24`. Elegante, teatral, valsa.

**MASTER**
```
Modern HD pixel art, background for a 2D arcade fighting game (Neo Geo / King of Fighters era, modern indie quality). Side view, flat eye-level camera. Crisp hand-placed pixels, no anti-aliasing, limited palette, hue-shifted shading (purple shadows, warm gold highlights), 1-pixel dark purple outline on object silhouettes, about 640 art pixels across the width. No characters, no people, no animals, no text, no UI.
Scene: a grand theater stage at night. The backdrop is a painted night sky with a full moon and a fairy-tale castle silhouette, with golden stars hanging on wires. Heavy red velvet curtains with deep folds on both sides and in the center back, a golden pelmet with tassels and scallops across the top. Ground: a polished wooden stage floor with footlights along the front edge and the silhouettes of audience heads at the very bottom. The stage floor starts at 75% of the image height. Elegant, theatrical, warm spotlight glow. Wide 21:9 composition.
```

**SKY = cenário do fundo** (16:9, opaco)
```
[Use the master image as reference.] Modern HD pixel art painted theater backdrop, 16:9, fully opaque: a purple night sky with soft painted clouds, a big pale full moon on the left, small painted stars, a dark violet fairy-tale castle silhouette with towers and a few lit windows in the center. It should look like a painted canvas backdrop. No text.
```

**FAR** (2:1, magenta)
```
[Use the master image as reference.] Modern HD pixel art far layer on flat solid magenta (#FF00FF), horizontally seamless tileable. Golden star decorations and small crescent moons hanging on thin wires from the top edge at different heights (10–45% of the height), a few painted cardboard cloud cutouts. 1-pixel dark outline. No text.
```

**MID** (21:9, magenta)
```
[Use the master image as reference.] Modern HD pixel art midground layer on flat solid magenta (#FF00FF), horizontally seamless tileable. Heavy red velvet theater curtains with deep vertical folds and gold trim on the left and right edges and a narrower one in the center back, tied with golden ropes, plus a golden scalloped pelmet with tassels running across the top edge. Curtains reach the ground line at 78%. Strong warm highlights on the folds, deep crimson-purple shadows, 1-pixel dark purple outline. No text.
```

**FLOOR** (21:9, magenta acima do chão)
```
[Use the master image as reference.] Modern HD pixel art ground layer: flat solid magenta (#FF00FF) above the stage. A polished wooden stage floor starting at exactly 75% of the height with long planks, warm reflections and a bright golden edge at the top; along the bottom, a row of small footlights and the dark silhouettes of audience heads cut off by the bottom edge. Horizontally seamless tileable. No text.
```

---

## 8 · Isola Bananini (`piantagione`)

Ilha tropical de bananeiras, casa do Chimpanzini Bananini. Paleta: céu `#2a8ae4 → #e4f6ff`, mar `#3a9ae0`, folhas `#3fa34a / #2e8a3a`, bananas `#ffd23f`, terra `#a8844a / #6a4e2e`. Alegre, ensolarado, calipso.

**MASTER**
```
Modern HD pixel art, background for a 2D arcade fighting game (Neo Geo / King of Fighters era, modern indie quality). Side view, flat eye-level camera. Crisp hand-placed pixels, no anti-aliasing, limited palette, hue-shifted shading (purple shadows, warm gold highlights), light from the upper left, 1-pixel dark purple outline on object silhouettes, about 640 art pixels across the width. No characters, no people, no animals, no text, no UI.
Scene: a sunny tropical banana plantation island. Bright blue sky with puffy clouds and a sun in the upper right. Background: a snow-capped volcano and a turquoise sea with green hills. Midground: rows of banana trees with big torn leaves, heavy yellow banana bunches and purple banana flowers, and wooden crates overflowing with bananas. Ground: warm brown dirt with grass tufts and a few banana peels. The ground starts at 75% of the image height. Cheerful calypso mood. Wide 21:9 composition.
```

**SKY** (16:9, opaco)
```
[Use the master image as reference.] Modern HD pixel art sky layer only, 16:9, fully opaque. Bright blue to pale sky, puffy white clouds with pixel shading, a sun in the upper right, and a turquoise sea at 66–75% of the height. Subtle dithering. No land, no text.
```

**FAR** (2:1, magenta)
```
[Use the master image as reference.] Modern HD pixel art far layer on flat solid magenta (#FF00FF), horizontally seamless tileable. A snow-capped volcano on the right with a faint smoke plume, and rolling green hills with rows of small plants along the coast, occupying 25–75% of the height, hazy and low contrast. No text.
```

**MID** (21:9, magenta)
```
[Use the master image as reference.] Modern HD pixel art midground layer on flat solid magenta (#FF00FF), horizontally seamless tileable. Four banana trees with segmented trunks, big torn green leaves, heavy yellow banana bunches and purple hanging banana flowers, and two wooden crates overflowing with bananas, resting on a ground line at 78% of the height; keep the center third open. Sunlight from the upper left, purple shadows, 1-pixel dark purple outline. No text.
```

**FLOOR** (21:9, magenta acima do chão)
```
[Use the master image as reference.] Modern HD pixel art ground layer: flat solid magenta (#FF00FF) above the ground. Warm brown plantation dirt starting at exactly 75% of the height: grass tufts along the top edge, furrows, small stones and a few yellow banana peels, darker toward the bottom. Horizontally seamless tileable. No text.
```

---

## 9 · Anelli di Saturno (`saturno`)

Cenário do chefe: o anel de Saturno no espaço. Paleta: espaço `#04020c → #260e44`, nebulosa `#8a2a9a / #c04a8a`, Saturno `#f0c888 / #d09a52`, chão `#d0c0a0 / #6a5a4e`. Ameaçador, cósmico, roxo.

**MASTER**
```
Modern HD pixel art, background for a 2D arcade fighting game (Neo Geo / King of Fighters era, modern indie quality). Side view, flat eye-level camera. Crisp hand-placed pixels, no anti-aliasing, limited palette, hue-shifted shading (purple shadows, warm highlights), 1-pixel dark outline on object silhouettes, about 640 art pixels across the width. No characters, no people, no animals, no text, no UI.
Scene: a final boss arena in outer space, standing on the icy rock of Saturn's ring. Deep black-violet space with purple and magenta nebula clouds and many stars, a tiny blue Earth in the upper left. Background: a huge banded planet Saturn on the right with its rings passing in front of and behind it, lit from the left. Midground: floating cratered asteroids of different sizes. Ground: a pale grey-beige rocky surface with craters, dust and small rocks. The ground starts at 75% of the image height. Ominous, cosmic, purple glow. Wide 21:9 composition.
```

**SKY** (16:9, opaco)
```
[Use the master image as reference.] Modern HD pixel art deep space layer only, 16:9, fully opaque. Black-violet space with purple, magenta and blue nebula clouds, many small stars of different brightness, a tiny blue-and-green Earth with a glow in the upper left. Subtle dithering in the nebula. No planets besides Earth, no text.
```

**FAR** (2:1, magenta)
```
[Use the master image as reference.] Modern HD pixel art far layer on flat solid magenta (#FF00FF). A huge planet Saturn on the right half with horizontal cream, tan and orange bands, shaded from a light source on the left, with wide pale rings tilted slightly, passing in front of and behind the planet, occupying 10–70% of the height. No text.
```

**MID** (21:9, magenta)
```
[Use the master image as reference.] Modern HD pixel art midground layer on flat solid magenta (#FF00FF), horizontally seamless tileable. A scattering of floating grey-violet asteroids of different sizes with craters, lit from the left with purple shadows, at 25–65% of the height; keep the center area open. 1-pixel dark outline. No text.
```

**FLOOR** (21:9, magenta acima do chão)
```
[Use the master image as reference.] Modern HD pixel art ground layer: flat solid magenta (#FF00FF) above the ground. A pale grey-beige rocky ring surface starting at exactly 75% of the height: shallow craters, fine dust, small rocks and ice crystals, a bright rim along the top edge, cool purple shadows. Horizontally seamless tileable. No text.
```

---

## 10 · Strada del Nonno (`strada`)

Rua de cidadezinha italiana num dia de sol (fase bônus do carro do Nonno). Paleta: céu `#4aa2e8 → #f8f0d8`, colinas `#8ab06a`, fachadas pastel `#f2c46a #e8a060 #f4e0b0 #e88a70`, asfalto `#5a5662 / #3a3642`. Ensolarado, nostálgico.

**MASTER**
```
Modern HD pixel art, background for a 2D arcade fighting game (Neo Geo / King of Fighters era, modern indie quality). Side view, flat eye-level camera. Crisp hand-placed pixels, no anti-aliasing, limited palette, hue-shifted shading (purple shadows, warm gold highlights), light from the upper left, 1-pixel dark purple outline on object silhouettes, about 640 art pixels across the width. No characters, no people, no animals, no text, no UI.
Scene: a sunny street in a small Italian countryside town. Clear blue sky with puffy clouds. Background: green Tuscan hills with tall cypress trees and a farmhouse with a terracotta roof. Midground: a row of pastel-colored houses (yellow, peach, cream, coral) with green shutters, small balconies with flowers, laundry lines with colorful clothes between the windows, a light blue vintage scooter parked by a door. Ground: a stone sidewalk with a curb, then grey asphalt road with white dashed lines. The sidewalk starts at 75% of the image height. Nostalgic and cheerful. Wide 21:9 composition.
```

**SKY** (16:9, opaco)
```
[Use the master image as reference.] Modern HD pixel art sky layer only, 16:9, fully opaque. Clear blue sky fading to warm cream near the horizon, puffy white clouds with pixel shading. Subtle dithering. No land, no text.
```

**FAR** (2:1, magenta)
```
[Use the master image as reference.] Modern HD pixel art far layer on flat solid magenta (#FF00FF), horizontally seamless tileable. Rolling green Tuscan hills with rows of tall dark cypress trees and a small cream farmhouse with a terracotta roof, occupying 45–75% of the height, slightly hazy. No text.
```

**MID** (21:9, magenta)
```
[Use the master image as reference.] Modern HD pixel art midground layer on flat solid magenta (#FF00FF), horizontally seamless tileable. A continuous row of pastel Italian houses (yellow, peach, cream, coral plaster) with green wooden shutters, small balconies with flower pots, wooden doors, roof cornices, laundry lines with colorful clothes strung between windows, and a light blue vintage scooter parked near a door. Houses rest on a ground line at 78% of the height. Sunlight from the upper left, 1-pixel dark purple outline. No text on signs.
```

**FLOOR** (21:9, magenta acima do chão)
```
[Use the master image as reference.] Modern HD pixel art ground layer: flat solid magenta (#FF00FF) above the ground. Starting at exactly 75% of the height: a light stone sidewalk with joints and a curb, then a grey asphalt road with texture, small cracks and white dashed center lines toward the bottom. Horizontally seamless tileable. No text.
```

---

## 11 · Neon Città (`cyber`)

Cidade synthwave à noite (fase bônus do Cybercaminhão). Paleta: céu `#07031a → #a42a7a → #ff5a8a`, sol `#fff06a → #ff3a8a`, neon ciano `#4af0ff` e rosa `#ff6ad5`, prédios `#120626`. Retrô-futurista, neon, chuvoso.

**MASTER**
```
Modern HD pixel art, background for a 2D arcade fighting game (Neo Geo / King of Fighters era, modern indie quality). Side view, flat eye-level camera. Crisp hand-placed pixels, no anti-aliasing, limited palette, 1-pixel dark outline on object silhouettes, about 640 art pixels across the width. No characters, no people, no animals, no text, no UI.
Scene: a synthwave neon city at night. Sky gradient from deep purple to magenta and hot pink at the horizon, a big retro sun with horizontal stripes cut through it, low on the center. Background: a skyline of dark skyscrapers with cyan and pink lit windows and neon rooftop edges. Midground: closer buildings with blank glowing neon sign boxes (no letters), fire escapes and antennas. Ground: dark asphalt with a glowing cyan and magenta perspective grid. The ground starts at 75% of the image height. Retro-futuristic 80s mood. Wide 21:9 composition.
```

**SKY** (16:9, opaco)
```
[Use the master image as reference.] Modern HD pixel art sky layer only, 16:9, fully opaque. Gradient from deep purple to magenta and hot pink at the horizon, a few stars at the top, a big retro synthwave sun with horizontal stripes cut through its lower half, centered low near the horizon. Ordered dithering in the gradient. No buildings, no text.
```

**FAR** (2:1, magenta)
```
[Use the master image as reference.] Modern HD pixel art far layer on flat solid magenta (#FF00FF) — careful: the buildings must be dark blue-violet, never pure magenta. Horizontally seamless tileable. A skyline of dark skyscrapers of varied heights with tiny cyan and pink lit windows and glowing neon edges on the rooftops, occupying 25–75% of the height. No text.
```

**MID** (21:9, magenta)
```
[Use the master image as reference.] Modern HD pixel art midground layer on flat solid magenta (#FF00FF) — the buildings must be dark violet, never pure magenta. Horizontally seamless tileable. Closer dark buildings with lit windows, fire escapes, antennas and rooftop water tanks, each with a blank glowing neon sign box (cyan or pink frame, no letters). Buildings rest on a ground line at 78% of the height; keep the center third lower. 1-pixel dark outline. No text.
```

**FLOOR** (21:9, magenta acima do chão)
```
[Use the master image as reference.] Modern HD pixel art ground layer: flat solid magenta (#FF00FF) above the ground. Starting at exactly 75% of the height: dark wet asphalt with a glowing cyan and magenta perspective grid (lines converging to the center), neon reflections and a soft pink glow along the top edge. Horizontally seamless tileable. No text.
```

---

## 12 · Vila Brasilini (`byd`)

Morro e calçadão inspirados no Rio de Janeiro (fase bônus do Bi-ai-di). Paleta: céu `#2a8ae8 → #f2f8ea`, morro `#4a9a52`, casinhas `#f2c46a #e86a5a #5ab0e0 #f4e0b0 #a0d070 #e88ac0`, calçadão `#1a1a1a / #f2efe6`, loja azul `#2a6ad8`. Ensolarado, brasileiro, funk carioca.

**MASTER**
```
Modern HD pixel art, background for a 2D arcade fighting game (Neo Geo / King of Fighters era, modern indie quality). Side view, flat eye-level camera. Crisp hand-placed pixels, no anti-aliasing, limited palette, hue-shifted shading (purple shadows, warm gold highlights), light from the upper left, 1-pixel dark purple outline on object silhouettes, about 640 art pixels across the width. No characters, no people, no animals, no text, no UI.
Scene: a sunny Brazilian seaside neighborhood inspired by Rio de Janeiro. Bright blue sky with clouds and a sun in the upper left. Background: a steep green hill covered with hundreds of small colorful houses (favela), with a distant white statue with open arms on the hilltop. Midground: tall palm trees and a modern glass electric-car showroom with a blue band and a blank sign. Ground: the famous black-and-white wavy mosaic sidewalk, then grey asphalt with yellow lines. The sidewalk starts at 75% of the image height. Warm, lively mood. Wide 21:9 composition.
```

**SKY** (16:9, opaco)
```
[Use the master image as reference.] Modern HD pixel art sky layer only, 16:9, fully opaque. Bright blue sky fading to pale near the horizon, puffy white clouds with pixel shading, a sun with a soft glow in the upper left. Subtle dithering. No land, no text.
```

**FAR** (2:1, magenta)
```
[Use the master image as reference.] Modern HD pixel art far layer on flat solid magenta (#FF00FF), horizontally seamless tileable. A steep green hill densely covered with hundreds of tiny colorful cube houses (yellow, red, blue, cream, green, pink) with small windows and rooftop water tanks, and a small distant white statue with open arms on the highest hilltop, occupying 20–75% of the height, slightly hazy. No text.
```

**MID** (21:9, magenta)
```
[Use the master image as reference.] Modern HD pixel art midground layer on flat solid magenta (#FF00FF), horizontally seamless tileable. Tall coconut palm trees and a modern glass electric-car showroom with a white frame, a blue band and a blank blue sign (no letters), big glass windows with reflections, resting on a ground line at 78% of the height; keep the center third open. Sunlight from the upper left, 1-pixel dark purple outline. No text.
```

**FLOOR** (21:9, magenta acima do chão)
```
[Use the master image as reference.] Modern HD pixel art ground layer: flat solid magenta (#FF00FF) above the ground. Starting at exactly 75% of the height: a Copacabana-style sidewalk with a black-and-white wavy mosaic pattern, a curb, then grey asphalt with texture and yellow road markings toward the bottom. Horizontally seamless tileable. No text.
```

---

## Depois de gerar

1. Coloque os arquivos em `assets/stage-art/<id>/` (pode ser `.jpg` ou `.png`).
2. Ajuste o posicionamento de cada camada em `assets/stage-art/stages.json` (veja abaixo).
3. Rode `npm run stages:art`. As camadas prontas vão para `public/stages/<id>/` e o jogo passa a usar a arte; os cenários sem arte continuam com a pintura procedural.

### Status

Regeneração concluída em **25/10/2026**, com a ferramenta de geração de imagens integrada. Foram recuperadas as 29 imagens já geradas (13 masters e 16 camadas) e geradas as 36 camadas restantes e o mapa. Total: **66 arquivos principais**. Cada camada foi gerada separadamente usando o master correspondente como referência e os prompts deste documento.

| Cenário | Arte | Observação |
|---------|------|------------|
| `beach` | MASTER, SKY, FAR, MID, FLOOR | Arquivos PNG separados; posicionamento ajustado em `stages.json`. |
| `piazza` | MASTER, SKY, FAR, MID, FLOOR | Arquivos PNG separados; posicionamento ajustado em `stages.json`. |
| `jungle` | MASTER, SKY, FAR, MID, FLOOR | Arquivos PNG separados; posicionamento ajustado em `stages.json`. |
| `desert` | MASTER, SKY, FAR, MID, FLOOR | Arquivos PNG separados; posicionamento ajustado em `stages.json`. |
| `cafe` | MASTER, SKY, FAR, MID, FLOOR | Arquivos PNG separados; posicionamento ajustado em `stages.json`. |
| `villaggio` | MASTER, SKY, FAR, MID, FLOOR | Arquivos PNG separados; posicionamento ajustado em `stages.json`. |
| `cielo` | MASTER, SKY, FAR, MID, FLOOR | Arquivos PNG separados; posicionamento ajustado em `stages.json`. |
| `teatro` | MASTER, SKY, FAR, MID, FLOOR | Arquivos PNG separados; posicionamento ajustado em `stages.json`. |
| `piantagione` | MASTER, SKY, FAR, MID, FLOOR | Arquivos PNG separados; posicionamento ajustado em `stages.json`. |
| `saturno` | MASTER, SKY, FAR, MID, FLOOR | Arquivos PNG separados; posicionamento ajustado em `stages.json`. |
| `strada` | MASTER, SKY, FAR, MID, FLOOR | Arquivos PNG separados; posicionamento ajustado em `stages.json`. |
| `cyber` | MASTER, SKY, FAR, MID, FLOOR | Arquivos PNG separados; posicionamento ajustado em `stages.json`. |
| `byd` | MASTER, SKY, FAR, MID, FLOOR | Arquivos PNG separados; posicionamento ajustado em `stages.json`. |
| `map` | MAP | Mapa regenerado; marcadores e decorações reposicionados na nova arte. |

Os masters e as camadas originais estão em `assets/stage-art/<id>/`. Como já previsto no `.gitignore`, os PNGs originais ficam locais; as versões processadas em `public/stages/` são versionadas. O inventário com hashes está em [geracao-2026-10-25.json](geracao-2026-10-25.json).

Validação da regeneração: renderização dos 13 cenários e do mapa revisada; campanha, 24 lutas, bônus, textos, snapshots, TypeScript e lint passaram. Os snapshots foram atualizados para as novas artes. Uma renderização isolada do `HEAD` anterior nesta mesma máquina confirmou os mesmos hashes dos 9 sprites e os mesmos resultados de vida das 13 lutas determinísticas; diferenças nos hashes de sprites do snapshot antigo já ocorriam antes desta troca de arte neste ambiente.

### Lições das duas primeiras gerações

- **O master sai ótimo; as camadas, nem sempre.** No Gemini, algumas camadas vieram com elementos de outras (palmeiras "fantasmas" semitransparentes no FAR, céu e palmeiras em cima do FLOOR). Gere **cada camada numa conversa nova**, anexando o master, e repita a regra: *"only these objects, everything else pure flat #FF00FF"*.
- **Nada de areia ou chão na camada MID.** Se vier, dá para cortar com `clipBelow`, mas o ideal é o objeto terminar na linha do chão.
- **O FLOOR pode vir mais alto que 75%.** Não tem problema: o `anchor` diz qual linha da imagem vira a linha do chão do jogo.
- Proporção 21:9 funcionou bem (o Gemini entregou 3168×1344).
- **Folhas de camadas também servem.** Quando a IA entrega as camadas numa imagem só (master em cima, SKY/FAR/MID/FLOOR em painéis), não precisa separar à mão: cada camada usa `crop` com o retângulo do painel. Os rótulos ("SKY (16:9)", "FAR"…) saem com `drop` quando estão sobre o magenta, ou ficam de fora do `crop` quando estão sobre o desenho. As divisórias brancas têm 1–3 px a mais do que parece: recorte uns pixels para dentro.
- **Painéis de folha são baixos.** Um SKY de folha tem ~200 px de altura: em vez de esticar, o céu fica numa escala menor e o pipeline repete a linha pintada mais próxima para cobrir o resto da camada (topo liso).
- **Só o master?** Também dá: o master opaco vira o FAR (ou o miolo dele, repetido) e o chão vira o FLOOR; `blank` esvazia uma camada procedural que ficaria por cima.

### Posicionamento (`stages.json`)

| Campo | O que faz |
|-------|-----------|
| `src` | Arquivo da camada dentro de `assets/stage-art/<id>/`. |
| `width` | Largura final (px HD) da imagem inteira. Define a escala. |
| `anchor` | `[linha da imagem em fração da altura, y no jogo]`. Ex.: `[0.30, 272]` põe a linha a 30% da imagem na linha do chão (y=272). |
| `x` | Onde começa a imagem na camada (padrão: centralizada). |
| `key` | Recorta o fundo magenta. |
| `keep` | Retângulos da imagem (em frações) a manter; o resto vira transparente. Bom para aproveitar só parte de uma imagem. |
| `crop` | Retângulo (frações) de uma folha com várias camadas. Todas as outras frações passam a ser relativas a ele. |
| `drop` | Retângulos (frações) a apagar, como os rótulos dos painéis de uma folha. |
| `clipAbove` / `clipBelow` | Descarta tudo acima/abaixo de uma linha (fração da altura). |
| `haze` | Acima dessa linha, descarta os pixels desbotados (névoa que a IA pintou atrás da grama). |
| `tile` | `"mirror"` ou `"repeat"` para preencher a largura da camada. |
| `outline` | Escurece a borda das silhuetas (0 a 1), como o contorno dos sprites. |
| `blank` | Camada vazia: esconde a pintura procedural quando a arte já cobre aquela profundidade. |
| `off` (no cenário) | Animações procedurais que não combinam mais com a arte (ex.: as lâmpadas da Piazza, que agora estão desenhadas). |

O pipeline recorta, escala, posiciona e aplica a mesma paleta limitada e o mesmo contorno dos cenários pintados, para a arte, os sprites e o HUD terem um visual só.

---

## Mapa de Brainrotália (`map`)

Uma imagem só, **16:9**, opaca (sem magenta). Salve em `assets/stage-art/map/map.png`. A camada interativa (marcadores, rota, avião, Saturno com os raios roxos, barras de cima e de baixo) continua sendo desenhada pelo jogo, e as posições dos 11 locais são ajustadas na arte gerada.

- As faixas de **0–9%** (topo) e **81–100%** (base) da altura ficam atrás das barras do jogo: só mar.
- O **canto superior direito** fica livre (mar escuro/aberto): é lá que o jogo desenha Saturno e o portal.

**MAP**
```
Modern HD pixel art fantasy world map seen from above (slight top-down three-quarter view), for a 2D arcade fighting game travel screen (Neo Geo / King of Fighters era, modern indie quality). Crisp hand-placed pixels, no anti-aliasing, limited palette (about 48 colors), hue-shifted shading (purple shadows, warm highlights), light from the upper left, 1-pixel dark outline on landmarks, 16:9.
A deep blue ocean with pixel wave patterns, foam rings around the coasts and shallow turquoise water near the shore. In the middle, one large boot-shaped island continent (like a playful Italy) covering roughly 12%–75% of the width and 15%–78% of the height, plus a smaller tropical island on the far right (around 88% width, 67% height) with a palm tree and banana plants, and two tiny islets on the left. Distinct regions on the continent, each with a clear landmark:
- north-west (21% width, 31% height): a village of wooden stilt huts with red roofs;
- north (34% width, 18% height): snowy mountains with a small airfield on a plateau;
- north-center (51% width, 27% height): a small theater with a red dome;
- center (42% width, 41% height): an Italian town piazza with terracotta roofs and a bell tower;
- east (64% width, 33% height): a dense dark-green jungle with a waterfall;
- center-south (55% width, 50% height): a winding country road with a tiny red car;
- south-west (25% width, 60% height): a sandy desert with dunes and a small clock tower ruin;
- south-center (38% width, 58% height): a lake shaped like a coffee cup with a handle;
- south-east coast (66% width, 71% height): a golden beach with palm trees and a lighthouse.
Dotted sandy paths connect the regions. Keep the top-right corner (around 89% width, 24% height) as open dark ocean with nothing on it. Keep the top 9% and bottom 19% of the image as plain ocean. No text, no labels, no names, no compass, no UI, no characters, no people, no animals, no watermark.
```
