import Dialog from '@/components/ui/dialog';
import { categoryLabel, confidenceLabel } from '@aura/domain/labels';
import { calculateUserScorePercentage, impactShare } from '@aura/domain/score';
import { EvaluationCategory } from '@aura/domain/types/evaluations';
import type { DialogHandle } from '@/components/ui/dialog';
import { useNavigate } from '@solidjs/router';
import { createEffect, createMemo, createSignal, For, Show } from 'solid-js';
import EvaluationsChart from '@/components/charts/evaluations-chart';
import EvaluateModal from '@/components/evaluation/evaluate-modal';
import Avatar from '@/components/home/avatar';
import ProgressBar from '@/components/home/progress-bar';
import LevelScore from '@/components/shared/level-score';
import { useSubjectName } from '@/hooks/use-backup';
import { useMyRating } from '@/hooks/use-my-evaluations';
import { useSubjectInboundEvaluations } from '@/hooks/use-subject-inbound-evaluations';
import { useSubjectVerifications } from '@/hooks/use-subject-verifications';
import { roleColor, roleIcon } from '@/shared/lib/role-style';
import { authStore } from '@/store/auth';
import Icon from '@/components/ui/icon';

/** One role's stats panel: standing, your evaluation, impacts chart. */
function RoleStats(props: {
  subjectId: () => string;
  category: EvaluationCategory;
  onNavigate: (subjectId: string) => void;
  onEvaluate: (category: EvaluationCategory) => void;
}) {
  const v = useSubjectVerifications(props.subjectId, () => props.category);
  const inbound = useSubjectInboundEvaluations(
    props.subjectId,
    () => props.category,
  );
  const progress = createMemo(() =>
    calculateUserScorePercentage(props.category, v.auraScore() ?? 0),
  );

  // My evaluation of this subject in this role + its share of total impact.
  const my = useMyRating(props.subjectId, () => props.category);
  const myImpactPercent = createMemo(() =>
    impactShare(v.auraImpacts(), authStore.user?.brightId),
  );
  const isSelf = () => props.subjectId() === authStore.user?.brightId;

  return (
    <div class="flex flex-col gap-2 pt-2">
      <LevelScore level={v.auraLevel()} score={v.auraScore()} />
      <p class="text-sm text-muted-foreground">
        Evaluations:{' '}
        <span class="font-medium text-foreground">
          {inbound.evaluations()?.length ?? '…'}
        </span>{' '}
        ({inbound.positiveCount() ?? '…'} pos / {inbound.negativeCount() ?? '…'}{' '}
        neg)
      </p>
      <Show when={progress() >= 0}>
        <ProgressBar percentage={progress()} class="w-full" />
      </Show>

      <div class="flex items-start justify-between gap-3 text-sm text-muted-foreground">
        <span class="min-w-0 flex-1">
          Your evaluation:{' '}
          <Show when={my.rating() !== undefined} fallback="-">
            <span
              class={`font-medium ${my.rating()! > 0 ? 'text-aura-success' : 'text-destructive'}`}
            >
              {(my.rating()! > 0 ? '+' : '') + my.rating()}{' '}
              {confidenceLabel(my.rating()!)}
            </span>
            <Show when={myImpactPercent() !== null}>
              <span class="ml-1">· {myImpactPercent()}% impact</span>
            </Show>
          </Show>
        </span>
        <Show when={!isSelf()}>
          <button
            class="a-button shrink-0"
            type="button"
            data-size="sm"
            data-variant="glass"
            data-testid={`credibility-evaluate-${props.category}`}
            onClick={() => props.onEvaluate(props.category)}
          >
            <Show when={my.rating() !== undefined} fallback="Evaluate">
              Edit
            </Show>
          </button>
        </Show>
      </div>

      <EvaluationsChart
        impacts={() => v.auraImpacts()}
        onBarClick={props.onNavigate}
        loading={() => v.loading()}
      />
    </div>
  );
}

export default function CredibilityDetails(props: {
  subjectId: () => string | null;
  onClose: () => void;
}) {
  let dialog: DialogHandle | undefined;
  const navigate = useNavigate();

  const id = () => props.subjectId() ?? '';
  const name = useSubjectName(id);

  const roleChecks = Object.values(EvaluationCategory).map((category) => ({
    category,
    v: useSubjectVerifications(id, () => category),
  }));
  const authorizedRoles = createMemo(() =>
    roleChecks
      .filter(
        ({ category, v }) =>
          category === EvaluationCategory.SUBJECT || (v.auraLevel() ?? 0) > 0,
      )
      .map(({ category }) => category),
  );

  const [evaluatingCategory, setEvaluatingCategory] =
    createSignal<EvaluationCategory | null>(null);

  const goTo = (subjectId: string) => {
    dialog?.hide();
    navigate(`/subject/${subjectId}`);
  };
  createEffect(() => {
    if (props.subjectId()) dialog?.show();
    else dialog?.hide();
  });

  // One per subject: the keyed <Show> below remounts it, resetting the tab.
  const RoleTabs = () => {
    const [picked, setPicked] = createSignal<EvaluationCategory | null>(null);
    const active = () => picked() ?? authorizedRoles()[0];
    return (
      <div>
        <div class="a-tabs" data-compact role="tablist">
          <For each={authorizedRoles()}>
            {(category) => (
              <button
                type="button"
                role="tab"
                class="a-tab"
                aria-selected={active() === category}
                onClick={() => setPicked(category)}
              >
                <Icon
                  name={roleIcon[category]}
                  style={{ color: roleColor[category] }}
                />
                {categoryLabel[category]}
              </button>
            )}
          </For>
        </div>
        <For each={authorizedRoles()}>
          {(category) => (
            <div
              class="a-tab-panel"
              role="tabpanel"
              hidden={active() !== category}
            >
              <RoleStats
                subjectId={id}
                category={category}
                onNavigate={goTo}
                onEvaluate={setEvaluatingCategory}
              />
            </div>
          )}
        </For>
      </div>
    );
  };

  return (
    <>
      {/* State clears only after the leave animation completes, so the body
          never re-renders to its empty state mid-exit. */}
      <Dialog
        label="Credibility details"
        ref={dialog}
        onClose={() => props.onClose()}
      >
        <div class="flex w-96 max-w-full flex-col gap-3">
          <div class="flex items-center gap-3">
            <Avatar name={name()} subjectId={id()} noHover class="h-10 w-10" />
            <p class="min-w-0 break-words font-medium text-foreground">
              {name()}
            </p>
          </div>

          {/* keyed: remount the tabs (and reset the active one) per subject */}
          <Show when={props.subjectId()} keyed>
            <RoleTabs />
          </Show>
          <button
            class="a-button mt-2 w-full"
            type="button"
            data-testid="credibility-view-profile"
            onClick={() => goTo(id())}
          >
            View profile
          </button>
        </div>
      </Dialog>

      <EvaluateModal
        subjectId={() => (evaluatingCategory() ? id() : null)}
        category={() => evaluatingCategory() ?? EvaluationCategory.SUBJECT}
        onClose={() => setEvaluatingCategory(null)}
      />
    </>
  );
}
