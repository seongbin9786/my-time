import { minutesToTimeString } from '../../utils/DateUtil';

export interface ProductivePace {
  offset: number;
  pace: number;
}

export const avgPaceOf = (logs: ProductivePace[]) =>
  Math.floor(logs.reduce((acc, cur) => acc + cur.pace, 0) / logs.length);

const UNIT = 30;

/**
 * 평평하게 만듬
 */
export const levelOutProductivePace = (logs: ProductivePace[]) => {
  const result = [];
  //let curLog = logs[0]; // 단순 시작시간임. productive 여부가 없어야 할 듯.
  result.push(logs[0]);
  for (let i = 1; i < logs.length; i++) {
    const curLog = logs[i - 1];
    const nextLog = logs[i];
    const curMinutes = curLog.offset;
    const nextMinutes = nextLog.offset;
    const timeDiff = nextMinutes - curMinutes;
    const paceDiff = nextLog.pace - curLog.pace;
    const numOfBlocks =
      timeDiff % UNIT > 0
        ? // 만약 끝나는 시간이 curLog.name + UNIT % 0 이면 중복됨. 아니면 중복 안 됨.
          Math.floor(timeDiff / UNIT) + 1
        : Math.floor(timeDiff / UNIT);

    for (let j = 1; j < numOfBlocks; j++) {
      result.push({
        name: minutesToTimeString(curLog.offset + UNIT * j),
        pace: Math.floor(curLog.pace + (paceDiff / numOfBlocks) * j),
      });
    }
    result.push(nextLog);
  }
  return result;
};
