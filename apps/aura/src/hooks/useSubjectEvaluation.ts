import { useMemo } from "react"
import { getConfidenceValueOfAuraRatingObject } from "@/constants/index"
import { useSubjectOutboundEvaluationsRaw } from "@/hooks/useOutboundEvaluationsContext"
import { useSubjectInboundEvaluations } from "@/hooks/useSubjectInboundEvaluations"
import { EvaluationCategory } from "../types/dashboard"
import useViewMode from "./useViewMode"

export const useSubjectConnectionInfoFromContext = ({
  fromSubjectId,
  toSubjectId,
}: {
  fromSubjectId: string | undefined
  toSubjectId: string
}) => {
  const inboundData = useSubjectInboundEvaluations({ subjectId: toSubjectId })
  const outboundData = useSubjectOutboundEvaluationsRaw(fromSubjectId ?? "")

  const connectionInfo = useMemo(() => {
    const fromInbound = inboundData.connections?.find((conn) => conn.id === fromSubjectId)
    if (fromInbound) return fromInbound
    if (fromSubjectId) {
      return outboundData.connections?.find((conn) => conn.id === toSubjectId) ?? null
    }
    return null
  }, [fromSubjectId, inboundData.connections, outboundData.connections, toSubjectId])

  return {
    connectionInfo,
    loading: inboundData.loading || outboundData.loading,
  }
}

export const useSubjectEvaluationFromContext = ({
  fromSubjectId,
  toSubjectId,
  evaluationCategory,
}: {
  fromSubjectId: string | undefined
  toSubjectId: string
  evaluationCategory: EvaluationCategory
}) => {
  const inboundData = useSubjectInboundEvaluations({ subjectId: toSubjectId, evaluationCategory })
  const outboundData = useSubjectOutboundEvaluationsRaw(fromSubjectId ?? "")

  const { currentEvaluationCategory } = useViewMode()
  const activeCategory = evaluationCategory ?? currentEvaluationCategory

  const rating = useMemo(() => {
    if (!fromSubjectId) return null
    const fromInbound = inboundData.ratings?.find(
      (r) => r.fromBrightId === fromSubjectId && r.category === activeCategory,
    )
    if (fromInbound) return fromInbound
    return outboundData.ratings?.find(
      (r) => r.toBrightId === toSubjectId && r.category === activeCategory,
    ) ?? null
  }, [activeCategory, fromSubjectId, inboundData.ratings, outboundData.ratings, toSubjectId])

  const confidenceValue = useMemo(
    () => getConfidenceValueOfAuraRatingObject(rating),
    [rating],
  )
  const ratingNumber = useMemo(() => rating && Number(rating.rating), [rating])

  return {
    rating,
    loading: inboundData.loading || outboundData.loading,
    ratingNumber,
    confidenceValue,
  }
}
