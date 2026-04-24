import BrightIdProfilePicture from '@/components/Shared/BrightIdProfilePicture';
import { getConfidenceValueOfAuraRatingNumber } from '@/constants/index';
import { useMyEvaluationsContext } from 'contexts/MyEvaluationsContext';
import { useSubjectName } from 'hooks/useSubjectName';
import { connectionLevelIcons } from '@/utils/connection';

export function EvaluatorInfo({ evaluatorId }: { evaluatorId: string }) {
  const evaluatorName = useSubjectName(evaluatorId);
  const {
    myRatingNumberToSubject: ratingNumber,
    loading,
    myConnectionToSubject: inboundConnectionInfo,
  } = useMyEvaluationsContext({ subjectId: evaluatorId });

  return (
    <div className="card__top-row__left flex items-start gap-1">
      <BrightIdProfilePicture
        subjectId={evaluatorId}
        className={`h-[56px] w-[56px] rounded-lg border-2 border-orange`}
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <p className="name text-sm font-medium">{evaluatorName}</p>
          <p className="evaluation-confidence flex text-sm font-medium">
            {loading ? (
              '...'
            ) : ratingNumber ? (
              `(${ratingNumber})`
            ) : inboundConnectionInfo ? (
              <img
                src={`/assets/images/Shared/${
                  connectionLevelIcons[inboundConnectionInfo.level]
                }.svg`}
                alt=""
              />
            ) : (
              '-'
            )}
          </p>
          <span className="flex h-4 w-8 items-center justify-center rounded-full bg-pastel-purple">
            <img
              src="/assets/images/SubjectProfile/horizontal-three-dot.svg"
              alt=""
            />
          </span>
        </div>
        <p className="your-connection-or-evaluation-title text-xs text-gray20">
          {ratingNumber
            ? 'Your evaluation:'
            : inboundConnectionInfo
              ? 'Your connection:'
              : '...'}
        </p>
        <div className="flex items-end gap-1">
          {ratingNumber !== null && ratingNumber > 0 && (
            <img
              src="/assets/images/Shared/thumbs-up.svg"
              className="h-[18px] w-[18px]"
              alt=""
            />
          )}
          <span
            className={`text-sm font-medium ${
              ratingNumber
                ? ratingNumber > 0
                  ? 'text-green'
                  : 'text-red-700'
                : ''
            }`}
          >
            {loading ? (
              '...'
            ) : ratingNumber ? (
              `${getConfidenceValueOfAuraRatingNumber(
                ratingNumber,
              )} ${ratingNumber}`
            ) : inboundConnectionInfo ? (
              <>
                <img
                  src={`/assets/images/Shared/${
                    connectionLevelIcons[inboundConnectionInfo.level]
                  }.svg`}
                  alt=""
                />
                {inboundConnectionInfo.level}
              </>
            ) : (
              '-'
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
