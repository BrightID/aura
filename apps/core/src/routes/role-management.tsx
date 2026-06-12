import { For, Show } from "solid-js"
import LevelScore from "@/components/shared/level-score"
import { useLevelupProgress } from "@/hooks/use-levelup-progress"
import { useRequireSession } from "@/hooks/use-require-session"
import { useSubjectVerifications } from "@/hooks/use-subject-verifications"
import { EvaluationCategory } from "@aura/domain/types/evaluations"

const ROLES: {
  label: string
  category: EvaluationCategory
  /** Roles past Player must be unlocked via level-up progress. */
  gated: boolean
}[] = [
  { label: "Player", category: EvaluationCategory.PLAYER, gated: false },
  { label: "Trainer", category: EvaluationCategory.TRAINER, gated: true },
  { label: "Manager", category: EvaluationCategory.MANAGER, gated: true },
]

/**
 * One card per role with level/score and unlock state. The old app's three
 * near-identical role-card components collapsed into this one.
 */
function RoleCard(props: {
  subjectId: () => string
  label: string
  category: EvaluationCategory
  gated: boolean
}) {
  const v = useSubjectVerifications(props.subjectId, () => props.category)
  const progress = useLevelupProgress(() => props.category)
  const unlocked = () => !props.gated || progress().isUnlocked

  return (
    <a-card
      variant="glass"
      data-testid={`role-card-${props.label.toLowerCase()}`}
      class="flex min-h-28 flex-col gap-3 p-5"
    >
      <div class="flex items-center justify-between">
        <p class="text-xl font-medium text-foreground">{props.label}</p>
        <Show
          when={unlocked()}
          fallback={
            <span class="rounded-full bg-foreground/10 px-3 py-1 text-xs text-muted-foreground">
              Locked
            </span>
          }
        >
          <span class="text-primary rounded-full bg-foreground/10 px-3 py-1 text-xs">
            Unlocked
          </span>
        </Show>
      </div>
      <LevelScore level={v.auraLevel()} score={v.auraScore()} />
    </a-card>
  )
}

/** /role-management — level, score and unlock state for each role. */
export default function RoleManagementPage() {
  const subjectId = useRequireSession()

  return (
    <div class="flex w-full flex-1 flex-col gap-4 px-5 pt-6 pb-10">
      <a-head class="text-2xl">Role Management</a-head>

      <Show when={subjectId()}>
        <For each={ROLES}>
          {(role) => (
            <RoleCard
              subjectId={() => subjectId()!}
              label={role.label}
              category={role.category}
              gated={role.gated}
            />
          )}
        </For>
      </Show>
    </div>
  )
}
