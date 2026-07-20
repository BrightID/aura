import { useNavigate } from "@solidjs/router"
import { createMemo, Show } from "solid-js"
import ImpactStrip from "@/components/charts/impact-strip"
import Avatar from "@/components/home/avatar"
import ProgressBar from "@/components/home/progress-bar"
import LevelScore from "@/components/shared/level-score"
import { useMyRating } from "@/hooks/use-my-evaluations"
import { useSubjectVerifications } from "@/hooks/use-subject-verifications"
import { useViewMode } from "@/hooks/use-view-mode"
import { toTitleCase } from "@/shared/lib/text"
import { authStore } from "@/store/auth"
import { confidenceLabel } from "@aura/domain/labels"
import { calculateUserScorePercentage, impactShare } from "@aura/domain/score"
import type {
  BrightIdBackupConnection,
  ConnectionLevel,
} from "@aura/domain/types/aura"

/** Old app's connection-level palette — colors the level chip's icon + text. */
const LEVEL_COLORS: Record<ConnectionLevel, string> = {
  reported: "#FF4B31",
  suspicious: "#FF7831",
  recovery: "#FFA131",
  "already known": "#FFC585",
  "just met": "#FFB85C",
  "aura only": "#FFE8D4",
}

/** Lucide icon per connection level (old app showed a level icon in the chip). */
const LEVEL_ICONS: Record<ConnectionLevel, string> = {
  reported: "shield-alert",
  suspicious: "shield-alert",
  "just met": "user",
  "already known": "user-check",
  recovery: "shield-check",
  "aura only": "sparkles",
}

/**
 * Subject row, ported from the old `SubjectCard`: avatar, name, level/score,
 * score progress, connection-level + your-evaluation status chips and a small
 * impact strip (lightweight CSS bars instead of the old echarts mini chart).
 */
export default function SubjectCard(props: {
  connection: BrightIdBackupConnection
  onEvaluate?: (id: string) => void
}) {
  const navigate = useNavigate()
  const subjectId = () => props.connection.id
  const name = () => props.connection.name || subjectId().slice(0, 7)

  const vm = useViewMode()
  const v = useSubjectVerifications(subjectId, vm.currentEvaluationCategory)
  const my = useMyRating(subjectId, vm.currentEvaluationCategory)

  const progress = createMemo(() =>
    calculateUserScorePercentage(
      vm.currentEvaluationCategory(),
      v.auraScore() ?? 0,
    ),
  )
  const myImpactPercent = createMemo(() =>
    impactShare(v.auraImpacts(), authStore.user?.brightId),
  )

  return (
    <a-card
      interactive
      data-testid={`subject-card-${subjectId()}`}
      class="flex w-full items-center justify-between gap-2 p-4"
      onClick={() => navigate(`/subject/${subjectId()}`)}
    >
      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <div class="flex items-start gap-3">
          <Avatar name={name()} subjectId={subjectId()} class="h-12 w-12" />
          <div class="flex min-w-0 flex-col gap-0.5">
            <p class="truncate font-medium text-foreground">{name()}</p>
            <LevelScore
              level={v.auraLevel()}
              score={v.auraScore()}
              testid={`subject-card-${subjectId()}`}
            />
            <Show when={progress() >= 0} fallback={<span>😈</span>}>
              <ProgressBar percentage={progress()} class="mt-1 w-36" />
            </Show>
          </div>
        </div>

        {/* Connection level + my evaluation status */}
        <div class="flex flex-wrap items-center gap-1.5">
          <span
            data-testid={`subject-${subjectId()}-connection-${props.connection.level}`}
            title={`You connected as "${props.connection.level}"`}
            class="bg-foreground/10 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs"
            style={{ color: LEVEL_COLORS[props.connection.level] }}
          >
            <a-icon name={LEVEL_ICONS[props.connection.level]} />
            {toTitleCase(props.connection.level)}
          </span>

          <Show when={my.rating()}>
            {(rating) => (
              <span
                data-testid={`subject-${subjectId()}-evaluation`}
                class={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                  rating() > 0
                    ? "bg-aura-success/15 text-aura-success"
                    : "bg-destructive/15 text-destructive"
                }`}
              >
                <a-icon name={rating() > 0 ? "thumbs-up" : "thumbs-down"} />
                {(rating() > 0 ? "+" : "") + rating()}
                <Show
                  when={!my.isPending()}
                  fallback={<a-icon name="loader-circle" class="animate-spin" />}
                >
                  {confidenceLabel(rating())}
                  <Show when={myImpactPercent() !== null}>
                    <span class="opacity-70">· {myImpactPercent()}%</span>
                  </Show>
                </Show>
              </span>
            )}
          </Show>
        </div>
      </div>

      <div class="flex shrink-0 flex-col items-end gap-2">
        <ImpactStrip
          impacts={() => v.auraImpacts()}
          class="h-12"
          title={`Top evaluations of ${name()}`}
          testid={`subject-card-${subjectId()}-chart`}
        />
        <a-button
          size="sm"
          variant="glass"
          data-testid={`subject-card-${subjectId()}-evaluate`}
          onClick={(e: MouseEvent) => {
            e.stopPropagation()
            props.onEvaluate?.(subjectId())
          }}
        >
          <Show when={my.rating()} fallback="Evaluate">
            Edit
          </Show>
        </a-button>
      </div>
    </a-card>
  )
}
