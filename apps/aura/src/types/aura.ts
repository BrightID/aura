import type { EvaluationCategory } from './dashboard';

export interface AuraImpactRaw {
  evaluator: string;
  level?: number | null;
  score: number | null;
  confidence: number;
  impact: number;
  modified: number;
}

export interface AuraImpact extends AuraImpactRaw {
  evaluatorName: string;
}

export type Domain = {
  name: 'BrightID';
  categories: {
    name: EvaluationCategory;
    score: number;
    level: number;
    impacts: AuraImpactRaw[];
  }[];
};

export type Verifications = {
  name: string;
  block: number;
  timestamp: number;
  domains?: Domain[];
}[];

export interface BrightIdProfile {
  createdAt: number;
  verifications: Verifications;
}
