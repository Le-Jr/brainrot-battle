import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { pixelFont } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  // Public URL used for absolute Open Graph links (set NEXT_PUBLIC_SITE_URL when deploying)
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Brainrot Battaglia: Ultra Caos',
  description:
    'Jogo de luta 2D no estilo Street Fighter II com os memes do Italian brainrot: 8 lutadores, um chefe cósmico, modo história, versus, treino e fases bônus.',
  applicationName: 'Brainrot Battaglia',
  openGraph: {
    title: 'Brainrot Battaglia: Ultra Caos',
    description: 'Tralalero, Tung Tung Sahur, Bombardiro e companhia contra La Vacca Saturnita.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export const viewport: Viewport = {
  themeColor: '#0c0814',
  colorScheme: 'dark',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={pixelFont.variable}>
      <body>{children}</body>
    </html>
  );
}
