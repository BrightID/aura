import { EvaluationCategory } from "./types/evaluations"
import { PreferredView } from "./types/dashboard"

/** The role we *evaluate* when in a given view. */
export const viewModeToViewAs: Record<PreferredView, EvaluationCategory> = {
  [PreferredView.PLAYER]: EvaluationCategory.SUBJECT,
  [PreferredView.TRAINER]: EvaluationCategory.PLAYER,
  [PreferredView.MANAGER_EVALUATING_TRAINER]: EvaluationCategory.TRAINER,
  [PreferredView.MANAGER_EVALUATING_MANAGER]: EvaluationCategory.MANAGER,
}

/** The view that evaluates the current view's role (one level up). */
export const viewModeToEvaluatorViewMode: Record<PreferredView, PreferredView> =
  {
    [PreferredView.PLAYER]: PreferredView.TRAINER,
    [PreferredView.TRAINER]: PreferredView.MANAGER_EVALUATING_TRAINER,
    [PreferredView.MANAGER_EVALUATING_TRAINER]:
      PreferredView.MANAGER_EVALUATING_MANAGER,
    [PreferredView.MANAGER_EVALUATING_MANAGER]:
      PreferredView.MANAGER_EVALUATING_MANAGER,
  }

/** `?viewas=` query value → view. */
export const viewAsToViewMode: Record<EvaluationCategory, PreferredView> = {
  [EvaluationCategory.SUBJECT]: PreferredView.PLAYER,
  [EvaluationCategory.PLAYER]: PreferredView.TRAINER,
  [EvaluationCategory.TRAINER]: PreferredView.MANAGER_EVALUATING_TRAINER,
  [EvaluationCategory.MANAGER]: PreferredView.MANAGER_EVALUATING_MANAGER,
}

export const viewModeToString: Record<PreferredView, string> = {
  [PreferredView.PLAYER]: "Player",
  [PreferredView.TRAINER]: "Trainer",
  [PreferredView.MANAGER_EVALUATING_TRAINER]: "Manager",
  [PreferredView.MANAGER_EVALUATING_MANAGER]: "Manager",
}

/** URL slug (`/home/:view`) ↔ view. Manager collapses to one slug. */
export const viewSlugToViewMode: Record<string, PreferredView> = {
  player: PreferredView.PLAYER,
  trainer: PreferredView.TRAINER,
  manager: PreferredView.MANAGER_EVALUATING_TRAINER,
}

export const viewModeToSlug: Record<PreferredView, string> = {
  [PreferredView.PLAYER]: "player",
  [PreferredView.TRAINER]: "trainer",
  [PreferredView.MANAGER_EVALUATING_TRAINER]: "manager",
  [PreferredView.MANAGER_EVALUATING_MANAGER]: "manager",
}

export const viewModeSubjectString: Record<PreferredView, string> = {
  [PreferredView.PLAYER]: "Subject",
  [PreferredView.TRAINER]: "Player",
  [PreferredView.MANAGER_EVALUATING_TRAINER]: "Trainer",
  [PreferredView.MANAGER_EVALUATING_MANAGER]: "Manager",
}
