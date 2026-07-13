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

  if (data.length === 0) {
    return (
      <div className="relative flex h-full min-h-[260px] items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-200 bg-slate-50/60">
        <div className="chart-empty-grid absolute inset-0 opacity-60" />
        <div className="relative text-center">
          <div className="mx-auto mb-3 flex h-6 w-12 items-end justify-center gap-1">
            <span className="h-2 w-1.5 rounded-sm bg-cyan-300" />
            <span className="h-4 w-1.5 rounded-sm bg-cyan-500" />
            <span className="h-6 w-1.5 rounded-sm bg-blue-600" />
            <span className="h-3 w-1.5 rounded-sm bg-orange-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            밸런스를 계산할 기록이 없습니다
          </p>
          <p className="mt-1 text-xs text-slate-400">
            생산과 소비 기록이 쌓이면 누적 차이를 시각화합니다.
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
    <div className="relative h-full min-h-[260px]">
      <div className="absolute right-2 top-0 z-10 flex items-center gap-4 text-[10px] font-medium text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cyan-500" /> 생산 우위
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-orange-500" /> 소비 초과
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-px w-4 border-t border-dashed border-slate-500" />
          균형선
        </span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 34,
            right: 18,
            left: -8,
            bottom: 4,
          }}
        >
          <CartesianGrid
            vertical={false}
            stroke="#e2e8f0"
            strokeDasharray="3 5"
          />
          <XAxis
            dataKey="offset"
            type="number"
            tick={{ fontSize: 10, fill: '#64748b' }}
            tickFormatter={minutesToTimeString}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
            tickMargin={10}
            minTickGap={42}
            domain={[minXAxisDomain, maxXAxisDomain]}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#64748b' }}
            domain={yAxisConfig.domain}
            ticks={yAxisConfig.ticks}
            tickFormatter={(value) => `${value}m`}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={42}
          />
          <Tooltip
            cursor={{ stroke: '#93c5fd', strokeDasharray: '3 3' }}
            contentStyle={{
              border: '1px solid #dbeafe',
              borderRadius: 10,
              boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
              fontSize: 12,
            }}
            labelFormatter={(label) =>
              `시각 ${minutesToTimeString(Number(label))}`
            }
            formatter={(value: number | string) => {
              const minutes = Number(value);
              return [
                `${Math.abs(minutes)}분`,
                minutes > 0 ? '소비 초과' : '생산 우위',
              ];
            }}
          />
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset={gradientOffset}
                stopColor="#f97316"
                stopOpacity={0.3}
              />
              <stop
                offset={gradientOffset}
                stopColor="#06b6d4"
                stopOpacity={0.24}
              />
            </linearGradient>
          </defs>
          <ReferenceLine
            y={0}
            stroke="#64748b"
            strokeDasharray="5 5"
            strokeWidth={1.25}
          />
          <Area
            type="monotone"
            dataKey="need"
            name="시간 밸런스"
            unit="분"
            stroke="#2563eb"
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            activeDot={{
              r: 4,
              fill: '#2563eb',
              stroke: '#ffffff',
              strokeWidth: 2,
            }}
          />
          {getPoints(data)}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
