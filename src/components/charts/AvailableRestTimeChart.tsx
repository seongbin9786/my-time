import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Log } from '../../assets/api/AvailableRestTimeData';
import { minutesToTimeString } from '../../utils/DateUtil';

interface AvailableRestTimeChartProps {
  logs: Log[];
}

export const AvailableRestTimeChart = ({
  logs,
}: AvailableRestTimeChartProps) => {
  const data = logs.map(({ offset, productive, wasted }) => ({
    offset,
    productive,
    wasted,
    need: wasted - productive,
  }));

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

  console.log(data);

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
        <XAxis
          dataKey="offset"
          type="number"
          tickFormatter={minutesToTimeString}
          domain={[8 * 60, 27 * 60]}
        />
        <YAxis />
        <Tooltip labelFormatter={minutesToTimeString} />
        <defs>
          <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset={off} stopColor="red" stopOpacity={1} />
            <stop offset={off} stopColor="green" stopOpacity={1} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="need"
          unit="min"
          stroke="#000"
          fill="url(#splitColor)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
