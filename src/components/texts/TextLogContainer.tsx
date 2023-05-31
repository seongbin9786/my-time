import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../store';
import { loadFromStorage, saveToStorage } from '../../utils/Storage';
import { DayNavigator } from '../days/DayNavigator';

/**
 * 다른 탭에서 발생한 storage 이벤트를 받아 실시간 최신 값으로 갱신
 */
const createRemoteChangeListener = (
  currentDate: string,
  setRawLog: (log: string) => void
) => {
  const listener = (e: StorageEvent) => {
    const { key, newValue } = e;
    // 값 변경 case가 아닌 경우
    if (!key || !newValue) {
      return;
    }
    // 보고 있는 날짜일 때만 갱신
    if (key === currentDate) {
      setRawLog(newValue);
    }
  };
  window.addEventListener('storage', listener);
  console.log('added new listener at ', currentDate);

  // 해당 리스너를 반환해야 삭제 가능
  return listener;
};

interface TextLogContainerProps {
  onLogUpdate: (result: string) => void;
}

export const TextLogContainer = ({ onLogUpdate }: TextLogContainerProps) => {
  // useState, useRef의 초기값은 함수인 경우 최초 1회만 실행하고 평가가 반복되지 않음.
  // 그 외의 경우는 평가는 하되 무시함. 매번 실행되는 이유는 인자이기 때문인 듯.
  // 참고: https://legacy.reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const prevDateRef = useRef<string | null>(null);
  const prevDate = prevDateRef.current;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentDate = useSelector((state: RootState) => state.currentDate);
  const [rawLog, setRawLog] = useState(() => loadFromStorage(currentDate));
  const listenerRef = useRef<(e: StorageEvent) => void>(() =>
    createRemoteChangeListener(currentDate, setRawLog)
  );

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

  const changeRemoteListenerForNewDate = (targetDate: string) => {
    console.log('removed old listener at ', targetDate);
    window.removeEventListener('storage', listenerRef.current);
    listenerRef.current = createRemoteChangeListener(targetDate, setRawLog);
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
    changeRemoteListenerForNewDate(currentDate);
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
    onLogUpdate(rawLog);
  }, []);

  // handleDateChange를 하지 말고, 여기서 return을 해서 cleanup을 하도록 하면 prevDate 만들 필요 없음.
  // https://legacy.reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
  useEffect(() => {
    handleDateChange();
    prevDateRef.current = currentDate; // 이전 날짜를 저장
  }, [currentDate]);

  return (
    <div
      style={{
        width: '100%',
        height: '45vh',
        gridColumn: '1 / span 2',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1>[기록지] ({currentDate})</h1>
        <DayNavigator />
      </div>

      <textarea
        style={{
          width: '100%',
          height: '85%',
          fontSize: 16,
        }}
        value={rawLog}
        ref={inputRef}
        onChange={handleChange}
      />
    </div>
  );
};
