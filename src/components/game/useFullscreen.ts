'use client';

import { useCallback, useEffect, useState, type RefObject } from 'react';

type Mode = 'off' | 'native' | 'pseudo';

interface WebkitDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => void;
}
interface WebkitElement extends HTMLElement {
  webkitRequestFullscreen?: () => void;
}
interface LockableOrientation extends ScreenOrientation {
  lock?: (orientation: 'landscape') => Promise<void>;
}

const fullscreenElement = () => {
  const d = document as WebkitDocument;
  return d.fullscreenElement ?? d.webkitFullscreenElement ?? null;
};

/**
 * Fullscreen for the game stage that prefers landscape:
 * - "native": the Fullscreen API plus an orientation lock to landscape (Android/Chrome, desktop);
 * - "pseudo": a fixed full-viewport layer when the API is missing or refused (iPhone Safari). The stage CSS
 *   rotates it to landscape while the phone is held upright.
 */
export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const [mode, setMode] = useState<Mode>('off');

  useEffect(() => {
    const sync = () => setMode((m) => (m === 'native' && !fullscreenElement() ? 'off' : m));
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', sync);
    };
  }, []);

  // the pseudo mode must not let the page scroll behind it
  useEffect(() => {
    if (mode !== 'pseudo') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mode]);

  const enter = useCallback(async () => {
    const el = ref.current as WebkitElement | null;
    if (!el) return;
    try {
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } catch {
      // refused: fall through to the pseudo mode
    }
    if (fullscreenElement() === el) {
      setMode('native');
      try {
        await (screen.orientation as LockableOrientation | undefined)?.lock?.('landscape');
      } catch {
        // orientation lock is not supported everywhere; the CSS rotation covers it
      }
    } else setMode('pseudo');
  }, [ref]);

  const exit = useCallback(async () => {
    if (fullscreenElement()) {
      try {
        screen.orientation?.unlock?.();
        const d = document as WebkitDocument;
        if (d.exitFullscreen) await d.exitFullscreen();
        else d.webkitExitFullscreen?.();
      } catch {
        // already out
      }
    }
    setMode('off');
  }, []);

  return { mode, active: mode !== 'off', enter, exit };
}
