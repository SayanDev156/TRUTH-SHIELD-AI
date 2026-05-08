'use client';

export function TruthShieldLogo({ size = 44 }: { size?: number }) {
  const svgSize = Math.round(size * 0.58);

  return (
    <div
      className="ts-logo-root relative shrink-0 flex items-center justify-center rounded-2xl overflow-hidden"
      data-size={size}
    >
      <div className="ts-logo-wrap ts-spin absolute inset-0 rounded-2xl" />

      <div className="ts-logo-inset absolute rounded-2xl" />

      <div className="ts-logo-glow-ring ts-glow absolute inset-0 rounded-2xl" />

      <div className="ts-logo-shimmer-bg ts-shimmer absolute inset-0 rounded-2xl pointer-events-none" />

      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        <path
          d="M12 2L4 5.5V11C4 15.418 7.582 19.5 12 21C16.418 19.5 20 15.418 20 11V5.5L12 2Z"
          fill="rgba(0,0,0,0.3)"
          stroke="rgba(255,255,255,0.88)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <ellipse
          cx="12" cy="12" rx="4.2" ry="2.8"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="1.2"
          className="ts-eye"
        />
        <circle cx="12" cy="12" r="1.5" fill="white" className="ts-pulse" />
        <line x1="6.5" y1="12" x2="7.8" y2="12" stroke="rgba(58,190,255,0.9)" strokeWidth="1.2" strokeLinecap="round" className="ts-blink-l" />
        <line x1="16.2" y1="12" x2="17.5" y2="12" stroke="rgba(58,190,255,0.9)" strokeWidth="1.2" strokeLinecap="round" className="ts-blink-r" />
        <line x1="12" y1="7" x2="12" y2="8.2" stroke="rgba(255,255,255,0.55)" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    </div>
  );
}
