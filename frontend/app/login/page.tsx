'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { GradientButton, GlassCard } from '@/components/ui';
import { loginUser } from '@/lib/api';
import { setAuthSession } from '@/lib/auth';
import { User, Crown } from 'lucide-react';
import { TruthShieldLogo } from '@/components/logo';

export default function LoginPage() {


  const router = useRouter();
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const session = await loginUser({ email, password });
      setAuthSession(session);
      router.push(session.user.is_admin ? '/dashboard/admin' : '/dashboard');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to log in');
    } finally {
      setLoading(false);
    }
  }

  const fillDemo = () => {
    if (role === 'admin') {
      setEmail('demo@truthshield.ai');
      setPassword('Demo@12345');
    } else {
      setEmail('user@truthshield.ai');
      setPassword('User@12345');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/auth/google/login`;
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#050816] px-6 py-12 text-white">

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(154,106,255,0.2),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(58,190,255,0.16),_transparent_28%)]" />
      <GlassCard className="relative z-10 w-full max-w-lg">
        <div className="flex items-center gap-3">
          <TruthShieldLogo size={48} />
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Authentication</p>
            <h1 className="font-display text-2xl font-semibold">Welcome back</h1>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-white/60">
          Sign in to access scan history, detector outputs, and analytics dashboard.
        </p>

        {/* Role selector */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('user')}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
              role === 'user'
                ? 'border-neon-blue bg-neon-blue/10 text-white shadow-glow'
                : 'border-white/12 text-white/60 hover:bg-white/5'
            }`}
          >
            <User className="h-4 w-4" />
            User Login
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
              role === 'admin'
                ? 'border-neon-purple bg-neon-purple/10 text-white shadow-glow'
                : 'border-white/12 text-white/60 hover:bg-white/5'
            }`}
          >
            <Crown className="h-4 w-4" />
            Admin Login
          </button>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition hover:bg-white/10"
          >
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/20">G</span>
            Continue with Google
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none transition focus:border-neon-blue/50 focus:bg-slate-950/70"
              placeholder={role === 'admin' ? 'admin@truthshield.ai' : 'user@truthshield.ai'}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none transition focus:border-neon-blue/50 focus:bg-slate-950/70"
              placeholder="••••••••"
            />
          </div>
          <GradientButton type="submit" className="w-full">
            {loading ? 'Signing in...' : 'Sign in'}
          </GradientButton>
          {error && <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <button onClick={fillDemo} className="text-white/55 transition hover:text-white">
            Fill demo credentials
          </button>
          <Link href="/register" className="text-white/55 transition hover:text-white">
            Create account
          </Link>
        </div>

        {/* Demo credentials info */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-white/45">Demo Credentials</p>
          <div className="mt-3 space-y-2 text-xs text-white/65">
            <div>
              <span className="text-white/45">User:</span> user@truthshield.ai / User@12345
            </div>
            <div>
              <span className="text-white/45">Admin:</span> demo@truthshield.ai / Demo@12345
            </div>
          </div>
        </div>
      </GlassCard>
    </main>
  );
}
