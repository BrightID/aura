export enum PreferredView {
  PLAYER,
  TRAINER,
  MANAGER_EVALUATING_TRAINER,
  MANAGER_EVALUATING_MANAGER,
}

export enum ProfileTab {
  OVERVIEW = 'overview',
  CONNECTIONS = 'connections',
  ACTIVITY = 'activity',
  EVALUATIONS = 'evaluations',
  ACTIVITY_ON_MANAGERS = 'activity_on_managers',
}

export enum EvidenceViewMode {
  INBOUND_CONNECTION,
  INBOUND_EVALUATION,
  OUTBOUND_ACTIVITY,
  OUTBOUND_ACTIVITY_ON_MANAGERS,
}

export enum EvaluationCategory {
  SUBJECT = 'subject',
  PLAYER = 'player',
  TRAINER = 'trainer',
  MANAGER = 'manager',
}

export enum EvaluationValue {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
}

export enum EvidenceType {
  EVALUATED,
  CONNECTED,
}

export const evaluationsToEvaluatedCategory: Record<
  string,
  EvaluationCategory
> = {
  player: EvaluationCategory.SUBJECT,
  trainer: EvaluationCategory.PLAYER,
  manager: EvaluationCategory.TRAINER,
};
