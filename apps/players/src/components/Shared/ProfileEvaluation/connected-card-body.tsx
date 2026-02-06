import { Verifications } from '@/api/auranode.service';
import BrightIdProfilePicture from '@/components/BrightIdProfilePicture';
import {
  INBOUND_EVIDENCE_VIEW_MODES,
  viewModeSubjectString,
} from '@/constants';
import { useSubjectName } from '@/hooks/useSubjectName';
import { EvidenceViewMode, EvidenceType } from '@/types/dashboard';
import { useMemo } from 'react';
import ConnectionInformation from './connection-information';
import UserInformation from './user-information';
import UserName from './user-name';
import Tooltip from '../Tooltip';
import SmallGraph from './graph';
import EvidenceInformation from './evidence-information';
import ConnectionInfo from './connection-info';

const ConnectedCardBody = ({
  evidenceViewMode,
  fromSubjectId,
  connection,
  toSubjectId,
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
  return (
    <>
      <div className="card__left-column flex w-[60%] gap-1.5">
        <div className="flex w-[50px] flex-col gap-1.5">
          <BrightIdProfilePicture
            subjectId={leftCardSide}
            className={`h-[46px] w-[46px] !min-w-[46px] rounded-lg border-2 border-pastel-purple`}
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
            content={`Top evaluations ${name}'s as a ${viewModeSubjectString[evidenceViewMode]}`}
          >
            <div>
              <SmallGraph
                connection={connection}
                evidenceViewMode={evidenceViewMode}
              />
            </div>
          </Tooltip>
        </div>
        <span className="divider pl-.5 mr-1.5 h-full border-r border-dashed border-gray00"></span>
      </div>
      <div className="card__right-column flex w-[40%] flex-col gap-1">
        <EvidenceInformation
          evidenceViewMode={evidenceViewMode}
          evidenceType={EvidenceType.CONNECTED}
          subjectId={rightCardSide}
        />
        <EvidenceUserProfile subjectId={rightCardSide} />
        <ConnectionInformation
          fromSubjectId={fromSubjectId}
          toSubjectId={toSubjectId}
        />
      </div>
    </>
  );
};

export const EvidenceUserProfile = ({ subjectId }: { subjectId: string }) => {
  return (
    <div className="img ml-auto">
      <BrightIdProfilePicture
        subjectId={subjectId}
        className="h-8 w-8 rounded-full border border-gray60"
      />
    </div>
  );
};

export default ConnectedCardBody;
