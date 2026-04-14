import {
  INBOUND_EVIDENCE_VIEW_MODES,
  getViewModeTextColorClass,
  getViewModeSubjectTextColorClass,
} from '@/constants';
import { useSubjectName } from '@/hooks/useSubjectName';
import useViewMode from '@/hooks/useViewMode';
import { EvidenceType, EvidenceViewMode } from '@/types/dashboard';
import { ArrowDownRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import Tooltip from '../Tooltip';

const EvidenceInformation = ({
  subjectId,
  evidenceType,
  evidenceViewMode,
}: {
  subjectId: string;
  evidenceType?: EvidenceType;
  evidenceViewMode: EvidenceViewMode;
}) => {
  const name = useSubjectName(subjectId);
  const { currentViewMode } = useViewMode();
  return (
    <div className="evidence-information flex flex-1 justify-between gap-2">
      <Tooltip
        content={
          evidenceType === EvidenceType.EVALUATED
            ? evidenceViewMode === EvidenceViewMode.OUTBOUND_ACTIVITY
              ? 'This user was evaluated by the current subject'
              : 'The current subject evaluated this user'
            : evidenceViewMode === EvidenceViewMode.OUTBOUND_ACTIVITY
              ? 'This user initiated the connection with the current subject'
              : 'This user is connected to the current subject'
        }
        className={`${
          INBOUND_EVIDENCE_VIEW_MODES.includes(evidenceViewMode)
            ? getViewModeTextColorClass(currentViewMode)
            : getViewModeSubjectTextColorClass(currentViewMode)
        } text-xs font-medium`}
      >
        <span className="inline-flex items-center gap-1">
          {evidenceType === EvidenceType.CONNECTED ? (
            <ArrowDownRight className="h-4 w-4" />
          ) : evidenceViewMode === EvidenceViewMode.OUTBOUND_ACTIVITY ? (
            <ArrowDownLeft className="h-4 w-4" />
          ) : (
            <ArrowUpRight className="h-4 w-4" />
          )}
          {evidenceType === EvidenceType.EVALUATED
            ? evidenceViewMode === EvidenceViewMode.OUTBOUND_ACTIVITY
              ? 'evaluated by'
              : 'evaluated'
            : evidenceViewMode === EvidenceViewMode.OUTBOUND_ACTIVITY
              ? 'connected by'
              : 'connected to'}
        </span>
      </Tooltip>
      <div className="flex-1 truncate text-right text-xs font-medium">
        {name}
      </div>
    </div>
  );
};

export default EvidenceInformation;
