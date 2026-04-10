import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Area,
  XAxis,
  YAxis,
  ComposedChart,
  ReferenceArea,
  ResponsiveContainer,
  Bar,
  Cell,
  TooltipProps,
  ReferenceLine,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';
import { MdRefresh } from 'react-icons/md';
import { formatDuration } from '@/utils/time';
import { AuraNodeBrightIdConnection, AuraRating } from '@/types';
import {
  EvaluationCategory,
  evaluationsToEvaluatedCategory,
} from '@/types/dashboard';
import { valueColorMap } from '@/constants/chart';
import { compactFormat } from '@/utils/number';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { getAuraVerification } from '@/hooks/useParseBrightIdVerificationData';
import { calculateImpact, calculateImpactPercent } from '@/utils/score';

type ZoomableChartProps = {
  ratings: AuraRating[] | null;
  evaluationCategory: EvaluationCategory;
  subjectId: string;
  loading: boolean;
  outboundEvaluations?: AuraNodeBrightIdConnection[];
  profile?: ProfileInfo;
};

const chartConfig = {
  evaluations: {
    label: 'Evaluations',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;
const CustomRatingTooltip = ({ payload, label }: TooltipProps<any, any>) => {
  if (!payload || payload.length === 0) return null;

  const ratingData = payload[0].payload;

  const { impact, evaluatorName, evaluated, rating, timestamp, subjectScore } =
    ratingData;

  return (
    <div className="rounded-md border bg-card p-2">
      <div>
        Name: <strong>{evaluatorName || evaluated?.slice(0, 7)}</strong>
      </div>
      <div>
        Score: <strong>{compactFormat(subjectScore ?? 0)}</strong>
      </div>
      <div>
        Impact: <strong>{compactFormat(impact)}</strong>
      </div>
      <div>
        Confidence:{' '}
        <strong>{(Number(rating) > 0 ? '+' : '') + rating || 'N/A'}</strong>
      </div>
      <small>{formatDuration(timestamp)}</small>
    </div>
  );
};

const processAuraRatings = (
  ratings: AuraRating[],
  evaluations: AuraNodeBrightIdConnection[] | undefined,
  evaluationCategory: EvaluationCategory,
  profileData: ProfileInfo | undefined,
) => {
  if (!evaluations || !profileData) return [];

  const outboundProfiles = evaluations?.reduce(
    (prev, curr) => {
      prev[curr.id] = curr;

      return prev;
    },
    {} as Record<string, AuraNodeBrightIdConnection>,
  );

  const profileImpact = getAuraVerification(
    profileData.verifications,
    evaluationCategory,
  );

  return ratings.map((rating) => {
    const ratingProfile = outboundProfiles[rating.toBrightId];

    const impact = getAuraVerification(
      ratingProfile.verifications,
      evaluationsToEvaluatedCategory[evaluationCategory],
    );

    const score = calculateImpact(
      profileImpact?.score ?? 0,
      Number(rating.rating),
    );
    return {
      ...rating,
      color: valueColorMap[rating.rating],
      subjectScore: impact?.score,
      score: profileImpact?.score,
      impact: score,
      impactPercentage: calculateImpactPercent(impact?.impacts ?? [], score),
      evaluatorName: rating.toBrightId.slice(0, 7),
      evaluated: rating.toBrightId,
    };
  });
};

export function SkeletonChart() {
  return (
    <div className="mb-12 h-52 w-full">
      <div className="flex h-full flex-col">
        <div className="my-2 flex justify-end gap-2 sm:mb-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-6 rounded-md" />
          ))}
        </div>

        <div className="relative flex-1">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ZoomableChart({
  evaluationCategory,
  ratings,
  subjectId,
  loading: ratingsLoading,
  outboundEvaluations,
  profile,
}: ZoomableChartProps) {
  const memoizedRatings = useMemo(() => ratings ?? [], [ratings]);
  const [refAreaLeft, setRefAreaLeft] = useState<number | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<number | null>(null);
  const [startIndex, setStartIndex] = useState<number>(0);
  const [endIndex, setEndIndex] = useState<number>(0);
  const [isSelecting, setIsSelecting] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const chartData = useMemo(() => {
    return processAuraRatings(
      ratings ?? [],
      outboundEvaluations,
      evaluationCategory,
      profile,
    );
  }, [memoizedRatings, evaluationCategory, profile, outboundEvaluations]);

  useEffect(() => {
    if (chartData.length > 0) {
      setStartIndex(0);
      setEndIndex(chartData.length - 1);
    }
  }, [chartData]);

  const zoomedData = useMemo(() => {
    return chartData.slice(startIndex, endIndex + 1);
  }, [chartData, startIndex, endIndex]);

  const maxAbs = useMemo(
    () =>
      Math.max(...zoomedData.map((item) => Math.abs(Number(item.impact ?? 0)))),
    [zoomedData],
  );

  const scaleBarHeight = useCallback(
    (data: any) => {
      return data.impactPercentage * 4;
    },
    [maxAbs],
  );

  const handleMouseDown = useCallback(
    (e: any) => {
      if (e && e.activePayload && e.activePayload[0]) {
        const index = chartData.indexOf(e.activePayload[0].payload);
        if (index !== -1) {
          setRefAreaLeft(index);
          setIsSelecting(true);
        }
      }
    },
    [chartData],
  );

  const handleMouseMove = useCallback(
    (e: any) => {
      if (isSelecting && e && e.activePayload && e.activePayload[0]) {
        const index = chartData.indexOf(e.activePayload[0].payload);
        if (index !== -1) {
          setRefAreaRight(index);
        }
      }
    },
    [isSelecting, chartData],
  );

  const handleMouseUp = useCallback(() => {
    if (refAreaLeft !== null && refAreaRight !== null) {
      const [left, right] = [refAreaLeft, refAreaRight].sort((a, b) => a - b);
      setStartIndex(left);
      setEndIndex(right);
    }
    setRefAreaLeft(null);
    setRefAreaRight(null);
    setIsSelecting(false);
  }, [refAreaLeft, refAreaRight]);

  const handleReset = useCallback(() => {
    setStartIndex(0);
    setEndIndex(chartData.length - 1);
  }, [chartData]);

  const handleZoom = useCallback(
    (
      e: React.WheelEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    ) => {
      if (!chartData.length || !chartRef.current) return;

      let zoomFactor = 0.1;
      let direction = 0;
      let clientX = 0;

      if ('deltaY' in e) {
        direction = e.deltaY < 0 ? 1 : -1; // Zoom in if scrolling up
        clientX = e.clientX;
      } else if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY,
        );
        if ((e as any).lastTouchDistance) {
          direction = currentDistance > (e as any).lastTouchDistance ? 1 : -1;
        }
        (e as any).lastTouchDistance = currentDistance;
        clientX = (touch1.clientX + touch2.clientX) / 2;
      } else {
        return;
      }

      const currentRange = endIndex - startIndex;
      const zoomAmount = currentRange * zoomFactor * direction;
      const chartRect = chartRef.current.getBoundingClientRect();
      const mouseX = clientX - chartRect.left;
      const mousePercentage = mouseX / chartRect.width;

      let newStartIndex = startIndex + zoomAmount * mousePercentage;
      let newEndIndex = endIndex - zoomAmount * (1 - mousePercentage);

      newStartIndex = Math.max(0, Math.round(newStartIndex));
      newEndIndex = Math.min(chartData.length - 1, Math.round(newEndIndex));

      if (newStartIndex <= newEndIndex) {
        setStartIndex(newStartIndex);
        setEndIndex(newEndIndex);
      }
    },
    [startIndex, endIndex, chartData],
  );

  const zoomIn = useCallback(() => {
    setStartIndex((prev) => Math.min(prev + 1, endIndex - 1));
    setEndIndex((prev) => Math.max(prev - 1, startIndex + 1));
  }, [startIndex, endIndex]);

  const zoomOut = useCallback(() => {
    setStartIndex((prev) => Math.max(prev - 1, 0));
    setEndIndex((prev) => Math.min(prev + 1, chartData.length - 1));
  }, [startIndex, endIndex, chartData]);

  const panLeft = useCallback(() => {
    const currentRange = endIndex - startIndex;
    const shift = 1;
    let newStartIndex = Math.max(0, startIndex - shift);
    let newEndIndex = newStartIndex + currentRange;
    if (newEndIndex > chartData.length - 1) {
      newEndIndex = chartData.length - 1;
      newStartIndex = Math.max(0, newEndIndex - currentRange);
    }
    setStartIndex(newStartIndex);
    setEndIndex(newEndIndex);
  }, [startIndex, endIndex, chartData]);

  const panRight = useCallback(() => {
    const currentRange = endIndex - startIndex;
    const shift = Math.round(currentRange * 0.1);
    let newEndIndex = Math.min(chartData.length - 1, endIndex + shift);
    let newStartIndex = newEndIndex - currentRange;
    if (newStartIndex < 0) {
      newStartIndex = 0;
      newEndIndex = Math.min(
        chartData.length - 1,
        newStartIndex + currentRange,
      );
    }
    setStartIndex(newStartIndex);
    setEndIndex(newEndIndex);
  }, [startIndex, endIndex, chartData]);

  if (ratingsLoading) return <SkeletonChart />;

  return (
    <ChartContainer config={chartConfig} className="mb-12 h-52 w-full">
      <div
        className="h-full"
        onWheel={handleZoom}
        onTouchMove={handleZoom}
        ref={chartRef}
        style={{ touchAction: 'none' }}
      >
        <div className="my-2 flex justify-end sm:mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            disabled={startIndex === 0 && endIndex === chartData.length - 1}
            className="h-6 w-6 text-xs sm:text-sm"
          >
            <MdRefresh className="h-2 w-2" />
          </Button>
          <Button
            size="icon"
            className="h-6 w-6 text-xs sm:text-sm"
            variant="ghost"
            onClick={zoomIn}
            disabled={startIndex === endIndex - 1}
          >
            <ZoomInIcon className="h-2 w-2" />
          </Button>
          <Button
            size="icon"
            className="h-6 w-6 text-xs sm:text-sm"
            variant="ghost"
            onClick={zoomOut}
            disabled={startIndex === 0 && endIndex === chartData.length - 1}
          >
            <ZoomOutIcon className="h-2 w-2" />
          </Button>
          <Button
            size="icon"
            className="h-6 w-6 text-xs sm:text-sm"
            variant="ghost"
            onClick={panLeft}
            disabled={startIndex === 0}
          >
            <ArrowLeftIcon className="h-2 w-2" />
          </Button>
          <Button
            size="icon"
            className="h-6 w-6 text-xs sm:text-sm"
            variant="ghost"
            onClick={panRight}
            disabled={endIndex === chartData.length - 1}
          >
            <ArrowRightIcon className="h-2 w-2" />
          </Button>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={zoomedData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              style={{ fontSize: '10px', userSelect: 'none' }}
              tick={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={false}
              style={{ fontSize: '10px', userSelect: 'none' }}
              width={30}
              domain={[-4, 4]}
              type="number"
            />
            <ChartTooltip content={<CustomRatingTooltip />} />
            <ReferenceLine y={0} stroke="gray" strokeWidth={1} />
            <Bar
              maxBarSize={20}
              dataKey={(data) => scaleBarHeight(data)}
              opacity={0.9}
            >
              {zoomedData.map((entry, index) => (
                <Cell radius={2} key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>

            <Area
              type="monotone"
              dataKey="rating"
              stroke={chartConfig.evaluations.color}
              fillOpacity={1}
              dot={{ r: 2, fill: 'white' }}
              fill="url(#colorEvaluations)"
              z={10}
              isAnimationActive={false}
            />

            {refAreaLeft !== null && refAreaRight !== null && (
              <ReferenceArea
                x1={chartData[Math.min(refAreaLeft, refAreaRight)].timestamp}
                x2={chartData[Math.max(refAreaLeft, refAreaRight)].timestamp}
                strokeOpacity={0.3}
                fill="hsl(var(--foreground))"
                fillOpacity={0.05}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}
