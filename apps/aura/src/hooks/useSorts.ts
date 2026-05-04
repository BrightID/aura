import { SortCategoryId } from "hooks/useFilterAndSort"
import { getAuraVerification } from "hooks/useParseBrightIdVerificationData"
import { useMemo } from "react"
import {
  AuraInboundConnectionAndRatingData,
  AuraNodeBrightIdConnectionWithBackupData,
  AuraOutboundConnectionAndRatingData,
  BrightIdConnection,
} from "types"

import { viewAsToEvaluatorViewAs } from "../constants"
import useBrightIdBackupWithAuraConnectionData from "./useBrightIdBackupWithAuraConnectionData"
import { useOutboundEvaluations } from "./useSubjectEvaluations"
import useViewMode from "./useViewMode"

export enum AuraSortId {
  RecentEvaluation = 1,
  ConnectionLastUpdated,
  // MostMutualConnections,
  ConnectionScore,
  ConnectionRecentEvaluation,
  // ConnectionMostEvaluations,
  EvaluatorScore,
  EvaluationConfidence,
}

export type AuraSortOption<T> = {
  id: AuraSortId
  title: string
  defaultAscending: boolean
  justDefaultDirection?: boolean
  ascendingLabel?: string
  descendingLabel?: string
  category: SortCategoryId
  func: (a: T, b: T) => number
}

export type AuraSortOptions<T> = AuraSortOption<T>[]

export type AuraSelectedSort<T> = AuraSortOption<T> & {
  isReversed: boolean
}

//TODO: use a generic type to merge this with useCategorizeAuraFilterOptions
export function useCategorizeAuraSortOptions<T>(sorts: AuraSortOptions<T>) {
  return useMemo(() => {
    const result: {
      [category in SortCategoryId]?: AuraSortOptions<T>
    } = {}

    for (const item of sorts) {
      if (result[item.category]) {
        // ? is added to fix build problem
        result[item.category]?.push(item)
      } else {
        result[item.category] = [item]
      }
    }

    return result
  }, [sorts])
}

export function useSubjectSorts(sortIds: AuraSortId[]) {
  const brightIdBackup = useBrightIdBackupWithAuraConnectionData()
  const { currentEvaluationCategory } = useViewMode()
  const { ratings: outboundRatings } = useOutboundEvaluations({
    subjectId: brightIdBackup?.userData.id,
    evaluationCategory: currentEvaluationCategory,
  })

  return useMemo(() => {
    const sorts: AuraSortOptions<AuraNodeBrightIdConnectionWithBackupData> = [
      {
        id: AuraSortId.ConnectionLastUpdated,
        title: "Last Connected",
        defaultAscending: false,
        category: SortCategoryId.Default,
        ascendingLabel: "Oldest",
        descendingLabel: "Newest",
        func: (a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0),
      },
      // {
      //   id: AuraSortId.ConnectionMostEvaluations,
      //   title: 'Most Evaluations (Not Implemented)',
      //   defaultAscending: true,
      //   category: SortCategoryId.Default,
      //   func: (_a, _b) => 1,
      // },
      {
        id: AuraSortId.ConnectionScore,
        title: "Score",
        defaultAscending: true,
        category: SortCategoryId.Default,
        func: (a, b) =>
          (getAuraVerification(b.verifications, currentEvaluationCategory)
            ?.score ?? 0) -
          (getAuraVerification(a.verifications, currentEvaluationCategory)
            ?.score ?? 0),
      },
      {
        id: AuraSortId.ConnectionRecentEvaluation,
        title: "Recently Evaluated",
        defaultAscending: false,
        category: SortCategoryId.Default,
        ascendingLabel: "Oldest",
        descendingLabel: "Newest",
        func: (a, b) =>
          (outboundRatings?.find((r) => r.toBrightId === b.id)?.timestamp ??
            0) -
          (outboundRatings?.find((r) => r.toBrightId === a.id)?.timestamp ?? 0),
      },
      {
        id: AuraSortId.EvaluationConfidence,
        title: "Confidence",
        defaultAscending: false,
        category: SortCategoryId.Default,
        ascendingLabel: "Ascending",
        descendingLabel: "Descending",
        func: (a, b) => {
          const firstRating = outboundRatings?.find(
            (r) => r.toBrightId === a.id,
          )?.rating

          const secondRating = outboundRatings?.find(
            (r) => r.toBrightId === b.id,
          )?.rating

          if (
            (!firstRating && !secondRating) ||
            (!Number(firstRating) && !Number(secondRating))
          )
            return 0
          if (!firstRating || !Number(firstRating)) return -1
          if (!secondRating || !Number(secondRating)) return 1

          return Number(firstRating) - Number(secondRating)
        },
      },
      // {
      //   id: AuraSortId.MostMutualConnections,
      //   title: 'Most Mutual Connections (Not Implemented)',
      //   defaultAscending: true,
      //   category: SortCategoryId.Default,
      //   func: (_a, _b) => 1,
      // },
    ]
    return sortIds
      .map((id) => sorts.find((f) => f.id === id))
      .filter(
        (item) => item !== undefined,
      ) as AuraSortOptions<BrightIdConnection>
  }, [currentEvaluationCategory, outboundRatings, sortIds])
}

export function useInboundEvaluationsSorts(sortIds: AuraSortId[]) {
  return useMemo(() => {
    const sorts: AuraSortOptions<AuraInboundConnectionAndRatingData> = [
      {
        id: AuraSortId.RecentEvaluation,
        title: "Last evaluated",
        defaultAscending: false,
        justDefaultDirection: true,
        descendingLabel: "Most Recent",
        category: SortCategoryId.Default,
        func: (a, b) =>
          new Date(b.rating?.updatedAt ?? 0).getTime() -
          new Date(a.rating?.updatedAt ?? 0).getTime(),
      },
      {
        id: AuraSortId.EvaluationConfidence,
        title: "Confidence",
        defaultAscending: false,
        category: SortCategoryId.Default,
        func: (a, b) => {
          return (
            Math.abs(Number(b.rating?.rating || "0")) -
            Math.abs(Number(a.rating?.rating || "0"))
          )
        },
      },
      {
        id: AuraSortId.EvaluatorScore,
        title: "Evaluator's score",
        category: SortCategoryId.Default,
        defaultAscending: true,
        func: (a, b) =>
          ((a.inboundConnection &&
            a.rating &&
            getAuraVerification(
              a.inboundConnection.verifications,
              viewAsToEvaluatorViewAs[a.rating.category],
            )?.score) ||
            0) -
          ((b.inboundConnection &&
            b.rating &&
            getAuraVerification(
              b.inboundConnection.verifications,
              viewAsToEvaluatorViewAs[b.rating.category],
            )?.score) ||
            0),
      },
    ]
    return sortIds
      .map((id) => sorts.find((f) => f.id === id))
      .filter(
        (item) => item !== undefined,
      ) as AuraSortOptions<AuraInboundConnectionAndRatingData>
  }, [sortIds])
}

export function useInboundConnectionsSorts(sortIds: AuraSortId[]) {
  return useMemo(() => {
    const sorts: AuraSortOptions<AuraInboundConnectionAndRatingData> = [
      {
        id: AuraSortId.ConnectionLastUpdated,
        title: "Last Connected",
        defaultAscending: false,
        category: SortCategoryId.Default,
        ascendingLabel: "Oldest",
        descendingLabel: "Newest",
        func: (a, b) =>
          (b.inboundConnection?.timestamp ?? 0) -
          (a.inboundConnection?.timestamp ?? 0),
      },
    ]
    return sortIds
      .map((id) => sorts.find((f) => f.id === id))
      .filter(
        (item) => item !== undefined,
      ) as AuraSortOptions<AuraInboundConnectionAndRatingData>
  }, [sortIds])
}

export function useOutboundEvaluationSorts(sortIds: AuraSortId[]) {
  return useMemo(() => {
    const sorts: AuraSortOptions<AuraOutboundConnectionAndRatingData> = [
      {
        id: AuraSortId.RecentEvaluation,
        title: "Last evaluated",
        defaultAscending: false,
        justDefaultDirection: true,
        descendingLabel: "Most Recent",
        category: SortCategoryId.Default,
        func: (a, b) =>
          new Date(b.rating?.updatedAt ?? 0).getTime() -
          new Date(a.rating?.updatedAt ?? 0).getTime(),
      },
      {
        id: AuraSortId.EvaluationConfidence,
        title: "Confidence",
        defaultAscending: false,
        category: SortCategoryId.Default,
        func: (a, b) => {
          return (
            Math.abs(Number(b.rating?.rating || "0")) -
            Math.abs(Number(a.rating?.rating || "0"))
          )
        },
      },
      {
        id: AuraSortId.EvaluatorScore,
        title: "Player Score (Not Implemented)",
        category: SortCategoryId.Default,
        defaultAscending: true,
        func: (_a, _b) => 1,
      },
    ]
    return sortIds
      .map((id) => sorts.find((f) => f.id === id))
      .filter(
        (item) => item !== undefined,
      ) as AuraSortOptions<AuraOutboundConnectionAndRatingData>
  }, [sortIds])
}
