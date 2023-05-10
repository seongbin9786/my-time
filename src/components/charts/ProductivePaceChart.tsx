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

import {
  levelOutProductivePace,
  ProductivePace,
} from '../../assets/api/ProductivePaceData';

interface ProductivePaceChartProps {
  data: ProductivePace[];
  totalAvg: number;
  todayAvg: number;
}

export const ProductivePaceChart = ({
  data,
  totalAvg,
  todayAvg,
}: ProductivePaceChartProps) => {
  const leveledData = levelOutProductivePace(data);

  return (
    <ResponsiveContainer width="80%" height="70%">
      <AreaChart
        width={500}
        height={400}
        data={leveledData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 60]} allowDataOverflow={true} />
        <Tooltip />
        <ReferenceLine y={40} stroke="red" label="목표 평균: 40min/h" />
        <ReferenceLine
          y={totalAvg}
          stroke="blue"
          label={`전체 평균(${totalAvg}min/h)`}
        />
        <ReferenceLine
          y={todayAvg}
          stroke="green"
          label={`오늘 평균(${todayAvg}min/h)`}
        />
        <Area
          type="monotone"
          dataKey={(o) => o.pace}
          unit="min/h"
          stroke="darkgreen"
          fill="green"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
