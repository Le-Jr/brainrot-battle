/** Local, editable arcade arrangements. No generated audio or external samples. */
const THEMES = {
  beach: [
    164,
    'Costa Turbo',
    'guitar',
    'Em C D B',
    [
      'B5 E6 D6 B5 G5 B5 A5 G5',
      'E5 G5 C6 B5 A5 G5 E5 G5',
      'F#5 A5 D6 E6 F#6 E6 D6 A5',
      'D#6 B5 F#5 D#5 B4 . B5 .',
      'E6 - B5 G5 A5 B5 D6 B5',
      'G5 C6 E6 G6 E6 D6 C6 G5',
      'A5 D6 F#6 E6 D6 A5 F#5 A5',
      'B5 A5 F#5 D#5 E5 F#5 B5 D#6',
    ],
  ],
  piazza: [
    152,
    'Piazza Furiosa',
    'accord',
    'Am Dm E Am',
    [
      'A5 C6 E6 G6 E6 C6',
      'D6 F6 A6 F6 D6 A5',
      'G#5 B5 E6 D6 B5 G#5',
      'A5 E6 C6 B5 A5 E5',
      'C6 E6 A6 G6 E6 C6',
      'F6 E6 D6 C6 A5 F5',
      'E5 G#5 B5 D6 F6 E6',
      'C6 B5 A5 G#5 B5 E6',
    ],
  ],
  jungle: [
    160,
    'Selva de Aço',
    'brass',
    'Gm Eb F D',
    [
      'D5 G5 . Bb5 D6 - Bb5 G5',
      'Bb5 G5 Eb5 . G5 Bb5 Eb6 D6',
      'C6 A5 F5 A5 C6 D6 F6 C6',
      'A5 F#5 D5 . A5 - C6 A5',
      'G5 Bb5 D6 G6 F6 D6 Bb5 G5',
      'Eb6 - Bb5 G5 Eb5 G5 Bb5 D6',
      'F6 C6 A5 F5 C6 A5 G5 F5',
      'F#5 A5 D6 C6 A5 F#5 E5 D5',
    ],
  ],
  desert: [
    154,
    'Miragem de Fogo',
    'reed',
    'Dm Eb C A',
    [
      'A5 Bb5 A5 F#5 G5 A5 F#5 Eb5',
      'G5 Bb5 Eb6 D6 Bb5 G5 F#5 Eb5',
      'E5 G5 C6 D6 E6 D6 C6 G5',
      'C#6 E6 A6 G6 E6 C#6 Bb5 A5',
      'D6 A5 F#5 Eb5 D5 Eb5 F#5 A5',
      'Bb5 G5 Eb5 F#5 G5 Bb5 Eb6 D6',
      'C6 G5 E5 G5 Bb5 C6 E6 D6',
      'C#6 Bb5 A5 G5 E5 C#5 E5 A5',
    ],
  ],
  cafe: [
    136,
    'Espresso Overdrive',
    'epiano',
    'Cm Ab Db G',
    [
      'Eb5 G5 Bb5 C6 . Bb5 G5 Eb5',
      'C6 Ab5 G5 Eb5 C5 . Eb5 G5',
      'F5 Ab5 C6 Db6 C6 Ab5 F5 Eb5',
      'D5 F5 G5 B5 D6 . B5 G5',
      'G5 Bb5 C6 Eb6 D6 C6 Bb5 G5',
      'Ab5 C6 Eb6 G6 Eb6 C6 Ab5 G5',
      'F5 Ab5 Db6 C6 Ab5 F5 Eb5 Db5',
      'D5 G5 B5 D6 F6 D6 B5 G5',
    ],
  ],
  sahur: [
    152,
    'Sahur Impact',
    'reed',
    'D Eb Gm D',
    [
      'A5 D6 C6 Bb5 A5 F#5 Eb5 D5',
      'Eb5 G5 Bb5 Eb6 D6 Bb5 G5 Eb5',
      'G5 Bb5 D6 F6 Eb6 D6 Bb5 G5',
      'F#5 A5 D6 C6 Bb5 A5 F#5 Eb5',
      'D5 . D6 . A5 Bb5 A5 F#5',
      'G5 Eb5 G5 Bb5 Eb6 D6 Bb5 G5',
      'Bb5 D6 G6 F6 D6 Bb5 A5 G5',
      'F#5 Eb5 D5 . A4 D5 F#5 A5',
    ],
  ],
  march: [
    144,
    'Esquadrão Relâmpago',
    'brass',
    'Bb Eb F Bb',
    [
      'Bb5 . F5 Bb5 D6 - F6 D6',
      'Eb6 Bb5 G5 Eb5 G5 Bb5 D6 Eb6',
      'C6 A5 F5 A5 C6 D6 Eb6 C6',
      'D6 - Bb5 F5 D5 F5 Bb5 D6',
      'F6 D6 Bb5 . F5 Bb5 D6 F6',
      'G6 F6 Eb6 D6 Bb5 G5 Eb5 G5',
      'A5 C6 F6 Eb6 D6 C6 A5 F5',
      'Bb5 F5 D5 Bb4 D5 F5 A5 C6',
    ],
  ],
  waltz: [
    180,
    'Dança das Lâminas',
    'guitar',
    'Dm Gm A Dm',
    [
      'A5 D6 F6 E6 D6 A5',
      'Bb5 D6 G6 F6 D6 Bb5',
      'A5 C#6 E6 G6 E6 C#6',
      'D6 A5 F5 E5 D5 A4',
      'F6 E6 D6 A5 F5 D5',
      'G5 Bb5 D6 G6 F6 D6',
      'E6 C#6 A5 G5 E5 C#5',
      'D5 F5 A5 C6 B5 A5',
    ],
  ],
  banana: [
    148,
    'Banana Breaker',
    'steel',
    'C F G C',
    [
      'G5 C6 E6 D6 C6 G5 E5 G5',
      'A5 C6 F6 E6 C6 A5 G5 F5',
      'B5 D6 G6 F6 D6 B5 A5 G5',
      'E6 D6 C6 G5 E5 G5 C6 .',
      'E5 . G5 A5 C6 A5 G5 E5',
      'F5 A5 C6 F6 A6 G6 F6 C6',
      'D6 E6 F6 G6 F6 D6 B5 G5',
      'C6 G5 E5 C5 E5 G5 B5 D6',
    ],
  ],
  boss: [
    168,
    'Catedral de Saturno',
    'cathedral',
    'Dm Bb Gm A',
    [
      'A5 G5 A5 - G5 F5 E5 D5',
      'C#5 - D5 - - - A4 -',
      'D5 E5 F5 G5 A5 Bb5 C#6 D6',
      'E6 C#6 A5 G5 E5 C#5 A4 .',
      'D6 A5 F5 D5 F5 A5 D6 F6',
      'F6 D6 Bb5 F5 Bb5 D6 F6 A6',
      'G6 F6 D6 Bb5 G5 Bb5 D6 F6',
      'E6 C#6 A5 E6 G6 E6 C#6 A5',
    ],
  ],
  bonus: [
    172,
    'Nonno Full Throttle',
    'guitar',
    'F Bb C C',
    [
      'F5 A5 C6 F6 E6 C6 A5 F5',
      'Bb5 D6 F6 A6 F6 D6 Bb5 F5',
      'G5 C6 E6 G6 E6 D6 C6 Bb5',
      'G5 Bb5 C6 E6 D6 C6 Bb5 G5',
      'A5 C6 F6 E6 C6 A5 G5 F5',
      'F5 Bb5 D6 F6 E6 D6 Bb5 A5',
      'C6 E6 G6 F6 E6 C6 Bb5 G5',
      'E5 G5 Bb5 C6 D6 E6 G6 E6',
    ],
  ],
  cyber: [
    148,
    'Neon Redline',
    'synlead',
    'Am F C G',
    [
      'A5 E6 C6 B5 A5 E5 G5 A5',
      'F5 A5 C6 E6 F6 E6 C6 A5',
      'G5 C6 E6 G6 E6 D6 C6 G5',
      'B5 D6 G6 F6 D6 B5 A5 G5',
      'E6 - C6 A5 B5 C6 E6 G6',
      'F6 E6 C6 A5 F5 A5 C6 E6',
      'E6 G6 E6 D6 C6 G5 E5 G5',
      'D6 B5 G5 D5 G5 A5 B5 D6',
    ],
  ],
  byd: [
    150,
    'Brasilini Pancadão',
    'pluck',
    'Em C D B',
    [
      'E5 . B5 E6 . D6 B5 .',
      'G5 . C6 E6 . C6 G5 E5',
      'A5 . D6 F#6 . E6 D6 A5',
      'B5 . D#6 F#6 . D#6 B5 .',
      'G5 B5 E6 . D6 B5 G5 .',
      'E6 G6 E6 C6 . G5 E5 .',
      'F#5 A5 D6 . E6 D6 A5 .',
      'F#5 D#5 B4 . D#5 F#5 A5 B5',
    ],
  ],
};

export function arrangeArcade(tracks) {
  for (const [id, [bpm, title, voice, progression, bridge]] of Object.entries(THEMES)) {
    const tr = tracks[id];
    const original = [...tr.lead];
    const chords = progression.split(' ');
    tr.title = title;
    tr.bpm = bpm;
    tr.lw = voice;
    tr.arcade = true;
    tr.lead = [...original, ...bridge];
    tr.chords = [
      ...original.map((_, i) => tr.chords[i % tr.chords.length]),
      ...bridge.map((_, i) => chords[i % chords.length]),
    ];
    tr.sections = original.map(() => 0.72).concat(bridge.map((_, i) => (i < 4 ? 0.52 : 1)));
  }
  // BWV 565 opening gesture, then a freely composed D-minor arcade variation.
  // This is a new performance, with no recording sampled from another artist.
  const tr = tracks.laststand;
  tr.title = 'Toccata della Mega Vacca — BWV 565 Arcade';
  tr.bpm = 172;
  tr.lw = 'cathedral';
  tr.arcade = true;
  const toccata = [
    'A5 G5 A5 - G5 F5 E5 D5',
    'C#5 - D5 - - - . .',
    'A4 G4 A4 - G4 F4 E4 D4',
    'C#4 - D4 - - - A4 -',
    'D5 E5 F5 G5 A5 Bb5 C#6 D6',
    'F6 E6 D6 C#6 D6 A5 F5 D5',
    'G5 Bb5 D6 F6 E6 D6 C#6 Bb5',
    'A5 C#6 E6 G6 E6 C#6 A5 .',
  ];
  tr.lead = [...toccata, ...tr.lead, ...toccata.slice(4)];
  tr.chords = ['Dm', 'A', 'Dm', 'A', 'Dm', 'Dm', 'Gm', 'A', ...tr.chords, 'Dm', 'Bb', 'Gm', 'A'];
  tr.sections = tr.lead.map((_, i) => (i < 4 ? 0.25 : i < 8 ? 0.65 : i < 16 ? 1 : i < 20 ? 0.5 : 1));
}
