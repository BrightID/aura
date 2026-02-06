import CredibilityDetailsModal from '@/components/CredibilityDetailsModal';
import ProfileOverview from '@/components/Shared/ProfileOverview';
import { viewModeToEvaluatorViewMode } from '@/constants';
import useViewMode from '@/hooks/useViewMode';
import { CredibilityDetailsProps } from '@/types';
import { SubjectOutboundEvaluationsContextProvider } from 'contexts/SubjectOutboundEvaluationsContext';
import { useState } from 'react';


const EvaluationsDetailsPerformance = ({
  subjectId,
  title = '',
  hasHeader = false,
  hasBtn = false,
  onFindEvaluatorsButtonClick,
}: {
  subjectId: string;
  hasHeader?: boolean;
  hasBtn?: boolean;
  title?: string;
  onFindEvaluatorsButtonClick?: () => void;
}) => {
  const { currentViewMode } = useViewMode();
  const [credibilityDetailsProps, setCredibilityDetailsProps] =
    useState<CredibilityDetailsProps | null>(null);
  return (
    <>
      <SubjectOutboundEvaluationsContextProvider subjectId={subjectId}>
        <ProfileOverview
          subjectId={subjectId}
          isMyPerformance={true}
          setCredibilityDetailsProps={setCredibilityDetailsProps}
          viewMode={viewModeToEvaluatorViewMode[currentViewMode]}
          onFindEvaluatorsButtonClick={onFindEvaluatorsButtonClick}
        />
      </SubjectOutboundEvaluationsContextProvider>
      {credibilityDetailsProps && (
        <CredibilityDetailsModal
          onClose={() => setCredibilityDetailsProps(null)}
          credibilityDetailsProps={credibilityDetailsProps}
        />
      )}
      {/*</div>*/}
    </>
  );
};

export default EvaluationsDetailsPerformance;
