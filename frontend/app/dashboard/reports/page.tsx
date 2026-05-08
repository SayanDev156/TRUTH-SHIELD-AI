'use client';

import { useEffect, useState } from 'react';
import { getHistory } from '@/lib/api';
import { HistoryItem } from '@/lib/types';
import { GlassCard, GradientButton, Pill } from '@/components/ui';

export default function ReportsPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    getHistory()
      .then((r) => { if (mounted) setItems(r.items); })
      .catch(() => { if (mounted) setItems([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = items.filter((item) =>
    !filter || item.scan_type === filter
  );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });

  const toggleAll = () =>
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((i) => i.id)));

  const reportItems = filtered.filter((i) => selected.has(i.id));

  const handleGeneratePDF = () => {
    if (!reportItems.length) { alert('Select at least one scan to generate a report.'); return; }
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const rows = reportItems
      .map(
        (item) => `
        <tr>
          <td>${item.title}</td>
          <td>${item.scan_type.replace('_', ' ')}</td>
          <td>${item.label}</td>
          <td>${Math.round(item.confidence * 100)}%</td>
          <td>${Math.round(item.risk_score * 100)}%</td>
          <td>${item.summary}</td>
          <td>${new Date(item.created_at).toLocaleString()}</td>
        </tr>`
      )
      .join('');
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>TruthShield AI – Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        p.sub { color: #555; font-size: 13px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #1a1a2e; color: #fff; padding: 10px 8px; text-align: left; }
        td { padding: 9px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        tr:nth-child(even) td { background: #f9fafb; }
        .badge { display:inline-block; padding:2px 8px; border-radius:999px; font-size:11px; font-weight:600; }
        .fake { background:#fee2e2; color:#b91c1c; }
        .real { background:#dcfce7; color:#15803d; }
        .footer { margin-top: 32px; font-size: 11px; color: #999; }
      </style></head><body>
      <h1>TruthShield AI – Evidence Report</h1>
      <p class="sub">Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp; Scans included: ${reportItems.length}</p>
      <table>
        <thead><tr><th>Title</th><th>Type</th><th>Verdict</th><th>Confidence</th><th>Risk</th><th>Summary</th><th>Date</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer">TruthShield AI &mdash; Verify before you amplify. This report is auto-generated and should be reviewed by a qualified analyst.</div>
      </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 400);
  };

  const handleShareBundle = async () => {
    if (!reportItems.length) { alert('Select at least one scan to share.'); return; }
    const bundle = {
      generated_at: new Date().toISOString(),
      source: 'TruthShield AI',
      scans: reportItems.map(({ id, title, scan_type, label, confidence, risk_score, summary, created_at, metadata }) => ({
        id, title, scan_type, label,
        confidence: Math.round(confidence * 100) + '%',
        risk_score: Math.round(risk_score * 100) + '%',
        summary, created_at, metadata,
      })),
    };
    await navigator.clipboard.writeText(JSON.stringify(bundle, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header + actions */}
      <GlassCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Reports</p>
            <h2 className="mt-2 text-2xl font-semibold">Export scans as PDF</h2>
            <p className="mt-1 text-sm text-white/60">
              {selected.size > 0 ? `${selected.size} scan${selected.size > 1 ? 's' : ''} selected` : 'Select scans below to include in the report.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <GradientButton onClick={handleGeneratePDF}>Generate PDF</GradientButton>
            <button
              onClick={handleShareBundle}
              className="rounded-full border border-white/12 px-5 py-3 text-sm text-white/75 transition hover:bg-white/10"
            >
              {copied ? '✓ Copied to clipboard' : 'Share evidence bundle'}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Filter + select-all */}
      <div className="flex flex-wrap items-center gap-3">
        {['', 'fake_news', 'deepfake'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`rounded-full border px-4 py-2 text-xs transition ${
              filter === type ? 'border-neon-blue bg-neon-blue/10 text-white' : 'border-white/12 text-white/60 hover:bg-white/5'
            }`}
          >
            {type === '' ? 'All' : type === 'fake_news' ? 'Fake News' : 'Deepfake'}
          </button>
        ))}
        {filtered.length > 0 && (
          <button onClick={toggleAll} className="ml-auto text-xs text-white/50 hover:text-white/80 transition">
            {selected.size === filtered.length ? 'Deselect all' : 'Select all'}
          </button>
        )}
      </div>

      {/* Scan list */}
      {loading && <GlassCard>Loading scans…</GlassCard>}
      {!loading && !filtered.length && <GlassCard>No scans found.</GlassCard>}
      <div className="grid gap-3">
        {filtered.map((item) => {
          const isSelected = selected.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`w-full rounded-3xl border p-5 text-left backdrop-blur-xl transition ${
                isSelected
                  ? 'border-neon-blue/60 bg-neon-blue/10 shadow-glow'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-4 w-4 shrink-0 rounded border-2 transition ${
                    isSelected ? 'border-neon-blue bg-neon-blue' : 'border-white/30'
                  }`} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{item.title}</span>
                      <Pill>{item.scan_type.replace('_', ' ')}</Pill>
                      <Pill>{item.label}</Pill>
                    </div>
                    <p className="mt-1 text-sm text-white/60">{item.summary}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right text-sm text-white/55">
                  <div>Confidence: {Math.round(item.confidence * 100)}%</div>
                  <div>Risk: {Math.round(item.risk_score * 100)}%</div>
                  <div className="text-xs">{new Date(item.created_at).toLocaleString()}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Included sections info */}
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">Included in report</p>
        <ul className="mt-4 space-y-2 text-sm text-white/65">
          <li>• Scan metadata and source URL</li>
          <li>• Flagged phrases and media anomalies</li>
          <li>• Model confidence and risk scores</li>
          <li>• Verdict label and audit trail</li>
          <li>• Recommended next verification steps</li>
        </ul>
      </GlassCard>
    </div>
  );
}
