import React, { useEffect, useMemo, useState } from 'react';

import {
  getDateStringDayAfter,
  getDateStringDayBefore,
  getTodayString,
} from '../../utils/DateUtil';
import { loadFromStorage, saveToStorage } from '../../utils/Storage';
import { convertTimeFormat } from '../../utils/TimeFormatConverter';

/**
 * 다른 탭에서 발생한 storage 이벤트를 받아 실시간 최신 값으로 갱신
 */
const listneOnChangesFromAnotherTab = (
  currentDate: string,
  setRawLog: (log: string) => void
) => {
  window.addEventListener('storage', (e: StorageEvent) => {
    const { key, newValue } = e;
    // 값 변경 case가 아닌 경우
    if (!key || !newValue) {
      return;
    }
    // 보고 있는 날짜일 때만 갱신
    if (key === currentDate) {
      setRawLog(newValue);
    }
  });
};

interface TextLogContainerProps {
  onLogUpdate: (result: string) => void;
}

export const TextLogContainer = ({ onLogUpdate }: TextLogContainerProps) => {
  const [currentDate, setCurrentDate] = useState(getTodayString());
  const [rawLog, setRawLog] = useState(loadFromStorage(currentDate));
  const formatted = useMemo(() => {
    // memoize
    try {
      const result = convertTimeFormat(rawLog);
      onLogUpdate(result);
      return result;
    } catch (e) {
      console.log(e);
    }
    return 'error!';
  }, [rawLog]);

  const goToDate = (dateProvider: (currentDate: string) => string) => {
    saveToStorage(currentDate, rawLog);

    const targetDate = dateProvider(currentDate);
    const targetLog = loadFromStorage(targetDate);
    setCurrentDate(targetDate);
    setRawLog(targetLog);
  };

  const goToToday = () => goToDate(getTodayString);
  const goToPrevDate = () => goToDate(getDateStringDayBefore);
  const goToNextDate = () => goToDate(getDateStringDayAfter);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextRawLog = e.target.value;
    setRawLog(nextRawLog);
    saveToStorage(currentDate, nextRawLog);
  };

  useEffect(() => {
    listneOnChangesFromAnotherTab(currentDate, setRawLog);
  }, []);

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
        <div>
          <button onClick={goToPrevDate}>
            <span style={{ fontSize: 32 }}>←</span>
          </button>
          <button onClick={goToToday}>
            <span style={{ fontSize: 28 }}>오늘</span>
          </button>
          <button onClick={goToNextDate}>
            <span style={{ fontSize: 32 }}>→</span>
          </button>
        </div>
      </div>
      <textarea
        style={{
          width: '100%',
          height: '40%',
          fontSize: 16,
        }}
        value={rawLog}
        onChange={handleChange}
      />
      <textarea
        style={{
          width: '100%',
          height: '40%',
          fontSize: 16,
        }}
        value={formatted}
        disabled
      />
    </div>
  );
};
