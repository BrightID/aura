import useFilterAndSort from "hooks/useFilterAndSort"
import {
  AuraFilterId,
  type AuraFilterOptions,
  useOutboundEvaluationFilters,
} from "hooks/useFilters"
import {
  AuraSortId,
  type AuraSortOptions,
  useOutboundEvaluationSorts,
} from "hooks/useSorts"
import { useOutboundEvaluations } from "hooks/useSubjectEvaluations"
import { type ReactNode, useEffect, useMemo, useRef } from "react"
import {
  type AuraOutboundConnectionAndRatingData,
  type BrightIdBackup,
} from "types"
import { create } from "zustand"
import { useProfileStore } from "@/store/profile.store"
import { useRefreshStore } from "@/store/refresh.store"
import { decryptUserData } from "@/utils/crypto"
import useViewMode from "../hooks/useViewMode"
import { type EvaluationCategory } from "../types/dashboard"

type SubjectOutboundEvaluationsData = ReturnType<
  typeof useOutboundEvaluations
> & {
  subjectId: string
} & ReturnType<typeof useFilterAndSort<AuraOutboundConnectionAndRatingData>> & {
    sorts: AuraSortOptions<AuraOutboundConnectionAndRatingData>
    filters: AuraFilterOptions<AuraOutboundConnectionAndRatingData>
  }

type StoreState = {
  data: Map<string, SubjectOutboundEvaluationsData>
  set: (id: string, d: SubjectOutboundEvaluationsData) => void
}

const useStore = create<StoreState>()((set) => ({
  data: new Map(),
  set: (id, d) =>
    set((s) => {
      const data = new Map(s.data)
      data.set(id, d)
      return { data }
    }),
}))

export function SubjectOutboundEvaluationsContextProvider({
  subjectId,
  children,
}: {
  subjectId: string
  children: ReactNode
}) {
  const { refreshOutboundRatings, ...hookData } = useOutboundEvaluations({
    subjectId,
  })
  const { ratings, connections } = hookData

  const filters = useOutboundEvaluationFilters(
    [
      AuraFilterId.EvaluationPositiveEvaluations,
      AuraFilterId.EvaluationNegativeEvaluations,
      AuraFilterId.EvaluationConfidenceLow,
      AuraFilterId.EvaluationConfidenceMedium,
      AuraFilterId.EvaluationConfidenceHigh,
      AuraFilterId.EvaluationConfidenceVeryHigh,
    ],
    subjectId,
  )
  const sorts = useOutboundEvaluationSorts([
    AuraSortId.RecentEvaluation,
    AuraSortId.EvaluationConfidence,
  ])

  const authData = useProfileStore((s) => s.authData)
  const brightIdBackupEncrypted = useProfileStore(
    (s) => s.brightIdBackupEncrypted,
  )
  const brightIdBackup = useMemo(
    () =>
      brightIdBackupEncrypted && authData?.password
        ? (decryptUserData(
            brightIdBackupEncrypted,
            authData.password,
          ) as BrightIdBackup)
        : null,
    [brightIdBackupEncrypted, authData?.password],
  )

  const outboundOpinions = useMemo<
    AuraOutboundConnectionAndRatingData[]
  >(() => {
    if (!connections || ratings === null || !brightIdBackup) return []
    const opinions: AuraOutboundConnectionAndRatingData[] = ratings.map(
      (r) => ({
        toSubjectId: r.toBrightId,
        rating: r,
        name: brightIdBackup.connections.find((c) => c.id === r.fromBrightId)
          ?.name,
        outboundConnection: connections.find((c) => c.id === r.fromBrightId),
        verifications: r.verifications,
      }),
    )
    connections.forEach((c) => {
      if (ratings.findIndex((r) => r.toBrightId === c.id) === -1) {
        opinions.push({
          toSubjectId: c.id,
          name: brightIdBackup.connections.find((conn) => conn.id === c.id)
            ?.name,
          outboundConnection: c,
          verifications: c.verifications,
        })
      }
    })
    return opinions.sort(
      (a, b) =>
        (a.rating?.timestamp ?? a.outboundConnection?.timestamp ?? 0) -
        (b.rating?.timestamp ?? b.outboundConnection?.timestamp ?? 0),
    )
  }, [brightIdBackup, ratings, connections])

  const filterAndSortHookData = useFilterAndSort(
    outboundOpinions,
    filters,
    sorts,
    useMemo(() => ["toSubjectId", "name"], []),
    "activityList|" + subjectId,
  )

  const refreshCounter = useRefreshStore((s) => s.refreshCounter)
  useEffect(() => {
    if (refreshCounter > 0) refreshOutboundRatings()
  }, [refreshCounter, refreshOutboundRatings])

  const storeSet = useStore((s) => s.set)
  const data = useMemo(
    () => ({
      refreshOutboundRatings,
      ...hookData,
      ...filterAndSortHookData,
      sorts,
      filters,
      subjectId,
    }),
    [
      refreshOutboundRatings,
      hookData,
      filterAndSortHookData,
      sorts,
      filters,
      subjectId,
    ],
  )
  const didInit = useRef(false)
  if (!didInit.current) {
    didInit.current = true
    useStore.setState((s) => {
      const m = new Map(s.data)
      m.set(subjectId, data)
      return { data: m }
    })
  }
  useEffect(() => {
    storeSet(subjectId, data)
  }, [storeSet, subjectId, data])

  return <>{children}</>
}

export function useOutboundEvaluationsContextSafe(subjectId: string) {
  return useStore((s) => s.data.get(subjectId) ?? null)
}

export function useOutboundEvaluationsContext(props: {
  subjectId: string
  evaluationCategory?: EvaluationCategory
}) {
  const data = useStore((s) => s.data.get(props.subjectId))
  if (!data)
    throw new Error(
      `SubjectOutboundEvaluationsContextProvider for ${props.subjectId} not mounted`,
    )

  const { currentEvaluationCategory } = useViewMode()

  const ratings = useMemo(
    () =>
      data.ratings?.filter(
        (r) =>
          r.category ===
          (props.evaluationCategory ?? currentEvaluationCategory),
      ) ?? null,
    [data.ratings, currentEvaluationCategory, props.evaluationCategory],
  )

  const [itemsFiltered, itemsOriginal] = useMemo(
    () =>
      [data.itemsFiltered, data.itemsOriginal].map(
        (items) =>
          items?.filter(
            (o) =>
              o.rating === undefined ||
              o.rating.category ===
                (props.evaluationCategory ?? currentEvaluationCategory),
          ) ?? null,
      ),
    [
      data.itemsFiltered,
      data.itemsOriginal,
      currentEvaluationCategory,
      props.evaluationCategory,
    ],
  )

  return { ...data, itemsFiltered, itemsOriginal, ratings }
}
