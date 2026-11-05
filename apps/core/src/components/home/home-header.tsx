import Dialog from '@/components/ui/dialog';
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
import Icon from '@/components/ui/icon';

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
    <header class="mb-6 flex flex-col gap-5">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Aura / Core
          </p>
          <h2 class="a-head text-xl sm:text-2xl">Your community</h2>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <GlobalSearch />
          <NotificationBell />
          <A href="/settings" data-testid="header-settings">
            <button
              class="a-button"
              type="button"
              data-size="icon"
              data-variant="glass"
              aria-label="Settings"
            >
              <Icon name="settings" />
            </button>
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
                  <Dialog
                    label="Locked role"
                    trigger={
                      <button
                        class="a-button cursor-help"
                        type="button"
                        data-size="sm"
                        data-variant="glass"
                        title={`${label} (locked)`}
                        aria-label={`${label} (locked)`}
                      >
                        <Icon name="lock" />
                        <span>{label}</span>
                      </button>
                    }
                  >
                    <div class="flex w-72 max-w-full flex-col gap-2">
                      <p class="font-medium text-foreground">{label} locked</p>
                      <p
                        class="a-text text-muted-foreground"
                        data-size="sm"
                        data-variant="muted"
                      >
                        {lockMessage(gate)}
                      </p>
                    </div>
                  </Dialog>
                }
              >
                <A href={`/home/${viewModeToSlug[view]}`} class="shrink-0">
                  <button
                    class="a-button"
                    type="button"
                    data-size="sm"
                    data-variant="glass"
                    aria-pressed={selected()}
                    title={label}
                    aria-label={label}
                  >
                    <Icon
                      name={roleIcon[viewModeToViewAs[view]]}
                      style={{ color: roleColor[viewModeToViewAs[view]] }}
                    />
                    <span>{label}</span>
                  </button>
                </A>
              </Show>
            );
          }}
        </For>
      </div>
    </header>
  );
}
