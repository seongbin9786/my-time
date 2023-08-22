import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../store';
import { updateRawLog } from '../../store/logs';
import { StorageListener } from '../../utils/StorageListener';
import { DayNavigator } from '../days/DayNavigator';

const storageListener = new StorageListener();

export const TextLogContainer = () => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { currentDate, rawLogs } = useSelector(
    (state: RootState) => state.logs
  );
  const dispatch = useDispatch();
  const setRawLogs = (nextRawLog: string) => dispatch(updateRawLog(nextRawLog));

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // TODO: 이게 무슨 동작인지 확인하기
  // 최근에 닫았던 탭을 다시 살리는 경우, input value가 채워진 상태로 켜짐.
  // 강제로 value를 rawLog로 동기화시킴.
  // 최초 렌더링 직후에 자동으로 채워진 텍스트는 안 보이게 됨.
  const synchronizeInput = () => {
    if (inputRef.current) {
      inputRef.current.value = rawLogs;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextRawLog = e.target.value;
    setRawLogs(nextRawLog);
  };

  useEffect(() => {
    synchronizeInput();
    focusInput();
  }, []);

  // handleDateChange를 하지 말고, 여기서 return을 해서 cleanup을 하도록 하면 prevDate 만들 필요 없음.
  // https://legacy.reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
  useEffect(() => {
    storageListener.install(currentDate, setRawLogs);
    focusInput();
  }, [currentDate]);

  return (
    <div className="flex flex-col w-full col-span-2 gap-4 sm:h-full h-1/2">
      <div className="flex items-center justify-between">
        <h1 className="text-xs font-bold sm:text-sm">
          [기록지] ({currentDate})
        </h1>
        <DayNavigator />
      </div>

      <textarea
        className="w-full h-full mb-2 text-xs textarea textarea-bordered textarea-lg"
        value={rawLogs}
        ref={inputRef}
        onChange={handleChange}
      />
    </div>
  );
};
