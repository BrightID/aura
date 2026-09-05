import { toast } from '@aura/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { Check, Shield } from 'lucide-react';
import { useRef, useState } from 'react';
import { API_BASE_URL } from '~/constants';
import { useAuraEvent } from '~/lib/aura';
import { cn } from '~/lib/utils';
import type { Project } from '~/types/projects';
import { formatScore } from '~/utils/numbers';

export const LEVEL_SCRIPTS: Record<number, string> = {
  0: '', // no gating: any / unverified user passes
  1: 'Aura.subject.level >= 1',
  2: 'Aura.subject.level >= 2',
  3: 'Aura.subject.level >= 3',
  4: 'Aura.subject.level >= 4',
};

const levelPalette: Record<
  number,
  {
    selected: string;
    current: string;
    text: string;
    dot: string;
    badge: string;
    radio: string;
  }
> = {
  0: {
    selected: 'border-zinc-400 bg-zinc-500/10',
    current: 'border-zinc-400/60 bg-zinc-500/5',
    text: 'text-zinc-400',
    dot: 'bg-zinc-400',
    badge: 'bg-zinc-500/15 text-zinc-400',
    radio: 'border-zinc-400 text-zinc-400',
  },
  1: {
    selected: 'border-amber-500 bg-amber-500/10',
    current: 'border-amber-500/60 bg-amber-500/5',
    text: 'text-amber-500',
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/15 text-amber-600',
    radio: 'border-amber-500 text-amber-500',
  },
  2: {
    selected: 'border-sky-500 bg-sky-500/10',
    current: 'border-sky-500/60 bg-sky-500/5',
    text: 'text-sky-500',
    dot: 'bg-sky-500',
    badge: 'bg-sky-500/15 text-sky-600',
    radio: 'border-sky-500 text-sky-500',
  },
  3: {
    selected: 'border-emerald-500 bg-emerald-500/10',
    current: 'border-emerald-500/60 bg-emerald-500/5',
    text: 'text-emerald-500',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-500/15 text-emerald-600',
    radio: 'border-emerald-500 text-emerald-500',
  },
  4: {
    selected: 'border-violet-500 bg-violet-500/10',
    current: 'border-violet-500/60 bg-violet-500/5',
    text: 'text-violet-500',
    dot: 'bg-violet-500',
    badge: 'bg-violet-500/15 text-violet-600',
    radio: 'border-violet-500 text-violet-500',
  },
};

const levelRequirements: Record<number, string> = {
  0: 'No minimum evaluation requirements',
  1: '1 low+ confidence eval from 1 level 1+ evaluator',
  2: '1 medium+ confidence eval from 1 level 1+ evaluator',
  3: '1 high+ confidence eval from 1 level 2+ evaluator OR 2 medium confidence evals from 2 level 2+ evaluators',
  4: '1 high+ confidence eval from 1 level 3+ evaluator OR 2 medium confidence evals from 2 level 3+ evaluators',
};

const levelPoints = [0, 1_000_000, 5_000_000, 10_000_000, 150_000_000];

export function UserRequiredLevelCard({ project }: { project: Project }) {
  const [selectedLevel, setSelectedLevel] = useState<string>(
    project.requirementLevel?.toString() ?? '',
  );

  const radioGroupRef = useRef<HTMLElement>(null);
  useAuraEvent<string>(radioGroupRef, 'change', setSelectedLevel);

  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationKey: ['update-project', project.id],
    mutationFn: async (level: number) => {
      const token = await getAuth().currentUser?.getIdToken();
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(
        `${API_BASE_URL}/api/projects/update-project`,
        { ...project, requirementLevel: level },
        { headers },
      );

      const { data } = await axios.post(
        `${API_BASE_URL}/api/projects/update-project-verifications`,
        { projectId: Number(project.id), verifications: LEVEL_SCRIPTS[level] },
        { headers },
      );

      return data as { updated: boolean; reason?: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-projects'] });
      if (data?.updated) {
        toast.success('Requirement level and verifications script updated');
      } else {
        toast.success('Requirement level updated');
        toast.warning(
          'No BrightID app is linked to this project yet — configure one in the Verification tab to sync the script.',
        );
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSave = () => {
    if (selectedLevel === '') return;
    mutate(Number(selectedLevel));
  };

  return (
    <a-card className="overflow-hidden">
      <div className="flex flex-col gap-1.5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <a-head level="3" className="text-lg font-semibold">
                Verification Requirement Level
              </a-head>
              <p className="text-muted-foreground text-sm">
                Minimum level users must achieve to pass
              </p>
            </div>
          </div>
          <a-button
            size="sm"
            onClick={handleSave}
            disabled={
              isPending ||
              selectedLevel === project.requirementLevel?.toString()
            }
          >
            {isPending ? 'Saving...' : 'Save'}
          </a-button>
        </div>
      </div>

      <div className="p-6 pt-0">
        <a-radio-group
          ref={radioGroupRef}
          value={selectedLevel}
          className="space-y-3"
        >
          {[4, 3, 2, 1, 0].map((level) => {
            const isSelected = selectedLevel === level.toString();
            const isCurrent = project.requirementLevel === level;
            const palette = levelPalette[level];

            return (
              <label
                key={level}
                className={cn(
                  'flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all',
                  isSelected
                    ? cn(palette.selected, 'shadow-sm')
                    : isCurrent
                      ? palette.current
                      : 'border-border bg-muted/30 hover:bg-muted/60',
                )}
              >
                <div className="flex items-center gap-4">
                  <a-radio
                    value={level.toString()}
                    className={isSelected ? palette.radio : ''}
                  />
                  <div className="select-none space-y-1">
                    <p
                      className={cn(
                        'font-semibold text-lg flex items-center gap-2',
                        isSelected && palette.text,
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block w-2 h-2 rounded-full',
                          palette.dot,
                        )}
                      />
                      Level {level} • {formatScore(levelPoints[level])} Score
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {levelRequirements[level]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isCurrent && (
                    <a-badge variant="secondary" className={palette.badge}>
                      Current
                    </a-badge>
                  )}
                  {isSelected && !isCurrent && (
                    <Check className={cn('w-5 h-5', palette.text)} />
                  )}
                </div>
              </label>
            );
          })}
        </a-radio-group>
      </div>
    </a-card>
  );
}
