import EvaluationInfo from 'components/Shared/EvaluationInfo/EvaluationInfo';
import { PencilIcon } from 'lucide-react';
import { useSelector } from 'store/hooks';
import { selectAuthData } from 'store/profile/selectors';

import { Button } from '@/components/ui/button';

import { useSubjectEvaluationFromContext } from '../../../hooks/useSubjectEvaluation';
import { EvaluationCategory } from '../../../types/dashboard';

export const YourEvaluationInfo = ({
  toSubjectId,
  setShowEvaluationFlow,
  evaluationCategory,
}: {
  toSubjectId: string;
  setShowEvaluationFlow: (value: boolean) => void;
  evaluationCategory: EvaluationCategory;
}) => {
  const authData = useSelector(selectAuthData);
  if (!authData) return <></>;
  return (
    <div className="flex gap-2">
      <EvaluationInfo
        fromSubjectId={authData.brightId}
        toSubjectId={toSubjectId}
        evaluationCategory={evaluationCategory}
        onClick={() => setShowEvaluationFlow(true)}
      />
      <Button
        onClick={() => setShowEvaluationFlow(true)}
        data-testid={`your-evaluation-${authData?.brightId}-${toSubjectId}-edit`}
        variant="secondary"
        size="icon"
      >
        <PencilIcon width={20} height={20} />
      </Button>
    </div>
  );
};
