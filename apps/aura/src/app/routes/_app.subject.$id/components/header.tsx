import { PlayerHistorySequence } from '@/components/Header/PlayerHistorySequence';
import DefaultHeader from '@/components/Header/DefaultHeader';
import Tooltip from '@/components/Shared/Tooltip';
import {
  viewModeSubjectBackgroundColorClass,
  subjectViewAsIcon,
} from '@/constants';
import { useOutboundEvaluations } from '@/hooks/useSubjectEvaluations';
import useViewMode from '@/hooks/useViewMode';
import { selectAuthData } from '@/store/profile/selectors';
import { PlayerHistorySequenceType } from '@/types';
import { EvaluationCategory } from '@/types/dashboard';
import { findLastIndex } from '@/utils';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';

const views = [
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

export default function SubjectProfileHeader() {
  const { subjectViewModeTitle } = useViewMode();
  const params = useParams();

  const authData = useSelector(selectAuthData);

  const subjectIdProp = params['id'];

  const subjectId = useMemo(
    () => subjectIdProp ?? authData?.brightId,
    [authData?.brightId, subjectIdProp],
  );

  const [playerHistorySequence, setPlayerHistorySequence] = useState<
    PlayerHistorySequenceType[]
  >([]);
  const [isSequenceOpen, setIsSequenceOpen] = useState(false);
  const { currentEvaluationCategory } = useViewMode();

  useEffect(() => {
    if (!subjectId) return;
    setPlayerHistorySequence((prevSequence) => {
      if (
        findLastIndex(prevSequence, (h) => h.subjectId === subjectId) ===
        prevSequence.length - 1
      ) {
        return [
          ...prevSequence.slice(0, prevSequence.length - 1),
          {
            subjectId,
            evaluationCategory: currentEvaluationCategory,
          },
        ];
      }
      const index = findLastIndex(
        prevSequence,
        (h) =>
          h.subjectId === subjectId &&
          h.evaluationCategory === currentEvaluationCategory,
      );
      if (index === -1) {
        return [
          ...prevSequence,
          {
            subjectId,
            evaluationCategory: currentEvaluationCategory,
          },
        ];
      }
      return prevSequence.slice(0, index + 1);
    });
  }, [currentEvaluationCategory, subjectId]);

  if (!subjectId) return null;

  return (
    <>
      <DefaultHeader
        breadcrumbs={
          isSequenceOpen && (
            <PlayerHistorySequence
              playerHistorySequence={playerHistorySequence}
            />
          )
        }
        beforeTitle={
          playerHistorySequence.length !== 0 && (
            <img
              className="mr-1 h-[18px] w-6 cursor-pointer"
              src={
                isSequenceOpen
                  ? '/assets/images/Header/close-sequence.svg'
                  : '/assets/images/Header/sequence.svg'
              }
              alt=""
              onClick={() => setIsSequenceOpen(!isSequenceOpen)}
            />
          )
        }
        title={`${subjectViewModeTitle} Profile`}
      >
        <div className="flex items-center">
          <SubjectHeaderBody subjectId={subjectId} />
        </div>
      </DefaultHeader>
    </>
  );
}

export function SubjectHeaderBody({ subjectId }: { subjectId: string }) {
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
    const tabs = [];

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
      <Tooltip
        className={`rounded p-1 ${
          currentEvaluationCategory === EvaluationCategory.SUBJECT
            ? viewModeSubjectBackgroundColorClass[currentViewMode]
            : 'bg-gray100'
        } ml-2 cursor-pointer`}
        position="bottom"
        content={viewsLabel[EvaluationCategory.SUBJECT]}
        onClick={() => updateViewAs(EvaluationCategory.SUBJECT)}
        data-testid={`subject-view-${viewsLabel[EvaluationCategory.SUBJECT]}`}
      >
        <img
          className="h-4 w-4"
          src={subjectViewAsIcon[EvaluationCategory.SUBJECT]}
          alt=""
        />
      </Tooltip>

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
              data-testid={`subject-view-${viewsLabel[subjectViewMode]}`}
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
}
