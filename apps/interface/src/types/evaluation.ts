export interface AuraImpactRaw {
  evaluator: string
  level?: number | null
  score: number | null
  confidence: number
  impact: number
}

export interface AuraImpact extends AuraImpactRaw {
  evaluatorName: string
}
