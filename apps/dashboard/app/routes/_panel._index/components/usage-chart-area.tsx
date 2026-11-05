import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart';
import { useIsMobile } from '~/hooks/use-mobile';
import { AuraSelect } from '~/components/aura-form-controls';
import { API_BASE_URL } from '~/constants';
import { getAuthHeaders } from '~/utils/apis';
import * as React from 'react';

const chartConfig = {
  verifications: { label: 'Verifications', color: 'var(--primary)' },
} satisfies import('~/components/ui/chart').ChartConfig;

async function fetchUsage(projectId: string) {
  const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/usage`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed');
  const json = await res.json();
  return json.data as { date: string; verifications: number }[];
}

const RANGES = [
  { value: '90d', label: 'Last 3 months', short: '3 months' },
  { value: '30d', label: 'Last 30 days', short: '30 days' },
  { value: '7d', label: 'Last 7 days', short: '7 days' },
];

export function ProjectUsageChart({ projectId }: { projectId: string }) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState('90d');

  const {
    data: chartData = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ['project-usage', projectId],
    queryFn: () => fetchUsage(projectId),
    enabled: Boolean(projectId),
  });

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const days = timeRange === '90d' ? 90 : timeRange === '30d' ? 30 : 7;
    return date >= new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  });

  React.useEffect(() => {
    isMobile && setTimeRange('7d');
  }, [isMobile]);

  return (
    <div className="a-card">
      <div className="flex flex-col gap-1.5 p-6">
        <h3 className="a-head font-semibold" data-level="3">
          Project Verifications
        </h3>
        <p className="text-muted-foreground text-sm">
          Last{' '}
          {timeRange === '90d'
            ? '3 months'
            : timeRange === '30d'
              ? '30 days'
              : '7 days'}
        </p>
        <div className="flex justify-end">
          <div
            role="group"
            aria-label="Time range"
            className="a-toggle-group hidden @[767px]:flex"
          >
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                className="a-toggle"
                data-variant="outline"
                aria-pressed={timeRange === r.value}
                onClick={() => setTimeRange(r.value)}
              >
                {r.short}
              </button>
            ))}
          </div>
          <AuraSelect
            aria-label="Time range"
            value={timeRange}
            onValueChange={setTimeRange}
            className="w-40 @[767px]:hidden"
            options={RANGES}
          />
        </div>
      </div>
      <div className="p-6 pt-0">
        {isError ? (
          <p className="py-16 text-center text-sm text-destructive">
            Could not load verifications.
          </p>
        ) : isPending ? (
          <div className="a-skeleton h-[300px] w-full" />
        ) : filteredData.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No verifications in this range.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillVerif" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-verifications)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-verifications)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                }
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="verifications"
                type="natural"
                fill="url(#fillVerif)"
                stroke="var(--color-verifications)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}
