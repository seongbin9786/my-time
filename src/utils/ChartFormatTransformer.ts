import { timeStringToMinutes } from './DateUtil';
import { extractTimeRangeAndText } from './TimeRangeFormatter';

const diffBetweenTimeStrings = (startedAt: string, endedAt: string) =>
  timeStringToMinutes(endedAt) - timeStringToMinutes(startedAt);

const timeDiffAndText = (log: string) => {
  const [, startedAt, endedAt, plusMinus, text] = extractTimeRangeAndText(log);

  return {
    startedAt,
    endedAt,
    delta: diffBetweenTimeStrings(startedAt, endedAt),
    productive: plusMinus === '+',
    text,
  };
};

const paceOf = (curProductive: number, wokeUpAt: string, endedAt: string) =>
  Math.floor((curProductive * 60) / diffBetweenTimeStrings(wokeUpAt, endedAt));

/**
 * ProductivePace, AvailableRestTime 차트에 맞게 변환
 */
export const transformLogsToChartFormat = (rawLogs: string) => {
  const logs = rawLogs.trim().split('\n'); // 첫, 끝 원소 제거 (빈 문자열임)
  const parsedLogs = logs.map(timeDiffAndText);
  const { startedAt: wokeUpAt, endedAt, delta, productive } = parsedLogs[0];
  const curProductive = productive ? delta : 0;

  // 첫번째 로그
  const initialData = [
    {
      name: wokeUpAt,
      direction: '',
      productive: 0,
      wasted: 0,
      pace: 0,
    },
    {
      name: endedAt, // endedAt
      direction: productive ? 'productive' : 'wasted',
      productive: curProductive,
      wasted: !productive ? delta : 0,
      pace: paceOf(curProductive, wokeUpAt, endedAt),
    },
  ];

  // 이러면 또 타이핑이 되네. 신기함.
  const result = [...initialData];

  for (let i = 1; i < parsedLogs.length; i++) {
    const { productive: prevProductive, wasted: prevWasted } = result[i];
    const { endedAt, delta, productive } = parsedLogs[i];

    const curProductive = prevProductive + (productive ? delta : 0);

    result.push({
      name: endedAt,
      direction: productive ? 'productive' : 'wasted',
      productive: curProductive,
      wasted: prevWasted + (!productive ? delta : 0),
      pace: paceOf(curProductive, wokeUpAt, endedAt),
    });
  }

  return result;
};
