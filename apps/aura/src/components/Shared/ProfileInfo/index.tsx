import { useMyEvaluationsContext } from "contexts/MyEvaluationsContext"
import { useSubjectInboundConnectionsContext } from "contexts/SubjectInboundConnectionsContext"
import { useSubjectInboundEvaluationsContextSafe } from "contexts/SubjectInboundEvaluationsContext"
import { useOutboundEvaluationsContext } from "contexts/SubjectOutboundEvaluationsContext"
import { AuraFilterId } from "hooks/useFilters"
import { AuraSortId } from "hooks/useSorts"
import { useSubjectName } from "hooks/useSubjectName"
import { useSubjectVerifications } from "hooks/useSubjectVerifications"
import useViewMode from "hooks/useViewMode"
import moment from "moment"
import { FC, useMemo } from "react"
import { EvaluationCategory, ProfileTab } from "types/dashboard"
import NewEvaluationCard from "@/app/routes/_app.subject.$id/components/new-evaluation-card"
import GravatarProfilePicture from "@/components/GravatarPoriflePicture"
import { getViewModeSubjectBorderColorClass } from "@/constants/index"
import { useProfileStore } from "@/store/profile.store"
import { connectionLevelIcons } from "@/utils/connection"
import { compactFormat } from "@/utils/number"
import { calculateUserScorePercentage } from "@/utils/score"
import BrightIdProfilePicture from "../../BrightIdProfilePicture"
import { YourEvaluationInfo } from "../EvaluationInfo/YourEvaluationInfo"
import { HorizontalProgressBar } from "../HorizontalProgressBar"

export interface ProfileInfoProps {
  injectedProfileImage?: string
  isPerformance?: boolean
  subjectId: string
  setShowEvaluationFlow: (value: boolean) => void
  setSelectedTab?: (value: ProfileTab) => void
  injectedProfileName?: string | null
}

export const ProfileInfo: FC<ProfileInfoProps> = ({
  isPerformance = false,
  subjectId,
  setShowEvaluationFlow,
  setSelectedTab,
  injectedProfileImage,
  injectedProfileName,
}) => {
  const { currentViewMode, currentEvaluationCategory, updateViewAs } =
    useViewMode()
  const authData = useProfileStore((s) => s.authData)

  const { userHasRecovery, auraLevel, auraScore } = useSubjectVerifications(
    subjectId,
    currentEvaluationCategory,
  )

  const name = useSubjectName(subjectId)
  const inboundEvaluationsData =
    useSubjectInboundEvaluationsContextSafe(subjectId)
  const { myConnectionToSubject, myRatingNumberToSubject, loading } =
    useMyEvaluationsContext({
      subjectId,
      evaluationCategory: currentEvaluationCategory,
    })

  const { toggleFiltersById, setSelectedSort } =
    useSubjectInboundConnectionsContext({
      subjectId,
      evaluationCategory: currentEvaluationCategory,
    })

  const { connections: outboundConnections, ratings: outboundRatings } =
    useOutboundEvaluationsContext({ subjectId })

  const lastActivity = useMemo(() => {
    if (outboundConnections && outboundRatings !== null) {
      let timestamp = 0
      outboundConnections.forEach(
        (c) => (timestamp = Math.max(timestamp, c.timestamp)),
      )
      outboundRatings.forEach(
        (r) =>
          (timestamp = Math.max(timestamp, new Date(r.updatedAt).getTime())),
      )
      return timestamp ? moment(timestamp).fromNow() : "-"
    }
    return "..."
  }, [outboundConnections, outboundRatings])

  const progress = calculateUserScorePercentage(
    currentEvaluationCategory,
    auraScore ?? 0,
  )

  const isVisitingYourPage = authData?.brightId === subjectId

  return (
    <a-card className="flex flex-col p-4 gap-3">
      <div className="card--header flex w-full items-center justify-between">
        <div className="card--header__left flex gap-4">
          {injectedProfileImage ? (
            <GravatarProfilePicture
              key={injectedProfileImage}
              image={injectedProfileImage}
              className={`card--header__left__avatar rounded-full border-[3px] ${getViewModeSubjectBorderColorClass(
                currentViewMode,
              )} h-[51px] w-[51px]`}
            />
          ) : (
            <BrightIdProfilePicture
              key={subjectId}
              className={`card--header__left__avatar rounded-full border-[3px] ${getViewModeSubjectBorderColorClass(
                currentViewMode,
              )} h-[51px] w-[51px]`}
              subjectId={subjectId}
            />
          )}
          <div className="card--header__left__info flex flex-col justify-center">
            <h3 className="truncate text-lg font-medium leading-5">
              {injectedProfileName ? (
                <span>
                  {injectedProfileName} <small>({name})</small>
                </span>
              ) : (
                name
              )}
            </h3>
            <div className="flex gap-1">
              <span className="text-sm">
                Level: <strong>{auraLevel}</strong>
              </span>{" "}
              {myConnectionToSubject && (
                <img
                  src={`/assets/images/Shared/${
                    connectionLevelIcons[myConnectionToSubject.level]
                  }.svg`}
                  alt=""
                  className="ml-2 w-5"
                />
              )}
            </div>
            <div className="text-sm">
              Score: <strong>{compactFormat(auraScore ?? 0)}</strong>
            </div>
          </div>
        </div>

        <div className="flex min-w-[90px] flex-col items-end gap-1.5 text-sm text-black dark:text-white">
          {userHasRecovery !== null && (
            <a-badge
              variant={userHasRecovery ? "accent" : "secondary"}
              size="sm"
              onClick={() => {
                if (userHasRecovery) {
                  updateViewAs(EvaluationCategory.SUBJECT)
                  setSelectedTab?.(ProfileTab.CONNECTIONS)
                  toggleFiltersById([AuraFilterId.TheirRecovery], true)
                  setSelectedSort(AuraSortId.ConnectionLastUpdated)
                }
              }}
              className="px-2 py-0.5"
              style={
                userHasRecovery
                  ? {
                      background: "var(--aura-warning)",
                      borderColor: "var(--aura-warning)",
                      color: "white",
                      cursor:
                        userHasRecovery &&
                        !isPerformance &&
                        inboundEvaluationsData
                          ? "pointer"
                          : "default",
                    }
                  : undefined
              }
            >
              {userHasRecovery ? "Has Recovery" : "No Recovery"}
            </a-badge>
          )}
          <p className="truncate text-sm font-light">
            Last Activity: <span className="font-medium">{lastActivity}</span>
          </p>
        </div>
      </div>
      {progress < 0 ? (
        "😈"
      ) : (
        <HorizontalProgressBar className="w-full" percentage={progress} />
      )}
      {isVisitingYourPage ||
        (!loading && !myRatingNumberToSubject ? (
          <NewEvaluationCard
            subjectId={subjectId}
            setShowEvaluationFlow={setShowEvaluationFlow}
          />
        ) : (
          <YourEvaluationInfo
            toSubjectId={subjectId}
            setShowEvaluationFlow={setShowEvaluationFlow}
            evaluationCategory={currentEvaluationCategory}
          />
        ))}
    </a-card>
  )
}

export default ProfileInfo
