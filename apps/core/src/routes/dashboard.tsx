import { A, useNavigate } from "@solidjs/router"
import { For, Show } from "solid-js"
import type { DialogElement } from "@aura/ui"
import { useLevelupProgress } from "@/hooks/use-levelup-progress"
import { useRequireSession } from "@/hooks/use-require-session"
import { useViewMode } from "@/hooks/use-view-mode"
import {
  viewModeToSlug,
  viewModeToString,
} from "@aura/domain/view-mode"
import { PreferredView } from "@aura/domain/types/dashboard"
import { EvaluationCategory } from "@aura/domain/types/evaluations"

const VIEWS: { view: PreferredView; gate: EvaluationCategory | null }[] = [
  { view: PreferredView.PLAYER, gate: null },
  { view: PreferredView.TRAINER, gate: EvaluationCategory.TRAINER },
  {
    view: PreferredView.MANAGER_EVALUATING_TRAINER,
    gate: EvaluationCategory.MANAGER,
  },
]

const LINKS: { icon: string; label: string; href: string }[] = [
  { icon: "globe", label: "Domain Overview", href: "/domain-overview" },
  { icon: "users", label: "Evaluate", href: "/home" },
  { icon: "bell", label: "Notifications", href: "/notifications" },
  { icon: "shield", label: "Role Management", href: "/role-management" },
  { icon: "settings", label: "Settings", href: "/settings" },
]

/** /dashboard — preferred-view selector + quick-link grid. */
export default function DashboardPage() {
  useRequireSession()
  const navigate = useNavigate()
  const vm = useViewMode()
  let dialog: DialogElement | undefined

  const trainerProgress = useLevelupProgress(() => EvaluationCategory.TRAINER)
  const managerProgress = useLevelupProgress(() => EvaluationCategory.MANAGER)
  const isUnlocked = (gate: EvaluationCategory | null) => {
    if (gate === EvaluationCategory.TRAINER) return trainerProgress().isUnlocked
    if (gate === EvaluationCategory.MANAGER) return managerProgress().isUnlocked
    return true
  }

  const selectView = (view: PreferredView) => {
    dialog?.hide()
    // The view lives in the route — /home/:view is the source of truth.
    navigate(`/home/${viewModeToSlug[view]}`)
  }

  return (
    <div class="flex w-full flex-1 flex-col gap-4 px-5 pt-6 pb-10">
      <a-head class="text-2xl">Dashboard</a-head>

      <a-card variant="glass" class="flex items-center justify-between p-4">
        <div class="flex flex-col gap-1">
          <p class="text-sm text-muted-foreground">Preferred view</p>
          <p data-testid="dashboard-current-view" class="font-bold text-foreground">
            {viewModeToString[vm.currentViewMode()]}
          </p>
        </div>

        <a-dialog ref={dialog}>
          <a-button slot="trigger" size="sm" variant="glass">
            Change
          </a-button>
          <div slot="content" class="flex w-72 max-w-full flex-col gap-3">
            <a-text variant="muted">Select your view</a-text>
            <For each={VIEWS}>
              {({ view, gate }) => (
                <a-button
                  data-testid={`dashboard-view-${viewModeToSlug[view]}`}
                  variant="glass"
                  selected={vm.currentViewMode() === view}
                  disabled={!isUnlocked(gate)}
                  onClick={() => selectView(view)}
                >
                  {viewModeToString[view]}
                  <Show when={!isUnlocked(gate)}> (locked)</Show>
                </a-button>
              )}
            </For>
          </div>
        </a-dialog>
      </a-card>

      <div class="grid grid-cols-2 gap-4">
        <For each={LINKS}>
          {(link) => (
            <A href={link.href}>
              <a-card
                interactive
                data-testid={`dashboard-link-${link.href.slice(1)}`}
                class="flex h-32 flex-col justify-between p-4"
              >
                <a-icon name={link.icon} />
                <p class="text-right text-lg text-foreground/80">{link.label}</p>
              </a-card>
            </A>
          )}
        </For>
      </div>
    </div>
  )
}
