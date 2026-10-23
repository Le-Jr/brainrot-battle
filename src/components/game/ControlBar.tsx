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
}

/** Page-level switches above the screen (music, narrator, CRT scanlines, touch pad, fullscreen). */
export function ControlBar({ toggles, onToggle, onFullscreen }: Props) {
  return (
    <div className={styles.bar}>
      {(Object.keys(LABELS) as (keyof Toggles)[]).map((key) => (
        <button key={key} type="button" aria-pressed={toggles[key]} onClick={() => onToggle(key)}>
          {LABELS[key]}
        </button>
      ))}
      <button type="button" onClick={onFullscreen}>
        TELA CHEIA
      </button>
    </div>
  );
}
