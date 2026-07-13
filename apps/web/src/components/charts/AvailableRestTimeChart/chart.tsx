import {
  Area,
  AreaChart,
  CartesianGrid,
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

  if (data.length < 2) {
    return (
      <div className="flex h-full min-h-[150px] items-center justify-center border border-dashed border-[#2c332d] bg-[#070a08] px-6 text-center">
        <div>
          <div className="mx-auto mb-3 h-px w-12 bg-[#c9ff3d]/40" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#8b958c]">
            Waiting for timeline
          </p>
          <p className="mt-2 font-mono text-[9px] leading-4 text-[#565e57]">
            두 개 이상의 시각 기록이 생기면
            <br />
            휴식 편차가 표시됩니다.
          </p>
        </div>
      </div>
    );
  }

  const gradientOffset = calculateGradientOffset(data);
  const yAxisConfig = getNormalizedYAxisTicks(data);

  // X축 범위 계산: 데이터의 최소/최대 시각에 패딩 추가
  const { minXAxisDomain, maxXAxisDomain } = getMinMaxXAxisDomain(data);

  const gradientId = 'availableRestTimeSplitColor';

  return (
    <ResponsiveContainer className="h-full min-h-0 w-full">
      <AreaChart
        data={data}
        margin={{
          top: 24,
          right: 14,
          left: -12,
          bottom: 4,
        }}
      >
        <CartesianGrid
          stroke="#252b26"
          strokeDasharray="2 5"
          vertical={false}
        />
        <XAxis
          dataKey="offset"
          type="number"
          axisLine={{ stroke: '#353c36' }}
          tickLine={false}
          tick={{ fontSize: 9, fill: '#737d74', fontFamily: 'monospace' }}
          tickFormatter={minutesToTimeString}
          domain={[minXAxisDomain, maxXAxisDomain]}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9, fill: '#737d74', fontFamily: 'monospace' }}
          domain={yAxisConfig.domain}
          ticks={yAxisConfig.ticks}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          labelFormatter={minutesToTimeString}
          formatter={(value: number | string) => [`${value} min`, '휴식 편차']}
          contentStyle={{
            background: '#080b09',
            border: '1px solid #3a423b',
            borderRadius: 0,
            color: '#e7ede8',
            fontFamily: 'monospace',
            fontSize: 10,
          }}
          labelStyle={{ color: '#c9ff3d', marginBottom: 4 }}
          itemStyle={{ color: '#d7ded8' }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset={gradientOffset}
              stopColor="#ff6b4a"
              stopOpacity={0.5}
            />
            <stop
              offset={gradientOffset}
              stopColor="#c9ff3d"
              stopOpacity={0.28}
            />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="need"
          unit="min"
          stroke="#d5ddd6"
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
        />
        {getPoints(data)}
      </AreaChart>
    </ResponsiveContainer>
  );
};
