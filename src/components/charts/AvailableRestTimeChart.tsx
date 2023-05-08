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

const minutesOf = (timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const append0 = (num: number) => (num <= 9 ? `0${num}` : num + '');

const timeStrOf = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${append0(h)}:${append0(m)}`;
};

const UNIT = 30;

const simulate = (logs: Log[]) => {
  const result = [];
  //let curLog = logs[0]; // 단순 시작시간임. productive 여부가 없어야 할 듯.
  result.push(logs[0]);
  for (let i = 1; i < logs.length; i++) {
    const curLog = logs[i - 1];
    const nextLog = logs[i];
    const curMinutes = minutesOf(curLog.name);
    const nextMinutes = minutesOf(nextLog.name);
    let numOfBlocks = Math.floor((nextMinutes - curMinutes) / UNIT);
    // 만약 끝나는 시간이 curLog.name + UNIT % 0 이면 중복됨. 아니면 중복 안 됨.
    if ((nextMinutes - curMinutes) % UNIT > 0) numOfBlocks++;

    console.log(numOfBlocks);
    const isProductive = nextLog.direction === 'productive';
    for (let j = 1; j < numOfBlocks; j++) {
      result.push({
        name: timeStrOf(minutesOf(curLog.name) + UNIT * j),
        productive: curLog.productive + (isProductive ? UNIT * j : 0),
        wasted: curLog.wasted + (isProductive ? 0 : UNIT * j),
      });
    }
    result.push(nextLog);
  }
  return result;
};

interface AvailableRestTimeChartProps {
  logs: Log[];
}

export const AvailableRestTimeChart = ({
  logs,
}: AvailableRestTimeChartProps) => {
  const data = simulate(logs).map(({ name, productive, wasted }) => ({
    name,
    productive,
    wasted,
    pace: productive - wasted * 2,
    need: wasted * 2 - productive,
  }));

  const gradientOffset = () => {
    const dataMax = Math.max(...data.map((i) => i.pace));
    const dataMin = Math.min(...data.map((i) => i.pace));

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
            <stop offset={off} stopColor="green" stopOpacity={1} />
            <stop offset={off} stopColor="red" stopOpacity={1} />
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
