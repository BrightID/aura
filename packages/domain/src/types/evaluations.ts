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

export type OperationState =
  | 'UNKNOWN'
  | 'INIT'
  | 'SENT'
  | 'APPLIED'
  | 'FAILED'
  | 'EXPIRED';

export interface EvaluateOperation {
  hash: string;
  evaluator: string;
  evaluated: string;
  category: EvaluationCategory;
  confidence: number;
  evaluation: EvaluationValue;
  timestamp: number;
  postTimestamp?: number;
  state: OperationState;
}
