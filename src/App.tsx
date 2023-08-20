import './App.css';

import { ChangeEvent, PropsWithChildren, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { AvailableRestTimeChart } from './components/charts/AvailableRestTimeChart';
import { ProductivePaceChart } from './components/charts/ProductivePaceChart';
import { TextLogContainer } from './components/texts/TextLogContainer';
import { TimeSummary } from './components/texts/TimeSummary';
import { RootState } from './store';
import { createLogsFromString } from './utils/LogConverter';
import { avgPaceOf } from './utils/PaceUtil';
import { loadFromStorage, saveToStorage } from './utils/Storage';

const installOnWindowFocusHandler = (handler: () => void) => {
  window.addEventListener('visibilitychange', handler);
};

const removeOnWindowFocusHandler = (handler: () => void) => {
  window.removeEventListener('visibilitychange', handler);
};

const Container = (props: PropsWithChildren) => (
  <div className="flex flex-col gap-2 h-1/2 sm:h-full">{props.children}</div>
);

const TARGET_PACE = 'targetPace';
const loadedTargetPace = Number.parseInt(loadFromStorage(TARGET_PACE)) || 0; // 최초 방문 시 값이 아예 없는 경우.

export const App = () => {
  const [targetPace, setTargetPace] = useState(loadedTargetPace);
  const [rawLogs, setRawLogs] = useState('');
  const currentDate = useSelector((state: RootState) => state.currentDate);
  const logsForCharts = createLogsFromString(rawLogs, currentDate);

  const updateTargetPace = (e: ChangeEvent<HTMLInputElement>) => {
    const nextPace = Number.parseInt(e.target.value) || 0;
    setTargetPace(nextPace);
    saveToStorage(TARGET_PACE, nextPace + '');
  };

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState !== 'visible') {
        return;
      }
      setRawLogs((rawLogs) => rawLogs + ' '); // 어차피 trim 되어 처리됨
    };
    installOnWindowFocusHandler(handler);
    return () => removeOnWindowFocusHandler(handler);
  }, []);

  return (
    <div className="min-w-[400px] h-screen max-w-screen-xl grid-cols-2 grid-rows-2 p-4 mx-auto my-0 sm:grid">
      <TextLogContainer onLogUpdate={setRawLogs} />
      <Container>
        <div className="flex flex-col h-full">
          <div className="h-20">
            <h1 className="text-sm font-bold">[초과 휴식 시간]</h1>
            <TimeSummary logs={logsForCharts} />
          </div>
          <div className="h-full">
            <AvailableRestTimeChart logs={logsForCharts} />
          </div>
        </div>
      </Container>
      <Container>
        <div>
          <h1 className="text-sm font-bold">[생산 페이스]</h1>
          <span className="text-xs">목표 페이스 설정: </span>
          <input
            className="input input-bordered input-xs"
            value={targetPace}
            onChange={updateTargetPace}
          />
        </div>
        <div className="h-full">
          <ProductivePaceChart
            data={logsForCharts}
            totalAvg={0}
            targetPace={targetPace}
            todayAvg={avgPaceOf(logsForCharts)}
          />
        </div>
      </Container>
    </div>
  );
};
