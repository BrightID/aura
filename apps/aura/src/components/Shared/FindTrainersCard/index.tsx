import { useMemo, useState } from 'react';
import { compactFormat } from '@/utils/number';

import {
  viewModeToEvaluatorViewMode,
  viewModeToViewAs,
} from '../../../constants';
import { useSubjectInboundEvaluationsContext } from '../../../contexts/SubjectInboundEvaluationsContext';
import { getAuraVerification } from '../../../hooks/useParseBrightIdVerificationData';
import { useSubjectConnectionInfoFromContext } from '../../../hooks/useSubjectEvaluation';
import {
  useInboundEvaluations,
  useOutboundEvaluations,
} from '../../../hooks/useSubjectEvaluations';
import { useSubjectName } from '../../../hooks/useSubjectName';
import { useSubjectVerifications } from '../../../hooks/useSubjectVerifications';
import { PreferredView } from '../../../types/dashboard';
import { connectionLevelIcons } from '../../../utils/connection';
import BrightIdProfilePicture from '../../BrightIdProfilePicture';
import LinkCard from '@/app/routes/_app.home/components/LinkCard';

const FindTrainersCard = ({ subjectId }: { subjectId: string }) => {
  return (
    <a-card>
      <div className="mb-4.5 text-lg font-bold">Find Trainers</div>
      <div className="flex flex-col gap-2.5">
        <PotentialEvaluatorsListBrief
          subjectId={subjectId}
          description={
            'Here is a list of trainers from your BrightID connections. Ask them to check your work and help you improve.'
          }
          evaluatorViewMode={PreferredView.TRAINER}
          title={'Trainers'}
        />
        <PotentialEvaluatorsListBrief
          subjectId={subjectId}
          description={
            'Or you can ask other players you know to introduce you to their trainers.'
          }
          evaluatorViewMode={PreferredView.PLAYER}
          title={'Players'}
        />
        <div className="mb-[22px]">
          <LinkCard />
        </div>
      </div>
    </a-card>
  );
};

const PotentialEvaluatorsListBrief = ({
  description,
  title,
  evaluatorViewMode,
  subjectId,
}: {
  description: string;
  title: string;
  evaluatorViewMode: PreferredView;
  subjectId: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { itemsOriginal, loading } = useSubjectInboundEvaluationsContext({
    subjectId,
  });
  const potentialEvaluators = useMemo(
    () =>
      itemsOriginal?.filter((c) => {
        const level = getAuraVerification(
          c.inboundConnection?.verifications,
          viewModeToViewAs[viewModeToEvaluatorViewMode[evaluatorViewMode]],
        )?.level;
        return level && level > 0;
      }),
    [evaluatorViewMode, itemsOriginal],
  );
  //TODO: Animation must be implemented
  return (
    <div className="flex flex-col gap-2.5">
      <div className="font-medium text-black2 dark:text-gray-300">
        {description}
      </div>
      <a-card className="flex flex-col gap-2" style={{ padding: '0.75rem' }}>
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-2.5">
            {!isExpanded && (
              <div className="flex flex-row gap-0.5">
                {potentialEvaluators
                  ?.slice(0, 3)
                  .map((p) => (
                    <BrightIdProfilePicture
                      key={p.fromSubjectId}
                      subjectId={p.fromSubjectId}
                      className="h-6 w-6 rounded border-[1px] border-pastel-green"
                    />
                  ))}
              </div>
            )}
            <div className="flex flex-row gap-1">
              <span className="font-black">
                {!loading && potentialEvaluators
                  ? potentialEvaluators.length
                  : '...'}
              </span>
              <span className="font-medium">{title}</span>
            </div>
          </div>
          {isExpanded ? (
            <a-button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
              <a-icon name="minus" size="sm" />
            </a-button>
          ) : (
            <a-button variant="ghost" size="sm" onClick={() => setIsExpanded(true)}>
              Show All
            </a-button>
          )}
        </div>
        {isExpanded && (
          <div className="flex flex-col gap-4">
            {potentialEvaluators?.map((p) => (
              <PotentialEvaluatorBrief
                key={p.fromSubjectId}
                evaluatorViewMode={evaluatorViewMode}
                evaluatorSubjectId={p.fromSubjectId}
                subjectId={subjectId}
              />
            ))}
          </div>
        )}
      </a-card>
    </div>
  );
};

const EvaluationsCount = ({
  evaluatorViewMode,
  evaluatorSubjectId,
}: {
  evaluatorViewMode: PreferredView;
  evaluatorSubjectId: string;
}) => {
  const { ratings } = useOutboundEvaluations({
    subjectId: evaluatorSubjectId,
    evaluationCategory: viewModeToViewAs[evaluatorViewMode],
  });
  return <>{ratings ? ratings.length : '...'}</>;
};

const EvaluatorsCount = ({
  evaluatorViewMode,
  evaluatorSubjectId,
}: {
  evaluatorViewMode: PreferredView;
  evaluatorSubjectId: string;
}) => {
  const { ratings } = useInboundEvaluations({
    subjectId: evaluatorSubjectId,
    evaluationCategory: viewModeToViewAs[evaluatorViewMode],
  });
  return <>{ratings ? ratings.length : '...'}</>;
};

const PotentialEvaluatorBrief = ({
  evaluatorViewMode,
  evaluatorSubjectId,
  subjectId,
}: {
  evaluatorViewMode: PreferredView;
  evaluatorSubjectId: string;
  subjectId: string;
}) => {
  const subjectName = useSubjectName(evaluatorSubjectId);
  const { auraLevel, loading, auraScore } = useSubjectVerifications(
    evaluatorSubjectId,
    viewModeToViewAs[viewModeToEvaluatorViewMode[evaluatorViewMode]],
  );
  const { connectionInfo } = useSubjectConnectionInfoFromContext({
    fromSubjectId: evaluatorSubjectId,
    toSubjectId: subjectId,
  });
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-1.5">
        <BrightIdProfilePicture
          subjectId={evaluatorSubjectId}
          className="h-[26px] w-[26px] rounded border-[1px] border-pastel-green"
        />
        <div className="flex flex-col leading-3">
          <div className="text-sm font-bold leading-4">{subjectName}</div>
          <div className="">
            {connectionInfo ? (
              <div className="flex items-center gap-1">
                <img
                  src={`/assets/images/Shared/${
                    connectionLevelIcons[connectionInfo.level]
                  }.svg`}
                  alt=""
                  className="mr-0.5 inline"
                  width={20}
                  height={20}
                />
                <span className="text-sm font-medium leading-3">
                  {connectionInfo.level}
                </span>
              </div>
            ) : (
              <div>...</div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col text-right leading-3">
        <span>
          {evaluatorViewMode === PreferredView.TRAINER && (
            <span className="text-xs font-medium">
              (
              <EvaluationsCount
                evaluatorSubjectId={evaluatorSubjectId}
                evaluatorViewMode={evaluatorViewMode}
              />{' '}
              Trainees)
            </span>
          )}{' '}
          {evaluatorViewMode === PreferredView.TRAINER && (
            <span className="text-xs font-medium">
              (
              <EvaluatorsCount
                evaluatorSubjectId={evaluatorSubjectId}
                evaluatorViewMode={evaluatorViewMode}
              />{' '}
              Trainers)
            </span>
          )}{' '}
          <span className="text-xs font-bold">
            Level {loading ? '...' : auraLevel !== null ? auraLevel : '-'}
          </span>{' '}
        </span>
        <p className="mb-2 text-xs text-gray10 dark:text-gray-300">
          Score:{' '}
          <span className="font-medium text-black dark:text-white">
            {auraScore ? compactFormat(auraScore) : '-'}
          </span>
        </p>
        {/* <div className="text-gray20 text-[10px] font-normal">
          Connection Level
        </div> */}
      </div>
    </div>
  );
};

export default FindTrainersCard;
