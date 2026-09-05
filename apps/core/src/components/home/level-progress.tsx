import { createMemo, createSignal, Match, Show, Switch } from 'solid-js';
import Skeleton from '@/components/shared/skeleton';
import RequirementsChecklist, {
  type LevelRequirement,
} from '@/components/home/requirements-checklist';
import { useMyEvaluations } from '@/hooks/use-my-evaluations';
import { useSubjectVerifications } from '@/hooks/use-subject-verifications';
import { useViewMode } from '@/hooks/use-view-mode';
import { compactFormat } from '@/shared/lib/number';
import { playerLevelPoints } from '@aura/domain/levels';
import {
  calculateRemainingScoreToNextLevel,
  calculateUserScorePercentage,
} from '@aura/domain/score';
import { EvaluationCategory } from '@aura/domain/types/evaluations';

const PLAYER_EVALUATION_MINIMUM_COUNT_BEFORE_TRAINING = 3;

type NextLevelStatus = {
  isPassed: boolean;
  reason: string;
  progress?: number;
  checklists?: LevelRequirement[];
};

/** Progress toward the subject's next level in the evaluator category. */
export default function LevelProgress(props: { subjectId: string }) {
  const vm = useViewMode();
  const category = vm.currentRoleEvaluatorEvaluationCategory;
  const [showRequirements, setShowRequirements] = createSignal(false);

  const v = useSubjectVerifications(() => props.subjectId, category);
  const { myRatings } = useMyEvaluations();

  const remainingScore = createMemo(() =>
    calculateRemainingScoreToNextLevel(category(), v.auraScore() ?? 0),
  );

  const nextLevel = createMemo<NextLevelStatus>(() => {
    if (category() !== EvaluationCategory.PLAYER) {
      return { isPassed: true, reason: '' };
    }

    const impacts = v.auraImpacts() ?? [];
    const medium = impacts.filter((i) => i.confidence > 1);
    const high = impacts.filter((i) => i.confidence > 2);
    const level = v.auraLevel();
    const score = v.auraScore() ?? 0;

    if (level === 1) {
      return {
        progress: 0,
        isPassed: medium.filter((i) => (i.level ?? 0) >= 1).length > 0,
        reason: '1 Medium+ confidence evaluation from one level 1+ trainer',
        checklists: [
          { title: 'Score: 2M+', requirement: playerLevelPoints[2] - score },
          {
            title: '1 Medium+ confidence evaluation from one level 1+ trainer',
            requirement: 1 - medium.filter((i) => (i.level ?? 0) >= 1).length,
          },
        ],
      };
    }

    if (level === 2) {
      const hasOneHigh = high.filter((i) => (i.level ?? 0) >= 2).length >= 1;
      const hasTwoMedium =
        medium.filter((i) => (i.level ?? 0) >= 2).length >= 2;
      return {
        isPassed: hasOneHigh || hasTwoMedium,
        reason: '2 Medium+ confidence evaluation from level 2+ trainers',
        progress: (medium.length + high.length) / 3,
        checklists: [
          { title: 'Score: 3M+', requirement: playerLevelPoints[3] - score },
          {
            OR: [
              {
                title: '2 Medium+ confidence evaluation from level 2+ trainers',
                requirement: 2 - medium.length,
              },
              {
                title:
                  '1 High+ confidence evaluation from one level 2+ trainer',
                requirement: 1 - high.length,
              },
            ],
          },
        ],
      };
    }

    return { isPassed: true, reason: '' };
  });

  const ratingsToBeDone = createMemo(() => {
    const r = myRatings();
    if (!r) return undefined;
    return Math.max(
      PLAYER_EVALUATION_MINIMUM_COUNT_BEFORE_TRAINING -
        r.filter((x) => Number(x.rating)).length,
      0,
    );
  });

  const progressPercentage = createMemo(() => {
    const progress = nextLevel().progress;
    if (progress) return Math.floor(progress * 100);
    const todo = ratingsToBeDone();
    if (!todo) return 0;
    return Math.floor(
      ((PLAYER_EVALUATION_MINIMUM_COUNT_BEFORE_TRAINING - todo) * 100) /
        PLAYER_EVALUATION_MINIMUM_COUNT_BEFORE_TRAINING,
    );
  });

  const levelPercentage = createMemo(() =>
    calculateUserScorePercentage(category(), v.auraScore() ?? 0),
  );

  const barWidth = createMemo(() =>
    remainingScore() > 0 || nextLevel().progress
      ? progressPercentage()
      : levelPercentage(),
  );

  const nextLevelLabel = () => `Level ${(v.auraLevel() ?? 0) + 1}`;

  return (
    <a-card variant="glass" class="relative block p-4">
      <div class="flex w-full flex-row items-end gap-4">
        <Show when={ratingsToBeDone() === 0}>
          <div class="flex flex-col items-center gap-1 rounded-md bg-primary/20 px-2.5 py-2">
            <div class="text-sm font-bold text-foreground">Level</div>
            <div class="text-center text-2xl font-black leading-6 text-foreground">
              {v.auraLevel() ?? '-'}
            </div>
          </div>
        </Show>

        <div class="flex w-full flex-col gap-3.5">
          <div class="flex flex-row flex-wrap items-center gap-1 text-foreground">
            <Switch
              fallback={
                <>
                  <p class="break-words text-sm">
                    {nextLevel().reason}
                    <Show when={nextLevel().checklists?.length}>
                      <button
                        type="button"
                        class="ml-2 cursor-pointer font-semibold underline"
                        onClick={() => setShowRequirements((s) => !s)}
                      >
                        {showRequirements() ? 'less' : 'more'}
                      </button>
                    </Show>
                  </p>
                  <span class="text-lg font-medium">to</span>
                  <span class="w-24 whitespace-nowrap text-lg font-semibold text-primary">
                    {nextLevelLabel()}
                  </span>
                </>
              }
            >
              <Match when={ratingsToBeDone() === undefined}>
                <Skeleton class="h-4 w-48" />
              </Match>
              <Match when={(v.auraLevel() ?? 0) < 0}>
                <span class="text-xl font-black">
                  {compactFormat(Math.abs(v.auraScore() ?? 0))}
                </span>
                <span class="text-lg font-medium">to</span>
                <span class="text-lg font-semibold text-primary">Level 1</span>
              </Match>
              <Match when={remainingScore() > 0}>
                <span class="text-xl font-black">
                  {compactFormat(remainingScore())}
                </span>
                <span class="text-lg font-medium">to</span>
                <span class="whitespace-nowrap text-lg font-semibold text-primary">
                  {nextLevelLabel()}
                </span>
              </Match>
              <Match when={nextLevel().isPassed}>
                <span class="font-semibold">
                  You've reached the maximum level! 🎉
                </span>
              </Match>
            </Switch>
          </div>

          <div class="relative mb-3 h-4 w-full rounded-full bg-foreground/10">
            <small class="absolute top-full mt-1 text-muted-foreground">
              score:{' '}
              <span class="font-semibold text-foreground">
                {compactFormat(v.auraScore() ?? 0)}
              </span>
            </small>
            <div
              class="absolute h-full rounded-full bg-primary"
              style={{ width: `${barWidth()}%` }}
            />
          </div>
        </div>
      </div>

      <Show when={showRequirements() && nextLevel().checklists}>
        {(checklists) => (
          <div class="mt-6 border-t border-border pt-4">
            <div class="font-semibold text-foreground">
              Requirements for the next level
            </div>
            <RequirementsChecklist checklists={checklists()} />
          </div>
        )}
      </Show>
    </a-card>
  );
}
