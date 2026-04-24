import { getAuraVerification } from '@/hooks/useParseBrightIdVerificationData';
import useViewMode from '@/hooks/useViewMode';
import {
  getViewModeSubjectTextColorClass,
  getViewModeTextColorClass,
  INBOUND_EVIDENCE_VIEW_MODES,
  preferredViewIconColored,
  subjectViewAsIconColored,
  viewModeToSubjectViewMode,
  viewModeToViewAs,
} from '@/constants/index';
import { compactFormat } from '@/utils/number';
import Tooltip from '../Tooltip';
import { EvaluationCategory, EvidenceViewMode } from '@/types/dashboard';
import { Verifications } from '@/types/aura';
import { FC, useMemo } from 'react';

export interface UserInformationProps {
  evidenceViewMode: EvidenceViewMode;
  connection?: { verifications: Verifications };
}

const UserInformation: FC<UserInformationProps> = ({
  evidenceViewMode,
  connection,
}) => {
  const { currentViewMode, currentRoleEvaluatorEvaluationCategory } =
    useViewMode();

  const verificartions = useMemo(
    () =>
      getAuraVerification(
        connection?.verifications,
        evidenceViewMode === EvidenceViewMode.INBOUND_CONNECTION
          ? EvaluationCategory.SUBJECT
          : evidenceViewMode === EvidenceViewMode.INBOUND_EVALUATION
            ? currentRoleEvaluatorEvaluationCategory
            : viewModeToViewAs[
                evidenceViewMode ===
                EvidenceViewMode.OUTBOUND_ACTIVITY_ON_MANAGERS
                  ? currentViewMode
                  : viewModeToSubjectViewMode[currentViewMode]
              ],
      ),
    [evidenceViewMode, connection],
  );

  const auraScore = verificartions?.score;

  const auraLevel = verificartions?.level;

  return (
    <div className="mb-1.5 flex items-center justify-between gap-0.5 rounded bg-muted p-1 pr-2 text-muted-foreground">
      <img
        src={
          evidenceViewMode === EvidenceViewMode.INBOUND_CONNECTION
            ? '/assets/images/Shared/brightid-icon.svg'
            : evidenceViewMode === EvidenceViewMode.INBOUND_EVALUATION
              ? preferredViewIconColored[currentViewMode]
              : subjectViewAsIconColored[
                  viewModeToViewAs[
                    evidenceViewMode ===
                    EvidenceViewMode.OUTBOUND_ACTIVITY_ON_MANAGERS
                      ? currentViewMode
                      : viewModeToSubjectViewMode[currentViewMode]
                  ]
                ]
        }
        alt=""
        className="mx-1 h-3.5 w-3.5"
      />
      <>
        <Tooltip
          content="subject level"
          tooltipClassName="z-10 font-normal"
          className={`level mr-0.5 text-sm font-bold ${
            INBOUND_EVIDENCE_VIEW_MODES.includes(evidenceViewMode)
              ? getViewModeTextColorClass(currentViewMode)
              : getViewModeSubjectTextColorClass(
                  evidenceViewMode ===
                    EvidenceViewMode.OUTBOUND_ACTIVITY_ON_MANAGERS
                    ? currentViewMode
                    : viewModeToSubjectViewMode[currentViewMode],
                )
          }`}
        >
          lvl {auraLevel}
        </Tooltip>
        <Tooltip
          content="subject score"
          tooltipClassName="z-10 font-normal"
          className={`text-sm font-bold ${
            INBOUND_EVIDENCE_VIEW_MODES.includes(evidenceViewMode)
              ? getViewModeTextColorClass(currentViewMode)
              : getViewModeSubjectTextColorClass(
                  evidenceViewMode ===
                    EvidenceViewMode.OUTBOUND_ACTIVITY_ON_MANAGERS
                    ? currentViewMode
                    : viewModeToSubjectViewMode[currentViewMode],
                )
          }`}
        >
          {auraScore ? compactFormat(auraScore) : '-'}
        </Tooltip>
      </>
    </div>
  );
};

export default UserInformation;
