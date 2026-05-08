import { AccuracyBars, OverviewCharts } from '@/components/charts';
import { MetricCard } from '@/components/ui';

const metrics = [
  { label: 'Total scans', value: '18,204', hint: 'Across news and media analysis' },
  { label: 'High-risk alerts', value: '3,412', hint: 'Requires human review' },
  { label: 'Model health', value: '94.1%', hint: 'Weighted benchmark accuracy' },
  { label: 'Median confidence', value: '88%', hint: 'High quality predictions' },
];

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      <OverviewCharts />
      <AccuracyBars />
    </div>
  );
}
