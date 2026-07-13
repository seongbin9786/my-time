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
    <div className="mr-2 flex border border-black">
      <Button
        variant="ghost"
        size="sm"
        className="border-0 border-r border-black"
        onClick={handleYesterdayButton}
        aria-label="이전 날짜"
      >
        {PREV_DAY_BUTTON_TEXT}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="border-0 border-r border-black"
        onClick={handleTodayButton}
      >
        {TODAY_BUTTON_TEXT}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="border-0"
        onClick={handleTomorrowButton}
        aria-label="다음 날짜"
      >
        {NEXT_DAY_BUTTON_TEXT}
      </Button>
    </div>
  );
};
