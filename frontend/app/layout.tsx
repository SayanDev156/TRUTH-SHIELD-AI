import './globals.css';
import type { Metadata } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });

export const metadata: Metadata = {
  title: 'TruthShield AI',
  description: 'Fake news and deepfake detection platform for high-trust verification.',
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/favicon.png', type: 'image/png' }],
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${manrope.variable}`}>
      <body>
        {/* ── Animated background elements ── */}
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
