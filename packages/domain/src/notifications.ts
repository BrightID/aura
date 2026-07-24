import type { AuraNodeBrightIdConnection, Verifications } from "./types/aura"
import { EvaluationCategory, EvaluationValue } from "./types/evaluations"
import { getAuraVerification } from "./verifications"

export const ALERT_THRESHOLDS = {
  LEVEL_CHANGE: 1,
  SCORE_CHANGE_PERCENT: 35,
}

export type NotificationKind =
  | "evaluation"
  | "score-increase"
  | "score-decrease"
  | "level-increase"
  | "level-decrease"

export interface NotificationAlert {
  id: string
  kind: NotificationKind
  category: EvaluationCategory
  about: string
  to: string | null
  previous: number | null
  next: number | null
  timestamp: number
  viewed: boolean
}

export interface TrackedProfile {
  level: number | null
  score: number | null
  evaluators?: Record<string, number>
}

export type TrackedProfiles = Record<string, TrackedProfile>

export const trackedKey = (id: string, category: EvaluationCategory) =>
  `${id}:${category}`

export const NOTIFICATION_CATEGORIES = [
  EvaluationCategory.SUBJECT,
  EvaluationCategory.PLAYER,
  EvaluationCategory.TRAINER,
  EvaluationCategory.MANAGER,
]

const alertId = (
  kind: NotificationKind,
  about: string,
  category: EvaluationCategory,
  timestamp: number,
) => `${kind}:${about}:${category}:${timestamp}`

function levelScoreAlerts(
  id: string,
  category: EvaluationCategory,
  prev: TrackedProfile | undefined,
  level: number | null,
  score: number | null,
  now: number,
): NotificationAlert[] {
  if (!prev) return []
  const alerts: NotificationAlert[] = []

  if (
    level !== null &&
    prev.level !== null &&
    Math.abs(prev.level - level) >= ALERT_THRESHOLDS.LEVEL_CHANGE
  ) {
    alerts.push({
      id: alertId(
        level > prev.level ? "level-increase" : "level-decrease",
        id,
        category,
        now,
      ),
      kind: level > prev.level ? "level-increase" : "level-decrease",
      category,
      about: id,
      to: null,
      previous: prev.level,
      next: level,
      timestamp: now,
      viewed: false,
    })
  }

  if (
    score !== null &&
    prev.score !== null &&
    prev.score !== 0 &&
    Math.abs((score / prev.score) * 100 - 100) >=
      ALERT_THRESHOLDS.SCORE_CHANGE_PERCENT
  ) {
    alerts.push({
      id: alertId(
        score > prev.score ? "score-increase" : "score-decrease",
        id,
        category,
        now,
      ),
      kind: score > prev.score ? "score-increase" : "score-decrease",
      category,
      about: id,
      to: null,
      previous: prev.score,
      next: score,
      timestamp: now,
      viewed: false,
    })
  }

  return alerts
}

/**
 * Pure diff of fresh node data against the previously tracked snapshot.
 * Produces alerts for: own level/score changes per category, new inbound
 * evaluations of the user, and changes on subjects the user has evaluated
 * (their level/score plus other evaluators' new or changed ratings).
 *
 * The first run (`lastFetch === null`) only seeds the tracked snapshot and
 * yields no alerts — otherwise every existing evaluation would fire at once.
 * No I/O and no clock access: the caller passes `now`.
 */
export function diffNotifications(params: {
  subjectId: string
  /** The user's own verifications (from their profile). */
  verifications: Verifications | undefined
  /** The user's inbound connections (evaluations of them ride along). */
  inbound: AuraNodeBrightIdConnection[]
  /** The user's outbound connections (subjects they evaluated). */
  outbound: AuraNodeBrightIdConnection[]
  prevTracked: TrackedProfiles
  lastFetch: number | null
  now: number
}): { alerts: NotificationAlert[]; tracked: TrackedProfiles } {
  const {
    subjectId,
    verifications,
    inbound,
    outbound,
    prevTracked,
    lastFetch,
    now,
  } = params

  const seedOnly = lastFetch === null
  const tracked: TrackedProfiles = { ...prevTracked }
  const alerts: NotificationAlert[] = []

  // ── Own level/score per category ─────────────────────────
  for (const category of NOTIFICATION_CATEGORIES) {
    const v = getAuraVerification(verifications, category)
    const key = trackedKey(subjectId, category)
    if (!seedOnly) {
      alerts.push(
        ...levelScoreAlerts(
          subjectId,
          category,
          tracked[key],
          v?.level ?? null,
          v?.score ?? null,
          now,
        ),
      )
    }
    tracked[key] = { level: v?.level ?? null, score: v?.score ?? null }
  }

  if (!seedOnly) {
    for (const connection of inbound) {
      for (const e of connection.auraEvaluations ?? []) {
        const modified = e.modified || connection.timestamp
        if (modified <= (lastFetch ?? 0)) continue
        alerts.push({
          id: alertId("evaluation", connection.id, e.category, modified),
          kind: "evaluation",
          category: e.category,
          about: connection.id,
          to: subjectId,
          previous: null,
          next:
            (e.evaluation === EvaluationValue.POSITIVE ? 1 : -1) * e.confidence,
          timestamp: modified,
          viewed: false,
        })
      }
    }
  }

  // ── Subjects the user evaluated ──────────────────────────
  for (const subject of outbound) {
    const categories = new Set(
      (subject.auraEvaluations ?? []).map((e) => e.category),
    )
    for (const category of categories) {
      const v = getAuraVerification(subject.verifications, category)
      const key = trackedKey(subject.id, category)
      const prev = tracked[key]

      const evaluators: Record<string, number> = {}
      for (const impact of v?.impacts ?? []) {
        evaluators[impact.evaluator] = impact.confidence
      }

      if (prev && !seedOnly) {
        alerts.push(
          ...levelScoreAlerts(
            subject.id,
            category,
            prev,
            v?.level ?? null,
            v?.score ?? null,
            now,
          ),
        )

        // Other evaluators newly rating (or re-rating) this subject.
        for (const impact of v?.impacts ?? []) {
          if (impact.evaluator === subjectId) continue
          if (prev.evaluators?.[impact.evaluator] === impact.confidence)
            continue
          alerts.push({
            id: alertId(
              "evaluation",
              impact.evaluator,
              category,
              impact.modified,
            ),
            kind: "evaluation",
            category,
            about: impact.evaluator,
            to: subject.id,
            previous: prev.evaluators?.[impact.evaluator] ?? null,
            next: impact.confidence,
            timestamp: impact.modified,
            viewed: false,
          })
        }
      }

      tracked[key] = {
        level: v?.level ?? null,
        score: v?.score ?? null,
        evaluators,
      }
    }
  }

  return { alerts, tracked }
}
