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
      <div className="flex h-full min-h-44 items-center justify-center border border-dashed border-neutral-300 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
        기록을 두 개 이상 추가하면 시간 잔고가 표시됩니다
      </div>
    );
  }

  return (
    <ResponsiveContainer className="min-h-0" width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 24,
          right: 16,
          left: -12,
          bottom: 8,
        }}
      >
        <CartesianGrid
          stroke="#deded9"
          strokeDasharray="2 5"
          vertical={false}
        />
        <XAxis
          dataKey="offset"
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#737373' }}
          tickFormatter={minutesToTimeString}
          domain={[minXAxisDomain, maxXAxisDomain]}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#737373' }}
          domain={yAxisConfig.domain}
          ticks={yAxisConfig.ticks}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          labelFormatter={minutesToTimeString}
          formatter={(value: number | string) => [`${value}분`, '소비 − 생산']}
          contentStyle={{
            border: '1px solid #171717',
            borderRadius: 0,
            boxShadow: 'none',
            fontSize: 11,
          }}
        />
        <ReferenceLine y={0} stroke="#171717" strokeDasharray="3 3" />
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset={gradientOffset}
              stopColor="#a3a3a3"
              stopOpacity={0.55}
            />
            <stop
              offset={gradientOffset}
              stopColor="#171717"
              stopOpacity={0.18}
            />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="need"
          unit="min"
          stroke="#171717"
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
        />
        {getPoints(data)}
      </AreaChart>
    </ResponsiveContainer>
  );
};
