'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui';
import { TruthShieldLogo } from '@/components/logo';
import { setAuthSession } from '@/lib/auth';
import { AuthSession } from '@/lib/types';

function decodeSession(encoded: string): AuthSession {
  const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const json = atob(padded);
  return JSON.parse(json) as AuthSession;
}

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const oauthError = searchParams.get('error') ?? hashParams.get('error');
    const encodedSession = searchParams.get('session') ?? hashParams.get('session');

    if (oauthError) {
      setError(oauthError);
      return;
    }

    if (!encodedSession) {
      setError('Google did not return a login session.');
      return;
    }

    try {
      const session = decodeSession(encodedSession);
      setAuthSession(session);
      router.replace(session.user.is_admin ? '/dashboard/admin' : '/dashboard');
    } catch {
      setError('Unable to read the Google login session.');
    }
  }, [router, searchParams]);

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#050816] px-6 py-12 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(154,106,255,0.2),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(58,190,255,0.16),_transparent_28%)]" />
      <GlassCard className="relative z-10 w-full max-w-md text-center">
        <div className="mx-auto flex w-fit items-center gap-3">
          <TruthShieldLogo size={44} />
          <div className="text-left">
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Google Auth</p>
            <h1 className="font-display text-2xl font-semibold">Signing you in</h1>
          </div>
        </div>

        {error ? (
          <>
            <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
            <Link href="/login" className="mt-5 inline-flex rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/10">
              Back to login
            </Link>
          </>
        ) : (
          <div className="mt-6 flex items-center justify-center gap-3 text-sm text-white/65">
            <Loader2 className="h-4 w-4 animate-spin" />
            Completing Google sign in...
          </div>
        )}
      </GlassCard>
    </main>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={null}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
