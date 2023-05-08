export interface ProductivePace {
  name: string;
  pace: number;
}

export const EXAMPLE_PRODUCTIVE_PACE_DATA = [
  {
    name: '09:00',
    pace: 0,
  },
  {
    name: '10:27',
    pace: 28,
  },
  {
    name: '12:11',
    pace: 18,
  },
  {
    name: '13:14',
    pace: 25,
  },
  {
    name: '13:30',
    pace: 24,
  },
  {
    name: '15:10',
    pace: 32,
  },
  {
    name: '15:43',
    pace: 30, // 30, 27, 31, 30, 34, 24
  },
  {
    name: '16:40',
    pace: 27,
  },
  {
    name: '18:11',
    pace: 31,
  },
  {
    name: '18:38',
    pace: 30,
  },
  {
    name: '21:10',
    pace: 34,
  },
  {
    name: '26:06',
    pace: 24,
  },
];

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

const UNIT = 60;

export const simulateProductivePace = (logs: ProductivePace[]) => {
  const result = [];
  //let curLog = logs[0]; // 단순 시작시간임. productive 여부가 없어야 할 듯.
  result.push(logs[0]);
  for (let i = 1; i < logs.length; i++) {
    const curLog = logs[i - 1];
    const nextLog = logs[i];
    const curMinutes = minutesOf(curLog.name);
    const nextMinutes = minutesOf(nextLog.name);
    const timeDiff = nextMinutes - curMinutes;
    const paceDiff = nextLog.pace - curLog.pace;
    const numOfBlocks =
      timeDiff % UNIT > 0
        ? // 만약 끝나는 시간이 curLog.name + UNIT % 0 이면 중복됨. 아니면 중복 안 됨.
          Math.floor(timeDiff / UNIT) + 1
        : Math.floor(timeDiff / UNIT);

    for (let j = 1; j < numOfBlocks; j++) {
      result.push({
        name: timeStrOf(minutesOf(curLog.name) + UNIT * j),
        pace: Math.floor(curLog.pace + (paceDiff / numOfBlocks) * j),
      });
    }
    result.push(nextLog);
  }
  return result;
};
