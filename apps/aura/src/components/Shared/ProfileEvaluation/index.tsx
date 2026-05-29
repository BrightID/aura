import { useSubjectEvaluationFromContext } from "hooks/useSubjectEvaluation"
import useViewMode from "hooks/useViewMode"
import { memo } from "react"
import { EvidenceViewMode } from "types/dashboard"
import {
  INBOUND_EVIDENCE_VIEW_MODES,
  viewModeToSubjectViewMode,
  viewModeToViewAs,
} from "@/constants/index"
import { Verifications } from "@/types/aura"
import ConnectedCardBody from "./connected-card-body"
import EvaluatedCardBody from "./evaluated-card-body"

const ProfileEvaluation = ({
  fromSubjectId,
  toSubjectId,
  onClick,
  evidenceViewMode,
  connection,
}: {
  fromSubjectId: string
  toSubjectId: string
  onClick: () => void
  evidenceViewMode: EvidenceViewMode
  connection?: { verifications: Verifications }
}) => {
  const { currentViewMode, currentEvaluationCategory } = useViewMode()
  const { loading, ratingNumber } = useSubjectEvaluationFromContext({
    fromSubjectId,
    toSubjectId,
    evaluationCategory:
      INBOUND_EVIDENCE_VIEW_MODES.includes(evidenceViewMode) ||
      evidenceViewMode === EvidenceViewMode.OUTBOUND_ACTIVITY_ON_MANAGERS
        ? currentEvaluationCategory
        : viewModeToViewAs[viewModeToSubjectViewMode[currentViewMode]],
  })

  return (
    <a-card
      onClick={onClick}
      className={`flex flex-1 justify-center rounded-md px-4.5 py-4 gap-0.5 cursor-pointer pb-3 pl-2 pr-3.5 pt-2.75`}
    >
      {loading ? (
        "Loading..."
      ) : ratingNumber &&
        evidenceViewMode !== EvidenceViewMode.INBOUND_CONNECTION ? (
        <EvaluatedCardBody
          connection={connection}
          evidenceViewMode={evidenceViewMode}
          fromSubjectId={fromSubjectId}
          toSubjectId={toSubjectId}
        />
      ) : (
        <ConnectedCardBody
          evidenceViewMode={evidenceViewMode}
          connection={connection}
          fromSubjectId={fromSubjectId}
          toSubjectId={toSubjectId}
        />
      )}
    </a-card>
  )
}

export default memo(ProfileEvaluation)
