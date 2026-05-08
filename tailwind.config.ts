import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './frontend/app/**/*.{ts,tsx}', './frontend/components/**/*.{ts,tsx}', './frontend/lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#050816',
        panel: 'rgba(9, 14, 33, 0.72)',
        neon: {
          blue: '#3ABEFF',
          purple: '#9A6AFF',
          teal: '#33D6C7',
          pink: '#FF5EA8',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(58,190,255,0.28), 0 24px 80px rgba(58,190,255,0.16)',
      },
      backgroundImage: {
        'radial-grid': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
        'hero-orb': 'radial-gradient(circle at 20% 20%, rgba(154,106,255,0.5), transparent 32%), radial-gradient(circle at 80% 10%, rgba(58,190,255,0.42), transparent 28%), radial-gradient(circle at 50% 90%, rgba(51,214,199,0.28), transparent 34%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 4s linear infinite',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-manrope)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;