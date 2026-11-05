import { plans } from '~/constants/subscriptions';
import type { Project } from '~/types/projects';

export default function ProjectUsage({ project }: { project: Project }) {
  const sub =
    plans.find((item) => item.id === (project.selectedPlanId ?? null)) ??
    plans[0];
  const allowance = sub.tokens || 1;
  const remaining = project.remainingtokens ?? 0;
  const available = Math.min((remaining / allowance) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="a-card">
        <div className="flex flex-col gap-1.5">
          <h3 className="a-head text-lg font-semibold" data-level="3">
            Token Usage
          </h3>
          <p className="text-muted-foreground text-sm">
            Monitor your token consumption and remaining allocation
          </p>
        </div>
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Remaining Tokens
              </span>
              <span className="text-sm font-medium">
                {remaining.toLocaleString()} / {allowance.toLocaleString()}
              </span>
            </div>
            <progress className="a-progress h-3" value={available} max={100} />
          </div>

          <hr className="a-separator" />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-semibold">
                {remaining.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Remaining</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-semibold">
                {Math.max(0, allowance - remaining).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Used</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-semibold">{available.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground mt-1">Available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
