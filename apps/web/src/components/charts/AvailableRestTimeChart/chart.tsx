import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { minutesToTimeString } from '../../../utils/DateUtil';
import { Log } from '../../../utils/PaceUtil';
import { getMinMaxXAxisDomain, getNormalizedYAxisTicks } from './axisUtil';
import { getChartDataPoints } from './dataPoint';
import { calculateGradientOffset } from './offsetUtil';
import { getPoints } from './points';

interface AvailableRestTimeChartProps {
  logs: Log[];
}

export const AvailableRestTimeChart = ({
  logs,
}: AvailableRestTimeChartProps) => {
  const data = getChartDataPoints(logs);
  const gradientOffset = calculateGradientOffset(data);
  const yAxisConfig = getNormalizedYAxisTicks(data);

  // X축 범위 계산: 데이터의 최소/최대 시각에 패딩 추가
  const { minXAxisDomain, maxXAxisDomain } = getMinMaxXAxisDomain(data);

  const gradientId = 'availableRestTimeSplitColor';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 20,
          right: 8,
          left: -22,
          bottom: 2,
        }}
      >
        <CartesianGrid
          vertical={false}
          stroke="#d8ccbc"
          strokeDasharray="2 5"
        />
        <XAxis
          dataKey="offset"
          type="number"
          tick={{ fontSize: 10, fill: '#817568' }}
          tickLine={false}
          axisLine={{ stroke: '#bfb09d' }}
          tickFormatter={minutesToTimeString}
          domain={[minXAxisDomain, maxXAxisDomain]}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#817568' }}
          tickLine={false}
          axisLine={false}
          domain={yAxisConfig.domain}
          ticks={yAxisConfig.ticks}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          labelFormatter={minutesToTimeString}
          formatter={(value: number | string) => [`${value}분`, '초과 휴식']}
          cursor={{ stroke: '#a64f38', strokeDasharray: '2 4' }}
          contentStyle={{
            background: '#fbf4e8',
            border: '1px solid #c9baa7',
            borderRadius: 3,
            color: '#3b332c',
            fontSize: 11,
          }}
        />
        <ReferenceLine y={0} stroke="#9e8d7a" strokeWidth={1} />
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset={gradientOffset}
              stopColor="#a64f38"
              stopOpacity={0.22}
            />
            <stop
              offset={gradientOffset}
              stopColor="#66715d"
              stopOpacity={0.2}
            />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="need"
          unit="min"
          stroke="#8f4937"
          strokeWidth={1.8}
          fill={`url(#${gradientId})`}
        />
        {getPoints(data)}
      </AreaChart>
    </ResponsiveContainer>
  );
};
