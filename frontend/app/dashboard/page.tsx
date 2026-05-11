"use client";

import { AccuracyBars, OverviewCharts } from '@/components/charts';
import { MetricCard } from '@/components/ui';
import { useDashboardCopy } from '@/lib/dashboard-copy';

export default function DashboardOverviewPage() {
  const copy = useDashboardCopy();
  const values = ['18,204', '3,412', '94.1%', '88%'];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {copy.overview.metrics.map((metric, index) => (
          <MetricCard key={metric.label} label={metric.label} value={values[index]} hint={metric.hint} />
        ))}
      </div>
      <OverviewCharts />
      <AccuracyBars />
    </div>
  );
}
