'use client';

import { useEffect, useState } from 'react';
import { getHistory } from '@/lib/api';
import { HistoryItem } from '@/lib/types';
import { GlassCard, Pill } from '@/components/ui';
import { useAppLocale } from '@/lib/locale';
import { useDashboardCopy } from '@/lib/dashboard-copy';

export default function HistoryPage() {
  const copy = useDashboardCopy();
  const { formatDateTime } = useAppLocale();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getHistory(search)
      .then((response) => {
        if (mounted) setItems(response.items);
      })
      .catch(() => {
        if (mounted) setItems([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [search]);

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">{copy.history.title}</p>
            <h2 className="mt-2 text-2xl font-semibold">{copy.history.subtitle}</h2>
          </div>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={copy.history.searchPlaceholder} className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none md:max-w-sm" />
        </div>
      </GlassCard>

      <div className="grid gap-4">
        {loading ? <GlassCard>Loading history...</GlassCard> : null}
        {items.map((item) => (
          <GlassCard key={item.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <Pill>{item.scan_type}</Pill>
                  <Pill>{item.label}</Pill>
                </div>
                <p className="mt-2 text-sm leading-7 text-white/60">{item.summary}</p>
              </div>
              <div className="text-sm text-white/60">
                <div>Confidence: {Math.round(item.confidence * 100)}%</div>
                <div>Risk: {Math.round(item.risk_score * 100)}%</div>
                <div>{formatDateTime(item.created_at)}</div>
              </div>
            </div>
          </GlassCard>
        ))}
        {!loading && !items.length ? <GlassCard>{copy.history.noItems}</GlassCard> : null}
      </div>
    </div>
  );
}
