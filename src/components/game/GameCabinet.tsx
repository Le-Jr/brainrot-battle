'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { GameHandle, VirtualButton } from '@/game';
import { ControlBar, type Toggles } from './ControlBar';
import { TouchControls } from './TouchControls';
import { useFullscreen } from './useFullscreen';
import { useGameEngine } from './useGameEngine';
import { useMediaQuery } from './useMediaQuery';
import styles from './GameCabinet.module.css';

/** The arcade cabinet column: marquee bar, 16:9 screen, touch controls and the controls legend. */
export function GameCabinet({ legend }: { legend: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [toggles, setToggles] = useState<Toggles>({ music: true, voice: true, crt: false, touch: false });
  const fs = useFullscreen(stageRef);
  const coarse = useMediaQuery('(pointer: coarse)');
  const portrait = useMediaQuery('(orientation: portrait)');
  // in fullscreen a phone held upright gets the stage turned to landscape by CSS
  const rotated = fs.active && portrait;

  const handleReady = useCallback((game: GameHandle) => {
    // The narrator can also be switched from the in-game OPÇÕES screen
    game.on('voice', (on) => setToggles((t) => ({ ...t, voice: on })));
  }, []);
  const gameRef = useGameEngine(canvasRef, handleReady);

  // Keep the engine in sync with the page buttons
  useEffect(() => {
    gameRef.current?.setNarrator(toggles.voice);
  }, [gameRef, toggles.voice]);

  const toggle = (key: keyof Toggles) => {
    const value = !toggles[key];
    setToggles((t) => ({ ...t, [key]: value }));
    if (key === 'music') gameRef.current?.setMusic(value);
    canvasRef.current?.focus();
  };

  const fullscreen = async () => {
    if (fs.active) await fs.exit();
    else await fs.enter();
    canvasRef.current?.focus();
  };

  const press = (code: VirtualButton) => gameRef.current?.pressButton(code);
  const release = (code: VirtualButton) => gameRef.current?.releaseButton(code);
  const handlers = { onPress: press, onRelease: release };

  return (
    <div className={styles.cabinet}>
      <header className={styles.marquee}>
        <h1 className={styles.title}>
          <span className={styles.eyebrow}>TUPINICODE · ARCADE SYSTEM</span>
          <b>BRAINROT BATTAGLIA</b>
          <span>ULTRA CAOS · FREE PLAY</span>
        </h1>
        <ControlBar toggles={toggles} onToggle={toggle} onFullscreen={fullscreen} />
      </header>

      <div
        ref={stageRef}
        className={[styles.stage, fs.active && styles.fs, rotated && styles.rotated]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={styles.rotor}>
          <div className={`${styles.screen} ${toggles.crt ? styles.crt : ''}`}>
            <canvas
              ref={canvasRef}
              className={styles.canvas}
              width={640}
              height={360}
              tabIndex={0}
              aria-label="Brainrot Battaglia, jogo de luta"
            />
          </div>

          {fs.active && (
            <>
              {(coarse || toggles.touch) && (
                <TouchControls variant="overlay" rotated={rotated} {...handlers} />
              )}
              <div className={styles.fsBar}>
                <button type="button" onClick={fullscreen} aria-label="Sair da tela cheia">
                  SAIR
                </button>
                <button type="button" aria-pressed={toggles.music} onClick={() => toggle('music')}>
                  {toggles.music ? 'SOM' : 'MUDO'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {!fs.active && coarse && (
        <button type="button" className={styles.playFs} onClick={fullscreen}>
          JOGAR EM TELA CHEIA
        </button>
      )}
      {!fs.active && <TouchControls variant="dock" forceVisible={toggles.touch} {...handlers} />}

      {legend}
    </div>
  );
}
