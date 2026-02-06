import { EvaluationCategory } from '@/utils/aura'

export const subjectLevelPoints = [0, 1000000, 5000000, 10000000, 150000000]

export const playerLevelPoints = [0, 1000000, 2000000, 3000000]

export const trainerLevelPoints = [0, 500000, 1000000]

export const managerLevelPoints = [0, 1000, 200000]

export const userLevelPoints = {
  [EvaluationCategory.MANAGER]: managerLevelPoints,
  [EvaluationCategory.PLAYER]: playerLevelPoints,
  [EvaluationCategory.SUBJECT]: subjectLevelPoints,
  [EvaluationCategory.TRAINER]: trainerLevelPoints
}
