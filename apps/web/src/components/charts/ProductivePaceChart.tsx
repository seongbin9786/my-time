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
  totalAvg: number;
  todayAvg: number;
  targetPace: number;
}

export const ProductivePaceChart = ({
  data,
  totalAvg,
  todayAvg,
  targetPace,
}: ProductivePaceChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 16,
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
          domain={[8 * 60, 27 * 60]}
        />
        <YAxis
          domain={[0, 60]}
          allowDataOverflow={true}
          tick={{ fontSize: 10, fill: '#817568' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          labelFormatter={minutesToTimeString}
          formatter={(value: number | string) => [
            `${value}분/시`,
            '생산 페이스',
          ]}
          cursor={{ stroke: '#66715d', strokeDasharray: '2 4' }}
          contentStyle={{
            background: '#fbf4e8',
            border: '1px solid #c9baa7',
            borderRadius: 3,
            color: '#3b332c',
            fontSize: 11,
          }}
        />
        <ReferenceLine
          y={targetPace}
          stroke="#a64f38"
          strokeDasharray="4 4"
          label={{
            value: `목표 ${targetPace}`,
            position: 'insideTopRight',
            fontSize: 9,
            fill: '#8f4937',
          }}
        />
        {totalAvg > 0 && (
          <ReferenceLine
            y={totalAvg}
            stroke="#8b7e71"
            label={{
              value: `전체 평균 ${totalAvg}`,
              fontSize: 9,
              fill: '#766a5e',
            }}
          />
        )}
        <ReferenceLine
          y={todayAvg}
          stroke="#66715d"
          label={{
            value: `오늘 평균 ${todayAvg}`,
            position: 'insideBottomRight',
            fontSize: 9,
            fill: '#56624f',
          }}
        />
        <defs>
          <linearGradient id="productivePacePaper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#66715d" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#66715d" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="pace"
          unit="min/h"
          stroke="#56624f"
          strokeWidth={1.8}
          fill="url(#productivePacePaper)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
