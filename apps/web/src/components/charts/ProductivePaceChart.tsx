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
      <div className="flex h-full min-h-44 items-center justify-center rounded-3xl border border-dashed border-[#28362c]/15 bg-white/35 px-8 text-center text-xs text-[#28362c]/35">
        기록을 두 개 이상 남기면 오늘의 페이스가 보여요
      </div>
    );
  }

  return (
    <ResponsiveContainer className="min-h-0" width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 20,
          right: 18,
          left: -12,
          bottom: 8,
        }}
      >
        <CartesianGrid
          stroke="#e4e7dc"
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
          domain={[8 * 60, 27 * 60]}
        />
        <YAxis
          domain={[0, 60]}
          allowDataOverflow={true}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#75806f' }}
        />
        <Tooltip
          labelFormatter={minutesToTimeString}
          contentStyle={{
            border: '1px solid rgba(40,54,44,.12)',
            borderRadius: 18,
            boxShadow: '0 14px 35px rgba(40,54,44,.10)',
            fontSize: 11,
          }}
        />
        <ReferenceLine
          y={targetPace}
          stroke="#d87f62"
          strokeDasharray="4 5"
          label={{
            value: `목표 ${targetPace}`,
            fontSize: 10,
            fill: '#b7674d',
          }}
        />
        <ReferenceLine
          y={todayAvg}
          stroke="#718466"
          label={{ value: `오늘 ${todayAvg}`, fontSize: 10, fill: '#718466' }}
        />
        <Area
          type="monotone"
          dataKey={(o) => o.pace}
          unit="min/h"
          stroke="#667a5d"
          strokeWidth={1.5}
          fill="#cbd8ba"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
