import { A } from '@solidjs/router';
import { For, Show } from 'solid-js';
import GlobalSearch from '@/components/search/global-search';
import NotificationBell from '@/components/shared/notification-bell';
import { useLevelupProgress } from '@/hooks/use-levelup-progress';
import { useViewMode } from '@/hooks/use-view-mode';
import { roleColor, roleIcon } from '@/shared/lib/role-style';
import {
  viewModeToSlug,
  viewModeToString,
  viewModeToViewAs,
} from '@aura/domain/view-mode';
import { PreferredView } from '@aura/domain/types/dashboard';
import { EvaluationCategory } from '@aura/domain/types/evaluations';

/** Views in the switcher, paired with the category that gates each one. */
const VIEWS: { view: PreferredView; gate: EvaluationCategory | null }[] = [
  { view: PreferredView.PLAYER, gate: null },
  { view: PreferredView.TRAINER, gate: EvaluationCategory.TRAINER },
  {
    view: PreferredView.MANAGER_EVALUATING_TRAINER,
    gate: EvaluationCategory.MANAGER,
  },
];

/**
 * Home header with role-view switcher — each view is its own route
 * (`/home/:view`). Trainer/Manager stay disabled until unlocked, mirroring the
 * "Level Up" tab gating in `home/[view]/_layout.tsx`.
 */
export default function HomeHeader() {
  const vm = useViewMode();
  const trainerProgress = useLevelupProgress(() => EvaluationCategory.TRAINER);
  const managerProgress = useLevelupProgress(() => EvaluationCategory.MANAGER);

  const isUnlocked = (gate: EvaluationCategory | null) => {
    if (gate === EvaluationCategory.TRAINER)
      return trainerProgress().isUnlocked;
    if (gate === EvaluationCategory.MANAGER)
      return managerProgress().isUnlocked;
    return true;
  };

  const lockMessage = (gate: EvaluationCategory | null) =>
    gate === EvaluationCategory.MANAGER
      ? 'Reach the required standing as a Trainer to unlock the Manager view.'
      : 'Reach the required standing as a Player to unlock the Trainer view.';

  return (
    <header class="mb-4 flex flex-col gap-3">
      <div class="flex items-center justify-between gap-2">
        <a-head class="text-2xl">Home</a-head>
        <div class="flex items-center gap-2">
          <GlobalSearch />
          <NotificationBell />
          <A href="/settings" data-testid="header-settings">
            <a-button size="icon-sm" variant="glass" aria-label="Settings">
              <a-icon name="settings" />
            </a-button>
          </A>
        </div>
      </div>

      {/* View switcher — scrolls horizontally instead of overflowing on
          narrow screens; each button keeps its intrinsic width. */}
      <div class="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
        <For each={VIEWS}>
          {({ view, gate }) => {
            const label = viewModeToString[view];
            const selected = () => vm.currentViewMode() === view;
            return (
              <Show
                when={isUnlocked(gate)}
                fallback={
                  <a-dialog class="shrink-0">
                    <a-button
                      slot="trigger"
                      size="sm"
                      variant="glass"
                      class="cursor-help opacity-40"
                      title={`${label} (locked)`}
                      aria-label={`${label} (locked)`}
                    >
                      <a-icon name="lock" />
                    </a-button>
                    <div
                      slot="content"
                      class="flex w-72 max-w-full flex-col gap-2"
                    >
                      <p class="font-medium text-foreground">{label} locked</p>
                      <a-text size="sm" class="text-muted-foreground">
                        {lockMessage(gate)}
                      </a-text>
                    </div>
                  </a-dialog>
                }
              >
                <A href={`/home/${viewModeToSlug[view]}`} class="shrink-0">
                  <a-button
                    size="sm"
                    variant="glass"
                    selected={selected()}
                    title={label}
                    aria-label={label}
                  >
                    <a-icon
                      name={roleIcon[viewModeToViewAs[view]]}
                      style={{ color: roleColor[viewModeToViewAs[view]] }}
                    />
                    {/* Only the active role shows its label — keeps the
                        switcher compact yet always says where you are. */}
                    <Show when={selected()}>
                      <span>{label}</span>
                    </Show>
                  </a-button>
                </A>
              </Show>
            );
          }}
        </For>
      </div>
    </header>
  );
}
