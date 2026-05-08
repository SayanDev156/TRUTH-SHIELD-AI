'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Activity, ScanFace, History, BarChart3, Settings, LayoutDashboard, Users, LogOut, ChevronDown } from 'lucide-react';
import { TruthShieldLogo } from '@/components/logo';
import { getAuthSession, clearAuthSession } from '@/lib/auth';
import { AuthSession } from '@/lib/types';

const userNavItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/fake-news', label: 'Fake News Detector', icon: ScanFace },
  { href: '/dashboard/deepfake', label: 'Deepfake Detector', icon: Activity },
  { href: '/dashboard/history', label: 'Scan History', icon: History },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const adminNavItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/fake-news', label: 'Fake News Detector', icon: ScanFace },
  { href: '/dashboard/deepfake', label: 'Deepfake Detector', icon: Activity },
  { href: '/dashboard/history', label: 'All Scans', icon: History },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/admin', label: 'Admin Panel', icon: Users },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    setSession(getAuthSession());
  }, []);

  const navItems = session?.user?.is_admin ? adminNavItems : userNavItems;

  const handleLogout = () => {
    clearAuthSession();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(154,106,255,0.2),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(58,190,255,0.16),_transparent_28%)]" />
      <div className="fixed inset-0 bg-[length:22px_22px] bg-radial-grid opacity-20" />
      <div className="relative z-0 flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-white/10 bg-white/5 px-5 py-6 backdrop-blur-xl xl:flex">
          <Link href="/" className="mb-10 flex items-center gap-3">
            <TruthShieldLogo size={44} />
            <div>
              <p className="font-display text-xl font-semibold">TruthShield AI</p>
              <p className="text-xs tracking-[0.24em] text-white/45">Verify before you amplify</p>
            </div>
          </Link>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    active ? 'bg-white/10 text-white shadow-glow' : 'text-white/65 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User info + logout at bottom of sidebar */}
          {session && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple text-xs font-bold text-slate-950">
                  {session.user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{session.user.full_name}</p>
                  <p className="truncate text-xs text-white/50">
                    {session.user.is_admin ? (
                      <span className="text-neon-purple">Admin</span>
                    ) : (
                      <span className="text-white/50">User</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="shrink-0 rounded-xl p-2 text-white/40 transition hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </aside>

        <div className="flex-1">
          <header className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl lg:px-8">
            <div className="flex items-center gap-3">
              <TruthShieldLogo size={40} />
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">TruthShield AI</p>
                <h1 className="font-display text-xl font-semibold text-white">Fake News + Deepfake Detector</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((s) => !s)}
                    className="flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple text-xs font-bold text-slate-950">
                      {session.user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block">{session.user.full_name}</span>
                    {session.user.is_admin && (
                      <span className="hidden rounded-full bg-neon-purple/20 px-2 py-0.5 text-xs text-neon-purple md:block">Admin</span>
                    )}
                    <ChevronDown className="h-3 w-3 text-white/40" />
                  </button>
                  {userMenuOpen &&
                    createPortal(
                      <div className="fixed right-6 top-16 mt-2 w-48 rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-xl backdrop-blur-xl z-[99999]">
                        <div className="px-3 py-2">
                          <p className="text-xs text-white/40">Signed in as</p>
                          <p className="truncate text-sm font-medium text-white">{session.user.email}</p>
                        </div>
                        <div className="my-1 border-t border-white/10" />
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>,
                      document.body
                    )}
                </div>
              ) : (
                <Link href="/login" className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/75 transition hover:bg-white/8">
                  Login
                </Link>
              )}
            </div>
          </header>
          <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
