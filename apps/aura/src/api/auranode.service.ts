import { EvaluationCategory } from '../types/dashboard';

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
  name: 'BrightID'; // for now
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

//TODO: complete based on this: https://brightid.stoplight.io/docs/node-api/5f925a7124856-gets-profile-information-of-a-user
export interface BrightIdProfile {
  createdAt: number;
  verifications: Verifications;
}
