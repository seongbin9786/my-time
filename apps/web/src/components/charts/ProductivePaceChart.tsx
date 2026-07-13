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
  if (data.length < 2) {
    return (
      <div className="flex h-full min-h-44 items-center justify-center border border-dashed border-neutral-300 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
        기록을 두 개 이상 추가하면 페이스가 표시됩니다
      </div>
    );
  }

  return (
    <ResponsiveContainer className="min-h-0" width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 18,
          right: 18,
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
          domain={[8 * 60, 27 * 60]}
        />
        <YAxis
          domain={[0, 60]}
          allowDataOverflow={true}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#737373' }}
        />
        <Tooltip
          labelFormatter={minutesToTimeString}
          contentStyle={{
            border: '1px solid #171717',
            borderRadius: 0,
            boxShadow: 'none',
            fontSize: 11,
          }}
        />
        <ReferenceLine
          y={targetPace}
          stroke="#171717"
          strokeDasharray="4 4"
          label={{
            value: `목표 ${targetPace}`,
            fontSize: 10,
            fill: '#171717',
          }}
        />
        <ReferenceLine
          y={todayAvg}
          stroke="#737373"
          label={{ value: `오늘 ${todayAvg}`, fontSize: 10, fill: '#737373' }}
        />
        <Area
          type="monotone"
          dataKey={(o) => o.pace}
          unit="min/h"
          stroke="#171717"
          strokeWidth={1.5}
          fill="#d4d4d4"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
