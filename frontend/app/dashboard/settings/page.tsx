'use client';

import { useEffect, useState } from 'react';
import { GlassCard, GradientButton } from '@/components/ui';
import { updateProfile, changePassword } from '@/lib/api';
import { getAuthSession, setAuthSession, clearAuthSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { User, Lock, ScanSearch, Bell, Trash2, Check, Eye, EyeOff } from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'scan', label: 'Scan Preferences', icon: ScanSearch },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'danger', label: 'Danger Zone', icon: Trash2 },
] as const;

type Tab = (typeof TABS)[number]['id'];

const PREF_KEY = 'truthshield.prefs';
const NOTIF_KEY = 'truthshield.notif';

function loadPrefs() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(PREF_KEY) || 'null'); } catch { return null; }
}
function loadNotif() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || 'null'); } catch { return null; }
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-neon-blue' : 'bg-white/20'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

function SaveBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
      <Check className="h-4 w-4" /> Saved successfully
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('profile');
  const session = typeof window !== 'undefined' ? getAuthSession() : null;

  // ── Profile ──────────────────────────────────────────────
  const [fullName, setFullName] = useState(session?.user.full_name ?? '');
  const [locale, setLocale] = useState(session?.user.locale ?? 'en');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  // ── Security ─────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');

  const pwStrength = (() => {
    if (!newPw) return null;
    let s = 0;
    if (newPw.length >= 8) s++;
    if (/[A-Z]/.test(newPw)) s++;
    if (/[0-9]/.test(newPw)) s++;
    if (/[^A-Za-z0-9]/.test(newPw)) s++;
    if (s <= 1) return { label: 'Weak', color: 'bg-red-500', w: 'w-1/4' };
    if (s === 2) return { label: 'Fair', color: 'bg-yellow-500', w: 'w-2/4' };
    if (s === 3) return { label: 'Good', color: 'bg-blue-500', w: 'w-3/4' };
    return { label: 'Strong', color: 'bg-green-500', w: 'w-full' };
  })();

  // ── Scan Preferences ─────────────────────────────────────
  const defaultPrefs = { defaultScanType: 'fake_news', defaultLanguage: 'en', autoSaveHistory: true, showExplanations: true, riskThreshold: '50' };
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [prefSaved, setPrefSaved] = useState(false);

  // ── Notifications ─────────────────────────────────────────
  const defaultNotif = { highRiskAlerts: true, scanComplete: true, weeklyDigest: false, adminAlerts: false };
  const [notif, setNotif] = useState(defaultNotif);
  const [notifSaved, setNotifSaved] = useState(false);

  useEffect(() => {
    const p = loadPrefs();
    if (p) setPrefs(p);
    const n = loadNotif();
    if (n) setNotif(n);
  }, []);

  // ── Handlers ─────────────────────────────────────────────
  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    try {
      const updated = await updateProfile({ full_name: fullName, locale });
      if (session) {
        setAuthSession({ ...session, user: { ...session.user, full_name: updated.full_name, locale: updated.locale } });
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPwError('');
    if (newPw !== confirmPw) { setPwError('New passwords do not match'); return; }
    if (newPw.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    setPwSaving(true);
    try {
      await changePassword({ current_password: currentPw, new_password: newPw });
      setPwSaved(true);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  }

  function handlePrefSave(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 3000);
  }

  function handleNotifSave(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notif));
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 3000);
  }

  function handleDeleteAccount() {
    if (!confirm('Are you sure? This will clear your local session. This action cannot be undone.')) return;
    clearAuthSession();
    localStorage.removeItem(PREF_KEY);
    localStorage.removeItem(NOTIF_KEY);
    router.push('/login');
  }

  const inputCls = 'w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none transition focus:border-neon-blue/50 focus:bg-slate-950/70';
  const selectCls = 'w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm outline-none transition focus:border-neon-blue/50';
  const rowCls = 'flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3';

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">Settings</p>
        <h2 className="mt-2 text-2xl font-semibold">Account &amp; Preferences</h2>
        <p className="mt-1 text-sm text-white/55">Manage your profile, security, scan defaults, and notifications.</p>
      </GlassCard>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm transition ${
              tab === id
                ? id === 'danger'
                  ? 'border-red-500/50 bg-red-500/10 text-red-400'
                  : 'border-neon-blue bg-neon-blue/10 text-white'
                : 'border-white/10 text-white/55 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── PROFILE ── */}
      {tab === 'profile' && (
        <GlassCard>
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Profile</p>
          <h3 className="mt-2 text-xl font-semibold">Personal information</h3>

          {/* Avatar */}
          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple text-2xl font-bold text-slate-950">
              {(fullName || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{session?.user.full_name ?? 'User'}</p>
              <p className="text-xs text-white/50">{session?.user.email}</p>
              <p className="mt-1 text-xs text-white/40">
                {session?.user.is_admin ? (
                  <span className="text-neon-purple">Admin account</span>
                ) : (
                  <span>Standard account</span>
                )}
                {' · '}Member since {session?.user.created_at ? new Date(session.user.created_at).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">Full Name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} required minLength={2} className={inputCls} placeholder="Your full name" />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">Email</label>
              <input value={session?.user.email ?? ''} disabled className={`${inputCls} cursor-not-allowed opacity-50`} />
              <p className="mt-1 text-xs text-white/35">Email cannot be changed after registration.</p>
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">Language</label>
              <select value={locale} onChange={e => setLocale(e.target.value)} className={selectCls}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="bn">Bengali</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <GradientButton type="submit">{profileSaving ? 'Saving…' : 'Save Profile'}</GradientButton>
            </div>
            <SaveBanner show={profileSaved} />
            {profileError && <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{profileError}</p>}
          </form>
        </GlassCard>
      )}

      {/* ── SECURITY ── */}
      {tab === 'security' && (
        <div className="space-y-5">
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Security</p>
            <h3 className="mt-2 text-xl font-semibold">Change password</h3>
            <form onSubmit={handlePasswordSave} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">Current Password</label>
                <div className="relative">
                  <input value={currentPw} onChange={e => setCurrentPw(e.target.value)} type={showCurrent ? 'text' : 'password'} required className={`${inputCls} pr-12`} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">New Password</label>
                <div className="relative">
                  <input value={newPw} onChange={e => setNewPw(e.target.value)} type={showNew ? 'text' : 'password'} required minLength={8} className={`${inputCls} pr-12`} placeholder="Min. 8 characters" />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {pwStrength && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full rounded-full bg-white/10">
                      <div className={`h-1.5 rounded-full transition-all ${pwStrength.color} ${pwStrength.w}`} />
                    </div>
                    <p className="mt-1 text-xs text-white/45">{pwStrength.label}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">Confirm New Password</label>
                <input value={confirmPw} onChange={e => setConfirmPw(e.target.value)} type="password" required className={inputCls} placeholder="Repeat new password" />
              </div>
              <GradientButton type="submit">{pwSaving ? 'Updating…' : 'Update Password'}</GradientButton>
              <SaveBanner show={pwSaved} />
              {pwError && <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{pwError}</p>}
            </form>
          </GlassCard>

          <GlassCard>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">System</p>
            <h3 className="mt-2 text-xl font-semibold">Authentication info</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className={rowCls}><span className="text-white/60">JWT session expiry</span><span className="font-medium">120 minutes</span></div>
              <div className={rowCls}><span className="text-white/60">Rate limiting</span><span className="font-medium text-green-400">Enabled</span></div>
              <div className={rowCls}><span className="text-white/60">Upload validation</span><span className="font-medium text-green-400">Strict MIME checks</span></div>
              <div className={rowCls}><span className="text-white/60">CORS policy</span><span className="font-medium text-green-400">Configured</span></div>
              <div className={rowCls}><span className="text-white/60">Password hashing</span><span className="font-medium">PBKDF2-SHA256</span></div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ── SCAN PREFERENCES ── */}
      {tab === 'scan' && (
        <GlassCard>
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Scan Preferences</p>
          <h3 className="mt-2 text-xl font-semibold">Default scan settings</h3>
          <form onSubmit={handlePrefSave} className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">Default Scan Type</label>
              <select value={prefs.defaultScanType} onChange={e => setPrefs(p => ({ ...p, defaultScanType: e.target.value }))} className={selectCls}>
                <option value="fake_news">Fake News Detection</option>
                <option value="deepfake">Deepfake Detection</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">Default Language</label>
              <select value={prefs.defaultLanguage} onChange={e => setPrefs(p => ({ ...p, defaultLanguage: e.target.value }))} className={selectCls}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="bn">Bengali</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">Risk Alert Threshold: {prefs.riskThreshold}%</label>
              <input
                type="range" min="10" max="90" step="5"
                value={prefs.riskThreshold}
                onChange={e => setPrefs(p => ({ ...p, riskThreshold: e.target.value }))}
                className="w-full accent-neon-blue"
              />
              <div className="mt-1 flex justify-between text-xs text-white/35">
                <span>10% (sensitive)</span><span>90% (strict)</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className={rowCls}>
                <div>
                  <p className="text-sm">Auto-save scan history</p>
                  <p className="text-xs text-white/45">Save every scan result to your history automatically</p>
                </div>
                <Toggle checked={prefs.autoSaveHistory} onChange={v => setPrefs(p => ({ ...p, autoSaveHistory: v }))} />
              </div>
              <div className={rowCls}>
                <div>
                  <p className="text-sm">Show AI explanations</p>
                  <p className="text-xs text-white/45">Display explainability notes with every scan result</p>
                </div>
                <Toggle checked={prefs.showExplanations} onChange={v => setPrefs(p => ({ ...p, showExplanations: v }))} />
              </div>
            </div>
            <GradientButton type="submit">Save Preferences</GradientButton>
            <SaveBanner show={prefSaved} />
          </form>
        </GlassCard>
      )}

      {/* ── NOTIFICATIONS ── */}
      {tab === 'notifications' && (
        <GlassCard>
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Notifications</p>
          <h3 className="mt-2 text-xl font-semibold">Alert preferences</h3>
          <form onSubmit={handleNotifSave} className="mt-5 space-y-3">
            <div className={rowCls}>
              <div>
                <p className="text-sm">High-risk scan alerts</p>
                <p className="text-xs text-white/45">Get notified when a scan returns risk score above your threshold</p>
              </div>
              <Toggle checked={notif.highRiskAlerts} onChange={v => setNotif(n => ({ ...n, highRiskAlerts: v }))} />
            </div>
            <div className={rowCls}>
              <div>
                <p className="text-sm">Scan complete notifications</p>
                <p className="text-xs text-white/45">Show a banner when each scan finishes processing</p>
              </div>
              <Toggle checked={notif.scanComplete} onChange={v => setNotif(n => ({ ...n, scanComplete: v }))} />
            </div>
            <div className={rowCls}>
              <div>
                <p className="text-sm">Weekly digest</p>
                <p className="text-xs text-white/45">Summary of your scan activity over the past 7 days</p>
              </div>
              <Toggle checked={notif.weeklyDigest} onChange={v => setNotif(n => ({ ...n, weeklyDigest: v }))} />
            </div>
            {session?.user.is_admin && (
              <div className={rowCls}>
                <div>
                  <p className="text-sm">Admin system alerts</p>
                  <p className="text-xs text-white/45">Notify on new user registrations and anomaly spikes</p>
                </div>
                <Toggle checked={notif.adminAlerts} onChange={v => setNotif(n => ({ ...n, adminAlerts: v }))} />
              </div>
            )}
            <div className="pt-2">
              <GradientButton type="submit">Save Notifications</GradientButton>
            </div>
            <SaveBanner show={notifSaved} />
          </form>
        </GlassCard>
      )}

      {/* ── DANGER ZONE ── */}
      {tab === 'danger' && (
        <div className="space-y-5">
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.28em] text-red-400/70">Danger Zone</p>
            <h3 className="mt-2 text-xl font-semibold">Destructive actions</h3>
            <p className="mt-2 text-sm text-white/55">These actions are irreversible. Please proceed with caution.</p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Clear scan history</p>
                    <p className="mt-1 text-xs text-white/45">Remove all your scan records from the local session. MongoDB records are retained.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { if (confirm('Clear local scan history cache?')) { localStorage.removeItem('truthshield.history'); alert('Local cache cleared.'); } }}
                    className="shrink-0 rounded-2xl border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5"
                  >
                    Clear cache
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Reset preferences</p>
                    <p className="mt-1 text-xs text-white/45">Restore all scan preferences and notification settings to defaults.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem(PREF_KEY);
                      localStorage.removeItem(NOTIF_KEY);
                      setPrefs(defaultPrefs);
                      setNotif(defaultNotif);
                      alert('Preferences reset to defaults.');
                    }}
                    className="shrink-0 rounded-2xl border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-red-400">Sign out of all sessions</p>
                    <p className="mt-1 text-xs text-white/45">Clear your JWT token and all local data, then redirect to login.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="shrink-0 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/20"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Session info</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className={rowCls}><span className="text-white/60">Account ID</span><span className="font-mono text-xs text-white/70">{session?.user.id ?? '—'}</span></div>
              <div className={rowCls}><span className="text-white/60">Role</span><span className={session?.user.is_admin ? 'text-neon-purple' : 'text-white/80'}>{session?.user.is_admin ? 'Admin' : 'User'}</span></div>
              <div className={rowCls}><span className="text-white/60">Locale</span><span>{session?.user.locale ?? '—'}</span></div>
              <div className={rowCls}><span className="text-white/60">Token</span><span className="font-mono text-xs text-white/40">{session?.access_token ? session.access_token.slice(0, 24) + '…' : '—'}</span></div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
