'use client';

import { useState, type PointerEvent } from 'react';
import type { VirtualButton } from '@/game';
import styles from './TouchPad.module.css';

interface Props {
  /** Show the pad even on devices with a fine pointer (the TOQUE switch). */
  forceVisible: boolean;
  onPress: (code: VirtualButton) => void;
  onRelease: (code: VirtualButton) => void;
}

interface PadButtonProps extends Omit<Props, 'forceVisible'> {
  code: VirtualButton;
  className: string;
  label: string;
  children: string;
}

/** A button that holds its virtual key for as long as the pointer stays down (pointer capture). */
function PadButton({ code, className, label, children, onPress, onRelease }: PadButtonProps) {
  const [held, setHeld] = useState(false);

  const down = (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onPress(code);
    setHeld(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // capture is best effort
    }
  };
  const up = (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onRelease(code);
    setHeld(false);
  };

  return (
    <button
      type="button"
      aria-label={label}
      className={`${className} ${held ? styles.held : ''}`}
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={up}
      onLostPointerCapture={up}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
}

/** On-screen D-pad and action buttons for phones and tablets. */
export function TouchPad({ forceVisible, onPress, onRelease }: Props) {
  const handlers = { onPress, onRelease };
  return (
    <div className={`${styles.touch} ${forceVisible ? styles.on : ''}`} aria-label="Controles de toque">
      <div className={styles.dpad}>
        <PadButton code="T_up" className={styles.up} label="Pular" {...handlers}>
          ▲
        </PadButton>
        <PadButton code="T_left" className={styles.left} label="Esquerda" {...handlers}>
          ◀
        </PadButton>
        <PadButton code="T_right" className={styles.right} label="Direita" {...handlers}>
          ▶
        </PadButton>
        <PadButton code="T_down" className={styles.down} label="Agachar" {...handlers}>
          ▼
        </PadButton>
      </div>
      <div className={styles.acts}>
        <PadButton code="T_p" className={styles.punch} label="Soco" {...handlers}>
          SOCO
        </PadButton>
        <PadButton code="T_k" className={styles.kick} label="Chute" {...handlers}>
          CHUTE
        </PadButton>
        <PadButton code="T_s" className={styles.special} label="Especial" {...handlers}>
          ESPECIAL
        </PadButton>
        <PadButton code="T_start" className={styles.start} label="Start" {...handlers}>
          START
        </PadButton>
      </div>
    </div>
  );
}
