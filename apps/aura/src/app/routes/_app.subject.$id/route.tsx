import CredibilityDetailsModal from "components/CredibilityDetailsModal"
import EvaluateOverlayCard from "components/EvaluationFlow/EvaluateOverlayCard"
import EvaluationFlow from "components/EvaluationFlow/EvaluationFlow"
import InfiniteScrollLocal from "components/InfiniteScrollLocal"
import { EmptyActivitiesList } from "components/Shared/EmptyAndLoadingStates/EmptyActivitiesList"
import { EmptyEvaluationsList } from "components/Shared/EmptyAndLoadingStates/EmptyEvaluationsList"
import { EmptySubjectList } from "components/Shared/EmptyAndLoadingStates/EmptySubjectList"
import { LoadingList } from "components/Shared/EmptyAndLoadingStates/LoadingList"
import Modal from "components/Shared/Modal"
import { ProfileInfo } from "components/Shared/ProfileInfo"
import ProfileOverview from "components/Shared/ProfileOverview"
import {
  SubjectInboundConnectionsContextProvider,
  useSubjectInboundConnectionsContext,
} from "contexts/SubjectInboundConnectionsContext"
import {
  SubjectInboundEvaluationsContextProvider,
  useSubjectInboundEvaluationsContext,
} from "contexts/SubjectInboundEvaluationsContext"
import {
  SubjectOutboundEvaluationsContextProvider,
  useOutboundEvaluationsContext,
} from "contexts/SubjectOutboundEvaluationsContext"
import { useMyEvaluations } from "hooks/useMyEvaluations"
import useViewMode from "hooks/useViewMode"
import { ArrowDownLeft, ArrowDownRight, ArrowUpRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { useProfileStore } from "@/store/profile.store"
import { CredibilityDetailsProps } from "types"
import {
  EvaluationCategory,
  EvidenceViewMode,
  PreferredView,
  ProfileTab,
} from "types/dashboard"
import { Verifications } from '@/types/aura'
import ProfileEvaluation from "@/components/Shared/ProfileEvaluation"
import { viewModeToSubjectViewMode, viewModeToViewAs } from "@/constants/index"
import { useGetGravatarProfileByHashedEmailQuery } from "@/hooks/queries/profile"
import { ActivityListSearch } from "./components/activity-list-search"
import { ConnectionListSearch } from "./components/connection-list-search"
import EvidenceHelpModal from "./components/evidence-help-modal"
import { EvidenceListSearch } from "./components/evidence-list-search"
import SubjectProfileHeader from "./components/header"

const connectionLevelPriority: {
  [key in ConnectionLevel | "aura only"]: number
} = {
  "already known": 1,
  recovery: 2,
  "just met": 3,
  "aura only": 4,
  suspicious: 5,
  reported: 6,
}

export const SubjectProfileBody = ({ subjectId }: { subjectId: string }) => {
  const [selectedTab, setSelectedTab] = useState(ProfileTab.OVERVIEW)

  const [query] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const tabFromQuery = query.get("tab") as ProfileTab | null
    if (tabFromQuery && Object.values(ProfileTab).includes(tabFromQuery)) {
      setSelectedTab(tabFromQuery)
    }
  }, [query, navigate])

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [showEvaluateOverlayCard, setShowEvaluateOverlayCard] = useState(false)
  const [credibilityDetailsProps, setCredibilityDetailsProps] =
    useState<CredibilityDetailsProps | null>(null)

  const name = useMemo(() => query.get("name"), [query])

  const gravatarHash = query.has("gravatar") ? query.get("gravatar")! : ""
  const profilePhotoFetch = useGetGravatarProfileByHashedEmailQuery(gravatarHash)

  const {
    currentViewMode,
    currentEvaluationCategory,
    currentRoleEvaluatorEvaluationCategory,
  } = useViewMode()

  const {
    itemsFiltered: evaluations,
    loading: loadingInboundEvaluations,
    selectedFilterIds: inboundEvaluationsSelectedFilterId,
    clearSortAndFilter: clearInboundEvaluationsSortAndFilter,
    searchString: evaluationSearchString,
  } = useSubjectInboundEvaluationsContext({
    subjectId,
    evaluationCategory: currentEvaluationCategory,
  })
  const { loading, myConnections } = useMyEvaluations()

  const {
    itemsFiltered: connections,
    loading: loadingInboundConnections,
    selectedFilterIds: inboundConnectionsSelectedFilterId,
    clearSortAndFilter: clearInboundConnectionsSortAndFilter,
    selectedSort,
    selectedFilters,
    searchString,
  } = useSubjectInboundConnectionsContext({
    subjectId,
    evaluationCategory: currentEvaluationCategory,
  })

  const {
    itemsFiltered: outboundEvaluations,
    loading: loadingOutboundEvaluations,
    selectedFilterIds: outboundEvaluationsSelectedFilterId,
    clearSortAndFilter: clearOutboundEvaluationsSortAndFilter,
    searchString: activitySearchString,
  } = useOutboundEvaluationsContext({
    subjectId,
    evaluationCategory:
      selectedTab === ProfileTab.ACTIVITY_ON_MANAGERS
        ? EvaluationCategory.MANAGER
        : viewModeToViewAs[viewModeToSubjectViewMode[currentViewMode]],
  })

  const evaluators = useMemo(() => {
    return evaluations?.filter((e) => e.rating && Number(e.rating.rating)) || []
  }, [evaluations])

  const connectionsList = useMemo(() => {
    if (selectedSort || selectedFilters) return connections || []

    const myConnectionsMap =
      myConnections?.reduce(
        (prev, curr) => {
          prev[curr.id] = true

          return prev
        },

        {} as { [key: string]: boolean },
      ) ?? {}

    return (
      connections?.sort((a, b) => {
        const levelA = a.inboundConnection?.level
        const levelB = b.inboundConnection?.level

        const priorityA =
          (levelA ? connectionLevelPriority[levelA] * 2 : Infinity) +
          (a.inboundConnection?.id && myConnectionsMap[a.inboundConnection.id]
            ? -1
            : 0)

        const priorityB =
          (levelB ? connectionLevelPriority[levelB] * 2 : Infinity) +
          (b.inboundConnection?.id && myConnectionsMap[b.inboundConnection.id]
            ? -1
            : 0)

        if (priorityA === priorityB) {
          const timestampA = a.inboundConnection?.timestamp || 0
          const timestampB = b.inboundConnection?.timestamp || 0

          return timestampB - timestampA
        }

        return priorityA - priorityB
      }) || []
    )
  }, [selectedSort, selectedFilters, connections, myConnections])

  const evaluateds = useMemo(() => {
    return (
      outboundEvaluations?.filter((e) => e.rating && Number(e.rating.rating)) ||
      []
    )
  }, [outboundEvaluations])

  const [showEvaluationFlow, setShowEvaluationFlow] = useState(false)

  useEffect(() => {
    if (currentViewMode === PreferredView.PLAYER) {
      if (
        ![
          ProfileTab.OVERVIEW,
          ProfileTab.EVALUATIONS,
          ProfileTab.CONNECTIONS,
        ].includes(selectedTab)
      ) {
        setSelectedTab(ProfileTab.OVERVIEW)
      }
      return
    }
    if (
      !(
        currentViewMode === PreferredView.MANAGER_EVALUATING_MANAGER &&
        selectedTab === ProfileTab.ACTIVITY_ON_MANAGERS
      ) &&
      ![
        ProfileTab.OVERVIEW,
        ProfileTab.EVALUATIONS,
        ProfileTab.ACTIVITY,
      ].includes(selectedTab)
    ) {
      setSelectedTab(ProfileTab.OVERVIEW)
    }
  }, [currentViewMode, selectedTab])

  return (
    <div className="page flex flex-col gap-y-4 overflow-x-hidden">
      {selectedTab !== ProfileTab.OVERVIEW && showEvaluateOverlayCard && (
        <EvaluateOverlayCard
          className={`absolute left-1/2 top-24 z-20 min-h-[89px] w-full max-w-92.5 -translate-x-1/2 md:w-[calc(100vw-40px)]`}
          subjectId={subjectId}
          setShowEvaluationFlow={setShowEvaluationFlow}
        />
      )}

      <ProfileInfo
        subjectId={subjectId}
        setShowEvaluationFlow={setShowEvaluationFlow}
        setSelectedTab={setSelectedTab}
        injectedProfileImage={profilePhotoFetch.data?.avatar_url}
        injectedProfileName={name}
      />

      <Modal
        title="Help: Understanding the Evidence Section"
        isOpen={isHelpModalOpen}
        closeModalHandler={() => setIsHelpModalOpen(false)}
      >
        <EvidenceHelpModal />
      </Modal>
      <div className="-mb-1 flex items-center gap-2">
        <p className="text-lg font-bold">Evidence</p>
        <img
          onClick={() => setIsHelpModalOpen(true)}
          className="h-5 w-5 cursor-pointer"
          src="/assets/images/SubjectProfile/evidence-info-icon.svg"
          alt=""
        />
      </div>
      {/* <ProfileTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} /> */}
      <a-tabs
        onChange={(e) => {
          console.log(e)
          setSelectedTab((e.target.value as ProfileTab) ?? selectedTab)
        }}
        value={selectedTab}
      >
        <a-tab value={ProfileTab.OVERVIEW}>Overview</a-tab>
        <a-tab
          value={
            currentViewMode === PreferredView.PLAYER
              ? ProfileTab.CONNECTIONS
              : ProfileTab.ACTIVITY
          }
        >
          {currentViewMode === PreferredView.PLAYER ? (
            <>
              <ArrowDownRight className="mr-1 h-4 w-4" />
              Connections
            </>
          ) : (
            <>
              <ArrowDownLeft className="mr-1 h-4 w-4" />
              Activity
            </>
          )}
        </a-tab>
        <a-tab value={ProfileTab.EVALUATIONS}>
          <ArrowUpRight className="mr-1 h-4 w-4" />
          Evaluations
        </a-tab>

        <a-tab-panel slot="panel" value={ProfileTab.OVERVIEW}>
          <ProfileOverview
            subjectId={subjectId}
            showEvidenceList={() => setSelectedTab(ProfileTab.EVALUATIONS)}
            setCredibilityDetailsProps={setCredibilityDetailsProps}
            viewMode={currentViewMode}
          />
        </a-tab-panel>
        <a-tab-panel slot="panel" value={ProfileTab.ACTIVITY}>
          <ActivityListSearch
            subjectId={subjectId}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
          {loadingOutboundEvaluations ? (
            <LoadingList />
          ) : evaluateds.length > 0 ? (
            <InfiniteScrollLocal
              className={"-mb-5 flex h-full w-full flex-col gap-2.5 pb-5"}
              items={evaluateds}
              renderItem={(evaluated) => {
                return (
                  <ProfileEvaluation
                    connection={evaluated as { verifications: Verifications }}
                    evidenceViewMode={
                      selectedTab === ProfileTab.ACTIVITY
                        ? EvidenceViewMode.OUTBOUND_ACTIVITY
                        : EvidenceViewMode.OUTBOUND_ACTIVITY_ON_MANAGERS
                    }
                    onClick={() =>
                      setCredibilityDetailsProps({
                        subjectId: evaluated.toSubjectId,
                        evaluationCategory:
                          selectedTab === ProfileTab.ACTIVITY_ON_MANAGERS
                            ? EvaluationCategory.MANAGER
                            : viewModeToViewAs[
                                viewModeToSubjectViewMode[currentViewMode]
                              ],
                      })
                    }
                    key={evaluated.toSubjectId}
                    fromSubjectId={subjectId}
                    toSubjectId={evaluated.toSubjectId}
                  />
                )
              }}
            />
          ) : (
            <EmptyActivitiesList
              searchString={activitySearchString}
              hasFilter={outboundEvaluationsSelectedFilterId !== null}
              clearSortAndFilter={clearOutboundEvaluationsSortAndFilter}
            />
          )}
        </a-tab-panel>
        <a-tab-panel slot="panel" value={ProfileTab.ACTIVITY_ON_MANAGERS}>
          <ActivityListSearch
            subjectId={subjectId}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
          {loadingOutboundEvaluations ? (
            <LoadingList />
          ) : evaluateds.length > 0 ? (
            <InfiniteScrollLocal
              className={"-mb-5 flex h-full w-full flex-col gap-2.5 pb-5"}
              items={evaluateds}
              renderItem={(evaluated) => {
                return (
                  <ProfileEvaluation
                    connection={evaluated as { verifications: Verifications }}
                    evidenceViewMode={
                      selectedTab === ProfileTab.ACTIVITY
                        ? EvidenceViewMode.OUTBOUND_ACTIVITY
                        : EvidenceViewMode.OUTBOUND_ACTIVITY_ON_MANAGERS
                    }
                    onClick={() =>
                      setCredibilityDetailsProps({
                        subjectId: evaluated.toSubjectId,
                        evaluationCategory:
                          selectedTab === ProfileTab.ACTIVITY_ON_MANAGERS
                            ? EvaluationCategory.MANAGER
                            : viewModeToViewAs[
                                viewModeToSubjectViewMode[currentViewMode]
                              ],
                      })
                    }
                    key={evaluated.toSubjectId}
                    fromSubjectId={subjectId}
                    toSubjectId={evaluated.toSubjectId}
                  />
                )
              }}
            />
          ) : (
            <EmptyActivitiesList
              searchString={activitySearchString}
              hasFilter={outboundEvaluationsSelectedFilterId !== null}
              clearSortAndFilter={clearOutboundEvaluationsSortAndFilter}
            />
          )}
        </a-tab-panel>
        <a-tab-panel slot="panel" value={ProfileTab.EVALUATIONS}>
          <EvidenceListSearch subjectId={subjectId} />
          {loadingInboundEvaluations ? (
            <LoadingList />
          ) : evaluators.length > 0 ? (
            <InfiniteScrollLocal
              className={"-mb-5 flex h-full w-full flex-col gap-2.5 pb-5"}
              items={evaluators}
              renderItem={(evaluator) => {
                return (
                  <ProfileEvaluation
                    connection={evaluator}
                    evidenceViewMode={EvidenceViewMode.INBOUND_EVALUATION}
                    onClick={() =>
                      setCredibilityDetailsProps({
                        subjectId: evaluator.fromSubjectId,
                        evaluationCategory:
                          currentRoleEvaluatorEvaluationCategory,
                      })
                    }
                    key={evaluator.fromSubjectId}
                    fromSubjectId={evaluator.fromSubjectId}
                    toSubjectId={subjectId}
                  />
                )
              }}
            />
          ) : (
            <EmptyEvaluationsList
              searchString={evaluationSearchString}
              hasFilter={inboundEvaluationsSelectedFilterId !== null}
              clearFilter={clearInboundEvaluationsSortAndFilter}
            />
          )}
        </a-tab-panel>
        <a-tab-panel slot="panel" value={ProfileTab.CONNECTIONS}>
          <ConnectionListSearch subjectId={subjectId} />
          {loadingInboundConnections ? (
            <LoadingList />
          ) : connectionsList.length > 0 ? (
            <InfiniteScrollLocal
              className={"-mb-5 flex h-full w-full flex-col gap-2.5 pb-5"}
              items={connectionsList}
              renderItem={(connection) => {
                return (
                  <ProfileEvaluation
                    connection={connection.inboundConnection}
                    evidenceViewMode={EvidenceViewMode.INBOUND_CONNECTION}
                    onClick={() =>
                      setCredibilityDetailsProps({
                        subjectId: connection.fromSubjectId,
                        evaluationCategory: EvaluationCategory.SUBJECT,
                      })
                    }
                    key={connection.fromSubjectId}
                    fromSubjectId={connection.fromSubjectId}
                    toSubjectId={subjectId}
                  />
                )
              }}
            />
          ) : (
            <EmptySubjectList
              searchString={searchString}
              hasFilter={inboundConnectionsSelectedFilterId !== null}
              clearSortAndFilter={clearInboundConnectionsSortAndFilter}
            />
          )}
        </a-tab-panel>
      </a-tabs>

      <EvaluationFlow
        showEvaluationFlow={showEvaluationFlow}
        setShowEvaluationFlow={setShowEvaluationFlow}
        subjectId={subjectId}
      />
      {credibilityDetailsProps && (
        <CredibilityDetailsModal
          onClose={() => setCredibilityDetailsProps(null)}
          credibilityDetailsProps={credibilityDetailsProps}
        />
      )}
    </div>
  )
}
const SubjectProfile = () => {
  const { id } = useParams()
  const authData = useProfileStore((s) => s.authData)
  const subjectId = useMemo(
    () => id ?? authData?.brightId,
    [authData?.brightId, id],
  )

  return !subjectId ? (
    <div>Unknown subject id</div>
  ) : (
    <SubjectOutboundEvaluationsContextProvider subjectId={subjectId}>
      <SubjectInboundEvaluationsContextProvider subjectId={subjectId}>
        <SubjectInboundConnectionsContextProvider subjectId={subjectId}>
          <SubjectProfileHeader />
          <SubjectProfileBody subjectId={subjectId} />
        </SubjectInboundConnectionsContextProvider>
      </SubjectInboundEvaluationsContextProvider>
    </SubjectOutboundEvaluationsContextProvider>
  )
}

export default SubjectProfile
