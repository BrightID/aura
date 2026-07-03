import { A } from "@solidjs/router"
import { For, Show } from "solid-js"
import GlobalSearch from "@/components/search/global-search"
import NotificationBell from "@/components/shared/notification-bell"
import { useLevelupProgress } from "@/hooks/use-levelup-progress"
import { useViewMode } from "@/hooks/use-view-mode"
import { viewModeToSlug, viewModeToString } from "@aura/domain/view-mode"
import { PreferredView } from "@aura/domain/types/dashboard"
import { EvaluationCategory } from "@aura/domain/types/evaluations"

/** Views in the switcher, paired with the category that gates each one. */
const VIEWS: { view: PreferredView; gate: EvaluationCategory | null }[] = [
  { view: PreferredView.PLAYER, gate: null },
  { view: PreferredView.TRAINER, gate: EvaluationCategory.TRAINER },
  {
    view: PreferredView.MANAGER_EVALUATING_TRAINER,
    gate: EvaluationCategory.MANAGER,
  },
]

/**
 * Home header with role-view switcher — each view is its own route
 * (`/home/:view`). Trainer/Manager stay disabled until unlocked, mirroring the
 * "Level Up" tab gating in `home/[view]/_layout.tsx`.
 */
export default function HomeHeader() {
  const vm = useViewMode()
  const trainerProgress = useLevelupProgress(() => EvaluationCategory.TRAINER)
  const managerProgress = useLevelupProgress(() => EvaluationCategory.MANAGER)

  const isUnlocked = (gate: EvaluationCategory | null) => {
    if (gate === EvaluationCategory.TRAINER) return trainerProgress().isUnlocked
    if (gate === EvaluationCategory.MANAGER) return managerProgress().isUnlocked
    return true
  }

  return (
    <header class="mb-4 flex items-center justify-between">
      <a-head class="text-2xl">Home</a-head>
      <div class="flex items-center gap-2">
        <GlobalSearch />
        <NotificationBell />
        <A href="/settings" data-testid="header-settings">
          <a-button size="icon-sm" variant="glass" aria-label="Settings">
            <a-icon name="settings" />
          </a-button>
        </A>
        <For each={VIEWS}>
          {({ view, gate }) => (
            <Show
              when={isUnlocked(gate)}
              fallback={
                <a-button
                  size="sm"
                  variant="glass"
                  class="cursor-not-allowed opacity-40"
                  disabled
                >
                  {viewModeToString[view]}
                </a-button>
              }
            >
              <A href={`/home/${viewModeToSlug[view]}`}>
                <a-button
                  size="sm"
                  variant="glass"
                  selected={vm.currentViewMode() === view}
                >
                  {viewModeToString[view]}
                </a-button>
              </A>
            </Show>
          )}
        </For>
      </div>
    </header>
  )
}
