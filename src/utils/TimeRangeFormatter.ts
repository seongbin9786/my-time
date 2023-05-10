const TIME_RANGE_AND_TEXT_REGEXP = new RegExp(
  /\[((?:[0-9|:])+) -> ((?:[0-9|:])+)\] ([+|-]) (.+)/
);

export const extractTimeRangeAndText = (str: string) => {
  const extracted = TIME_RANGE_AND_TEXT_REGEXP.exec(str);

  if (!extracted) {
    throw new Error(`extractTimeRangeAndText - bad format: ${str}`);
  }
  return extracted;
};

const TIME_AND_TEXT_REGEXP = new RegExp(/\[((?:[0-9|:])+)\] (.+)/);

export const extractTimeAndText = (str: string) => {
  const extracted = TIME_AND_TEXT_REGEXP.exec(str);

  if (!extracted) {
    throw new Error(`extractTimeAndText - bad format: ${str}`);
  }
  return extracted;
};
