export const append0 = (num: number) => (num <= 9 ? `0${num}` : num + '');

export const getDateString = (date: Date) => {
  return `${date.getFullYear()}-${append0(date.getMonth() + 1)}-${append0(
    date.getDate()
  )}`;
};

export const getTodayString = () => getDateString(new Date());

const HOURS_OF_24 = 24 * 60 * 60 * 1000;

export const getDateStringDayBefore = (date: string) =>
  getDateString(new Date(new Date(date).getTime() - HOURS_OF_24));

export const getDateStringDayAfter = (date: string) =>
  getDateString(new Date(new Date(date).getTime() + HOURS_OF_24));

/**
 * @param timeStr hh:mm
 * @returns minutes
 */
export const timeStringToMinutes = (timeStr: string) => {
  const [hStr, mStr] = timeStr.split(':');
  return Number(hStr) * 60 + Number(mStr);
};

/**
 * @param minutes minutes
 * @returns hh:mm
 */
export const minutesToTimeString = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${append0(h)}:${append0(m)}`;
};
