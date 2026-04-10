import {
  ComposedChart,
  XAxis,
  YAxis,
  Bar,
  Cell,
  ReferenceLine,
  Area,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import EvaluationsChartTooltip from './chart-tooltip';
import { ChartTooltip } from '@/components/ui/chart';
import { ChartAreaProps } from '../../ActivitiesCard/activity-chart/chart-area';
import { cn } from '@/lib/utils';
import BrightIdProfilePicture from '@/components/BrightIdProfilePicture';
import { FC } from 'react';

export interface EvaluationChartAreaProps extends ChartAreaProps {}

const maxImageSize = 40;
const minImageSize = 16;
const maxNumberOfImages = 20;

function calculateImageSize(numberOfImages: number) {
  if (numberOfImages < 1 || numberOfImages > maxNumberOfImages) {
    return 0;
  }

  const sizeRange = maxImageSize - minImageSize;
  const sizePerImage = sizeRange / (maxNumberOfImages - 1);
  const imageSize = maxImageSize - sizePerImage * (numberOfImages - 1);

  return imageSize;
}

export const ImageLabel: FC<any> = ({ x, y, payload, data, onBarClick }) => {
  if (data.length > maxNumberOfImages) return null;

  const item = data[payload.index];

  const imageSize = calculateImageSize(data.length);

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject
        width={imageSize}
        height={imageSize}
        x={-imageSize / 2}
        y={-91 - imageSize / 2 + (Math.sign(item.impact) * imageSize) / 2}
      >
        <BrightIdProfilePicture
          key={`${item.evaluated}.${item.id}`}
          withoutHover
          onClick={onBarClick?.bind(null, item)}
          className={cn('rounded', onBarClick && 'cursor-pointer')}
          subjectId={item.evaluated}
        />
      </foreignObject>
    </g>
  );
};

export const EvaluationsChartArea = ({
  data,
  refAreaLeft,
  refAreaRight,
  scaleBarHeight,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  zoomedData,
  onBarClick,
}: EvaluationChartAreaProps) => (
  <ResponsiveContainer width="100%" height="100%">
    <ComposedChart
      data={zoomedData}
      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <XAxis
        dataKey="index"
        tickLine={false}
        axisLine={false}
        style={{ fontSize: '10px', userSelect: 'none' }}
        tick={<ImageLabel onBarClick={onBarClick} data={zoomedData} />}
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
      <ChartTooltip cursor={false} content={<EvaluationsChartTooltip />} />

      <ReferenceLine y={0} stroke="gray" strokeWidth={1} />
      <Bar
        maxBarSize={20}
        dataKey={(data) => scaleBarHeight(data)}
        opacity={0.9}
      >
        {zoomedData.map((entry, index) => (
          <Cell
            className={cn(onBarClick && 'cursor-pointer')}
            radius={entry.borderRadius}
            onClick={onBarClick?.bind(null, entry)}
            key={`cell-${index}`}
            fill={entry.color}
          />
        ))}
      </Bar>
      <Area
        type="linear"
        dataKey="confidence"
        stroke="hsl(var(--primary))"
        fillOpacity={1}
        dot={{ r: zoomedData.length > 50 ? 1 : 2, fill: 'white' }}
        fill="url(#colorEvaluations)"
        z={10}
        strokeWidth={2}
        isAnimationActive={false}
      />
      {refAreaLeft !== null && refAreaRight !== null && (
        <ReferenceArea
          x1={Math.min(refAreaLeft, refAreaRight)}
          x2={Math.max(refAreaLeft, refAreaRight)}
          strokeOpacity={0.3}
          fill="hsl(var(--foreground))"
          fillOpacity={0.1}
        />
      )}
    </ComposedChart>
  </ResponsiveContainer>
);

export default EvaluationsChartArea;
