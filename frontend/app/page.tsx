'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, FileText, Radio, Workflow } from 'lucide-react';
import { TruthShieldLogo } from '@/components/logo';
import { GradientButton, GlassCard, MetricCard, Pill } from '@/components/ui';

const features = [
  { icon: FileText, title: 'Fake News Analysis', text: 'Scan headlines, articles, social posts, forwarded messages, and URLs in one flow.' },
  { icon: BrainCircuit, title: 'Deepfake Detection', text: 'Inspect images, video frames, and audio signals with explainable anomaly scoring.' },
  { icon: Workflow, title: 'Explainable AI', text: 'Show confidence, suspicious spans, media heatmaps, and similarity links for trust.' },
  { icon: Radio, title: 'Live Demo Mode', text: 'A hackathon-ready experience with auth, dashboard, history, and admin insights.' },
];

const stats = [
  { label: 'Scans processed', value: '128K+', hint: 'News and media items verified' },
  { label: 'Flagged content', value: '94.2%', hint: 'High-risk items surfaced clearly' },
  { label: 'Median latency', value: '< 2s', hint: 'Fast enough for live demos' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 bg-[length:28px_28px] bg-radial-grid opacity-20" />
      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TruthShieldLogo size={44} />
            <div>
              <p className="font-display text-xl font-semibold">TruthShield AI</p>
              <p className="text-xs tracking-[0.28em] text-white/45">Fake News + Deepfake Detector</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5">Login</Link>
            <Link href="/dashboard" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950">Open Dashboard</Link>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
              <Pill>Dark-theme SaaS UI built for live demos</Pill>
              <h1 className="max-w-3xl font-display text-5xl font-semibold leading-tight text-white md:text-7xl">
                Detect misinformation and synthetic media before it spreads.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/60">
                TruthShield AI combines fake news detection, deepfake analysis, and explainable risk scoring in one polished workflow. Designed for hackathons, ready for production hardening.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard/fake-news">
                  <GradientButton>Try Fake News Scan</GradientButton>
                </Link>
                <Link href="/dashboard/deepfake" className="inline-flex items-center justify-center rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/5">
                  Try Deepfake Scan <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {stats.map((stat, index) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 * index }}>
                  <MetricCard label={stat.label} value={stat.value} hint={stat.hint} />
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }} className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-hero-orb blur-3xl" />
            <GlassCard className="relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(58,190,255,0.08),rgba(154,106,255,0.08),rgba(255,94,168,0.08))]" />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">Live intelligence</p>
                    <h2 className="mt-2 text-2xl font-semibold">Unified Trust Score</h2>
                  </div>
                  <span className="rounded-full border border-neon-blue/30 bg-neon-blue/10 px-3 py-1 text-xs text-neon-blue">96% precision</span>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <span>News credibility</span>
                    <span>0.84</span>
                  </div>
                  <div className="mt-3 h-3 rounded-full bg-white/10">
                    <div className="h-3 w-[84%] rounded-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink" />
                  </div>
                  <div className="mt-5 flex items-center justify-between text-sm text-white/60">
                    <span>Deepfake signal</span>
                    <span>0.72</span>
                  </div>
                  <div className="mt-3 h-3 rounded-full bg-white/10">
                    <div className="h-3 w-[72%] rounded-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/45">Why it flagged</p>
                    <ul className="mt-3 space-y-2 text-sm text-white/65">
                      <li>Urgent forwarding language detected</li>
                      <li>Source domain not in trusted shortlist</li>
                      <li>Frame anomalies around facial regions</li>
                    </ul>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/45">Similar checks</p>
                    <ul className="mt-3 space-y-2 text-sm text-white/65">
                      <li>Reuters fact-check result</li>
                      <li>Snopes verification card</li>
                      <li>Audio spectrogram comparison</li>
                    </ul>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-16">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <GlassCard key={feature.title}>
                <Icon className="h-6 w-6 text-neon-blue" />
                <h3 className="mt-5 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">{feature.text}</p>
              </GlassCard>
            );
          })}
        </div>
      </section>
    </main>
  );
}
