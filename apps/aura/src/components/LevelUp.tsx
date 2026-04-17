import { useMemo, useState } from "react"
import EvaluationsDetailsPerformance from "@/app/routes/_app.home/components/EvaluationsDetailsPerformance"
import { useSubjectInboundEvaluationsContext } from "../contexts/SubjectInboundEvaluationsContext"
import useViewMode from "../hooks/useViewMode"
import { useProfileStore } from "@/store/profile.store"
import { PreferredView } from "../types/dashboard"
import FindTrainersCard from "./Shared/FindTrainersCard"

export default function LevelUp({ subjectId }: { subjectId: string }) {
  const authData = useProfileStore((s) => s.authData)

  const { currentViewMode, currentRoleEvaluatorEvaluationCategory } =
    useViewMode()

  const {
    itemsOriginal: evaluationsOriginal,
    loading: loadingInboundEvaluations,
  } = useSubjectInboundEvaluationsContext({
    subjectId,
    evaluationCategory: currentRoleEvaluatorEvaluationCategory,
  })

  const [forceShowFindTrainers, setForceShowFindTrainers] = useState(false)
  const showFindTrainers = useMemo(
    () =>
      forceShowFindTrainers ||
      (currentViewMode === PreferredView.PLAYER &&
        !loadingInboundEvaluations &&
        !evaluationsOriginal?.filter((e) => Number(e.rating?.rating)).length),
    [
      currentViewMode,
      evaluationsOriginal,
      forceShowFindTrainers,
      loadingInboundEvaluations,
    ],
  )

  if (!authData) {
    return <div>Not logged in</div>
  }

  return (
    <div className="flex mt-4 flex-col gap-4">
      {/*<ActivitiesCard />*/}
      {showFindTrainers ? (
        <FindTrainersCard subjectId={subjectId} />
      ) : (
        <EvaluationsDetailsPerformance
          subjectId={subjectId}
          title={`Evaluation by ${
            currentRoleEvaluatorEvaluationCategory.slice(0, 1).toUpperCase() +
            currentRoleEvaluatorEvaluationCategory.slice(1)
          }`}
          hasHeader={true}
          hasBtn={true}
          onFindEvaluatorsButtonClick={() => setForceShowFindTrainers(true)}
        />
      )}
    </div>
  )
}
