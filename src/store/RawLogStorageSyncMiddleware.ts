import type { AnyAction, TypedStartListening } from '@reduxjs/toolkit';
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';

import {
  getDateStringDayAfter,
  getDateStringDayBefore,
  getTodayString,
} from '../utils/DateUtil';
import { loadFromStorage, saveToStorage } from '../utils/Storage';
import type { AppDispatch, RootState } from '.';
import {
  goToNextDate,
  goToPrevDate,
  goToToday,
  LogSlice,
  updateRawLog,
} from './logs';

const nextDateOfAction = (action: AnyAction, currentDate: string) => {
  // match 코드 문서: https://github.com/reduxjs/redux-toolkit/issues/237#issuecomment-578057024
  if (LogSlice.actions.goToPrevDate.match(action)) {
    return getDateStringDayBefore(currentDate);
  }
  if (LogSlice.actions.goToNextDate.match(action)) {
    return getDateStringDayAfter(currentDate);
  }
  return getTodayString();
};

/**
 * RawLog를 Storage에 저장하고 불러오는 Middleware
 * 부작용이므로 Middleware에서 구현
 */
export const RawLogStorageSyncMiddleware = createListenerMiddleware();

// 굳이 필요한 Type 정의...
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;

const startAppListening =
  RawLogStorageSyncMiddleware.startListening as AppStartListening;

// localstorage에 저장
startAppListening({
  actionCreator: updateRawLog,
  effect: (action, middleareAPI) => {
    const { currentDate } = middleareAPI.getState().logs;
    const nextRawLogs = action.payload;
    saveToStorage(currentDate, nextRawLogs);
    console.log(`[middleware] saved at ${currentDate}`);
  },
});

// localstorage에서 불러오기
startAppListening({
  matcher: isAnyOf(goToToday, goToPrevDate, goToNextDate),
  effect: (action, middleareAPI) => {
    const { currentDate } = middleareAPI.getState().logs;
    const nextDate: string = nextDateOfAction(action, currentDate);
    const RawLogForNextDate = loadFromStorage(nextDate);
    middleareAPI.dispatch(updateRawLog(RawLogForNextDate));
    console.log(`[middleware] loaded, dispatched update at ${nextDate}`);
  },
});
