import { useEffect } from "react"
import DefaultHeader from "@/components/Header/DefaultHeader"
import Tooltip from "@/components/Shared/Tooltip"
import { getViewModeBackgroundColorClass, preferredViewIcon } from "@/constants"
import { SubjectInboundEvaluationsContextProvider } from "@/contexts/SubjectInboundEvaluationsContext"
import {
  SubjectOutboundEvaluationsContextProvider,
  useOutboundEvaluationsContext,
} from "@/contexts/SubjectOutboundEvaluationsContext"
import { useSubjectVerifications } from "@/hooks/useSubjectVerifications"
import useViewMode from "@/hooks/useViewMode"
import { useProfileStore } from "@/store/profile.store"
import { RoleStatus, useSettingsStore } from "@/store/settings.store"
import { EvaluationCategory, PreferredView } from "@/types/dashboard"

const ViewTooltip = ({
  view,
  content,
  condition,
  views,
}: {
  view?: PreferredView
  content: string
  condition: boolean
  views?: PreferredView[]
}) => {
  const { setPreferredView, currentViewMode } = useViewMode()

  if (!condition) return null

  const activeView = views?.find((v) => v === currentViewMode)

  return (
    <Tooltip
      content={content}
      data-testid={`hometab-${content}`}
      onClick={() => setPreferredView(view ?? views![0])}
    >
      <a-button
        variant="secondary"
        className={`rounded-lg ${
          currentViewMode === view || activeView
            ? getViewModeBackgroundColorClass(currentViewMode)
            : "bg-gray100"
        } cursor-pointer `}
        size="icon"
      >
        <img
          className="h-4 w-4"
          src={preferredViewIcon[view ?? views![0]]}
          alt=""
        />
      </a-button>
    </Tooltip>
  )
}

function HomeHeaderItems() {
  const { currentViewMode, setPreferredView } = useViewMode()

  const authData = useProfileStore((s) => s.authData)

  const managerRole = useSettingsStore((s) => s.hasManagerRole)

  const trainerRole = useSettingsStore((s) => s.hasTrainerRole)

  const subjectId = authData!.brightId

  const { itemsFiltered: trainerActivity } = useOutboundEvaluationsContext({
    subjectId,
    evaluationCategory: EvaluationCategory.TRAINER,
  })

  const { itemsFiltered: managerActivity } = useOutboundEvaluationsContext({
    subjectId,
    evaluationCategory: EvaluationCategory.MANAGER,
  })

  const playerEvaluation = useSubjectVerifications(
    subjectId,
    EvaluationCategory.PLAYER,
  )

  const trainerEvaluation = useSubjectVerifications(
    subjectId,
    EvaluationCategory.TRAINER,
  )

  const shouldNavigateToPlayerFromTrainer =
    currentViewMode === PreferredView.TRAINER &&
    !trainerEvaluation.loading &&
    (!playerEvaluation.auraLevel ||
      playerEvaluation.auraLevel < 2 ||
      (trainerRole === RoleStatus.NOT_SET &&
        (!trainerActivity || trainerActivity.length === 0)))

  const shouldNavigateToPlayerFromManager =
    (currentViewMode === PreferredView.MANAGER_EVALUATING_TRAINER ||
      currentViewMode === PreferredView.MANAGER_EVALUATING_MANAGER) &&
    (!trainerEvaluation.auraLevel ||
      trainerEvaluation.auraLevel < 1 ||
      (managerRole === RoleStatus.NOT_SET &&
        (!managerActivity || managerActivity.length === 0)))

  const canShowTrainerTooltip =
    !!playerEvaluation.auraLevel &&
    playerEvaluation.auraLevel >= 2 &&
    (trainerRole === RoleStatus.SHOW ||
      (trainerRole === RoleStatus.NOT_SET &&
        (trainerActivity?.length ?? 0) > 0))

  const canShowManagerTooltip =
    !!trainerEvaluation.auraLevel &&
    trainerEvaluation.auraLevel >= 1 &&
    (managerRole === RoleStatus.SHOW ||
      (managerRole === RoleStatus.NOT_SET &&
        (managerActivity?.length ?? 0) > 0))

  useEffect(() => {
    if (
      shouldNavigateToPlayerFromTrainer ||
      shouldNavigateToPlayerFromManager
    ) {
      setPreferredView(PreferredView.PLAYER)
    }
  }, [
    shouldNavigateToPlayerFromTrainer,
    shouldNavigateToPlayerFromManager,
    setPreferredView,
  ])

  return (
    <div className="flex ml-2 items-center gap-2">
      <ViewTooltip
        view={PreferredView.PLAYER}
        content="Player"
        condition={true}
      />
      <ViewTooltip
        view={PreferredView.TRAINER}
        content="Trainer"
        condition={canShowTrainerTooltip}
      />
      <ViewTooltip
        views={[
          PreferredView.MANAGER_EVALUATING_TRAINER,
          PreferredView.MANAGER_EVALUATING_MANAGER,
        ]}
        content="Manager"
        condition={canShowManagerTooltip}
      />
    </div>
  )
}

export const HeaderBody = () => {
  const authData = useProfileStore((s) => s.authData)
  const subjectId = authData?.brightId

  if (!subjectId) return null

  return (
    <>
      <SubjectOutboundEvaluationsContextProvider subjectId={subjectId}>
        <SubjectInboundEvaluationsContextProvider subjectId={subjectId}>
          <HomeHeaderItems />
        </SubjectInboundEvaluationsContextProvider>
      </SubjectOutboundEvaluationsContextProvider>
    </>
  )
}

export default function HomeHeader() {
  return (
    <DefaultHeader title="Home">
      <HeaderBody />
    </DefaultHeader>
  )
}
