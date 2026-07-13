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
      <div className="flex h-full min-h-[150px] items-center justify-center border border-dashed border-[#2c332d] bg-[#070a08] px-6 text-center">
        <div>
          <div className="mx-auto mb-3 h-px w-12 bg-[#ffb52e]/50" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#8b958c]">
            Pace signal unavailable
          </p>
          <p className="mt-2 font-mono text-[9px] leading-4 text-[#565e57]">
            활동 구간이 완성되면 시간당 생산
            <br />
            페이스를 계산합니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer className="h-full min-h-0 w-full">
      <AreaChart
        data={data}
        margin={{
          top: 22,
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
          domain={[8 * 60, 27 * 60]}
        />
        <YAxis
          domain={[0, 60]}
          allowDataOverflow={true}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9, fill: '#737d74', fontFamily: 'monospace' }}
        />
        <Tooltip
          labelFormatter={minutesToTimeString}
          formatter={(value: number | string) => [
            `${value} min/h`,
            '생산 페이스',
          ]}
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
        <ReferenceLine
          y={targetPace}
          stroke="#ffb52e"
          strokeDasharray="4 4"
          label={{
            value: `TARGET ${targetPace}`,
            fontSize: 8,
            fill: '#ffbf49',
            fontFamily: 'monospace',
            position: 'insideTopRight',
          }}
        />
        <ReferenceLine
          y={todayAvg}
          stroke="#c9ff3d"
          strokeOpacity={0.5}
          label={{
            value: `AVG ${todayAvg}`,
            fontSize: 8,
            fill: '#c9ff3d',
            fontFamily: 'monospace',
            position: 'insideBottomRight',
          }}
        />
        <Area
          type="monotone"
          dataKey={(o) => o.pace}
          unit="min/h"
          name="생산 페이스"
          stroke="#c9ff3d"
          strokeWidth={1.5}
          fill="#c9ff3d"
          fillOpacity={0.18}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
