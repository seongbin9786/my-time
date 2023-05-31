import { createSlice } from '@reduxjs/toolkit';

import {
  getDateStringDayAfter,
  getDateStringDayBefore,
  getTodayString,
} from '../utils/DateUtil';

export type CurrentDateState = string;

const initialState: CurrentDateState = getTodayString(); // 오늘 날짜 반환.

export const currentDateSlice = createSlice({
  name: 'currentDate',
  initialState,
  reducers: {
    // 기존 함수 재활용. return문 사용. Immer 미사용.
    goToToday: getTodayString,
    goToPrevDate: getDateStringDayBefore,
    goToNextDate: getDateStringDayAfter,
  },
});

// Action creators are generated for each case reducer function
export const {
  actions: { goToToday, goToPrevDate, goToNextDate },
  reducer: currentDateReducer,
} = currentDateSlice;
