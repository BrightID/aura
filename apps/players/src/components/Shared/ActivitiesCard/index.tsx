import { useOutboundEvaluationsContext } from 'contexts/SubjectOutboundEvaluationsContext';
import { useMemo } from 'react';

import {
  viewModeSubjectString,
  viewModeToSubjectViewMode,
  viewModeToViewAs,
} from '../../../constants';
import { CredibilityDetailsProps } from '../../../types';
import { PreferredView } from '../../../types/dashboard';
import { useGetBrightIDProfileQuery } from '@/store/api/profile';
import { useGetOutboundConnectionsQuery } from '@/store/api/connections';
import { ActivityChart, ActivityChartProps } from './activity-chart';
import { ArrowDownLeft } from 'lucide-react';

const ActivitiesCard = ({
  subjectId,
  onLastEvaluationClick,
  viewMode,
  onBarChartClick,
}: {
  subjectId: string;
  onLastEvaluationClick: (
    credibilityDetailsProps: CredibilityDetailsProps,
  ) => void;
  viewMode: PreferredView;
  onBarChartClick?: ActivityChartProps['onBarClick'];
}) => {
  const { ratings: outboundRatings, loading } = useOutboundEvaluationsContext({
    subjectId,
    evaluationCategory: viewModeToViewAs[viewModeToSubjectViewMode[viewMode]],
  });

  const { data, isLoading } = useGetOutboundConnectionsQuery({ id: subjectId });
  const profileFetch = useGetBrightIDProfileQuery(subjectId);

  const outboundActiveRatings = useMemo(
    () => outboundRatings?.filter((r) => Number(r.rating)),
    [outboundRatings],
  );

  return (
    <>
      <div className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <ArrowDownLeft className="h-5 w-5" />
        {viewModeSubjectString[viewMode]} Activity
      </div>
      <div>
        <div className="mb-3 flex flex-col gap-1 leading-5">
          <div className="flex justify-between">
            <div className="font-medium">Total evaluations:</div>
            <div>
              <span className="font-medium">
                {outboundActiveRatings?.length ?? '...'}{' '}
              </span>
              <span>
                (
                {outboundRatings?.filter((r) => Number(r.rating) > 0).length ??
                  '...'}
                {' Pos / '}
                {outboundRatings?.filter((r) => Number(r.rating) < 0).length ??
                  '...'}{' '}
                Neg)
              </span>
            </div>
          </div>
        </div>
        <ActivityChart
          key={viewMode}
          ratings={
            outboundRatings
              ?.filter((r) => r.rating !== '0')
              .sort((a, b) => a.timestamp - b.timestamp) ?? []
          }
          outboundEvaluations={data}
          loading={loading || profileFetch.isLoading}
          profile={profileFetch.data}
          evaluationCategory={viewModeToViewAs[viewMode]}
          subjectId={subjectId}
          onBarClick={onBarChartClick}
        />
      </div>
    </>
  );
};

export default ActivitiesCard;
