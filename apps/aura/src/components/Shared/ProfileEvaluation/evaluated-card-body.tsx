import UserName from './user-name';
import UserInformation from './user-information';
import BrightIdProfilePicture from '@/components/BrightIdProfilePicture';
import { EvidenceType, EvidenceViewMode } from '@/types/dashboard';
import { Verifications } from '@/types/aura';
import {
  getViewModeBorderColorClass,
  getViewModeSubjectBorderColorClass,
  INBOUND_EVIDENCE_VIEW_MODES,
  viewModeToSubjectViewMode,
} from '@/constants';
import Tooltip from '../Tooltip';
import { useMemo } from 'react';
import { useSubjectName } from '@/hooks/useSubjectName';
import useViewMode from '@/hooks/useViewMode';
import ConnectionInfo from './connection-info';
import EvaluationInformation from './evaluation-information';
import EvidenceInformation from './evidence-information';
import Graph from './graph';
import { EvidenceUserProfile } from './connected-card-body';

const EvaluatedCardBody = ({
  fromSubjectId,
  toSubjectId,
  evidenceViewMode,
  connection,
}: {
  fromSubjectId: string;
  toSubjectId: string;
  evidenceViewMode: EvidenceViewMode;
  connection?: { verifications: Verifications };
}) => {
  const leftCardSide = useMemo(
    () =>
      INBOUND_EVIDENCE_VIEW_MODES.includes(evidenceViewMode)
        ? fromSubjectId
        : toSubjectId,
    [evidenceViewMode, fromSubjectId, toSubjectId],
  );
  const name = useSubjectName(leftCardSide);

  const rightCardSide = useMemo(
    () =>
      INBOUND_EVIDENCE_VIEW_MODES.includes(evidenceViewMode)
        ? toSubjectId
        : fromSubjectId,
    [evidenceViewMode, fromSubjectId, toSubjectId],
  );
  const { currentViewMode, currentEvaluationCategory } = useViewMode();

  return (
    <>
      <div className="card__left-column flex w-[60%] gap-1.5">
        <div className="flex w-[50px] flex-col gap-1.5">
          <BrightIdProfilePicture
            subjectId={leftCardSide}
            className={`h-[46px] w-[46px] !min-w-[46px] rounded-lg border-2 ${
              INBOUND_EVIDENCE_VIEW_MODES.includes(evidenceViewMode)
                ? getViewModeBorderColorClass(currentViewMode)
                : getViewModeSubjectBorderColorClass(
                    evidenceViewMode ===
                      EvidenceViewMode.OUTBOUND_ACTIVITY_ON_MANAGERS
                      ? currentViewMode
                      : viewModeToSubjectViewMode[currentViewMode],
                  )
            }`}
          />
          <ConnectionInfo
            connection={connection}
            evidenceViewMode={evidenceViewMode}
            subjectId={leftCardSide}
          />
        </div>
        <div className="flex w-full flex-col gap-0">
          <UserName subjectId={leftCardSide} />
          <UserInformation
            connection={connection}
            evidenceViewMode={evidenceViewMode}
          />
          <Tooltip
            content={`Top evaluations of ${name} as a ${currentEvaluationCategory}`}
          >
            <div>
              <Graph
                evidenceViewMode={evidenceViewMode}
                connection={connection}
              />
            </div>
          </Tooltip>
        </div>
        <span className="divider pl-.5 mr-1.5 h-full border-r border-dashed border-border"></span>
      </div>
      <div className="card__right-column flex w-[40%] flex-col gap-1">
        <EvidenceInformation
          evidenceViewMode={evidenceViewMode}
          evidenceType={EvidenceType.EVALUATED}
          subjectId={rightCardSide}
        />
        <EvidenceUserProfile subjectId={rightCardSide} />
        <EvaluationInformation
          evidenceViewMode={evidenceViewMode}
          fromSubjectId={fromSubjectId}
          toSubjectId={toSubjectId}
        />
      </div>
    </>
  );
};

export default EvaluatedCardBody;
