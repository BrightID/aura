import {
  useImpactPercentage,
  useSubjectVerifications,
} from '@/hooks/useSubjectVerifications';
import Tooltip from '../Tooltip';
import {
  INBOUND_EVIDENCE_VIEW_MODES,
  viewModeToViewAs,
  viewModeToSubjectViewMode,
  getBgClassNameOfAuraRatingObject,
  getTextClassNameOfAuraRatingObject,
  getConfidenceValueOfAuraRatingNumber,
} from '@/constants';
import { useSubjectEvaluationFromContext } from '@/hooks/useSubjectEvaluation';
import { useSubjectName } from '@/hooks/useSubjectName';
import useViewMode from '@/hooks/useViewMode';
import { EvidenceViewMode } from '@/types/dashboard';
import { useMemo } from 'react';
import EvaluationThumb from '../EvaluationThumb';

export const EvaluationInformation = ({
  fromSubjectId,
  toSubjectId,
  evidenceViewMode,
}: {
  fromSubjectId: string;
  toSubjectId: string;
  evidenceViewMode: EvidenceViewMode;
}) => {
  const { currentViewMode, currentEvaluationCategory } = useViewMode();
  const evaluationCategory = useMemo(
    () =>
      INBOUND_EVIDENCE_VIEW_MODES.includes(evidenceViewMode) ||
      evidenceViewMode === EvidenceViewMode.OUTBOUND_ACTIVITY_ON_MANAGERS
        ? currentEvaluationCategory
        : viewModeToViewAs[viewModeToSubjectViewMode[currentViewMode]],
    [currentEvaluationCategory, currentViewMode, evidenceViewMode],
  );
  const { rating, loading } = useSubjectEvaluationFromContext({
    fromSubjectId,
    toSubjectId,
    evaluationCategory,
  });

  const fromName = useSubjectName(fromSubjectId);
  const toName = useSubjectName(toSubjectId);

  const { auraImpacts } = useSubjectVerifications(
    toSubjectId,
    evaluationCategory,
  );
  const impactPercentage = useImpactPercentage(auraImpacts, fromSubjectId);

  //TODO: change bg color on negative rating
  return (
    <Tooltip
      position="left"
      tooltipClassName="z-10 w-32 !h-auto !whitespace-normal"
      content={`${fromName} evaluated ${toName} ${
        Number(rating?.rating) > 0 ? '+' : ''
      }${rating?.rating}`}
    >
      <div
        className={`evaluation-information flex flex-col items-center justify-center gap-1 py-1.5 ${getBgClassNameOfAuraRatingObject(
          rating,
        )} rounded-md`}
      >
        {loading ? (
          '...'
        ) : (
          <div className="flex items-center gap-1.5">
            <EvaluationThumb rating={rating && Number(rating?.rating)} />
            <p
              className={`${getTextClassNameOfAuraRatingObject(
                rating,
              )} mt-0.5 text-xs font-bold`}
            >{`${getConfidenceValueOfAuraRatingNumber(
              Number(rating?.rating),
            )} ${Number(rating?.rating) > 0 ? '+' : ''}${rating?.rating}`}</p>
          </div>
        )}
        <div
          className={`flex justify-between gap-9 text-sm ${getTextClassNameOfAuraRatingObject(
            rating,
          )}`}
        >
          <p>Impact</p>
          <p className="font-bold">
            {impactPercentage !== null ? `${impactPercentage}%` : '-'}
          </p>
        </div>
      </div>
    </Tooltip>
  );
};

export default EvaluationInformation;
