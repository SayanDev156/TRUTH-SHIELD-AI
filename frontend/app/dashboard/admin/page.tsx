'use client';

import { useEffect, useState } from 'react';
import { getAdminStats, getAdminUsers } from '@/lib/api';
import { HistoryItem } from '@/lib/types';
import { GlassCard, MetricCard, Pill } from '@/components/ui';
import { Users, BarChart3 } from 'lucide-react';

function progressWidthClass(percent: number) {
  if (percent >= 95) return 'w-[95%]';
  if (percent >= 90) return 'w-[90%]';
  if (percent >= 80) return 'w-[80%]';
  if (percent >= 70) return 'w-[70%]';
  if (percent >= 60) return 'w-[60%]';
  if (percent >= 50) return 'w-1/2';
  if (percent >= 40) return 'w-[40%]';
  if (percent >= 30) return 'w-[30%]';
  if (percent >= 20) return 'w-[20%]';
  return 'w-[10%]';
}

type AdminUser = { id: string; full_name: string; email: string; is_admin: boolean; locale: string; created_at: string };

export default function AdminPage() {
  const [tab, setTab] = useState<'stats' | 'users'>('stats');
  const [stats, setStats] = useState<null | {
    total_users: number;
    total_scans: number;
    fake_news_scans: number;
    deepfake_scans: number;
    average_accuracy: number;
    recent_activity: HistoryItem[];
    model_metrics: Array<{ name: string; accuracy: number; precision: number; recall: number; f1: number }>;
  }>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : 'Unable to load admin stats'));
    getAdminUsers()
      .then((r) => setUsers(r.items))
      .catch(() => setUsers([]));
  }, []);

  return (
    <div className="space-y-6">
      {error && (
        <GlassCard>
          <h2 className="text-xl font-semibold">Admin access required</h2>
          <p className="mt-2 text-sm text-white/60">Sign in with an admin account to view this panel.</p>
          <p className="mt-3 text-sm text-red-300">{error}</p>
        </GlassCard>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Users" value={stats ? String(stats.total_users) : '—'} hint="Registered accounts" />
        <MetricCard label="Scans" value={stats ? String(stats.total_scans) : '—'} hint="All detector runs" />
        <MetricCard label="Fake News" value={stats ? String(stats.fake_news_scans) : '—'} hint="Text scans" />
        <MetricCard label="Deepfake" value={stats ? String(stats.deepfake_scans) : '—'} hint="Media scans" />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setTab('stats')}
          className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm transition ${
            tab === 'stats' ? 'border-neon-blue bg-neon-blue/10 text-white' : 'border-white/12 text-white/60 hover:bg-white/5'
          }`}
        >
          <BarChart3 className="h-4 w-4" /> Model Stats
        </button>
        <button
          onClick={() => setTab('users')}
          className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm transition ${
            tab === 'users' ? 'border-neon-blue bg-neon-blue/10 text-white' : 'border-white/12 text-white/60 hover:bg-white/5'
          }`}
        >
          <Users className="h-4 w-4" /> All Users
        </button>
      </div>

      {tab === 'stats' && (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <GlassCard>
            <h2 className="text-2xl font-semibold">Model accuracy stats</h2>
            <div className="mt-5 space-y-4">
              {(stats?.model_metrics ?? []).map((metric) => (
                <div key={metric.name} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span>{metric.name}</span>
                    <span>{Math.round(metric.accuracy * 100)}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className={`h-2 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple ${progressWidthClass(metric.accuracy * 100)}`} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-white/50">
                    <span>P: {Math.round(metric.precision * 100)}%</span>
                    <span>R: {Math.round(metric.recall * 100)}%</span>
                    <span>F1: {Math.round(metric.f1 * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard>
            <h2 className="text-2xl font-semibold">Recent activity</h2>
            <div className="mt-5 space-y-3">
              {(stats?.recent_activity ?? []).map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-white">{item.title}</span>
                    <Pill>{item.label}</Pill>
                  </div>
                  <div className="mt-1 text-xs text-white/50">
                    {item.scan_type} · {item.user_email} · {Math.round(item.confidence * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {tab === 'users' && (
        <GlassCard>
          <h2 className="text-2xl font-semibold">Registered users</h2>
          <p className="mt-1 text-sm text-white/55">{users.length} account{users.length !== 1 ? 's' : ''} in MongoDB</p>
          <div className="mt-5 space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple text-xs font-bold text-slate-950">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.full_name}</p>
                    <p className="text-xs text-white/50">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill>{user.is_admin ? 'Admin' : 'User'}</Pill>
                  <span className="text-xs text-white/40">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {!users.length && <p className="text-sm text-white/50">No users found.</p>}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
