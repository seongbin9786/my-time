import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDispatch } from 'react-redux';

import { goToNextDate, goToPrevDate, goToToday } from '../../store/logs';
import { Button } from '../ui/button';

const TODAY_BUTTON_TEXT = '오늘';

export const DayNavigator = () => {
  const dispatch = useDispatch();
  const handleTodayButton = () => dispatch(goToToday());
  const handleYesterdayButton = () => dispatch(goToPrevDate());
  const handleTomorrowButton = () => dispatch(goToNextDate());

  return (
    <div className="flex items-center rounded-md border border-[#c9baa7] bg-[#f5ecdf]/80 p-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleYesterdayButton}
        aria-label="이전 날짜"
      >
        <ChevronLeft size={14} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 min-w-16 font-serif text-sm"
        onClick={handleTodayButton}
      >
        {TODAY_BUTTON_TEXT}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleTomorrowButton}
        aria-label="다음 날짜"
      >
        <ChevronRight size={14} />
      </Button>
    </div>
  );
};
