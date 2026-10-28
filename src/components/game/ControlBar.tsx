import styles from './ControlBar.module.css';

export interface Toggles {
  music: boolean;
  voice: boolean;
  crt: boolean;
  touch: boolean;
}

const LABELS: Record<keyof Toggles, string> = {
  music: 'MÚSICA',
  voice: 'NARRADOR',
  crt: 'CRT',
  touch: 'TOQUE',
};

interface Props {
  toggles: Toggles;
  onToggle: (key: keyof Toggles) => void;
  onFullscreen: () => void;
  onTests?: () => void;
}

/** Page-level switches above the screen (music, narrator, CRT scanlines, touch pad, fullscreen). */
export function ControlBar({ toggles, onToggle, onFullscreen, onTests }: Props) {
  return (
    <div className={styles.bar}>
      {(Object.keys(LABELS) as (keyof Toggles)[]).map((key) => (
        <button key={key} type="button" aria-pressed={toggles[key]} onClick={() => onToggle(key)}>
          {LABELS[key]}
        </button>
      ))}
      <a href="/audio/music/index.html" target="_blank" rel="noopener noreferrer">
        OUVIR TRILHA ↗
      </a>
      {onTests && (
        <button type="button" onClick={onTests}>
          TESTES (F2)
        </button>
      )}
      <button type="button" onClick={onFullscreen}>
        TELA CHEIA
      </button>
    </div>
  );
}
