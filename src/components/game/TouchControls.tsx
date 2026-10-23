'use client';

import { useRef, useState, type PointerEvent } from 'react';
import type { VirtualButton } from '@/game';
import styles from './TouchControls.module.css';

type Dir = 'T_up' | 'T_down' | 'T_left' | 'T_right';

interface Handlers {
  onPress: (code: VirtualButton) => void;
  onRelease: (code: VirtualButton) => void;
}

const buzz = () => navigator.vibrate?.(8);

/**
 * 8-way D-pad: one touch zone; the finger can slide between directions (diagonals and motions like ↓↘→ work).
 * `rotated` compensates for the stage being turned 90° clockwise by CSS (portrait phones in fullscreen).
 */
function DPad({ onPress, onRelease, rotated }: Handlers & { rotated: boolean }) {
  const held = useRef(new Set<Dir>());
  const [dirs, setDirs] = useState<Set<Dir>>(new Set());
  const [knob, setKnob] = useState<[number, number]>([0, 0]);

  const apply = (next: Set<Dir>) => {
    for (const d of held.current) if (!next.has(d)) onRelease(d);
    for (const d of next) if (!held.current.has(d)) onPress(d);
    if (next.size > held.current.size) buzz();
    held.current = next;
    setDirs(new Set(next));
  };
  const track = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect(),
      sx = e.clientX - (r.left + r.width / 2),
      sy = e.clientY - (r.top + r.height / 2),
      // screen → pad coordinates (the pad is turned 90° clockwise when the stage is rotated)
      dx = rotated ? sy : sx,
      dy = rotated ? -sx : sy,
      radius = (rotated ? r.height : r.width) / 2,
      len = Math.hypot(dx, dy),
      next = new Set<Dir>();
    if (len > radius * 0.2) {
      // sin(22.5°) ≈ 0.38 splits the circle into 8 sectors of 45°
      if (dx / len > 0.38) next.add('T_right');
      if (dx / len < -0.38) next.add('T_left');
      if (dy / len > 0.38) next.add('T_down');
      if (dy / len < -0.38) next.add('T_up');
    }
    const k = Math.min(1, len / (radius * 0.55)) * 0.55 * radius;
    setKnob(len ? [(dx / len) * k, (dy / len) * k] : [0, 0]);
    apply(next);
  };
  const end = () => {
    apply(new Set());
    setKnob([0, 0]);
  };

  return (
    <div
      className={styles.dpad}
      role="group"
      aria-label="Direcional"
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        track(e);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) track(e);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className={`${styles.arrow} ${styles.aUp} ${dirs.has('T_up') ? styles.on : ''}`}>▲</span>
      <span className={`${styles.arrow} ${styles.aDown} ${dirs.has('T_down') ? styles.on : ''}`}>▼</span>
      <span className={`${styles.arrow} ${styles.aLeft} ${dirs.has('T_left') ? styles.on : ''}`}>◀</span>
      <span className={`${styles.arrow} ${styles.aRight} ${dirs.has('T_right') ? styles.on : ''}`}>▶</span>
      <span className={styles.knob} style={{ transform: `translate(${knob[0]}px, ${knob[1]}px)` }} />
    </div>
  );
}

/** Button that holds its virtual key while the finger stays on it (multi-touch: one pointer per button). */
function PadButton({
  code,
  label,
  className,
  children,
  onPress,
  onRelease,
}: Handlers & { code: VirtualButton; label: string; className: string; children: string }) {
  const [held, setHeld] = useState(false);
  const down = useRef(false);
  const up = (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!down.current) return;
    down.current = false;
    onRelease(code);
    setHeld(false);
  };
  return (
    <button
      type="button"
      aria-label={label}
      className={`${styles.btn} ${className} ${held ? styles.held : ''}`}
      onPointerDown={(e) => {
        e.preventDefault();
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // capture is best effort
        }
        down.current = true;
        onPress(code);
        setHeld(true);
        buzz();
      }}
      onPointerUp={up}
      onPointerCancel={up}
      onLostPointerCapture={up}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
}

interface Props extends Handlers {
  /** "dock": under the screen on the page; "overlay": over the game in fullscreen. */
  variant: 'dock' | 'overlay';
  /** Show the dock even with a fine pointer (the TOQUE switch). */
  forceVisible?: boolean;
  rotated?: boolean;
}

/** On-screen controls: D-pad on the left, punch/kick/special in an arcade arc on the right, START. */
export function TouchControls({ variant, forceVisible = false, rotated = false, onPress, onRelease }: Props) {
  const h = { onPress, onRelease };
  return (
    <div
      className={`${styles[variant]} ${forceVisible ? styles.on : ''}`}
      aria-label="Controles de toque"
      onContextMenu={(e) => e.preventDefault()}
    >
      <DPad {...h} rotated={rotated} />
      <div className={styles.acts}>
        <PadButton code="T_p" label="Soco" className={styles.punch} {...h}>
          SOCO
        </PadButton>
        <PadButton code="T_k" label="Chute" className={styles.kick} {...h}>
          CHUTE
        </PadButton>
        <PadButton code="T_s" label="Especial" className={styles.special} {...h}>
          ESP
        </PadButton>
        <PadButton code="T_start" label="Start" className={styles.start} {...h}>
          START
        </PadButton>
      </div>
    </div>
  );
}
