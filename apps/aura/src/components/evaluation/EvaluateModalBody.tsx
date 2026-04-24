import ConfidenceDropdown from 'components/Shared/Dropdown/ConfidenceDropdown';
import { useSubjectInboundEvaluationsContext } from 'contexts/SubjectInboundEvaluationsContext';
import { useEvaluateSubject } from 'hooks/useEvaluateSubject';
import { useSubjectName } from 'hooks/useSubjectName';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useProfileStore } from '@/store/profile.store';

import { viewModeSubjectString } from '@/constants';
import { EvaluationCategory, PreferredView } from '@/types/dashboard';

import useViewMode from '../../hooks/useViewMode';
import CustomTrans from '../CustomTrans';
import { toast } from '@aura/ui';

const EvaluateModalBody = ({
  subjectId,
  onSubmitted,
  evaluationCategory,
  viewMode,
}: {
  subjectId: string;
  onSubmitted: (newRating: number | null | undefined) => void;
  evaluationCategory?: EvaluationCategory;
  viewMode?: PreferredView;
}) => {
  const [isYes, setIsYes] = useState(true);
  const [confidence, setConfidence] = useState(1);
  const [onDelete, setOnDelete] = useState(false);
  const { myRatingObject } = useSubjectInboundEvaluationsContext({
    subjectId,
    evaluationCategory,
  });
  const authData = useProfileStore((s) => s.authData);
  const prevRating = useMemo(
    () => (myRatingObject ? Number(myRatingObject.rating) : undefined),
    [myRatingObject],
  );


  useEffect(() => {
    if (!prevRating) return;
    setIsYes(prevRating > 0);
    setConfidence(Math.abs(prevRating));
  }, [prevRating]);

  const name = useSubjectName(subjectId);

  const { submitEvaluation, loading } = useEvaluateSubject(evaluationCategory);

  const submit = useCallback(async () => {
    if (loading || !authData?.brightId) return;
    try {
      const newRating = isYes ? confidence : -1 * confidence;

      await submitEvaluation(subjectId, newRating);
      onSubmitted(newRating);
    } catch (e) {
      toast.error('Error', {
        description:
          'Failed to submit evaluation' +
          (e instanceof Error ? `: ${e.message}` : String(e)),
        duration: 5000,
      });
    }
  }, [
    authData,
    confidence,
    isYes,
    loading,
    onSubmitted,
    subjectId,
    submitEvaluation,
  ]);

  const { subjectViewModeTitle: defaultViewTitle } = useViewMode();

  const subjectViewModeTitle = useMemo(
    () => (viewMode ? viewModeSubjectString[viewMode] : defaultViewTitle),
    [defaultViewTitle, viewMode],
  );
  return (
    <div>
      <p className="subtitle -mt-1 mb-6">
        as a <span className="font-bold">{subjectViewModeTitle}</span> in{' '}
        <span className="font-bold">BrightID</span> domain
      </p>

      <p className="mb-2 font-medium">
        <CustomTrans
          i18nKey={`evaluationQuestion.${subjectViewModeTitle.toLowerCase()}`}
          values={{ name }}
        />
      </p>

      <div className="mb-5 w-full rounded-lg bg-white p-1.5 dark:bg-button-primary">
        <div className="relative flex h-[38px] w-full bg-white dark:bg-button-primary">
          <span
            className={`background absolute bottom-0 top-0 w-1/2 cursor-pointer rounded-md transition-all duration-300 ease-in-out ${
              isYes ? 'left-0 right-1/2 bg-pl3' : 'left-1/2 right-0 bg-error'
            }`}
          ></span>
          <p
            className={`absolute left-0 top-1/2 w-1/2 -translate-y-1/2 cursor-pointer bg-transparent text-center text-lg font-bold transition-all duration-300 ease-in-out ${
              isYes ? 'text-white' : 'text-black'
            }`}
            data-testid={`evaluate-positive`}
            onClick={() => setIsYes(true)}
          >
            <div className="flex w-full justify-center gap-1">
              <img
                src={
                  isYes
                    ? '/assets/images/Shared/thumbs-up-white.svg'
                    : '/assets/images/Shared/thumbs-up-black.svg'
                }
                alt=""
                width="17.5px"
                height="17.5px"
              />
              Yes
            </div>
          </p>
          <p
            className={`absolute right-0 top-1/2 w-1/2 -translate-y-1/2 cursor-pointer bg-transparent text-center text-lg font-bold transition-all duration-300 ease-in-out ${
              isYes ? 'text-black' : 'text-white'
            }`}
            data-testid={`evaluate-negative`}
            onClick={() => setIsYes(false)}
          >
            <div className="flex w-full justify-center gap-1">
              <img
                src={
                  isYes
                    ? '/assets/images/Shared/thumbs-down-black.svg'
                    : '/assets/images/Shared/thumbs-down-white.svg'
                }
                alt=""
                width="17.5px"
                height="17.5px"
              />
              No
            </div>
          </p>
        </div>
      </div>

      <p className="mb-2 font-medium">How confident are you?</p>
      <ConfidenceDropdown
        isYes={isYes}
        confidence={confidence}
        setConfidence={setConfidence}
      />
      <p className="mt-1 font-medium">
        <CustomTrans
          i18nKey={`evaluationExpression.${subjectViewModeTitle.toLowerCase()}.${
            isYes ? 'positive' : 'negative'
          }`}
        />
      </p>
      <div className="mt-12">
        {prevRating ? (
          <div className="flex gap-3">
            <button
              className={`flex items-center justify-center transition-all ease-linear ${
                onDelete
                  ? `btn btn--big btn--outlined-big`
                  : `btn btn--big w-full`
              } `}
              onClick={submit}
            >
              {loading ? 'Sending Operation...' : 'Update Evaluation'}
            </button>
            <button
              data-testid="remove-evaluation"
              className={`btn btn--big flex gap-2.5 bg-delete transition-all ease-linear dark:bg-red-500 ${
                onDelete ? 'w-full items-center justify-center' : ''
              }`}
              onClick={() =>
                onDelete
                  ? submitEvaluation(subjectId, 0).then(() => onSubmitted(0))
                  : setOnDelete(true)
              }
            >
              <img src="/assets/images/Shared/erase-icon.svg" alt="" />
              <p
                className={`overflow-hidden transition-all ${
                  onDelete ? 'w-[75px] opacity-100' : 'w-0 opacity-0'
                }`}
              >
                Remove
              </p>
            </button>
          </div>
        ) : (
          <button
            data-testid="submit-evaluation"
            className="btn btn--big w-full disabled:opacity-60"
            onClick={submit}
            disabled={loading}
          >
            {loading ? 'Sending Operation...' : 'Submit Evaluation'}
          </button>
        )}
      </div>
    </div>
  );
};

export default EvaluateModalBody;
