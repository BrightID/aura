import { useSubjectInboundEvaluationsContext } from 'contexts/SubjectInboundEvaluationsContext';
import {
  useSubjectVerifications,
  useTotalImpact,
} from 'hooks/useSubjectVerifications';
import useViewMode from 'hooks/useViewMode';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router';
import { selectAuthData } from 'store/profile/selectors';
import { PreferredView, ProfileTab } from 'types/dashboard';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  viewModeToEvaluatorViewMode,
  viewModeToString,
  viewModeToViewAs,
} from '../../../constants';
import { CredibilityDetailsProps } from '../../../types';
import { compactFormat } from '../../../utils/number';
import ActivitiesCard from '../ActivitiesCard';
import ChartViewHelpModal from '@/app/routes/_app.subject.$id/components/chart-view-help-modal';
import LevelProgress from '@/app/routes/_app.home/components/LevelProgress';
import { EvaluationsChart } from './evaluations-chart';
import { ArrowUpRight } from 'lucide-react';

const ProfileOverview = ({
  subjectId,
  title = '',
  showEvidenceList,
  hasHeader = false,
  setCredibilityDetailsProps,
  onFindEvaluatorsButtonClick,
  viewMode,
  isMyPerformance,
}: {
  subjectId: string;
  showEvidenceList?: () => void;
  hasHeader?: boolean;
  title?: string;
  setCredibilityDetailsProps: (
    credibilityDetailsProps: CredibilityDetailsProps,
  ) => void;
  onFindEvaluatorsButtonClick?: () => void;
  viewMode: PreferredView;
  isMyPerformance?: boolean;
}) => {
  const [isChartHelpModalOpen, setIsChartHelpModalOpen] = useState(false);
  const location = useLocation();
  const {
    ratings: inboundRatings,
    inboundRatingsStatsString,
    connections: inboundConnections,
  } = useSubjectInboundEvaluationsContext({
    subjectId,
    evaluationCategory: viewModeToViewAs[viewMode],
  });
  const { auraScore, auraImpacts, loading } = useSubjectVerifications(
    subjectId,
    viewModeToViewAs[viewMode],
  );
  const { totalPositiveImpact, totalNegativeImpact } =
    useTotalImpact(auraImpacts);

  const auraImpactsSorted = useMemo(
    () =>
      (auraImpacts ?? [])
        .filter((item) => item.impact !== 0)
        .sort((a, b) => b.impact - a.impact),
    [auraImpacts],
  );

  const { currentRoleEvaluatorEvaluationCategory } = useViewMode();

  const authData = useSelector(selectAuthData);

  const onChartClick = (params: any) => {
    setCredibilityDetailsProps({
      subjectId: params.evaluated,
      evaluationCategory:
        viewModeToViewAs[viewModeToEvaluatorViewMode[viewMode]],
    });
  };

  return (
    <>
      {authData?.brightId === subjectId &&
        !location.pathname.startsWith('/subject/') && (
          <LevelProgress
            category={currentRoleEvaluatorEvaluationCategory}
            subjectId={subjectId}
          />
        )}
      <div className="card border px-2 dark:bg-dark-primary md:px-4">
        {hasHeader && (
          <div className="mb-4 text-lg font-bold text-black">{title}</div>
        )}

        {viewMode === PreferredView.PLAYER || (
          <ActivitiesCard
            subjectId={subjectId}
            onLastEvaluationClick={setCredibilityDetailsProps}
            viewMode={viewMode}
            onBarChartClick={onChartClick}
          />
        )}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xl font-semibold">
            <ArrowUpRight className="h-5 w-5" />
            {viewModeToString[viewMode]} Evaluations
          </div>
          <div className="header__info flex flex-col gap-1">
            <ShowData
              title="Evaluations"
              value={inboundRatings?.filter((r) => Number(r.rating)).length}
              details={
                inboundRatingsStatsString
                  ? `(${inboundRatingsStatsString})`
                  : undefined
              }
            />
            <ShowData
              title="Calculated Score"
              value={auraScore ? compactFormat(auraScore) : '-'}
              details={`(${
                totalPositiveImpact !== null
                  ? `+${compactFormat(totalPositiveImpact)}`
                  : '-'
              } / ${
                totalNegativeImpact !== null
                  ? `-${compactFormat(totalNegativeImpact)}`
                  : '-'
              })`}
            />
          </div>
          <Dialog
            open={isChartHelpModalOpen}
            onOpenChange={(value) => setIsChartHelpModalOpen(value)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Understanding Overview Tab</DialogTitle>
              </DialogHeader>
              <ChartViewHelpModal />
            </DialogContent>
          </Dialog>
          <div className="body__info flex w-full gap-2">
            <div className="font-medium">Evaluation Impact:</div>
            <button
              onClick={() => setIsChartHelpModalOpen(true)}
              className="text-sm text-gray00 underline dark:text-gray-400"
            >
              <img
                className="h-5 w-5 cursor-pointer"
                src="/assets/images/SubjectProfile/evidence-info-icon.svg"
                alt="help"
              />
            </button>
          </div>
          <EvaluationsChart
            evaluationCategory={viewModeToViewAs[viewMode]}
            loading={loading}
            onBarClick={onChartClick}
            impacts={auraImpactsSorted}
          />
          {/* <ReactECharts
            option={impactChartOption}
            onEvents={{
              click: onChartClick, // Attach click event
            }}
            className="body__chart mb-3 w-full"
          /> */}
          {/* <div className="chart-info mb-5 flex flex-wrap gap-y-2.5">
            <div className="chart-info__item flex w-1/2 items-center gap-1">
              <div className="chart-info__item__color h-[11px] w-[22px] rounded bg-[#E2E2E2]"></div>
              <div className="chart-info__item__text text-xs font-bold">
                Low Confidence
              </div>
            </div>
            <div className="chart-info__item flex w-1/2 items-center gap-1">
              <div className="chart-info__item__color h-[11px] w-[22px] rounded bg-[#B5B5B5]"></div>
              <div className="chart-info__item__text text-xs font-bold">
                Medium Confidence
              </div>
            </div>
            <div className="chart-info__item flex w-1/2 items-center gap-1">
              <div className="chart-info__item__color h-[11px] w-[22px] rounded bg-[#7A7A7A]"></div>
              <div className="chart-info__item__text text-xs font-bold">
                High Confidence
              </div>
            </div>
            <div className="chart-info__item flex w-1/2 items-center gap-1">
              <div className="chart-info__item__color h-[11px] w-[22px] rounded bg-[#404040]"></div>
              <div className="chart-info__item__text text-xs font-bold">
                Very High Confidence
              </div>
            </div>
          </div> */}
        </div>

        {isMyPerformance && (
          <>
            <Link
              to={`/subject/${subjectId}?viewas=${viewModeToViewAs[viewMode]}&tab=${ProfileTab.EVALUATIONS}`}
              className="w-full"
            >
              <button className="btn--outlined btn--medium mt-4 w-full">
                View All Evaluations
              </button>
            </Link>
            {viewMode === PreferredView.TRAINER && (
              <button
                onClick={onFindEvaluatorsButtonClick}
                className="btn mt-3"
              >
                Find New Trainer
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
};

const ShowData = ({
  title,
  value,
  details,
}: {
  title: string | number | null | undefined;
  value: string | number | null | undefined;
  details: string | number | null | undefined;
}) => {
  return (
    <div className="flex w-full justify-between">
      <div className="font-medium">{title}:</div>
      <div>
        <span className="font-medium">{value} </span>
        <span>{details}</span>
      </div>
    </div>
  );
};

export default ProfileOverview;
