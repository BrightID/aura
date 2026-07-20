import { createMemo, Show } from "solid-js"
import Avatar from "@/components/home/avatar"
import ProgressBar from "@/components/home/progress-bar"
import LevelScore from "@/components/shared/level-score"
import { useSubjectName } from "@/hooks/use-backup"
import { useSubjectVerifications } from "@/hooks/use-subject-verifications"
import { useViewMode } from "@/hooks/use-view-mode"
import { calculateUserScorePercentage } from "@aura/domain/score"

export default function ProfileHeaderCard(props: { subjectId: string }) {
  const name = useSubjectName(() => props.subjectId)
  const vm = useViewMode()
  const v = useSubjectVerifications(
    () => props.subjectId,
    vm.currentRoleEvaluatorEvaluationCategory,
  )
  const progress = createMemo(() =>
    calculateUserScorePercentage(
      vm.currentRoleEvaluatorEvaluationCategory(),
      v.auraScore() ?? 0,
    ),
  )

  return (
    <a-card variant="glass" class="relative p-4">
      <div class="flex flex-1 gap-3">
        <Avatar name={name()} subjectId={props.subjectId} class="h-16 w-16" />
        <div class="flex flex-1 flex-col gap-1">
          <p data-testid="profile-name" class="font-medium text-foreground">
            {name()}
          </p>
          <LevelScore
            level={v.auraLevel()}
            score={v.auraScore()}
            testid="profile"
          />
          <Show when={progress() >= 0} fallback={<span>😈</span>}>
            <ProgressBar percentage={progress()} class="w-full" />
          </Show>
        </div>
      </div>
    </a-card>
  )
}
