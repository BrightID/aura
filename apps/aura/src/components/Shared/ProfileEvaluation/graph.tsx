import { Verifications } from '@/api/auranode.service';
import { viewModeToSubjectViewMode, viewModeToViewAs } from '@/constants';
import useParseBrightIdVerificationData from '@/hooks/useParseBrightIdVerificationData';
import { useImpactEChartOption } from '@/hooks/useSubjectVerifications';
import useViewMode from '@/hooks/useViewMode';
import { EvaluationCategory, EvidenceViewMode } from '@/types/dashboard';
import ReactECharts from 'echarts-for-react';

const SmallGraph = ({
  evidenceViewMode,
  connection,
}: {
  evidenceViewMode: EvidenceViewMode;
  connection?: { verifications: Verifications };
}) => {
  const { currentViewMode, currentRoleEvaluatorEvaluationCategory } =
    useViewMode();

  const { auraImpacts } = useParseBrightIdVerificationData(
    connection?.verifications,
    evidenceViewMode === EvidenceViewMode.INBOUND_CONNECTION
      ? EvaluationCategory.SUBJECT
      : evidenceViewMode === EvidenceViewMode.INBOUND_EVALUATION
        ? currentRoleEvaluatorEvaluationCategory
        : viewModeToViewAs[
            evidenceViewMode === EvidenceViewMode.OUTBOUND_ACTIVITY_ON_MANAGERS
              ? currentViewMode
              : viewModeToSubjectViewMode[currentViewMode]
          ],
  );

  const { impactChartSmallOption } = useImpactEChartOption(auraImpacts);

  return (
    <ReactECharts
      style={{ height: '48px', width: '100%' }}
      option={impactChartSmallOption}
    />
  );
};

export default SmallGraph;
