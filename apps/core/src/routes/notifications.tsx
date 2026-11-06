import { useNavigate } from '@solidjs/router';
import { createMemo, createSignal, For, Show } from 'solid-js';
import IncrementalList from '@/components/list/incremental-list';
import ListState from '@/components/list/list-state';
import { useNameResolver } from '@/hooks/use-backup';
import { useRequireSession } from '@/hooks/use-require-session';
import {
  markAllAsRead,
  markAsRead,
  notificationsStore,
  unreadCount,
} from '@/store/notifications';
import { compactFormat } from '@/shared/lib/number';
import { formatDuration } from '@/shared/lib/time';
import { categoryLabel } from '@aura/domain/labels';
import type { NotificationAlert } from '@aura/domain/notifications';
import { EvaluationCategory } from '@aura/domain/types/evaluations';
import Icon from '@/components/ui/icon';

const CATEGORY_FILTERS: { label: string; value: EvaluationCategory | null }[] =
  [
    { label: 'All', value: null },
    ...Object.values(EvaluationCategory).map((c) => ({
      label: categoryLabel[c],
      value: c as EvaluationCategory | null,
    })),
  ];

const KIND_ICON: Record<NotificationAlert['kind'], string> = {
  evaluation: 'user-check',
  'score-increase': 'trending-up',
  'score-decrease': 'trending-down',
  'level-increase': 'arrow-up',
  'level-decrease': 'arrow-down',
};

/** /notifications — alerts produced by the notifications checker. */
export default function NotificationsPage() {
  const subjectId = useRequireSession();
  const navigate = useNavigate();
  const resolveName = useNameResolver();
  const [filter, setFilter] = createSignal<EvaluationCategory | null>(null);

  const nameOf = (id: string) => (id === subjectId() ? 'You' : resolveName(id));

  const title = (a: NotificationAlert) => {
    switch (a.kind) {
      case 'evaluation':
        return a.to === subjectId()
          ? `${nameOf(a.about)} evaluated you`
          : `${nameOf(a.about)} evaluated ${nameOf(a.to ?? '')}`;
      case 'level-increase':
        return a.about === subjectId()
          ? `Your level increased to ${a.next}`
          : `${nameOf(a.about)} leveled up to ${a.next}`;
      case 'level-decrease':
        return a.about === subjectId()
          ? `Your level decreased to ${a.next}`
          : `${nameOf(a.about)}'s level decreased to ${a.next}`;
      case 'score-increase':
        return a.about === subjectId()
          ? `Your score increased to ${compactFormat(a.next ?? 0)}`
          : `${nameOf(a.about)}'s score increased to ${compactFormat(a.next ?? 0)}`;
      case 'score-decrease':
        return a.about === subjectId()
          ? `Your score dropped to ${compactFormat(a.next ?? 0)}`
          : `${nameOf(a.about)}'s score dropped to ${compactFormat(a.next ?? 0)}`;
    }
  };

  const alerts = createMemo(() => {
    const f = filter();
    return notificationsStore.alerts.filter((a) => !f || a.category === f);
  });

  const open = (a: NotificationAlert) => {
    markAsRead(a.id);
    const target = a.about === subjectId() ? a.to : a.about;
    if (target) navigate(`/subject/${target}`);
  };

  return (
    <div class="flex w-full flex-1 flex-col gap-4 px-5 pt-6 pb-10">
      <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h2 class="a-head text-2xl">Notifications</h2>
        <Show when={unreadCount() > 0}>
          <button
            class="a-button"
            type="button"
            data-size="sm"
            data-variant="glass"
            data-testid="notifications-mark-all"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        </Show>
      </div>

      <div class="flex flex-wrap gap-2">
        <For each={CATEGORY_FILTERS}>
          {(c) => (
            <button
              class="a-button"
              type="button"
              data-size="sm"
              data-variant="glass"
              data-color="secondary"
              aria-pressed={filter() === c.value}
              data-testid={`notifications-filter-${c.label.toLowerCase()}`}
              onClick={() => setFilter(c.value)}
            >
              {c.label}
            </button>
          )}
        </For>
      </div>

      <ListState
        loading={false}
        empty={alerts().length === 0}
        emptyText="Nothing here yet — new evaluations and level or score changes will show up here."
      >
        <IncrementalList items={alerts()} class="flex flex-col gap-3">
          {(alert) => (
            <div
              class="a-card flex w-full items-center gap-3 p-4"
              data-interactive
              data-testid={`notification-${alert.id}`}
              onClick={() => open(alert)}
            >
              <Icon name={KIND_ICON[alert.kind]} />
              <div class="flex flex-1 flex-col">
                <p
                  class={`text-sm ${alert.viewed ? 'text-muted-foreground' : 'font-medium text-foreground'}`}
                >
                  {title(alert)}
                </p>
                <p class="text-xs text-muted-foreground">
                  <span class="capitalize">{alert.category}</span> ·{' '}
                  {formatDuration(alert.timestamp)}
                </p>
              </div>
              <Show when={!alert.viewed}>
                <span class="bg-primary h-2.5 w-2.5 rounded-full" />
              </Show>
            </div>
          )}
        </IncrementalList>
      </ListState>
    </div>
  );
}
