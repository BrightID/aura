import {
  selectManagerRoleState,
  selectTrainerRoleState,
  RoleStatus,
} from '@/BrightID/actions';
import DefaultHeader from '@/components/Header/DefaultHeader';
import Tooltip from '@/components/Shared/Tooltip';
import {
  getViewModeBackgroundColorClass,
  preferredViewIcon,
} from '@/constants';
import { SubjectInboundEvaluationsContextProvider } from '@/contexts/SubjectInboundEvaluationsContext';
import {
  SubjectOutboundEvaluationsContextProvider,
  useOutboundEvaluationsContext,
} from '@/contexts/SubjectOutboundEvaluationsContext';
import { useSubjectVerifications } from '@/hooks/useSubjectVerifications';
import useViewMode from '@/hooks/useViewMode';
import { selectAuthData } from '@/store/profile/selectors';
import { PreferredView, EvaluationCategory } from '@/types/dashboard';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const ViewTooltip = ({
  view,
  content,
  condition,
  views,
}: {
  view?: PreferredView;
  content: string;
  condition: boolean;
  views?: PreferredView[];
}) => {
  const { setPreferredView, currentViewMode } = useViewMode();

  if (!condition) return null;

  const activeView = views?.find((v) => v === currentViewMode);

  return (
    <Tooltip
      content={content}
      data-testid={`hometab-${content}`}
      className={`h-6 w-6 rounded p-1 ${
        currentViewMode === view || activeView
          ? getViewModeBackgroundColorClass(currentViewMode)
          : 'bg-gray100'
      } ml-2 cursor-pointer`}
      onClick={() => setPreferredView(view ?? views![0])}
    >
      <img
        className="h-4 w-4"
        src={preferredViewIcon[view ?? views![0]]}
        alt=""
      />
    </Tooltip>
  );
};

function HomeHeaderItems() {
  const { currentViewMode, setPreferredView } = useViewMode();

  const authData = useSelector(selectAuthData);

  const managerRole = useSelector(selectManagerRoleState);

  const trainerRole = useSelector(selectTrainerRoleState);

  const subjectId = authData!.brightId;

  const { itemsFiltered: trainerActivity } = useOutboundEvaluationsContext({
    subjectId,
    evaluationCategory: EvaluationCategory.TRAINER,
  });

  const { itemsFiltered: managerActivity } = useOutboundEvaluationsContext({
    subjectId,
    evaluationCategory: EvaluationCategory.MANAGER,
  });

  const playerEvaluation = useSubjectVerifications(
    subjectId,
    EvaluationCategory.PLAYER,
  );

  const trainerEvaluation = useSubjectVerifications(
    subjectId,
    EvaluationCategory.TRAINER,
  );

  const shouldNavigateToPlayerFromTrainer =
    currentViewMode === PreferredView.TRAINER &&
    !trainerEvaluation.loading &&
    (!playerEvaluation.auraLevel ||
      playerEvaluation.auraLevel < 2 ||
      (trainerRole === RoleStatus.NOT_SET &&
        (!trainerActivity || trainerActivity.length === 0)));

  const shouldNavigateToPlayerFromManager =
    (currentViewMode === PreferredView.MANAGER_EVALUATING_TRAINER ||
      currentViewMode === PreferredView.MANAGER_EVALUATING_MANAGER) &&
    (!trainerEvaluation.auraLevel ||
      trainerEvaluation.auraLevel < 1 ||
      (managerRole === RoleStatus.NOT_SET &&
        (!managerActivity || managerActivity.length === 0)));

  const canShowTrainerTooltip =
    !!playerEvaluation.auraLevel &&
    playerEvaluation.auraLevel >= 2 &&
    (trainerRole === RoleStatus.SHOW ||
      (trainerRole === RoleStatus.NOT_SET &&
        (trainerActivity?.length ?? 0) > 0));

  const canShowManagerTooltip =
    !!trainerEvaluation.auraLevel &&
    trainerEvaluation.auraLevel >= 1 &&
    (managerRole === RoleStatus.SHOW ||
      (managerRole === RoleStatus.NOT_SET &&
        (managerActivity?.length ?? 0) > 0));

  useEffect(() => {
    if (
      shouldNavigateToPlayerFromTrainer ||
      shouldNavigateToPlayerFromManager
    ) {
      setPreferredView(PreferredView.PLAYER);
    }
  }, [
    shouldNavigateToPlayerFromTrainer,
    shouldNavigateToPlayerFromManager,
    setPreferredView,
  ]);

  return (
    <>
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
    </>
  );
}

export const HeaderBody = () => {
  const authData = useSelector(selectAuthData);
  const subjectId = authData?.brightId;

  if (!subjectId) return null;

  return (
    <>
      <SubjectOutboundEvaluationsContextProvider subjectId={subjectId}>
        <SubjectInboundEvaluationsContextProvider subjectId={subjectId}>
          <HomeHeaderItems />
        </SubjectInboundEvaluationsContextProvider>
      </SubjectOutboundEvaluationsContextProvider>
    </>
  );
};

export default function HomeHeader() {
  return (
    <DefaultHeader title="Home">
      <HeaderBody />
    </DefaultHeader>
  );
}
