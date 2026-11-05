import Dialog from '@/components/ui/dialog';
import {
  CONFIDENCE_LABELS,
  categoryLabel,
  confidenceLabel,
} from '@aura/domain/labels';
import { EvaluationCategory } from '@aura/domain/types/evaluations';
import type { DialogHandle } from '@/components/ui/dialog';
import { toast } from '@aura/ui/toast';
import { createEffect, createSignal, For, Show } from 'solid-js';
import { useSubjectName } from '@/hooks/use-backup';
import { useEvaluateSubject } from '@/hooks/use-evaluate-subject';
import { useMyRating } from '@/hooks/use-my-evaluations';
import { useViewMode } from '@/hooks/use-view-mode';
import Icon from '@/components/ui/icon';

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
  let dialog: DialogHandle | undefined;

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

  const fail = () =>
    toast.error('Could not submit evaluation', {
      description: 'Something went wrong. Try again.',
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
    } catch {
      fail();
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
    } catch {
      fail();
    }
  };

  return (
    <Dialog
      label="Evaluate account"
      ref={dialog}
      onClose={() => props.onClose()}
    >
      <div class="flex w-80 max-w-full flex-col gap-5">
        <div class="flex flex-col gap-1">
          <p class="a-text" data-variant="muted">
            Evaluate <span class="font-bold">{name()}</span> as a{' '}
            <span class="font-bold">{categoryLabel[category()]}</span> in the{' '}
            <span class="font-bold">BrightID</span> domain
          </p>
          <p class="font-medium text-foreground">
            {QUESTIONS[category()].replace('{name}', name())}
          </p>
        </div>

        <div class="flex gap-2">
          <button
            class="a-button flex-1 transition-all duration-200"
            type="button"
            data-testid="evaluate-positive"
            data-variant={isYes() ? 'default' : 'outline'}
            onClick={() => setIsYes(true)}
          >
            <Icon name="thumbs-up" /> Yes
          </button>
          <button
            class="a-button flex-1 transition-all duration-200"
            type="button"
            data-testid="evaluate-negative"
            data-color="destructive"
            data-variant={isYes() ? 'outline' : 'default'}
            onClick={() => setIsYes(false)}
          >
            <Icon name="thumbs-down" /> No
          </button>
        </div>

        <div class="flex flex-col gap-2">
          <p class="a-text" data-variant="muted">
            How confident are you?
          </p>
          <div class="flex flex-wrap gap-2">
            <For each={CONFIDENCE_VALUES}>
              {(value) => (
                <button
                  class="a-button"
                  type="button"
                  data-testid={`evaluate-confidence-${value}`}
                  data-size="sm"
                  data-variant="glass"
                  data-color="secondary"
                  aria-pressed={confidence() === value}
                  onClick={() => setConfidence(value)}
                >
                  {confidenceLabel(value)}
                </button>
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
              <button
                class="a-button flex-1"
                type="button"
                data-variant="outline"
                data-testid="evaluate-cancel"
                onClick={() => dialog?.hide()}
              >
                Cancel
              </button>
              <button
                class="a-button flex-1"
                type="button"
                data-testid="submit-evaluation"
                disabled={isPending()}
                onClick={submit}
              >
                <Show when={isPending()} fallback="Submit">
                  Sending…
                </Show>
              </button>
            </div>
          }
        >
          <div class="flex flex-col gap-2 sm:flex-row">
            <button
              class="a-button flex-1"
              type="button"
              data-testid="submit-evaluation"
              data-variant={onDelete() ? 'outline' : 'default'}
              disabled={isPending()}
              onClick={submit}
            >
              <Show when={isPending()} fallback="Update Evaluation">
                Sending…
              </Show>
            </button>
            <button
              class="a-button flex-1"
              type="button"
              data-testid="remove-evaluation"
              data-color="destructive"
              data-variant={onDelete() ? 'default' : 'outline'}
              disabled={isPending()}
              onClick={remove}
            >
              <Icon name="trash-2" />
              <Show when={onDelete()} fallback={<span>Remove evaluation</span>}>
                <span>Confirm removal</span>
              </Show>
            </button>
          </div>
        </Show>
      </div>
    </Dialog>
  );
}
