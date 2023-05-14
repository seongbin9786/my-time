import { minutesToTimeString } from '../../utils/DateUtil';

export interface Log {
  offset: number; // 단순 시작 시각임. 이후부터는 시작과 끝이 동시임.
  direction: string;
  productive: number;
  wasted: number;
}

const UNIT = 10;

/**
 * 로그를 평평하게 만듬
 */
export const levelOutAvailableRestTimeLogs = (logs: Log[]) => {
  const result = [];
  result.push(logs[0]);
  for (let i = 1; i < logs.length; i++) {
    const curLog = logs[i - 1];
    const nextLog = logs[i];
    const curMinutes = curLog.offset;
    const nextMinutes = nextLog.offset;
    let numOfBlocks = Math.floor((nextMinutes - curMinutes) / UNIT);
    // 만약 끝나는 시간이 curLog.name + UNIT % 0 이면 중복됨. 아니면 중복 안 됨.
    if ((nextMinutes - curMinutes) % UNIT > 0) {
      numOfBlocks++;
    }

    console.log(numOfBlocks);
    const isProductive = nextLog.direction === 'productive';
    for (let j = 1; j < numOfBlocks; j++) {
      result.push({
        name: minutesToTimeString(curLog.offset + UNIT * j),
        productive: curLog.productive + (isProductive ? UNIT * j : 0),
        wasted: curLog.wasted + (isProductive ? 0 : UNIT * j),
      });
    }
    result.push(nextLog);
  }
  return result;
};
