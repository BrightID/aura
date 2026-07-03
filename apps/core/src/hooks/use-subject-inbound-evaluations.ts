import { createMemo } from "solid-js"
import { useNameResolver } from "@/hooks/use-backup"
import {
  createBrightIdProfileQuery,
  createInboundConnectionsQuery,
  createOutboundConnectionsQuery,
} from "@/queries/connections"
import { categoryEvaluatedBy } from "@aura/domain/labels"
import { impactShare } from "@aura/domain/score"
import type {
  AuraEvaluation,
  AuraImpactRaw,
  AuraNodeBrightIdConnection,
  ConnectionLevel,
} from "@aura/domain/types/aura"
import {
  type EvaluationCategory,
  EvaluationValue,
} from "@aura/domain/types/evaluations"
import { getAuraVerification } from "@aura/domain/verifications"

/** One evaluation row: the other party, their standing, and the rating. */
export interface InboundEvaluation {
  evaluatorId: string
  name: string
  /** Signed rating: +confidence for positive, -confidence for negative. */
  rating: number
  confidence: number
  timestamp: number
  /** The other party's level/score in the relevant role. */
  level: number | null
  score: number | null
  /** This evaluation's share of the subject's total impact (percent). */
  impactPercent: number | null
  /** The evaluator's own inbound impacts in the relevant role, for the mini
   * chart — mirrors the old card's per-evaluator graph. */
  impacts: AuraImpactRaw[] | null
}

/** Flatten one connection's evaluations (in a category) into rows. */
function toRows(
  connection: AuraNodeBrightIdConnection,
  category: EvaluationCategory,
  options: {
    nameOf: (id: string) => string
    /** Which role's level/score to show for the other party. */
    standingCategory: EvaluationCategory
    impacts?: AuraImpactRaw[]
  },
): InboundEvaluation[] {
  const standing = getAuraVerification(
    connection.verifications,
    options.standingCategory,
  )
  return (connection.auraEvaluations ?? [])
    .filter((e: AuraEvaluation) => e.category === category)
    .map((e) => ({
      evaluatorId: connection.id,
      name: options.nameOf(connection.id),
      rating:
        (e.evaluation === EvaluationValue.POSITIVE ? 1 : -1) * e.confidence,
      confidence: e.confidence,
      timestamp: e.modified || connection.timestamp,
      level: standing?.level ?? null,
      score: standing?.score ?? null,
      impactPercent: impactShare(options.impacts, connection.id),
      impacts: standing?.impacts ?? null,
    }))
}

const byRecency = (a: InboundEvaluation, b: InboundEvaluation) =>
  b.timestamp - a.timestamp

/**
 * Inbound evaluations of a subject in a category, derived from the subject's
 * inbound connections (`auraEvaluations` ride along on each connection).
 * Ported from the old `useSubjectInboundEvaluations`, minus its filter/sort
 * machinery — lists are short enough to sort by recency here.
 */
export function useSubjectInboundEvaluations(
  subjectId: () => string,
  category: () => EvaluationCategory,
) {
  const query = createInboundConnectionsQuery(subjectId)
  // The subject's own profile carries the per-evaluator impacts (cached by id).
  const profile = createBrightIdProfileQuery(subjectId)
  const nameOf = useNameResolver()

  const evaluations = createMemo<InboundEvaluation[] | null>(() => {
    const data = query.data
    if (!data) return null
    const impacts =
      getAuraVerification(profile.data?.verifications, category())?.impacts ??
      undefined
    return data
      .flatMap((c) =>
        toRows(c, category(), {
          nameOf,
          standingCategory: categoryEvaluatedBy[category()],
          impacts,
        }),
      )
      .sort(byRecency)
  })

  const positiveCount = createMemo(
    () => evaluations()?.filter((e) => e.rating > 0).length,
  )
  const negativeCount = createMemo(
    () => evaluations()?.filter((e) => e.rating < 0).length,
  )

  return {
    loading: () => query.isLoading,
    evaluations,
    positiveCount,
    negativeCount,
  }
}

/**
 * The subject's outgoing evaluations in a category — their "activity" (e.g.
 * a player's evaluations of subjects). Same row shape; `evaluatorId` holds
 * the *evaluated* subject's id here.
 */
export function useSubjectOutboundEvaluations(
  subjectId: () => string,
  category: () => EvaluationCategory,
) {
  const query = createOutboundConnectionsQuery(subjectId)
  const nameOf = useNameResolver()

  const evaluations = createMemo<InboundEvaluation[] | null>(() => {
    const data = query.data
    if (!data) return null
    return data
      .flatMap((c) =>
        // The other party is the evaluated subject — show their standing in
        // the evaluated category itself.
        toRows(c, category(), { nameOf, standingCategory: category() }),
      )
      .sort(byRecency)
  })

  return { loading: () => query.isLoading, evaluations }
}

// Mirrors the old app's connection ordering: closer levels first, then recency.
const LEVEL_PRIORITY: Record<ConnectionLevel, number> = {
  "already known": 1,
  recovery: 2,
  "just met": 3,
  "aura only": 4,
  suspicious: 5,
  reported: 6,
}

/** A subject's inbound connections, closest level first, then most recent. */
export function useSubjectInboundConnections(subjectId: () => string) {
  const query = createInboundConnectionsQuery(subjectId)
  const nameOf = useNameResolver()

  const connections = createMemo<AuraNodeBrightIdConnection[] | null>(() => {
    const data = query.data
    if (!data) return null
    return [...data].sort((a, b) => {
      const pa = LEVEL_PRIORITY[a.level] ?? Number.POSITIVE_INFINITY
      const pb = LEVEL_PRIORITY[b.level] ?? Number.POSITIVE_INFINITY
      return pa === pb ? b.timestamp - a.timestamp : pa - pb
    })
  })

  return { loading: () => query.isLoading, connections, nameOf }
}
