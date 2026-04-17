import {
  INBOUND_EVIDENCE_VIEW_MODES,
  viewModeToSubjectViewMode,
  viewModeToViewAs,
} from '@/constants/index';
import { useSubjectEvaluationFromContext } from 'hooks/useSubjectEvaluation';
import useViewMode from 'hooks/useViewMode';
import { EvidenceViewMode } from 'types/dashboard';

import ConnectedCardBody from './connected-card-body';
import EvaluatedCardBody from './evaluated-card-body';
import { Verifications } from '@/types/aura';

const ProfileEvaluation = ({
  fromSubjectId,
  toSubjectId,
  onClick,
  evidenceViewMode,
  connection,
}: {
  fromSubjectId: string;
  toSubjectId: string;
  onClick: () => void;
  evidenceViewMode: EvidenceViewMode;
  connection?: { verifications: Verifications };
}) => {
  const { currentViewMode, currentEvaluationCategory } = useViewMode();
  const { loading, ratingNumber } = useSubjectEvaluationFromContext({
    fromSubjectId,
    toSubjectId,
    evaluationCategory:
      INBOUND_EVIDENCE_VIEW_MODES.includes(evidenceViewMode) ||
      evidenceViewMode === EvidenceViewMode.OUTBOUND_ACTIVITY_ON_MANAGERS
        ? currentEvaluationCategory
        : viewModeToViewAs[viewModeToSubjectViewMode[currentViewMode]],
  });

  return (
    <div
      onClick={onClick}
      className={`profile-evaluation-card card gap-.5 cursor-pointer !flex-row border pb-3 pl-2 pr-[14px] pt-[11px]`}
    >
      {loading ? (
        'Loading...'
      ) : ratingNumber &&
        evidenceViewMode !== EvidenceViewMode.INBOUND_CONNECTION ? (
        <EvaluatedCardBody
          connection={connection}
          evidenceViewMode={evidenceViewMode}
          fromSubjectId={fromSubjectId}
          toSubjectId={toSubjectId}
        />
      ) : (
        <ConnectedCardBody
          evidenceViewMode={evidenceViewMode}
          connection={connection}
          fromSubjectId={fromSubjectId}
          toSubjectId={toSubjectId}
        />
      )}
    </div>
  );
};

export default ProfileEvaluation;
