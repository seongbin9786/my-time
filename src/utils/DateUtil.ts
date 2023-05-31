export const append0 = (num: number) => (num <= 9 ? `0${num}` : num + '');

export const getDateString = (date: Date) => {
  return `${date.getFullYear()}-${append0(date.getMonth() + 1)}-${append0(
    date.getDate()
  )}`;
};

export const getTodayString = () => getDateString(new Date());

export const HOURS_OF_24_IN_MS = 24 * 60 * 60 * 1000;

export const HOURS_OF_24_IN_MINUTES = 24 * 60 * 60;

export const getDateStringDayBefore = (date: string) =>
  getDateString(new Date(new Date(date).getTime() - HOURS_OF_24_IN_MS));

export const getDateStringDayAfter = (date: string) =>
  getDateString(new Date(new Date(date).getTime() + HOURS_OF_24_IN_MS));

/**
 * hh:mm 형식의 시각을(e.g. 06:00) 숫자로 된 분 단위로(e.g. 720) 변환한다.
 *
 * @param timeStr hh:mm
 * @returns minutes
 */
export const timeStringToMinutes = (timeStr: string) => {
  const [hStr, mStr] = timeStr.split(':');
  return Number(hStr) * 60 + Number(mStr);
};

/**
 * 숫자로 된 분 단위를(e.g. 720) hh:mm 형식의 시각으로(e.g. 06:00) 변환한다.
 *
 * @param minutes minutes
 * @returns hh:mm
 */
export const minutesToTimeString = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${append0(h)}:${append0(m)}`;
};

/**
 * string으로된 날짜의 오늘 시각을 분 단위로(e.g. 720) 변환한다.
 *
 * @param timeStr timsStr
 * @returns minutes
 */
export const minutesOf = (timeStr: string) => {
  const [h, m] = timeStr.split(':');
  return Number.parseInt(h) * 60 + Number.parseInt(m);
};

/**
 * string으로된 두 날짜의 간격을 분 단위로 변환한다.
 *
 * @param startedAt startedAt
 * @param endedAt endedAt
 * @returns minutes
 */
export const diffBetweenTimeStrings = (startedAt: string, endedAt: string) =>
  timeStringToMinutes(endedAt) - timeStringToMinutes(startedAt);

/**
 * string으로된 두 날짜의 간격이 하루 이상인지를 반환한다.
 *
 * @param dateStringA 날짜 1
 * @param dateStringB 날짜 2
 * @returns 하루 이상 차이나는지 여부
 */
export const diffMoreThanOneDay = (dateStringA: string, dateStringB: string) =>
  Math.abs(diffBetweenTimeStrings(dateStringB, dateStringA)) >=
  HOURS_OF_24_IN_MINUTES;
