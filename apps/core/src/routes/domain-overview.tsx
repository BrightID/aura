import { For } from 'solid-js';
import { useRequireSession } from '@/hooks/use-require-session';
import Icon from '@/components/ui/icon';

// Straight port of the old page's hardcoded stats — there is no domain-stats
// endpoint yet (same as the old app; wire real counts when one exists).
const STATS: { label: string; value: string; icon: string }[] = [
  { label: 'Subjects', value: '1203', icon: 'users' },
  { label: 'Players', value: '247', icon: 'user-check' },
  { label: 'Trainers', value: '11', icon: 'graduation-cap' },
  { label: 'Managers', value: '3', icon: 'shield' },
];

/** /domain-overview — static domain info card + member counts. */
export default function DomainOverviewPage() {
  useRequireSession();

  return (
    <div class="flex w-full flex-1 flex-col gap-4 px-5 pt-6 pb-10">
      <h2 class="a-head text-2xl">Domain Overview</h2>

      <div class="a-card flex flex-col gap-4 p-4" data-variant="glass">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p class="text-sm text-muted-foreground">Domain</p>
            <p class="font-bold text-foreground">BrightID</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Creator</p>
            <p class="font-bold text-foreground">Sina.eth</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Created at</p>
            <p class="font-bold text-foreground">23 May 03</p>
          </div>
        </div>
        <div>
          <p class="text-sm text-muted-foreground">About</p>
          <p class="text-sm font-medium text-foreground">
            BrightID is a digital identity solution that aims to revolutionize
            how identities are verified online
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <For each={STATS}>
          {(stat) => (
            <div
              class="a-card flex h-28 flex-col justify-between p-4"
              data-variant="glass"
              data-testid={`domain-stat-${stat.label.toLowerCase()}`}
            >
              <div class="flex items-center justify-between">
                <Icon name={stat.icon} />
                <p class="font-bold text-foreground">{stat.value}</p>
              </div>
              <p class="text-right text-lg text-foreground">{stat.label}</p>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
