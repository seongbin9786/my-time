import { useDispatch } from 'react-redux';

import { goToNextDate, goToPrevDate, goToToday } from '../../store/currentDate';

const PREV_DAY_BUTTON_TEXT = '←';
const TODAY_BUTTON_TEXT = '오늘';
const NEXT_DAY_BUTTON_TEXT = '→';

export const DayNavigator = () => {
  const dispatch = useDispatch();
  const handleTodayButton = () => dispatch(goToToday());
  const handleYesterdayButton = () => dispatch(goToPrevDate());
  const handleTomorrowButton = () => dispatch(goToNextDate());

  return (
    <div>
      <button onClick={handleYesterdayButton}>
        <span style={{ fontSize: 32 }}>{PREV_DAY_BUTTON_TEXT}</span>
      </button>
      <button onClick={handleTodayButton}>
        <span style={{ fontSize: 28 }}>{TODAY_BUTTON_TEXT}</span>
      </button>
      <button onClick={handleTomorrowButton}>
        <span style={{ fontSize: 32 }}>{NEXT_DAY_BUTTON_TEXT}</span>
      </button>
    </div>
  );
};
