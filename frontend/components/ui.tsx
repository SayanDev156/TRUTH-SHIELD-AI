import { ReactNode } from 'react';

export function GlassCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function MetricCard({ label, value, hint, accent = 'text-white' }: { label: string; value: string; hint: string; accent?: string }) {
  return (
    <GlassCard className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-70" />
      <p className="text-xs uppercase tracking-[0.3em] text-white/45">{label}</p>
      <div className={`mt-3 text-3xl font-semibold ${accent}`}>{value}</div>
      <p className="mt-2 text-sm text-white/60">{hint}</p>
    </GlassCard>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs text-white/75">{children}</span>;
}

export function GradientButton({ children, className = '', type = 'button', onClick }: { children: ReactNode; className?: string; type?: 'button' | 'submit'; onClick?: () => void }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink px-5 py-3 text-sm font-semibold text-slate-950 shadow-glow transition-transform hover:-translate-y-0.5 ${className}`}
    >
      {children}
    </button>
  );
}
