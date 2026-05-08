import './globals.css';
import type { Metadata } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });

export const metadata: Metadata = {
  title: 'TruthShield AI',
  description: 'Fake news and deepfake detection platform for high-trust verification.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${manrope.variable}`}>
      <body>
        <div id="ts-bg-grid" aria-hidden="true" />
        <div id="ts-bg-orb2" aria-hidden="true" />
        <div id="ts-bg-orb3" aria-hidden="true" />
        <div id="ts-bg-scan" aria-hidden="true" />
        <div aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="ts-particle" />
          ))}
        </div>
        {children}
      </body>
    </html>
  );
}