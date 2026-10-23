'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { GameHandle, VirtualButton } from '@/game';
import { ControlBar, type Toggles } from './ControlBar';
import { TouchPad } from './TouchPad';
import { useGameEngine } from './useGameEngine';
import styles from './GameCabinet.module.css';

/** The arcade cabinet column: marquee bar, 16:9 screen, touch pad and the controls legend. */
export function GameCabinet({ legend }: { legend: ReactNode }) {
  const screenRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [toggles, setToggles] = useState<Toggles>({ music: true, voice: true, crt: false, touch: false });

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

  const fullscreen = () => {
    const screen = screenRef.current;
    if (!screen) return;
    const request = document.fullscreenElement ? document.exitFullscreen() : screen.requestFullscreen();
    request?.catch(() => {});
    canvasRef.current?.focus();
  };

  const press = (code: VirtualButton) => gameRef.current?.pressButton(code);
  const release = (code: VirtualButton) => gameRef.current?.releaseButton(code);

  return (
    <div className={styles.cabinet}>
      <header className={styles.marquee}>
        <h1 className={styles.title}>
          <b>BRAINROT</b> BATTAGLIA <span>ULTRA CAOS</span>
        </h1>
        <ControlBar toggles={toggles} onToggle={toggle} onFullscreen={fullscreen} />
      </header>

      <div ref={screenRef} className={`${styles.screen} ${toggles.crt ? styles.crt : ''}`}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={640}
          height={360}
          tabIndex={0}
          aria-label="Brainrot Battaglia, jogo de luta"
        />
      </div>

      <TouchPad forceVisible={toggles.touch} onPress={press} onRelease={release} />

      {legend}
    </div>
  );
}
