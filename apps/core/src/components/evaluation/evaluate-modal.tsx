import {
  CONFIDENCE_LABELS,
  categoryLabel,
  confidenceLabel,
} from '@aura/domain/labels';
import { EvaluationCategory } from '@aura/domain/types/evaluations';
import type { DialogElement } from '@aura/ui';
import { toast } from '@aura/ui';
import { createEffect, createSignal, For, Show } from 'solid-js';
import { useSubjectName } from '@/hooks/use-backup';
import { useEvaluateSubject } from '@/hooks/use-evaluate-subject';
import { useMyRating } from '@/hooks/use-my-evaluations';
import { useViewMode } from '@/hooks/use-view-mode';

const CONFIDENCE_VALUES = Object.keys(CONFIDENCE_LABELS).map(Number);

/** Question + expression copy ported from the old app's translations. */
const QUESTIONS: Record<EvaluationCategory, string> = {
  [EvaluationCategory.SUBJECT]:
    'Is this the account of {name} that should be Aura verified?',
  [EvaluationCategory.PLAYER]:
    'Does this Player accurately and honestly evaluate Subjects in the BrightID domain?',
  [EvaluationCategory.TRAINER]:
    'Does this Trainer accurately and honestly evaluate Players in the BrightID domain?',
  [EvaluationCategory.MANAGER]:
    'Does this Manager accurately and honestly evaluate Managers and Trainers in the BrightID domain?',
};

const EXPRESSIONS: Record<
  EvaluationCategory,
  { positive: string; negative: string }
> = {
  [EvaluationCategory.SUBJECT]: {
    positive: '… this account should be verified.',
    negative: '… this account should not be verified.',
  },
  [EvaluationCategory.PLAYER]: {
    positive: '… this Player accurately and honestly evaluates Subjects.',
    negative:
      '… this Player does not accurately and honestly evaluate Subjects.',
  },
  [EvaluationCategory.TRAINER]: {
    positive: '… this Trainer accurately and honestly evaluates Players.',
    negative:
      '… this Trainer does not accurately and honestly evaluate Players.',
  },
  [EvaluationCategory.MANAGER]: {
    positive:
      '… this Manager accurately and honestly evaluates Managers and Trainers.',
    negative:
      '… this Manager does not accurately and honestly evaluate Managers and Trainers.',
  },
};

export default function EvaluateModal(props: {
  subjectId: () => string | null;
  onClose: () => void;
  category?: () => EvaluationCategory;
}) {
  let dialog: DialogElement | undefined;

  const vm = useViewMode();
  const category = () => props.category?.() ?? vm.currentEvaluationCategory();

  const [isYes, setIsYes] = createSignal(true);
  const [confidence, setConfidence] = createSignal(1);
  const [onDelete, setOnDelete] = createSignal(false);

  const { submitEvaluation, isPending } = useEvaluateSubject(category);
  const name = useSubjectName(() => props.subjectId() ?? '');
  // Existing rating for this subject in this category — seeds the form.
  const existing = useMyRating(() => props.subjectId() ?? '', category);

  createEffect(() => {
    const id = props.subjectId();
    if (id) {
      const prev = existing.rating();
      setIsYes(prev === undefined ? true : prev > 0);
      setConfidence(prev === undefined ? 1 : Math.abs(prev) || 1);
      setOnDelete(false);
      dialog?.show();
    } else {
      dialog?.hide();
    }
  });

  const close = () => dialog?.hide();

  const fail = (e: unknown) =>
    toast.error('Error', {
      description:
        'Failed to submit evaluation' +
        (e instanceof Error ? `: ${e.message}` : String(e)),
      duration: 5000,
    });

  const submit = async () => {
    const id = props.subjectId();
    if (!id || isPending()) return;
    const updating = existing.rating() !== undefined;
    try {
      await submitEvaluation(id, isYes() ? confidence() : -confidence());
      toast.success(updating ? 'Evaluation updated' : 'Evaluation submitted', {
        description: name(),
      });
      close();
    } catch (e) {
      fail(e);
    }
  };

  // Two-step remove: first tap arms it, second submits a confidence-0 op.
  const remove = async () => {
    const id = props.subjectId();
    if (!id || isPending()) return;
    if (!onDelete()) return setOnDelete(true);
    try {
      await submitEvaluation(id, 0);
      toast.success('Evaluation removed', { description: name() });
      close();
    } catch (e) {
      fail(e);
    }
  };

  return (
    <a-dialog ref={dialog} on:after-hide={() => props.onClose()}>
      <div slot="content" class="flex w-80 max-w-full flex-col gap-5">
        <div class="flex flex-col gap-1">
          <a-text variant="muted">
            Evaluate <span class="font-bold">{name()}</span> as a{' '}
            <span class="font-bold">{categoryLabel[category()]}</span> in the{' '}
            <span class="font-bold">BrightID</span> domain
          </a-text>
          <p class="font-medium text-foreground">
            {QUESTIONS[category()].replace('{name}', name())}
          </p>
        </div>

        <div class="flex gap-2">
          <a-button
            class="flex-1 transition-all duration-200"
            data-testid="evaluate-positive"
            variant={isYes() ? 'default' : 'outline'}
            onClick={() => setIsYes(true)}
          >
            <a-icon name="thumbs-up" /> Yes
          </a-button>
          <a-button
            class="flex-1 transition-all duration-200"
            data-testid="evaluate-negative"
            color="destructive"
            variant={isYes() ? 'outline' : 'default'}
            onClick={() => setIsYes(false)}
          >
            <a-icon name="thumbs-down" /> No
          </a-button>
        </div>

        <div class="flex flex-col gap-2">
          <a-text variant="muted">How confident are you?</a-text>
          <div class="flex flex-wrap gap-2">
            <For each={CONFIDENCE_VALUES}>
              {(value) => (
                <a-button
                  data-testid={`evaluate-confidence-${value}`}
                  size="sm"
                  variant="glass"
                  color="secondary"
                  selected={confidence() === value}
                  onClick={() => setConfidence(value)}
                >
                  {confidenceLabel(value)}
                </a-button>
              )}
            </For>
          </div>
          <p class="text-sm text-muted-foreground">
            I'm{' '}
            <span class="font-medium text-foreground">
              {confidenceLabel(confidence())}
            </span>{' '}
            confident that{' '}
            {EXPRESSIONS[category()][isYes() ? 'positive' : 'negative']}
          </p>
        </div>

        <Show
          when={existing.rating() !== undefined}
          fallback={
            <div class="flex gap-2">
              <a-button
                class="flex-1"
                variant="outline"
                data-testid="evaluate-cancel"
                onClick={() => dialog?.hide()}
              >
                Cancel
              </a-button>
              <a-button
                class="flex-1"
                data-testid="submit-evaluation"
                disabled={isPending()}
                onClick={submit}
              >
                <Show when={isPending()} fallback="Submit">
                  Sending…
                </Show>
              </a-button>
            </div>
          }
        >
          <div class="flex gap-2">
            <a-button
              class="flex-1"
              data-testid="submit-evaluation"
              variant={onDelete() ? 'outline' : 'default'}
              disabled={isPending()}
              onClick={submit}
            >
              <Show when={isPending()} fallback="Update Evaluation">
                Sending…
              </Show>
            </a-button>
            <a-button
              data-testid="remove-evaluation"
              color="destructive"
              variant={onDelete() ? 'default' : 'outline'}
              class={onDelete() ? 'flex-1' : ''}
              disabled={isPending()}
              onClick={remove}
            >
              <a-icon name="trash-2" />
              <Show when={onDelete()}>
                <span class="ml-1">Remove</span>
              </Show>
            </a-button>
          </div>
        </Show>
      </div>
    </a-dialog>
  );
}
