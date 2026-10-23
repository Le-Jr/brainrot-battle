import type { ReactNode } from 'react';
import styles from './ControlsLegend.module.css';

type Row = [keys: ReactNode, description: ReactNode];

/** Separate keys, e.g. A D. */
const k = (...labels: string[]) =>
  labels.map((l, i) => (
    <span key={l}>
      {i > 0 && ' '}
      <kbd>{l}</kbd>
    </span>
  ));
/** A motion input, e.g. → ↓ ↘ (the pixel font has no readable arrow glyphs, so these use the system font). */
const m = (...arrows: string[]) =>
  arrows.map((a) => (
    <kbd key={a} className={styles.arrow}>
      {a}
    </kbd>
  ));

const CARDS: { title: string; accent?: 'p2'; rows: Row[] }[] = [
  {
    title: 'JOGADOR 1',
    rows: [
      [k('A', 'D'), 'Andar (segure para trás para defender)'],
      [k('W', 'S'), 'Pular / agachar'],
      [k('J', 'K', 'L'), 'Soco, chute, especial'],
      ['Fora do versus', <>Setas + {k('Z', 'X', 'C')} também funcionam</>],
    ],
  },
  {
    title: 'JOGADOR 2 (VERSUS)',
    accent: 'p2',
    rows: [
      ['Setas', 'Andar, pular, agachar'],
      [k('B', 'N', 'M'), 'Soco, chute, especial (ou Numpad 1 2 3)'],
      [k('Enter'), 'Start / pausa'],
      [k('Esc'), 'Voltar'],
    ],
  },
  {
    title: 'GOLPES E COMBOS',
    rows: [
      [<>{m('→')}+Soco</>, 'Soco forte (defenda em pé)'],
      [<>{m('→', '↓', '↘')}+Soco</>, 'Uppercut: lança o rival para um juggle'],
      [<>Perto {m('→')}+Chute</>, 'Agarrão'],
      [<>{m('↓', '↘', '→')}+Esp.</>, 'Especial EX (meia barra)'],
      [
        'Corrente',
        <>
          Soco <span className={styles.arrow}>→</span> soco/chute/forte; acerto{' '}
          <span className={styles.arrow}>→</span> especial cancela
        </>,
      ],
      ['Treino', <>{k('Tab')} mostra as hitboxes</>],
    ],
  },
];

/** Static reference cards under the screen (server component). */
export function ControlsLegend() {
  return (
    <section className={styles.legend} aria-label="Controles">
      {CARDS.map((card) => (
        <div key={card.title} className={styles.card}>
          <h2 className={card.accent === 'p2' ? styles.p2 : undefined}>{card.title}</h2>
          <dl>
            {card.rows.map(([keys, desc], i) => (
              <div key={i} className={styles.row}>
                <dt>{keys}</dt>
                <dd>{desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </section>
  );
}
