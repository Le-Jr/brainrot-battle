import { Press_Start_2P } from 'next/font/google';

/** Self-hosted arcade font, shared by the page (CSS variable) and the canvas engine (font family). */
export const pixelFont = Press_Start_2P({
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-pixel',
});
