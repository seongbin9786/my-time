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

  if (data.length < 2) {
    return (
      <div className="flex h-full min-h-44 items-center justify-center rounded-3xl border border-dashed border-[#28362c]/15 bg-white/35 px-8 text-center text-xs text-[#28362c]/35">
        기록을 두 개 이상 남기면 오늘의 시간 온도가 보여요
      </div>
    );
  }

  return (
    <ResponsiveContainer className="min-h-0" width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 26,
          right: 18,
          left: -12,
          bottom: 8,
        }}
      >
        <CartesianGrid
          stroke="#dfe3d7"
          strokeDasharray="3 6"
          vertical={false}
        />
        <XAxis
          dataKey="offset"
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#75806f' }}
          tickFormatter={minutesToTimeString}
          domain={[minXAxisDomain, maxXAxisDomain]}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#75806f' }}
          domain={yAxisConfig.domain}
          ticks={yAxisConfig.ticks}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          labelFormatter={minutesToTimeString}
          formatter={(value: number | string) => [`${value}분`, '소비 − 생산']}
          contentStyle={{
            border: '1px solid rgba(40,54,44,.12)',
            borderRadius: 18,
            boxShadow: '0 14px 35px rgba(40,54,44,.10)',
            fontSize: 11,
          }}
        />
        <ReferenceLine y={0} stroke="#8b9684" strokeDasharray="3 5" />
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset={gradientOffset}
              stopColor="#f4a88f"
              stopOpacity={0.78}
            />
            <stop
              offset={gradientOffset}
              stopColor="#b9c8a3"
              stopOpacity={0.72}
            />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="need"
          unit="min"
          stroke="#52624e"
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
        />
        {getPoints(data)}
      </AreaChart>
    </ResponsiveContainer>
  );
};
