import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { PlanBurndown } from '../../assets/api/PlanBurdownData';

interface PlanBurndownChartProps {
  data: PlanBurndown[];
}

export const PlanBurndownChart = ({ data }: PlanBurndownChartProps) => {
  const currentTimeIdx =
    (data.findIndex((d) => d.progress === undefined) || data.length) - 1;
  const currentTime = data[currentTimeIdx].name;

  return (
    <ResponsiveContainer width="80%" height="70%">
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <ReferenceLine x={currentTime} stroke="red" label="now" />
        <Line
          type="monotone"
          dataKey="progress"
          stroke="#82ca9d"
          strokeWidth={4}
        />
        <Line type="monotone" dataKey="recommended" stroke="blue" />
      </LineChart>
    </ResponsiveContainer>
  );
};
