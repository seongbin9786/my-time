import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../store';
import { loadFromStorage, saveToStorage } from '../../utils/Storage';
import { StorageListener } from '../../utils/StorageListener';
import { DayNavigator } from '../days/DayNavigator';

const storageListener = new StorageListener();

interface TextLogContainerProps {
  onLogUpdate: (result: string) => void;
}

export const TextLogContainer = ({ onLogUpdate }: TextLogContainerProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentDate = useSelector((state: RootState) => state.currentDate);
  const [prevDate, setPrevDate] = useState<string | null>(null);
  const [rawLog, setRawLog] = useState(() => loadFromStorage(currentDate));

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // 최근에 닫았던 탭을 다시 살리는 경우, input value가 채워진 상태로 켜짐.
  // 강제로 value를 rawLog로 동기화시킴.
  // 최초 렌더링 직후에 자동으로 채워진 텍스트는 안 보이게 됨.
  const synchronizeInput = () => {
    if (inputRef.current) {
      inputRef.current.value = rawLog;
    }
  };

  const handleDateChange = () => {
    if (prevDate) {
      // 첫 로딩일 경우 null
      saveToStorage(prevDate, rawLog);
    }
    const targetLog = loadFromStorage(currentDate);
    setRawLog(targetLog);
    onLogUpdate(targetLog);
    focusInput();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextRawLog = e.target.value;
    setRawLog(nextRawLog);
    onLogUpdate(nextRawLog);
    saveToStorage(currentDate, nextRawLog);
  };

  useEffect(() => {
    synchronizeInput();
    focusInput();
    onLogUpdate(rawLog); // 전역 상태에 대해 이 컴포넌트에서 localstorage로부터 얻어온 데이터를 갱신하는 역할
    // TODO: onLogUpdate를 제거하고 전역 상태로 놓는 게 깔끔할 듯? 당장 이 상태를 변경하는 건 이 컴포넌트 뿐이긴 함
  }, []);

  // handleDateChange를 하지 말고, 여기서 return을 해서 cleanup을 하도록 하면 prevDate 만들 필요 없음.
  // https://legacy.reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
  useEffect(() => {
    storageListener.install(currentDate, setRawLog);
    handleDateChange();

    setPrevDate(currentDate);
    // 이전 날짜를 저장
    // 첫 렌더링 시 이 useEffect를 호출함
    // currentDate가 동일한데, handleDateChange 이후에 호출되어야 불필요한 saveToStorage가 없을 듯
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
        value={rawLog}
        ref={inputRef}
        onChange={handleChange}
      />
    </div>
  );
};
