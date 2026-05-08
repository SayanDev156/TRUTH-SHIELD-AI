'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GradientButton, GlassCard } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('demo@truthshield.ai');

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <GlassCard className="w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">Password recovery</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Reset your access</h1>
        <p className="mt-3 text-sm leading-7 text-white/60">We’ll send a secure reset link to your inbox.</p>
        <div className="mt-6 space-y-4">
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none placeholder:text-white/35" placeholder="Email" />
          <GradientButton type="submit" className="w-full">Send reset link</GradientButton>
        </div>
        <p className="mt-5 text-sm text-white/55">
          <Link href="/login" className="text-white hover:underline">Back to login</Link>
        </p>
      </GlassCard>
    </main>
  );
}
