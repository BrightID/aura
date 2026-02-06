import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import ZoomControls from './zoom-controls';
import ChartArea from './chart-area';
import SkeletonChart from './sekeleton-chart';
import { calculateRatingsImpact } from './utils';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { EvaluationCategory } from '@/types/dashboard';
import { useSelector } from '@/store/hooks';
import { selectBrightIdBackup } from '@/store/profile/selectors';
import { AuraImpact } from '@/api/auranode.service';

export interface EvaluationsChartProps {
  evaluationCategory: EvaluationCategory;
  loading: boolean;
  impacts?: AuraImpact[];
  onBarClick?: (entry: any) => void;
}

const chartConfig = {
  evaluations: {
    label: 'Evaluations',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export const EvaluationsChart = ({
  evaluationCategory,
  loading: impactsLoading,
  impacts,
  onBarClick,
}: EvaluationsChartProps) => {
  const [refAreaLeft, setRefAreaLeft] = useState<number | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<number | null>(null);
  const [startIndex, setStartIndex] = useState<number>(0);
  const [endIndex, setEndIndex] = useState<number>(0);
  const [isSelecting, setIsSelecting] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const brightIdBackup = useSelector(selectBrightIdBackup);
  const chartData = useMemo(
    () => calculateRatingsImpact(impacts, evaluationCategory, brightIdBackup),
    [evaluationCategory, brightIdBackup, impacts],
  );

  useEffect(() => {
    if (chartData.length > 0) {
      setStartIndex(0);
      setEndIndex(chartData.length - 1);
    }
  }, [chartData]);

  const zoomedData = useMemo(
    () => chartData.slice(startIndex, endIndex + 1),
    [chartData, startIndex, endIndex],
  );

  const maxAbs = useMemo(
    () =>
      Math.max(
        ...zoomedData.map((item) =>
          Math.abs(Number(item.impactPercentage ?? 0)),
        ),
      ),
    [zoomedData],
  );

  const scaleBarHeight = useCallback(
    (data: any) => {
      return (data.impactPercentage / maxAbs) * 4;
    },
    [maxAbs],
  );

  const handleMouseDown = useCallback(
    (e: any) => {
      if (e?.activePayload?.[0]) {
        const index = chartData.indexOf(e.activePayload[0].payload);
        if (index !== -1) setRefAreaLeft(index);
        setIsSelecting(true);
      }
    },
    [chartData],
  );

  const handleMouseMove = useCallback(
    (e: any) => {
      if (isSelecting && e?.activePayload?.[0]) {
        const index = chartData.indexOf(e.activePayload[0].payload);
        if (index !== -1) setRefAreaRight(index);
      } else {
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
    setEndIndex(Math.min(chartData.length - 1, 19));
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
        direction = e.deltaY < 0 ? 1 : -1;
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
      } else return;

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

  if (impactsLoading) return <SkeletonChart />;

  return (
    <ChartContainer config={chartConfig} className="mb-12 h-52 w-full">
      <div
        className="h-full"
        onWheel={handleZoom}
        onTouchMove={handleZoom}
        ref={chartRef}
        style={{ touchAction: 'none' }}
      >
        <ZoomControls
          onReset={handleReset}
          onZoomIn={() => {
            if (startIndex < endIndex - 1) {
              setStartIndex((prev) => Math.min(prev + 3, endIndex - 1));
            } else {
              setEndIndex((prev) => Math.min(prev + 1, chartData.length - 1));
            }
          }}
          onZoomOut={() => {
            if (startIndex !== 0)
              setStartIndex((prev) => Math.max(prev - 3, 0));
            else
              setEndIndex((prev) => Math.min(prev + 1, chartData.length - 1));
          }}
          onPanLeft={() => {
            setStartIndex((prev) => Math.max(prev - 1, 0));
            setEndIndex((prev) => Math.max(prev - 1, 0));
          }}
          onPanRight={() => {
            setEndIndex((prev) => Math.min(prev + 1, chartData.length - 1));
            setStartIndex((prev) => Math.min(prev + 1, chartData.length - 1));
          }}
          disabledZoomIn={startIndex === endIndex - 1}
          disabledZoomOut={
            startIndex === 0 && endIndex === chartData.length - 1
          }
          disabledPanLeft={startIndex === 0}
          disabledPanRight={endIndex === chartData.length - 1}
        />
        <ChartArea
          data={chartData}
          refAreaLeft={refAreaLeft}
          refAreaRight={refAreaRight}
          scaleBarHeight={scaleBarHeight}
          handleMouseDown={handleMouseDown}
          handleMouseMove={handleMouseMove}
          handleMouseUp={handleMouseUp}
          zoomedData={zoomedData}
          onBarClick={onBarClick}
        />
      </div>
    </ChartContainer>
  );
};
