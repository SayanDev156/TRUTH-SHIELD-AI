'use client';

import { BarChart, Bar, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { GlassCard } from './ui';

const overviewData = [
  { name: 'Fake News', value: 72 },
  { name: 'Deepfake', value: 64 },
  { name: 'History', value: 46 },
  { name: 'Reports', value: 58 },
];

const pieData = [
  { name: 'Legit', value: 68, color: '#33D6C7' },
  { name: 'Flagged', value: 32, color: '#FF5EA8' },
];

const activityData = [
  { name: 'Mon', scans: 42 },
  { name: 'Tue', scans: 61 },
  { name: 'Wed', scans: 52 },
  { name: 'Thu', scans: 74 },
  { name: 'Fri', scans: 81 },
  { name: 'Sat', scans: 69 },
  { name: 'Sun', scans: 88 },
];

export function OverviewCharts() {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <GlassCard className="xl:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Weekly scan volume</h3>
          <span className="text-xs text-white/45">Live demo dataset</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activityData}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
              <YAxis stroke="rgba(255,255,255,0.45)" />
              <Tooltip contentStyle={{ background: '#0B1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }} />
              <Line type="monotone" dataKey="scans" stroke="#3ABEFF" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
      <GlassCard>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Verdict split</h3>
          <span className="text-xs text-white/45">30-day snapshot</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={95} paddingAngle={4}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0B1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}

export function AccuracyBars() {
  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Model accuracy</h3>
        <span className="text-xs text-white/45">Benchmark snapshot</span>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={overviewData}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" />
            <YAxis stroke="rgba(255,255,255,0.45)" />
            <Tooltip contentStyle={{ background: '#0B1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }} />
            <Bar dataKey="value" radius={[12, 12, 0, 0]}>
              {overviewData.map((entry, index) => (
                <Cell key={entry.name} fill={['#3ABEFF', '#9A6AFF', '#33D6C7', '#FF5EA8'][index % 4]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
