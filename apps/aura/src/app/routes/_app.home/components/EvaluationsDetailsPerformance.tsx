import { useState } from "react"
import CredibilityDetailsModal from "@/components/Shared/CredibilityDetailsModal"
import ProfileOverview from "@/components/Shared/ProfileOverview"
import { viewModeToEvaluatorViewMode } from "@/constants"
import useViewMode from "@/hooks/useViewMode"
import { CredibilityDetailsProps } from "@/types"

const EvaluationsDetailsPerformance = ({
  subjectId,
  title = "",
  hasHeader = false,
  hasBtn = false,
  onFindEvaluatorsButtonClick,
}: {
  subjectId: string
  hasHeader?: boolean
  hasBtn?: boolean
  title?: string
  onFindEvaluatorsButtonClick?: () => void
}) => {
  const { currentViewMode } = useViewMode()
  const [credibilityDetailsProps, setCredibilityDetailsProps] =
    useState<CredibilityDetailsProps | null>(null)
  return (
    <>
      <ProfileOverview
        subjectId={subjectId}
        isMyPerformance={true}
        setCredibilityDetailsProps={setCredibilityDetailsProps}
        viewMode={viewModeToEvaluatorViewMode[currentViewMode]}
        onFindEvaluatorsButtonClick={onFindEvaluatorsButtonClick}
      />
      {credibilityDetailsProps && (
        <CredibilityDetailsModal
          onClose={() => setCredibilityDetailsProps(null)}
          credibilityDetailsProps={credibilityDetailsProps}
        />
      )}
    </>
  )
}

export default EvaluationsDetailsPerformance
