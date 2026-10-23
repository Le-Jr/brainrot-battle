'use client';

import { useEffect, useRef, type RefObject } from 'react';
import type { GameHandle } from '@/game';
import { pixelFont } from '@/app/fonts';

/**
 * Boots the canvas engine on the given canvas once it is mounted (client only: the engine
 * touches window, document and Web Audio, so it is loaded with a dynamic import).
 * Returns a ref to the live handle; it is null until the engine module has loaded.
 */
export function useGameEngine(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  onReady?: (game: GameHandle) => void,
) {
  const gameRef = useRef<GameHandle | null>(null);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let handle: GameHandle | null = null;

    import('@/game').then(({ createGame }) => {
      if (cancelled) return;
      handle = createGame({ canvas, fontFamily: pixelFont.style.fontFamily });
      gameRef.current = handle;
      onReadyRef.current?.(handle);
    });

    return () => {
      cancelled = true;
      handle?.destroy();
      gameRef.current = null;
    };
  }, [canvasRef]);

  return gameRef;
}
