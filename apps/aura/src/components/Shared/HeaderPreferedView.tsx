import { RoleStatus } from '@/store/settings.store';
import { useOutboundEvaluationsContext } from '@/hooks/useOutboundEvaluationsContext';
import { useSubjectVerifications } from 'hooks/useSubjectVerifications';
import { useEffect, useMemo } from 'react';
import { useProfileStore } from '@/store/profile.store';
import { useSettingsStore } from '@/store/settings.store';

import { useOutboundEvaluations } from '@/hooks/useSubjectEvaluations';

import {
  getViewModeBackgroundColorClass,
  preferredViewIcon,
  subjectViewAsIcon,
  viewModeSubjectBackgroundColorClass,
} from '../../constants';
import useViewMode from '../../hooks/useViewMode';
import { EvaluationCategory, PreferredView } from '../../types/dashboard';
import Tooltip from './Tooltip';

const views = [
  EvaluationCategory.SUBJECT,
  EvaluationCategory.PLAYER,
  EvaluationCategory.TRAINER,
  EvaluationCategory.MANAGER,
];

const viewsLabel = {
  [EvaluationCategory.MANAGER]: 'Manager',
  [EvaluationCategory.PLAYER]: 'Player',
  [EvaluationCategory.TRAINER]: 'Trainer',
  [EvaluationCategory.SUBJECT]: 'Subject',
};

export const HeaderPreferedView = {
  ProfileHeaderViews: ({ subjectId }: { subjectId: string }) => {
    const { updateViewAs, currentViewMode, currentEvaluationCategory } =
      useViewMode();

    const playerActivity = useOutboundEvaluations({
      subjectId,
      evaluationCategory: EvaluationCategory.PLAYER,
    });

    const trainerActivity = useOutboundEvaluations({
      subjectId,
      evaluationCategory: EvaluationCategory.TRAINER,
    });

    const managerActivity = useOutboundEvaluations({
      subjectId,
      evaluationCategory: EvaluationCategory.MANAGER,
    });

    const authorizedTabs = useMemo(() => {
      const tabs = [EvaluationCategory.SUBJECT];

      if ((playerActivity.ratings?.length ?? 0) > 0)
        tabs.push(EvaluationCategory.PLAYER);

      if ((trainerActivity.ratings?.length ?? 0) > 0)
        tabs.push(EvaluationCategory.TRAINER);

      if ((managerActivity.ratings?.length ?? 0) > 0)
        tabs.push(EvaluationCategory.MANAGER);

      return tabs;
    }, [playerActivity, trainerActivity, managerActivity]);

    const isLoading =
      managerActivity.loading ||
      trainerActivity.loading ||
      playerActivity.loading;

    return (
      <>
        {isLoading
          ? views.map((_, key) => (
              <div
                key={key}
                className={`ml-2 animate-pulse cursor-pointer rounded bg-gray100 p-1`}
              >
                <div className="h-4 w-4"></div>
              </div>
            ))
          : authorizedTabs.map((subjectViewMode) => (
              <Tooltip
                className={`rounded p-1 ${
                  currentEvaluationCategory === subjectViewMode
                    ? viewModeSubjectBackgroundColorClass[currentViewMode]
                    : 'bg-gray100'
                } ml-2 cursor-pointer`}
                position="bottom"
                key={subjectViewMode}
                content={viewsLabel[subjectViewMode]}
                onClick={() => updateViewAs(subjectViewMode)}
              >
                <img
                  className="h-4 w-4"
                  src={subjectViewAsIcon[subjectViewMode]}
                  alt=""
                />
              </Tooltip>
            ))}
      </>
    );
  },
  PreferedView: () => {
    const { currentViewMode, setPreferredView } = useViewMode();

    const authData = useProfileStore((s) => s.authData);

    const managerRole = useSettingsStore((s) => s.hasManagerRole);

    const trainerRole = useSettingsStore((s) => s.hasTrainerRole);

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
          view={PreferredView.MANAGER_EVALUATING_TRAINER}
          content="Manager"
          condition={canShowManagerTooltip}
        />
      </>
    );
  },
};

const ViewTooltip = ({
  view,
  content,
  condition,
}: {
  view: PreferredView;
  content: string;
  condition: boolean;
}) => {
  const { setPreferredView, currentViewMode } = useViewMode();

  if (!condition) return null;

  return (
    <Tooltip
      content={content}
      className={`rounded p-1 ${
        currentViewMode === view
          ? getViewModeBackgroundColorClass(currentViewMode)
          : 'bg-gray100'
      } ml-2 cursor-pointer`}
      onClick={() => setPreferredView(view)}
    >
      <img className="h-4 w-4" src={preferredViewIcon[view]} alt="" />
    </Tooltip>
  );
};
