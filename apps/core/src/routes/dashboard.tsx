import Dialog from '@/components/ui/dialog';
import { A, useNavigate } from '@solidjs/router';
import { For, Show } from 'solid-js';
import type { DialogHandle } from '@/components/ui/dialog';
import { useLevelupProgress } from '@/hooks/use-levelup-progress';
import { useRequireSession } from '@/hooks/use-require-session';
import { useViewMode } from '@/hooks/use-view-mode';
import { viewModeToSlug, viewModeToString } from '@aura/domain/view-mode';
import { PreferredView } from '@aura/domain/types/dashboard';
import { EvaluationCategory } from '@aura/domain/types/evaluations';
import Icon from '@/components/ui/icon';

const VIEWS: { view: PreferredView; gate: EvaluationCategory | null }[] = [
  { view: PreferredView.PLAYER, gate: null },
  { view: PreferredView.TRAINER, gate: EvaluationCategory.TRAINER },
  {
    view: PreferredView.MANAGER_EVALUATING_TRAINER,
    gate: EvaluationCategory.MANAGER,
  },
];

const LINKS: { icon: string; label: string; href: string }[] = [
  { icon: 'globe', label: 'Domain Overview', href: '/domain-overview' },
  { icon: 'users', label: 'Evaluate', href: '/home' },
  { icon: 'bell', label: 'Notifications', href: '/notifications' },
  { icon: 'shield', label: 'Role Management', href: '/role-management' },
  { icon: 'settings', label: 'Settings', href: '/settings' },
];

/** /dashboard — preferred-view selector + quick-link grid. */
export default function DashboardPage() {
  useRequireSession();
  const navigate = useNavigate();
  const vm = useViewMode();
  let dialog: DialogHandle | undefined;

  const trainerProgress = useLevelupProgress(() => EvaluationCategory.TRAINER);
  const managerProgress = useLevelupProgress(() => EvaluationCategory.MANAGER);
  const isUnlocked = (gate: EvaluationCategory | null) => {
    if (gate === EvaluationCategory.TRAINER)
      return trainerProgress().isUnlocked;
    if (gate === EvaluationCategory.MANAGER)
      return managerProgress().isUnlocked;
    return true;
  };

  const selectView = (view: PreferredView) => {
    dialog?.hide();
    // The view lives in the route — /home/:view is the source of truth.
    navigate(`/home/${viewModeToSlug[view]}`);
  };

  return (
    <div class="flex w-full flex-1 flex-col gap-4 px-5 pt-6 pb-10">
      <h2 class="a-head text-2xl">Dashboard</h2>

      <div
        class="a-card flex items-center justify-between p-4"
        data-variant="glass"
      >
        <div class="flex flex-col gap-1">
          <p class="text-sm text-muted-foreground">Preferred view</p>
          <p
            data-testid="dashboard-current-view"
            class="font-bold text-foreground"
          >
            {viewModeToString[vm.currentViewMode()]}
          </p>
        </div>

        <Dialog
          label="Select your view"
          ref={dialog}
          trigger={
            <button
              class="a-button"
              type="button"
              data-size="sm"
              data-variant="glass"
            >
              Change
            </button>
          }
        >
          <div class="flex w-72 max-w-full flex-col gap-3">
            <p class="a-text" data-variant="muted">
              Select your view
            </p>
            <For each={VIEWS}>
              {({ view, gate }) => (
                <button
                  class="a-button"
                  type="button"
                  data-testid={`dashboard-view-${viewModeToSlug[view]}`}
                  data-variant="glass"
                  aria-pressed={vm.currentViewMode() === view}
                  disabled={!isUnlocked(gate)}
                  onClick={() => selectView(view)}
                >
                  {viewModeToString[view]}
                  <Show when={!isUnlocked(gate)}> (locked)</Show>
                </button>
              )}
            </For>
          </div>
        </Dialog>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <For each={LINKS}>
          {(link) => (
            <A href={link.href}>
              <div
                class="a-card flex h-32 flex-col justify-between p-4"
                data-interactive
                data-testid={`dashboard-link-${link.href.slice(1)}`}
              >
                <Icon name={link.icon} />
                <p class="text-right text-lg text-foreground">{link.label}</p>
              </div>
            </A>
          )}
        </For>
      </div>
    </div>
  );
}
