import { Show } from "solid-js"
import LevelProgress from "@/components/home/level-progress"
import { useRequireSession } from "@/hooks/use-require-session"
import { useSubjectVerifications } from "@/hooks/use-subject-verifications"
import { useViewMode } from "@/hooks/use-view-mode"
import { compactFormat } from "@/shared/lib/number"

/** Single "Evaluations" stat row: title, value, and an optional detail note. */
function StatRow(props: { title: string; value: string; details?: string }) {
  return (
    <div class="flex w-full justify-between text-foreground">
      <div class="font-medium">{props.title}:</div>
      <div>
        <span class="font-medium">{props.value} </span>
        <Show when={props.details}>
          <span class="text-muted-foreground">{props.details}</span>
        </Show>
      </div>
    </div>
  )
}

/** /home/:view/levelup — next-level progress + inbound evaluation summary. */
export default function HomeLevelUp() {
  const subjectId = useRequireSession()
  const vm = useViewMode()
  const v = useSubjectVerifications(
    () => subjectId() ?? "",
    vm.currentRoleEvaluatorEvaluationCategory,
  )

  const impacts = () => (v.auraImpacts() ?? []).filter((i) => i.impact !== 0)
  const evaluationsCount = () => impacts().length
  const totalPositive = () =>
    impacts()
      .filter((i) => i.impact > 0)
      .reduce((sum, i) => sum + i.impact, 0)
  const totalNegative = () =>
    impacts()
      .filter((i) => i.impact < 0)
      .reduce((sum, i) => sum + Math.abs(i.impact), 0)

  return (
    <Show when={subjectId()}>
      {(id) => (
        <div class="mt-4 flex flex-col gap-4">
          <LevelProgress subjectId={id()} />

          <a-card variant="glass" class="block p-4">
            <div class="mb-3 text-lg font-bold text-foreground">Evaluations</div>
            <div class="flex flex-col gap-2">
              <StatRow title="Evaluations" value={String(evaluationsCount())} />
              <StatRow
                title="Calculated Score"
                value={v.auraScore() ? compactFormat(v.auraScore()!) : "-"}
                details={
                  evaluationsCount() > 0
                    ? `(+${compactFormat(totalPositive())} / -${compactFormat(
                        totalNegative(),
                      )})`
                    : undefined
                }
              />
            </div>
          </a-card>
        </div>
      )}
    </Show>
  )
}
