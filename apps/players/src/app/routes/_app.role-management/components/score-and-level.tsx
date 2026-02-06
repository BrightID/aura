import { compactFormat } from '@/utils/number';

export default function PlayerLevelAndScore({
  color,
  level,
  score,
  loading,
}: {
  color: string;
  score?: number | null;
  level?: number | null;
  loading: boolean;
}) {
  return (
    <div
      className={`flex h-fit min-w-[90px] items-center justify-between gap-1.5 rounded bg-gray00 py-1.5 pl-2.5 pr-2 ${color}`}
    >
      <p data-testid="role-card-level" className={`level text-sm font-bold`}>
        {loading ? '-' : `lvl ${level ?? '-'}`}
      </p>
      <p data-testid="role-card-score" className={`text-sm font-bold`}>
        {loading ? '-' : compactFormat(score ?? 0)}
      </p>
    </div>
  );
}
