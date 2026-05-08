'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { GradientButton, GlassCard } from '@/components/ui';
import { registerUser } from '@/lib/api';
import { setAuthSession } from '@/lib/auth';
import { User, Crown, Eye, EyeOff } from 'lucide-react';
import { TruthShieldLogo } from '@/components/logo';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = (() => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
    if (score === 2) return { label: 'Fair', color: 'bg-yellow-500', width: 'w-2/4' };
    if (score === 3) return { label: 'Good', color: 'bg-blue-500', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
  })();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const session = await registerUser({
        full_name: fullName,
        email,
        password,
        is_admin: role === 'admin',
        admin_secret: role === 'admin' ? adminSecret : undefined,
      });
      setAuthSession(session);
      router.push(session.user.is_admin ? '/dashboard/admin' : '/dashboard');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#050816] px-6 py-12 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(154,106,255,0.2),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(58,190,255,0.16),_transparent_28%)]" />
      <GlassCard className="relative z-10 w-full max-w-lg">
        <div className="flex items-center gap-3">
          <TruthShieldLogo size={48} />
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Create account</p>
            <h1 className="font-display text-2xl font-semibold">Join TruthShield AI</h1>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-white/60">
          Start detecting fake news and deepfakes with AI-powered analysis.
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
            Register as User
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
            Register as Admin
          </button>
        </div>

        {role === 'admin' && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-neon-purple/30 bg-neon-purple/10 px-4 py-3">
            <Crown className="mt-0.5 h-4 w-4 shrink-0 text-neon-purple" />
            <p className="text-xs leading-5 text-white/70">
              Admin accounts have full access to all user scans, analytics, and system management. An admin secret key is required.
            </p>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={2}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none transition focus:border-neon-blue/50 focus:bg-slate-950/70"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none transition focus:border-neon-blue/50 focus:bg-slate-950/70"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={8}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none transition focus:border-neon-blue/50 focus:bg-slate-950/70"
              placeholder="Min. 8 characters"
            />
            {passwordStrength && (
              <div className="mt-2">
                <div className="h-1.5 w-full rounded-full bg-white/10">
                  <div className={`h-1.5 rounded-full transition-all ${passwordStrength.color} ${passwordStrength.width}`} />
                </div>
                <p className="mt-1 text-xs text-white/45">{passwordStrength.label}</p>
              </div>
            )}
          </div>
          {role === 'admin' && (
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">Admin Secret Key</label>
              <div className="relative">
                <input
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  type={showSecret ? 'text' : 'password'}
                  required
                  className="w-full rounded-2xl border border-neon-purple/30 bg-slate-950/50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-neon-purple/60 focus:bg-slate-950/70"
                  placeholder="Enter admin secret key"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
          <GradientButton type="submit" className="w-full">
            {loading ? 'Creating account...' : `Create ${role === 'admin' ? 'Admin' : 'User'} Account`}
          </GradientButton>
          {error && <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
        </form>

        <p className="mt-5 text-sm text-white/55">
          Already have an account?{' '}
          <Link href="/login" className="text-white transition hover:underline">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </main>
  );
}
