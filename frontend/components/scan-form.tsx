'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { analyzeDeepfake, analyzeFakeNews } from '@/lib/api';
import { ScanResult } from '@/lib/types';
import { GlassCard, GradientButton, Pill } from './ui';
import { useDashboardCopy } from '@/lib/dashboard-copy';

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

export function FakeNewsScanForm() {
  const copy = useDashboardCopy();
  const [title, setTitle] = useState('BREAKING: Scientists reveal a simple cure hidden from the public');
  const [text, setText] = useState('This forwarded post claims a miracle cure and urges everyone to share it now.');
  const [sourceUrl, setSourceUrl] = useState('https://unknown-source.example.com/article');
  const [language, setLanguage] = useState('en');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await analyzeFakeNews({ title, text, source_url: sourceUrl, language });
      setResult(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to analyze text right now');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <GlassCard>
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">{copy.scan.fakeNewsDetector}</p>
            <h2 className="mt-2 text-2xl font-semibold">{copy.scan.analyzeText}</h2>
          </div>
          <Pill>DistilBERT + fallback model</Pill>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={copy.scan.headline} className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none ring-0 placeholder:text-white/35 focus:border-neon-blue/50" />
          <textarea value={text} onChange={(event) => setText(event.target.value)} rows={6} placeholder={copy.scan.articlePlaceholder} className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none placeholder:text-white/35 focus:border-neon-blue/50" />
          <div className="grid gap-4 md:grid-cols-2">
            <input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder={copy.scan.sourceUrl} className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none placeholder:text-white/35 focus:border-neon-blue/50" />
            <select aria-label={copy.scan.language} title={copy.scan.language} value={language} onChange={(event) => setLanguage(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none focus:border-neon-blue/50">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="bn">Bengali</option>
            </select>
          </div>
          <GradientButton type="submit" className="w-full md:w-auto">{loading ? copy.scan.scanning : copy.scan.runFakeNewsScan}</GradientButton>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </form>
      </GlassCard>
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">{copy.scan.output}</p>
        {result ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">{copy.scan.verdict}</span>
                <span className={`text-xl font-semibold ${result.label === 'Fake' ? 'text-red-300' : 'text-emerald-300'}`}>{result.label}</span>
              </div>
              <p className="mt-3 text-3xl font-semibold">{Math.round(result.confidence * 100)}%</p>
              <div className="mt-3 h-3 rounded-full bg-white/10">
                <div className={`h-3 rounded-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink ${progressWidthClass(Math.round(result.risk_score * 100))}`} />
              </div>
              <p className="mt-2 text-xs text-white/45">{copy.scan.riskScore}: {Math.round(result.risk_score * 100)}%</p>
            </div>
            <p className="text-sm leading-7 text-white/70">{result.summary}</p>
            <ul className="space-y-2 text-sm text-white/65">
              {result.explanation.map((item) => (
                <li key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">{item}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-7 text-white/55">{copy.scan.placeholderText}</p>
        )}
      </GlassCard>
    </div>
  );
}

export function DeepfakeScanForm() {
  const copy = useDashboardCopy();
  const [kind, setKind] = useState<'image' | 'video' | 'audio'>('video');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileSizeWarning, setFileSizeWarning] = useState('');

  const MAX_FILE_SIZE = 100 * 1024 * 1024;
  const WARNING_FILE_SIZE = 50 * 1024 * 1024;

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  function handleClearPreview() {
    setFile(null);
    setFileSizeWarning('');
  }

  const uploadAccept =
    kind === 'image'
      ? 'image/png,image/jpeg,image/webp'
      : kind === 'video'
      ? 'video/mp4,video/webm'
      : 'audio/mpeg,audio/wav,audio/mp3';

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError('Please upload a file before scanning');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await analyzeDeepfake(kind, file);
      setResult(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to analyze media right now');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">{copy.scan.deepfakeDetector}</p>
        <h2 className="mt-2 text-2xl font-semibold">{copy.scan.inspectUploads}</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <select
            aria-label={copy.scan.uploadType}
            title={copy.scan.uploadType}
            value={kind}
            onChange={(event) => {
              setKind(event.target.value as 'image' | 'video' | 'audio');
              setFile(null);
              setResult(null);
              setError('');
              setFileSizeWarning('');
            }}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none focus:border-neon-blue/50"
          >
            <option value="image">{copy.scan.image}</option>
            <option value="video">{copy.scan.video}</option>
            <option value="audio">{copy.scan.audio}</option>
          </select>
          <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-10 text-center text-sm text-white/55">
            <input
              type="file"
              accept={uploadAccept}
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                if (!selected) {
                  setFile(null);
                  setFileSizeWarning('');
                  return;
                }

                const type = selected.type;
                if ((kind === 'image' && !type.startsWith('image/')) || (kind === 'video' && !type.startsWith('video/')) || (kind === 'audio' && !type.startsWith('audio/'))) {
                  setError(copy.scan.selectedModeError(kind, type || 'unknown type'));
                  setFile(null);
                  setFileSizeWarning('');
                  return;
                }

                if (selected.size > MAX_FILE_SIZE) {
                  setError(copy.scan.fileTooLarge((selected.size / (1024 * 1024)).toFixed(1)));
                  setFile(null);
                  setFileSizeWarning('');
                  return;
                }

                if (selected.size > WARNING_FILE_SIZE) {
                  setFileSizeWarning(copy.scan.largeFileWarning((selected.size / (1024 * 1024)).toFixed(1)));
                } else {
                  setFileSizeWarning('');
                }

                setError('');
                setFile(selected);
              }}
            />
            <span className="text-base text-white/80">{copy.scan.dropFile}</span>
            <span className="mt-2 text-xs tracking-[0.2em] uppercase">PNG, JPG, MP4, WEBM, WAV, MP3</span>
            {file ? <span className="mt-4 rounded-full border border-neon-blue/30 bg-neon-blue/10 px-3 py-1 text-xs text-neon-blue">{file.name}</span> : null}
          </label>
          {previewUrl && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">{copy.scan.preview}</span>
                <button
                  type="button"
                  onClick={handleClearPreview}
                  className="flex items-center gap-1 rounded-lg bg-red-500/10 px-2 py-1 text-xs text-red-400 transition hover:bg-red-500/20"
                >
                  <X className="h-3 w-3" />
                  {copy.scan.clear}
                </button>
              </div>
              {kind === 'image' && <Image src={previewUrl} alt="preview" width={600} height={400} unoptimized className="mx-auto max-h-60 w-auto rounded-2xl object-contain" />}
              {kind === 'video' && (
                <video src={previewUrl} autoPlay muted controls className="mx-auto max-h-60 w-full rounded-2xl object-contain" />
              )}
              {kind === 'audio' && (
                <audio src={previewUrl} controls className="mx-auto w-full" />
              )}
            </div>
          )}

          {fileSizeWarning && <p className="text-sm text-yellow-400">{fileSizeWarning}</p>}

          <GradientButton type="submit" className="w-full">{loading ? copy.scan.scanning : copy.scan.runDeepfakeScan}</GradientButton>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </form>
      </GlassCard>
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">{copy.scan.analysis}</p>
        {result ? (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-white/45">{copy.scan.realFake}</p>
                <p className={`mt-2 text-3xl font-semibold ${result.label === 'Fake' ? 'text-red-300' : 'text-emerald-300'}`}>{result.label}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-white/45">{copy.scan.probability}</p>
                <p className="mt-2 text-3xl font-semibold">{Math.round(result.confidence * 100)}%</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm text-white/60">{copy.scan.frameScore}</p>
              <div className="space-y-2">
                {(result.frame_scores ?? []).map((score, index) => (
                  <div key={`${index}-${score}`} className="flex items-center gap-3">
                    <span className="w-16 text-xs text-white/45">Frame {index + 1}</span>
                    <div className="h-2 flex-1 rounded-full bg-white/10">
                      <div className={`h-2 rounded-full bg-gradient-to-r from-neon-blue to-neon-pink ${progressWidthClass(Math.min(score * 100, 100))}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/60">{copy.scan.waveformHints}</p>
              <pre className="mt-3 whitespace-pre-wrap text-xs leading-6 text-white/55">{JSON.stringify(result.audio_insights ?? result.regions ?? {}, null, 2)}</pre>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-7 text-white/55">{copy.scan.highlightedRegions}</p>
        )}
      </GlassCard>
    </div>
  );
}
