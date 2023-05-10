import { extractTimeAndText } from './TimeRangeFormatter';

/**
 * @param rawLogs [hh:mm] str
 * @returns [hh:mm -> hh:mm] str
 */
export const convertTimeFormat = (rawLogs: string) => {
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

  const [, startedAt, prevText] = extractTimeAndText(str[str.length - 1]);
  result.push(
    `[${startedAt} -> ${new Date().getHours()}:${new Date().getMinutes()}] ${prevText}`
  );

  return result.join('\n');
};
