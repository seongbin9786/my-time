import { useDispatch } from 'react-redux';

import { goToNextDate, goToPrevDate, goToToday } from '../../store/logs';
import { Button } from '../ui/button';

const PREV_DAY_BUTTON_TEXT = '←';
const TODAY_BUTTON_TEXT = '오늘';
const NEXT_DAY_BUTTON_TEXT = '→';

export const DayNavigator = () => {
  const dispatch = useDispatch();
  const handleTodayButton = () => dispatch(goToToday());
  const handleYesterdayButton = () => dispatch(goToPrevDate());
  const handleTomorrowButton = () => dispatch(goToNextDate());

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        className="w-8 px-0 font-mono"
        onClick={handleYesterdayButton}
        title="이전 날짜 ([)"
        aria-label="이전 날짜"
      >
        {PREV_DAY_BUTTON_TEXT}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="px-3"
        onClick={handleTodayButton}
        title="오늘로 이동 (T)"
      >
        {TODAY_BUTTON_TEXT}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-8 px-0 font-mono"
        onClick={handleTomorrowButton}
        title="다음 날짜 (])"
        aria-label="다음 날짜"
      >
        {NEXT_DAY_BUTTON_TEXT}
      </Button>
    </div>
  );
};
