import { Pencil } from "lucide-react"
import { useMemo } from "react"
import { Link } from "react-router"
import { Verifications } from '@/types/aura'
import { Button } from "@/components/ui/button"
import {
  getBgClassNameOfAuraRatingObject,
  getTextClassNameOfAuraRatingObject,
  INBOUND_EVIDENCE_VIEW_MODES,
  viewModeToSubjectViewMode,
  viewModeToViewAs,
} from "@/constants"
import { ratingToText } from "@/constants/chart"
import { useMyEvaluationsContext } from "@/contexts/MyEvaluationsContext"
import { getAuraVerification } from "@/hooks/useParseBrightIdVerificationData"
import { useSubjectName } from "@/hooks/useSubjectName"
import { useImpactPercentage } from "@/hooks/useSubjectVerifications"
import useViewMode from "@/hooks/useViewMode"
import { useProfileStore } from "@/store/profile.store"
import { EvidenceViewMode } from "@/types/dashboard"
import { connectionLevelIcons } from "@/utils/connection"
import Tooltip from "../Tooltip"

const ConnectionInfo = ({
  subjectId,
  evidenceViewMode,
  connection,
}: {
  subjectId: string
  connection?: { verifications: Verifications }
  evidenceViewMode: EvidenceViewMode
}) => {
  const { currentViewMode, currentEvaluationCategory } = useViewMode()
  const evaluationCategory = useMemo(
    () =>
      INBOUND_EVIDENCE_VIEW_MODES.includes(evidenceViewMode)
        ? currentEvaluationCategory
        : viewModeToViewAs[viewModeToSubjectViewMode[currentViewMode]],
    [currentEvaluationCategory, currentViewMode, evidenceViewMode],
  )
  const {
    myRatingToSubject: rating,
    loading,
    myConnectionToSubject: inboundConnectionInfo,
  } = useMyEvaluationsContext({
    subjectId,
    evaluationCategory,
  })

  const verification = useMemo(
    () => getAuraVerification(connection?.verifications, evaluationCategory),
    [evaluationCategory, connection],
  )

  const auraImpacts = verification?.impacts

  const authData = useProfileStore((s) => s.authData)
  const impactPercentage = useImpactPercentage(
    auraImpacts ?? [],
    authData?.brightId,
  )

  const name = useSubjectName(subjectId)

  const bgColor = useMemo(() => {
    if (rating && Number(rating?.rating) !== 0) {
      return getBgClassNameOfAuraRatingObject(rating)
    }
    if (inboundConnectionInfo?.level === "just met") {
      return "bg-pl1"
    }
    if (
      inboundConnectionInfo?.level === "recovery" ||
      inboundConnectionInfo?.level === "already known"
    ) {
      return "bg-pl4"
    }
    if (
      inboundConnectionInfo?.level === "suspicious" ||
      inboundConnectionInfo?.level === "reported"
    ) {
      return "bg-nl4"
    }
    return ""
  }, [inboundConnectionInfo?.level, rating])

  if (
    !inboundConnectionInfo ||
    !connectionLevelIcons[inboundConnectionInfo.level] ||
    !rating
  ) {
    return (
      <Tooltip
        content={`Evaluate ${name}`}
        position="right"
        className="mt-auto"
        tooltipClassName="!w-40 !whitespace-normal"
      >
        <Link
          to={`/subject/${subjectId}?viewas=${evaluationCategory}`}
          onClick={(e) => e.stopPropagation()}
        >
          <a-button variant={"outline"} size={"icon"}>
            <Pencil className="h-4 w-4 text-white" />
          </a-button>
        </Link>
      </Tooltip>
    )
  }
  return (
    <div className="z-10" content={``}>
      <div className={`flex flex-col gap-0.5 ${bgColor} rounded-md py-1.5`}>
        {loading ? (
          "..."
        ) : (
          <>
            <div className="flex items-center justify-center gap-0.5">
              {inboundConnectionInfo &&
                connectionLevelIcons[inboundConnectionInfo.level] && (
                  <Tooltip
                    content={`You connected with "${inboundConnectionInfo?.level}" to ${name}`}
                    position="right"
                    tooltipClassName="!whitespace-normal !w-40"
                  >
                    <img
                      src={`/assets/images/Shared/${
                        connectionLevelIcons[inboundConnectionInfo.level]
                      }.svg`}
                      className="h-[18px] w-[18px]"
                      alt=""
                    />
                  </Tooltip>
                )}
              {!!rating && Number(rating?.rating) !== 0 && (
                <Tooltip
                  position="right"
                  content={`You evaluated ${name} ${
                    Number(rating.rating) > 0
                      ? `+${rating.rating}`
                      : rating.rating
                  } (${ratingToText[rating.rating]})`}
                >
                  <p
                    className={`text-sm font-bold ${getTextClassNameOfAuraRatingObject(
                      rating,
                    )}`}
                  >
                    {Number(rating.rating) < 0 ? "-" : "+"}
                    {Math.abs(Number(rating.rating))}
                  </p>
                </Tooltip>
              )}
            </div>
            {!!rating && Number(rating?.rating) !== 0 && (
              <Tooltip
                position="right"
                content={`Your evaluation impact on ${name} is ${
                  impactPercentage !== null ? `${impactPercentage}%` : "-"
                }`}
              >
                <p
                  className={`impact-percentage ${getTextClassNameOfAuraRatingObject(
                    rating,
                  )} w-full text-center text-[11px] font-bold`}
                >
                  {impactPercentage !== null ? `${impactPercentage}%` : "-"}
                </p>
              </Tooltip>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ConnectionInfo
