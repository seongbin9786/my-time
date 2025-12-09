import { append0, justOneDayAwayAtMost } from './DateUtil';
import { extractTimeAndText } from './TimeRangeFormatter';

/**
 * 로그에 현재 시간을 추가하여 실시간 현황을 볼 수 있게 한다.
 *
 * @param str 원본 로그
 * @param result 수정 후 로그
 * @returns 현재 시간의 기록을 추가한 result(수정 후 로그)
 *
 * TODO: 해당 메소드 호출을 화면 revisit할 때마다 해야 함
 */
const addCurrentTime = (str: string[], result: string[], isDawn: boolean) => {
  const lastLog = str[str.length - 1];
  const [, startedAt, prevText] = extractTimeAndText(lastLog);

  // <수면> 키워드가 있으면 종료한다.
  // 오늘과 하루 이상 차이나도 addCurrentTime을 호출하지 않아야 함
  if (lastLog.includes('수면')) {
    return;
  }

  const now = new Date();
  // 24시간이 넘으면 다음 날로 가기 때문에, 00:00으로 초기화되는데, 여기에 24시간을 더해줘야 한다.
  const hours = isDawn ? now.getHours() + 24 : now.getHours();
  const minutes = now.getMinutes();
  result.push(
    `[${startedAt} -> ${append0(hours)}:${append0(minutes)}] ${prevText}`,
  );
};

/**
 * @param rawLogs [hh:mm] str
 * @returns [hh:mm -> hh:mm] str
 */
export const convertTimeFormat = (
  rawLogs: string,
  targetDay: string,
  today: string,
) => {
  const str = rawLogs.trim().split('\n');

  const result = [];

  for (let i = 1; i < str.length; i++) {
    const prev = str[i - 1];
    const cur = str[i];

    const prevExtracted = extractTimeAndText(prev);
    const curExtracted = extractTimeAndText(cur);

    if (!prevExtracted || !curExtracted) {
      throw new Error('Wrong format');
    }

    const [, startedAt, prevText] = prevExtracted;
    const [, endedAt] = curExtracted;

    result.push(`[${startedAt} -> ${endedAt}] ${prevText}`);
  }

  // addCurrentTime의 대상:
  // 1. [오늘 내내]
  // 2. [어제] 로그를 오늘 새벽에 안자고 기록하는 경우 <---- 버그 발생 지점
  // ---> isDawn을 최대 어제까지만 적용해야 함. (어제 이전의 날짜에 대해선 실행하면 안 됨.)
  const todayOrYesterday = justOneDayAwayAtMost(targetDay, today);
  const dawn = new Date().getHours() < 7;
  if (targetDay === today || (todayOrYesterday && dawn)) {
    addCurrentTime(str, result, dawn);
  }

  return result.join('\n');
};
