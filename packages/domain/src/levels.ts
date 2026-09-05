import { EvaluationCategory } from './types/evaluations';

export const subjectLevelPoints = [
  0, 1_000_000, 5_000_000, 10_000_000, 150_000_000,
];
export const playerLevelPoints = [0, 1_000_000, 2_000_000, 3_000_000];
export const trainerLevelPoints = [0, 500_000, 1_000_000];
export const managerLevelPoints = [0, 1_000, 200_000];

export const userLevelPoints = {
  [EvaluationCategory.MANAGER]: managerLevelPoints,
  [EvaluationCategory.PLAYER]: playerLevelPoints,
  [EvaluationCategory.SUBJECT]: subjectLevelPoints,
  [EvaluationCategory.TRAINER]: trainerLevelPoints,
};
