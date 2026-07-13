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

import { minutesToTimeString } from '../../utils/DateUtil';
import { Log } from '../../utils/PaceUtil';

interface ProductivePaceChartProps {
  data: Log[];
  todayAvg: number;
  targetPace: number;
}

export const ProductivePaceChart = ({
  data,
  todayAvg,
  targetPace,
}: ProductivePaceChartProps) => {
  if (data.length === 0) {
    return (
      <div className="relative flex h-full min-h-[260px] items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-200 bg-slate-50/60">
        <div className="chart-empty-grid absolute inset-0 opacity-60" />
        <div className="relative text-center">
          <div className="mx-auto mb-3 h-2 w-12 rounded-full bg-blue-100">
            <div className="h-2 w-5 rounded-full bg-blue-500" />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            페이스 데이터가 아직 없습니다
          </p>
          <p className="mt-1 text-xs text-slate-400">
            첫 생산 활동을 기록하면 시간대별 흐름이 나타납니다.
          </p>
        </div>
      </div>
    );
  }

  const firstOffset = data[0].offset;
  const lastOffset = data[data.length - 1].offset;
  const domainStart = Math.max(0, Math.floor((firstOffset - 30) / 60) * 60);
  const domainEnd = Math.max(
    domainStart + 60,
    Math.ceil((lastOffset + 30) / 60) * 60,
  );
  const paceCeiling = Math.max(
    60,
    targetPace + 10,
    todayAvg + 10,
    ...data.map((log) => log.pace + 10),
  );

  return (
    <div className="relative h-full min-h-[260px]">
      <div className="absolute right-2 top-0 z-10 flex items-center gap-4 text-[10px] font-medium text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-600" /> 생산 페이스
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-px w-4 border-t border-dashed border-cyan-500" />
          오늘 평균 {todayAvg}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-px w-4 border-t border-dashed border-blue-700" />
          목표 {targetPace}
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
          <defs>
            <linearGradient id="productivePaceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} />
              <stop offset="92%" stopColor="#2563eb" stopOpacity={0.02} />
            </linearGradient>
          </defs>
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
            domain={[domainStart, domainEnd]}
          />
          <YAxis
            domain={[0, paceCeiling]}
            allowDataOverflow
            tick={{ fontSize: 10, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={42}
            unit="m"
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
            formatter={(value: number | string) => [
              `${value}분 / 시간`,
              '생산 페이스',
            ]}
          />
          <ReferenceLine
            y={targetPace}
            stroke="#1d4ed8"
            strokeDasharray="6 4"
            strokeWidth={1.5}
          />
          <ReferenceLine
            y={todayAvg}
            stroke="#06b6d4"
            strokeDasharray="3 4"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="pace"
            name="생산 페이스"
            unit="분/시간"
            stroke="#2563eb"
            strokeWidth={2.5}
            fill="url(#productivePaceFill)"
            activeDot={{
              r: 4,
              fill: '#2563eb',
              stroke: '#ffffff',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
