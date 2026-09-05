import { EvaluationCategory } from '@aura/domain/types/evaluations';

/**
 * Per-role visual identity (old app coloured the view switchers / tabs by
 * role). `icon` is a lucide name; `color` is a mid-tone from that role's
 * confidence palette, used as an accent so the active role reads at a glance.
 */
export const roleIcon: Record<EvaluationCategory, string> = {
  [EvaluationCategory.SUBJECT]: 'user',
  [EvaluationCategory.PLAYER]: 'gamepad-2',
  [EvaluationCategory.TRAINER]: 'dumbbell',
  [EvaluationCategory.MANAGER]: 'briefcase',
};

export const roleColor: Record<EvaluationCategory, string> = {
  [EvaluationCategory.SUBJECT]: '#E67E22',
  [EvaluationCategory.PLAYER]: '#8341DE',
  [EvaluationCategory.TRAINER]: '#5B9969',
  [EvaluationCategory.MANAGER]: '#3B82F6',
};
