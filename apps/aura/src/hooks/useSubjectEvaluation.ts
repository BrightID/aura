import { useMemo } from "react"
import { getConfidenceValueOfAuraRatingObject } from "@/constants/index"
import { useOutboundEvaluationsContextSafe } from "@/hooks/useOutboundEvaluationsContext"
import { useSubjectInboundEvaluationsContextSafe } from "@/hooks/useSubjectInboundEvaluationsContext"

import { EvaluationCategory } from "../types/dashboard"
import useViewMode from "./useViewMode"

export const useSubjectConnectionInfoFromContext = ({
  fromSubjectId,
  toSubjectId,
}: {
  fromSubjectId: string | undefined
  toSubjectId: string
}) => {
  const inboundData = useSubjectInboundEvaluationsContextSafe(toSubjectId)
  const outboundData = useOutboundEvaluationsContextSafe(fromSubjectId ?? "")

  const connectionInfo = useMemo(() => {
    if (inboundData) {
      const ratingObject = inboundData.connections?.find(
        (conn) => conn.id === fromSubjectId,
      )
      if (ratingObject) return ratingObject
    }
    if (outboundData && fromSubjectId) {
      const ratingObject = outboundData.connections?.find(
        (conn) => conn.id === toSubjectId,
      )
      if (ratingObject) return ratingObject
    }
    return null
  }, [fromSubjectId, inboundData, outboundData, toSubjectId])

  return {
    connectionInfo,
    loading:
      (inboundData?.loading ?? false) || (outboundData?.loading ?? false),
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
  const inboundData = useSubjectInboundEvaluationsContextSafe(toSubjectId)
  const outboundData = useOutboundEvaluationsContextSafe(fromSubjectId ?? "")

  const { currentEvaluationCategory } = useViewMode()

  const rating = useMemo(() => {
    if (!fromSubjectId) return null
    if (inboundData) {
      const ratingObject = inboundData.ratings?.find(
        (r) =>
          r.fromBrightId === fromSubjectId &&
          r.category === (evaluationCategory ?? currentEvaluationCategory),
      )
      if (ratingObject) return ratingObject
    }
    if (outboundData && fromSubjectId) {
      const ratingObject = outboundData.ratings?.find(
        (r) =>
          r.toBrightId === toSubjectId &&
          r.category === (evaluationCategory ?? currentEvaluationCategory),
      )
      if (ratingObject) return ratingObject
    }
    return null
  }, [
    currentEvaluationCategory,
    evaluationCategory,
    fromSubjectId,
    inboundData,
    outboundData,
    toSubjectId,
  ])

  if (!inboundData && !outboundData) {
    throw new Error("proper EvaluationsContext not provided")
  }

  const confidenceValue = useMemo(
    () => getConfidenceValueOfAuraRatingObject(rating),
    [rating],
  )

  const ratingNumber = useMemo(() => rating && Number(rating?.rating), [rating])

  return {
    rating,
    loading:
      (inboundData?.loading ?? false) || (outboundData?.loading ?? false),
    ratingNumber,
    confidenceValue,
  }
}
