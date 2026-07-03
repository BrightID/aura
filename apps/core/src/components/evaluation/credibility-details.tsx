import { useNavigate } from "@solidjs/router"
import { createEffect, createMemo, createSignal, For, Show } from "solid-js"
import type { DialogElement } from "@aura/ui"
import EvaluationsChart from "@/components/charts/evaluations-chart"
import EvaluateModal from "@/components/evaluation/evaluate-modal"
import Avatar from "@/components/home/avatar"
import ProgressBar from "@/components/home/progress-bar"
import LevelScore from "@/components/shared/level-score"
import { useSubjectName } from "@/hooks/use-backup"
import { useMyRating } from "@/hooks/use-my-evaluations"
import { useSubjectInboundEvaluations } from "@/hooks/use-subject-inbound-evaluations"
import { useSubjectVerifications } from "@/hooks/use-subject-verifications"
import { authStore } from "@/store/auth"
import { categoryLabel, confidenceLabel } from "@aura/domain/labels"
import { calculateUserScorePercentage, impactShare } from "@aura/domain/score"
import { EvaluationCategory } from "@aura/domain/types/evaluations"

/** One role's stats panel: standing, your evaluation, impacts chart. */
function RoleStats(props: {
  subjectId: () => string
  category: EvaluationCategory
  onNavigate: (subjectId: string) => void
  onEvaluate: (category: EvaluationCategory) => void
}) {
  const v = useSubjectVerifications(props.subjectId, () => props.category)
  const inbound = useSubjectInboundEvaluations(
    props.subjectId,
    () => props.category,
  )
  const progress = createMemo(() =>
    calculateUserScorePercentage(props.category, v.auraScore() ?? 0),
  )

  // My evaluation of this subject in this role + its share of total impact.
  const my = useMyRating(props.subjectId, () => props.category)
  const myImpactPercent = createMemo(() =>
    impactShare(v.auraImpacts(), authStore.user?.brightId),
  )
  const isSelf = () => props.subjectId() === authStore.user?.brightId

  return (
    <div class="flex flex-col gap-2 pt-2">
      <LevelScore level={v.auraLevel()} score={v.auraScore()} />
      <p class="text-sm text-muted-foreground">
        Evaluations:{" "}
        <span class="font-medium text-foreground">
          {inbound.evaluations()?.length ?? "…"}
        </span>{" "}
        ({inbound.positiveCount() ?? "…"} pos / {inbound.negativeCount() ?? "…"}{" "}
        neg)
      </p>
      <Show when={progress() >= 0}>
        <ProgressBar percentage={progress()} class="w-full" />
      </Show>

      <div class="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Your evaluation:{" "}
          <Show when={my.rating() !== undefined} fallback="-">
            <span
              class={`font-medium ${my.rating()! > 0 ? "text-aura-success" : "text-destructive"}`}
            >
              {(my.rating()! > 0 ? "+" : "") + my.rating()}{" "}
              {confidenceLabel(my.rating()!)}
            </span>
            <Show when={myImpactPercent() !== null}>
              <span class="ml-1">· {myImpactPercent()}% impact</span>
            </Show>
          </Show>
        </span>
        <Show when={!isSelf()}>
          <a-button
            size="sm"
            variant="glass"
            data-testid={`credibility-evaluate-${props.category}`}
            onClick={() => props.onEvaluate(props.category)}
          >
            <Show when={my.rating() !== undefined} fallback="Evaluate">
              Edit
            </Show>
          </a-button>
        </Show>
      </div>

      <EvaluationsChart
        impacts={() => v.auraImpacts()}
        onBarClick={props.onNavigate}
      />
    </div>
  )
}

/**
 * Credibility breakdown dialog for a subject (usually an evaluator tapped in
 * a list). Ported from the old `CredibilityDetailsModal`: one tab per role
 * the subject has unlocked (Subject always), each with standing, your
 * evaluation (editable inline) and the impacts chart.
 */
export default function CredibilityDetails(props: {
  subjectId: () => string | null
  onClose: () => void
}) {
  let dialog: DialogElement | undefined
  const navigate = useNavigate()

  const id = () => props.subjectId() ?? ""
  const name = useSubjectName(id)

  // Role tabs are gated like the old modal: Subject always, others once the
  // subject has a level in them. All four reads share one profile query.
  const roleChecks = Object.values(EvaluationCategory).map((category) => ({
    category,
    v: useSubjectVerifications(id, () => category),
  }))
  const authorizedRoles = createMemo(() =>
    roleChecks
      .filter(
        ({ category, v }) =>
          category === EvaluationCategory.SUBJECT || (v.auraLevel() ?? 0) > 0,
      )
      .map(({ category }) => category),
  )

  // Inline evaluate (old modal's pencil / "Evaluate Now"): track which role
  // is being evaluated; null keeps the nested dialog closed.
  const [evaluatingCategory, setEvaluatingCategory] =
    createSignal<EvaluationCategory | null>(null)

  // Chart bar tap: close the dialog and jump to that evaluator (old behavior).
  const goTo = (subjectId: string) => {
    props.onClose()
    navigate(`/subject/${subjectId}`)
  }

  createEffect(() => {
    if (props.subjectId()) dialog?.show()
    else dialog?.hide()
  })

  const onOpenChange = (e: CustomEvent<{ open: boolean }>) => {
    if (!e.detail.open && props.subjectId()) props.onClose()
  }

  return (
    <>
      <a-dialog ref={dialog} on:open-change={onOpenChange}>
        <div slot="content" class="flex w-96 max-w-full flex-col gap-3">
          <div class="flex items-center gap-3">
            <Avatar name={name()} subjectId={id()} noHover class="h-10 w-10" />
            <p class="font-medium text-foreground">{name()}</p>
          </div>

          {/* keyed: remount the tabs (and reset the active one) per subject */}
          <Show when={props.subjectId()} keyed>
            <a-tabs>
              <For each={authorizedRoles()}>
                {(category) => (
                  <a-tab value={category}>{categoryLabel[category]}</a-tab>
                )}
              </For>
              <For each={authorizedRoles()}>
                {(category) => (
                  <a-tab-panel slot="panel" value={category}>
                    <RoleStats
                      subjectId={id}
                      category={category}
                      onNavigate={goTo}
                      onEvaluate={setEvaluatingCategory}
                    />
                  </a-tab-panel>
                )}
              </For>
            </a-tabs>
          </Show>

          {/* Navigate via goTo, which captures the id *before* onClose nulls
              props.subjectId() — a reactive `/subject/${id()}` href would
              otherwise collapse to `/subject/` on click and 404. */}
          <a-button
            class="mt-2 w-full"
            data-testid="credibility-view-profile"
            onClick={() => goTo(id())}
          >
            View profile
          </a-button>
        </div>
      </a-dialog>

      {/* Sibling overlay — a-dialog only projects its named slots, and a
          later fixed overlay stacks above the credibility dialog. */}
      <EvaluateModal
        subjectId={() => (evaluatingCategory() ? id() : null)}
        category={() => evaluatingCategory() ?? EvaluationCategory.SUBJECT}
        onClose={() => setEvaluatingCategory(null)}
      />
    </>
  )
}
