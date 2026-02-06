import { AuraRating, ConnectionLevel } from 'types';
import {
  EvaluationCategory,
  EvidenceViewMode,
  PreferredView,
} from 'types/dashboard';

import { operation_states } from '../BrightID/utils/constants';

export const CONNECTION_SEARCH_SEED = 5;

export const TOAST_SUCCESS = 'success';
export const TOAST_ERROR = 'danger';

// eslint-disable-next-line no-unused-vars
export const connectionLevelMap: {
  [c in ConnectionLevel]: number | undefined;
} = {
  reported: 0,
  suspicious: 1,
  'just met': 2,
  'already known': 4,
  'aura only': 3,
  recovery: 5,
};

export function getTextClassNameOfAuraRatingNumber(
  rating: number | null | undefined,
) {
  if (!rating) return '';
  return Math.abs(rating) > 2 ? 'text-white' : 'text-black';
}

export function getTextClassNameOfAuraRatingObject(
  auraRating: Pick<AuraRating, 'rating'> | null | undefined,
) {
  if (!auraRating) return auraRating;
  return getTextClassNameOfAuraRatingNumber(Number(auraRating.rating));
}

// All cases of if are here because of Tailwindcss
export function getBgClassNameOfAuraRatingNumber(
  rating: number | null | undefined,
) {
  if (!rating) return '';
  if (rating >= 4) return 'bg-pl4 dark:bg-pl4-dark';
  if (rating >= 3) return 'bg-pl3 dark:bg-pl3-dark';
  if (rating >= 2) return 'bg-pl2';
  if (rating > 0) return 'bg-pl1 dark:bg-pl1-dark';
  if (rating >= -1) return 'bg-nl1';
  if (rating >= -2) return 'bg-nl2';
  if (rating >= -3) return 'bg-nl3';
  return 'bg-nl4';
}

// All cases of if are here because of Tailwindcss
export function getRawTextClassNameOfAuraRatingNumber(
  rating: number | null | undefined,
) {
  if (!rating) return '';
  if (rating >= 4) return 'text-pl4';
  if (rating >= 3) return 'text-pl3';
  if (rating >= 2) return 'text-pl2';
  if (rating > 0) return 'text-pl1';
  if (rating >= -1) return 'text-nl1';
  if (rating >= -2) return 'text-nl2';
  if (rating >= -3) return 'text-nl3';
  return 'text-nl4';
}

export function getBgClassNameOfAuraRatingObject(
  auraRating: Pick<AuraRating, 'rating'> | null | undefined,
) {
  if (!auraRating) return auraRating;
  return getBgClassNameOfAuraRatingNumber(Number(auraRating.rating));
}

export function getConfidenceValueOfAuraRatingNumber(
  rating: number | null | undefined,
) {
  if (rating === null || rating === undefined) return rating;
  const score = Math.abs(rating);
  if (score >= 4) return 'Very High';
  if (score >= 3) return 'High';
  if (score >= 2) return 'Medium';
  if (score >= 1) return 'Low';
  return 'Very Low';
}

export function getConfidenceValueOfAuraRatingObject(
  auraRating: AuraRating | null | undefined,
) {
  if (!auraRating) return auraRating;
  return getConfidenceValueOfAuraRatingNumber(Number(auraRating.rating));
}

export const brightIdBaseURL = 'http://184.72.224.75';

export const RATING_INBOUND_STAT = 'ri';
export const RATING_OUTBOUND_STAT = 'ro';
export const ENERGY_INBOUND_STAT = 'ei';
export const ENERGY_OUTBOUND_STAT = 'eo';

export const MUTUAL_CONNECTIONS_TEST_NAMESPACE = 'mutual-connections-';

export const PLAYER_EVALUATION_MINIMUM_COUNT_BEFORE_TRAINING = 3;
export const SUBJECTS_EVALUATION_ONBOARDING_GUIDE_STEP_COUNT = 4;

//TODO: remove the functions and just use the mappings, and make sure tailwindcss classes still work properly
export const viewModeSubjectBackgroundColorClass: {
  [key in PreferredView]: string;
} = {
  [PreferredView.PLAYER]: 'bg-pastel-orange',
  [PreferredView.TRAINER]: 'bg-natural-black dark:bg-purple3',
  [PreferredView.MANAGER_EVALUATING_TRAINER]: 'bg-pastel-green',
  [PreferredView.MANAGER_EVALUATING_MANAGER]: 'bg-pastel-blue',
};
export const getViewModeSubjectBorderColorClass = (viewMode: PreferredView) => {
  switch (viewMode) {
    case PreferredView.PLAYER:
      return 'border-pastel-orange';
    case PreferredView.TRAINER:
      return 'border-pastel-purple';
    case PreferredView.MANAGER_EVALUATING_TRAINER:
      return 'border-pastel-green';
    case PreferredView.MANAGER_EVALUATING_MANAGER:
      return 'border-pastel-blue';
    default:
      return 'border-gray100';
  }
};
export const getViewModeSubjectTextColorClass = (viewMode: PreferredView) => {
  switch (viewMode) {
    case PreferredView.PLAYER:
      return 'text-pastel-orange';
    case PreferredView.TRAINER:
      return 'text-pastel-purple';
    case PreferredView.MANAGER_EVALUATING_TRAINER:
      return 'text-pastel-green';
    case PreferredView.MANAGER_EVALUATING_MANAGER:
      return 'text-pastel-blue';
    default:
      return 'text-gray100';
  }
};
export const getViewModeUpArrowIcon = (viewMode: PreferredView) => {
  switch (viewMode) {
    case PreferredView.PLAYER:
      return '/assets/images/Home/level-up-icon-purple.svg';
    case PreferredView.TRAINER:
      return '/assets/images/Home/level-up-icon-green.svg';
    case PreferredView.MANAGER_EVALUATING_TRAINER:
    case PreferredView.MANAGER_EVALUATING_MANAGER:
      return '/assets/images/Home/level-up-icon-blue.svg';
    default:
      return '/assets/images/Home/level-up-icon-purple.svg';
  }
};
export const getViewModeBackgroundColorClass = (viewMode: PreferredView) => {
  switch (viewMode) {
    case PreferredView.PLAYER:
      return 'bg-natural-black dark:bg-slate-500';
    case PreferredView.TRAINER:
      return 'bg-pl2';
    case PreferredView.MANAGER_EVALUATING_TRAINER:
    case PreferredView.MANAGER_EVALUATING_MANAGER:
      return 'bg-blue';
    default:
      return 'bg-gray100';
  }
};
export const getViewModeBorderColorClass = (viewMode: PreferredView) => {
  switch (viewMode) {
    case PreferredView.PLAYER:
      return 'border-pastel-purple';
    case PreferredView.TRAINER:
      return 'border-pastel-green';
    case PreferredView.MANAGER_EVALUATING_TRAINER:
    case PreferredView.MANAGER_EVALUATING_MANAGER:
      return 'border-pastel-blue';
    default:
      return 'border-gray100';
  }
};
export const getViewModeTextColorClass = (viewMode: PreferredView) => {
  switch (viewMode) {
    case PreferredView.PLAYER:
      return 'text-pastel-purple';
    case PreferredView.TRAINER:
      return 'text-pastel-green';
    case PreferredView.MANAGER_EVALUATING_TRAINER:
    case PreferredView.MANAGER_EVALUATING_MANAGER:
      return 'text-pastel-blue';
    default:
      return 'text-gray100';
  }
};

export type StringViewModes = 'manager' | 'trainer' | 'player' | 'subject';

export const viewModeToString: {
  [key in PreferredView]: string;
} = {
  // first property is just for avoiding type errors
  [PreferredView.PLAYER]: 'Player',
  [PreferredView.TRAINER]: 'Trainer',
  [PreferredView.MANAGER_EVALUATING_TRAINER]: 'Manager',
  [PreferredView.MANAGER_EVALUATING_MANAGER]: 'Manager',
};
export const viewModeSubjectString: {
  [key in PreferredView]: string;
} = {
  [PreferredView.PLAYER]: 'Subject',
  [PreferredView.TRAINER]: 'Player',
  [PreferredView.MANAGER_EVALUATING_TRAINER]: 'Trainer',
  [PreferredView.MANAGER_EVALUATING_MANAGER]: 'Manager',
};

export const viewModeToSubjectViewMode: {
  [key in PreferredView]: PreferredView;
} = {
  // first property is just for avoiding type errors
  [PreferredView.PLAYER]: PreferredView.PLAYER,
  [PreferredView.TRAINER]: PreferredView.PLAYER,
  [PreferredView.MANAGER_EVALUATING_TRAINER]: PreferredView.TRAINER,
  [PreferredView.MANAGER_EVALUATING_MANAGER]:
    PreferredView.MANAGER_EVALUATING_TRAINER,
};
export const viewModeToEvaluatorViewMode: {
  [key in PreferredView]: PreferredView;
} = {
  [PreferredView.PLAYER]: PreferredView.TRAINER,
  [PreferredView.TRAINER]: PreferredView.MANAGER_EVALUATING_TRAINER,
  [PreferredView.MANAGER_EVALUATING_TRAINER]:
    PreferredView.MANAGER_EVALUATING_MANAGER,
  // last property is just for avoiding type errors
  [PreferredView.MANAGER_EVALUATING_MANAGER]:
    PreferredView.MANAGER_EVALUATING_MANAGER,
};

export const viewModeToViewAs: {
  [key in PreferredView]: EvaluationCategory;
} = {
  [PreferredView.PLAYER]: EvaluationCategory.SUBJECT,
  [PreferredView.TRAINER]: EvaluationCategory.PLAYER,
  [PreferredView.MANAGER_EVALUATING_TRAINER]: EvaluationCategory.TRAINER,
  [PreferredView.MANAGER_EVALUATING_MANAGER]: EvaluationCategory.MANAGER,
};
export const viewAsToViewMode: {
  [key in EvaluationCategory]: PreferredView;
} = {
  [EvaluationCategory.SUBJECT]: PreferredView.PLAYER,
  [EvaluationCategory.PLAYER]: PreferredView.TRAINER,
  [EvaluationCategory.TRAINER]: PreferredView.MANAGER_EVALUATING_TRAINER,
  [EvaluationCategory.MANAGER]: PreferredView.MANAGER_EVALUATING_MANAGER,
};
export const viewAsToEvaluatorViewAs: {
  [key in EvaluationCategory]: EvaluationCategory;
} = {
  [EvaluationCategory.SUBJECT]: EvaluationCategory.PLAYER,
  [EvaluationCategory.PLAYER]: EvaluationCategory.TRAINER,
  [EvaluationCategory.TRAINER]: EvaluationCategory.MANAGER,
  [EvaluationCategory.MANAGER]: EvaluationCategory.MANAGER,
};

export const subjectViewAsIcon: {
  [key in EvaluationCategory]: string;
} = {
  [EvaluationCategory.SUBJECT]:
    '/assets/images/Dashboard/brightid-icon-white.svg',
  [EvaluationCategory.PLAYER]:
    '/assets/images/Dashboard/account-icon-white.svg',
  [EvaluationCategory.TRAINER]:
    '/assets/images/Dashboard/trainer-icon-white.svg',
  [EvaluationCategory.MANAGER]:
    '/assets/images/Dashboard/manager-icon-white.svg',
};

export const subjectViewAsIconColored: {
  [key in EvaluationCategory]: string;
} = {
  [EvaluationCategory.SUBJECT]: '/assets/images/Shared/brightid-icon.svg',
  [EvaluationCategory.PLAYER]: '/assets/images/Shared/player.svg',
  [EvaluationCategory.TRAINER]: '/assets/images/Shared/trainer.svg',
  [EvaluationCategory.MANAGER]: '/assets/images/Shared/manager-icon-s-blue.svg',
};

export const preferredViewIcon: {
  [key in PreferredView]: string;
} = {
  [PreferredView.PLAYER]: '/assets/images/Dashboard/account-icon-white.svg',
  [PreferredView.TRAINER]: '/assets/images/Dashboard/trainer-icon-white.svg',
  [PreferredView.MANAGER_EVALUATING_TRAINER]:
    '/assets/images/Dashboard/manager-icon-white.svg',
  [PreferredView.MANAGER_EVALUATING_MANAGER]:
    '/assets/images/Dashboard/manager-icon-white.svg',
} as const;

export const preferredViewIconColored: {
  [key in PreferredView]: string;
} = {
  [PreferredView.PLAYER]: '/assets/images/Shared/player.svg',
  [PreferredView.TRAINER]: '/assets/images/Shared/trainer.svg',
  [PreferredView.MANAGER_EVALUATING_TRAINER]:
    '/assets/images/Shared/manager-icon-s-blue.svg',
  [PreferredView.MANAGER_EVALUATING_MANAGER]:
    '/assets/images/Shared/manager-icon-s-blue.svg',
} as const;

export const INBOUND_EVIDENCE_VIEW_MODES = [
  EvidenceViewMode.INBOUND_CONNECTION,
  EvidenceViewMode.INBOUND_EVALUATION,
];

export const OUTBOUND_EVIDENCE_VIEW_MODES = [
  EvidenceViewMode.OUTBOUND_ACTIVITY,
  EvidenceViewMode.OUTBOUND_ACTIVITY_ON_MANAGERS,
];

export const pendingOperationStates = [
  operation_states.UNKNOWN,
  operation_states.INIT,
  operation_states.SENT,
] as const;
