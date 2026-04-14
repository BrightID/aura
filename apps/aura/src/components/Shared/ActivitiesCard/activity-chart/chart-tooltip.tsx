import { TooltipProps } from 'recharts';
import { compactFormat } from '@/utils/number';
import { formatDuration } from '@/utils/time';

export const ActivityChartTooltip = ({ payload }: TooltipProps<any, any>) => {
  if (!payload || payload.length === 0) return null;

  const { impact, evaluatorName, evaluated, rating, timestamp, subjectScore } =
    payload[0].payload;

  return (
    <div className="rounded-md border bg-card p-2">
      <div>
        Name: <strong>{evaluatorName || evaluated?.slice(0, 7)}</strong>
      </div>
      <div>
        Score: <strong>{compactFormat(subjectScore ?? 0)}</strong>
      </div>
      <div>
        Impact: <strong>{compactFormat(impact)}</strong>
      </div>
      <div>
        Confidence:{' '}
        <strong>{(Number(rating) > 0 ? '+' : '') + rating || 'N/A'}</strong>
      </div>
      <small>{formatDuration(timestamp)}</small>
    </div>
  );
};

export default ActivityChartTooltip;
