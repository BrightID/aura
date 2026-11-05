import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { Shield } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '~/components/ui/button';
import { API_BASE_URL } from '~/constants';
import { cn } from '~/lib/utils';
import type { Project } from '~/types/projects';
import { formatScore } from '~/utils/numbers';
import {
  saveVerification,
  type VerificationSaveResult,
} from './verification-save';

// One line on purpose. brightid-apps splits this string on newlines, and the
// node evaluates each line as its own expr-eval expression. Shape matches the
// node evaluator: key verifications by name, filter Aura.domains, then compare
// BrightID subject level. Last assignment is the boolean result.
function subjectLevelScript(level: number) {
  return (
    'domainFilter(d) = d.name == "BrightID"; ' +
    'categoryFilter(c) = c.name == "subject"; ' +
    'domains = filter(domainFilter, Aura.domains); ' +
    'categories = filter(categoryFilter, domains[0].categories); ' +
    `verified = categories[0].level >= ${level};`
  );
}

export const LEVEL_SCRIPTS: Record<number, string> = {
  0: '', // no gating: any / unverified user passes
  1: subjectLevelScript(1),
  2: subjectLevelScript(2),
  3: subjectLevelScript(3),
  4: subjectLevelScript(4),
};

const levelRequirements: Record<number, string[]> = {
  0: ['Anyone can pass, including users without verification.'],
  1: [
    'One evaluation with low confidence or higher, from an evaluator at Level 1 or above.',
  ],
  2: [
    'One evaluation with medium confidence or higher, from an evaluator at Level 1 or above.',
  ],
  3: [
    'One evaluation with high confidence or higher, from an evaluator at Level 2 or above.',
    'Two evaluations with medium confidence, from two evaluators at Level 2 or above.',
  ],
  4: [
    'One evaluation with high confidence or higher, from an evaluator at Level 3 or above.',
    'Two evaluations with medium confidence, from two evaluators at Level 3 or above.',
  ],
};
const levelPoints = [0, 1_000_000, 5_000_000, 10_000_000, 150_000_000];

export function UserRequiredLevelCard({ project }: { project: Project }) {
  const groupId = useId();
  const savedLevel = project.requirementLevel;
  const [selectedLevel, setSelectedLevel] = useState<number | null>(savedLevel);
  const [result, setResult] = useState<
    VerificationSaveResult | 'save-failed' | null
  >(null);
  const previousSavedLevel = useRef(savedLevel);
  const queryClient = useQueryClient();
  const isDirty = selectedLevel !== savedLevel;

  // Follow refreshed saved values without replacing a draft the user is editing.
  useEffect(() => {
    const previous = previousSavedLevel.current;
    previousSavedLevel.current = savedLevel;
    setSelectedLevel((draft) => (draft === previous ? savedLevel : draft));
  }, [savedLevel]);

  const { isPending, mutate } = useMutation({
    mutationKey: ['update-project-verification', project.id],
    mutationFn: async ({
      level,
      retrySync,
    }: {
      level: number;
      retrySync: boolean;
    }) => {
      const token = await getAuth().currentUser?.getIdToken();
      if (!token) throw new Error('Please sign in again.');
      const headers = { Authorization: `Bearer ${token}` };
      await queryClient.cancelQueries({ queryKey: ['user-projects'] });
      return saveVerification({
        saveLevel: retrySync
          ? undefined
          : async () => {
              await axios.post(
                `${API_BASE_URL}/api/projects/update-project`,
                {
                  id: Number(project.id),
                  requirementLevel: level,
                  isActive: project.isActive,
                },
                { headers },
              );
              // The level is persisted even if the following sync fails.
              queryClient.setQueryData<Project[]>(
                ['user-projects'],
                (projects) =>
                  projects?.map((item) =>
                    item.id === project.id
                      ? { ...item, requirementLevel: level }
                      : item,
                  ),
              );
            },
        syncLevel: async () => {
          const { data } = await axios.post<{
            updated: boolean;
            reason?: string;
          }>(
            `${API_BASE_URL}/api/projects/update-project-verifications`,
            {
              projectId: Number(project.id),
              verifications: LEVEL_SCRIPTS[level],
            },
            { headers },
          );
          return data;
        },
      });
    },
    onMutate: () => setResult(null),
    onSuccess: setResult,
    onError: (_error, { retrySync }) =>
      setResult(retrySync ? 'sync-failed' : 'save-failed'),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ['user-projects'] }),
  });

  const needsSync = result === 'sync-failed' || result === 'unlinked';
  const message = isPending
    ? 'Saving verification settings…'
    : result === 'unlinked'
      ? 'Level saved. Link a BrightID app below, then retry verification sync.'
      : result === 'sync-failed'
        ? 'Level saved, but verification sync failed. The linked app may still use the previous rule. Retry sync.'
        : result === 'save-failed'
          ? 'Could not save the verification level. Your selection is still here; try saving again.'
          : isDirty
            ? 'Unsaved changes'
            : result === 'synced'
              ? 'Verification level saved and synced.'
              : 'No unsaved changes';

  useEffect(() => {
    if (!isDirty) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [isDirty]);

  return (
    <div className="a-card">
      <div className="flex items-start gap-3">
        <Shield
          className="mt-0.5 size-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <div>
          <h2 id={`${groupId}-title`} className="text-lg font-semibold">
            Minimum verification level
          </h2>
          <p
            id={`${groupId}-help`}
            className="mt-1 text-sm text-muted-foreground"
          >
            Users below this level cannot pass your project’s verification. Save
            to apply the rule to your linked BrightID app.
          </p>
        </div>
      </div>

      <details className="mt-4 text-sm">
        <summary className="w-fit cursor-pointer rounded-sm font-medium focus-visible:outline-2 focus-visible:outline-ring">
          How levels work
        </summary>
        <p className="mt-2 max-w-prose text-muted-foreground">
          Choose the minimum Aura level a user must have. Higher levels have
          stricter evaluation requirements. Confidence describes an evaluation’s
          strength; the evaluator’s level describes the person providing it.
          Scores are shown for reference. This setting checks the user’s level.
        </p>
      </details>

      <fieldset
        disabled={isPending}
        aria-describedby={`${groupId}-help`}
        className="mt-4 min-w-0 space-y-2"
      >
        <legend className="sr-only">Minimum verification level</legend>
        {[0, 1, 2, 3, 4].map((level) => (
          <label
            key={level}
            className={cn(
              'flex min-h-14 items-start gap-3 rounded-lg border p-3 transition-colors focus-within:ring-2 focus-within:ring-ring',
              isPending
                ? 'cursor-wait opacity-70'
                : 'cursor-pointer hover:bg-muted/50',
              selectedLevel === level
                ? 'border-primary bg-primary/10'
                : 'border-foreground/25',
            )}
          >
            <input
              type="radio"
              name={groupId}
              value={level}
              checked={selectedLevel === level}
              onChange={() => setSelectedLevel(level)}
              aria-labelledby={`${groupId}-name-${level}`}
              aria-describedby={`${groupId}-level-${level}`}
              className="mt-1 size-4 shrink-0 accent-primary"
            />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span id={`${groupId}-name-${level}`} className="font-semibold">
                  {level === 0
                    ? 'Level 0 — No verification required'
                    : `Level ${level}`}
                </span>
                {level > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {formatScore(levelPoints[level])} score
                  </span>
                )}
                {savedLevel === level && (
                  <span className="rounded border border-foreground/25 px-2 py-0.5 text-xs">
                    Saved level
                  </span>
                )}
                {selectedLevel === level && isDirty && (
                  <span className="text-xs font-medium text-primary">
                    Unsaved selection
                  </span>
                )}
              </span>
              <span
                id={`${groupId}-level-${level}`}
                className="mt-1 block text-sm text-muted-foreground"
              >
                {levelRequirements[level].map((requirement, index) => (
                  <span key={requirement} className="block">
                    {index > 0 && <strong className="font-medium">Or: </strong>}
                    {requirement}
                  </span>
                ))}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <div
        className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"
        aria-busy={isPending}
      >
        <p role="status" aria-live="polite" className="text-sm">
          {message}
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          {needsSync && savedLevel !== null && (
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => mutate({ level: savedLevel, retrySync: true })}
            >
              Retry sync
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={isPending || !isDirty}
            onClick={() => {
              setSelectedLevel(savedLevel);
              if (!needsSync) setResult(null);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isPending || !isDirty || selectedLevel === null}
            onClick={() => {
              if (selectedLevel !== null)
                mutate({ level: selectedLevel, retrySync: false });
            }}
          >
            {isPending ? 'Saving…' : 'Save verification level'}
          </Button>
        </div>
      </div>
    </div>
  );
}
