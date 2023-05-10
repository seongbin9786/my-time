import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  levelOutAvailableRestTimeLogs,
  Log,
} from '../../assets/api/AvailableRestTimeData';

interface AvailableRestTimeChartProps {
  logs: Log[];
}

export const AvailableRestTimeChart = ({
  logs,
}: AvailableRestTimeChartProps) => {
  const data = levelOutAvailableRestTimeLogs(logs).map(
    ({ name, productive, wasted }) => ({
      name,
      productive,
      wasted,
      need: wasted - productive,
    })
  );

  const gradientOffset = () => {
    const dataMax = Math.max(...data.map((i) => i.need));
    const dataMin = Math.min(...data.map((i) => i.need));

    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }

    return dataMax / (dataMax - dataMin);
  };

  const off = gradientOffset();

  return (
    <ResponsiveContainer width="80%" height="70%">
      <AreaChart
        width={500}
        height={400}
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <defs>
          <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset={off} stopColor="red" stopOpacity={1} />
            <stop offset={off} stopColor="green" stopOpacity={1} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="need"
          stroke="#000"
          fill="url(#splitColor)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
