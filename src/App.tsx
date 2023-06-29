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
  <div
    style={{
      height: '45vh',
    }}
  >
    {props.children}
  </div>
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
    <div
      style={{
        display: 'grid',
        width: '95vw',
        height: '95vh',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
      }}
    >
      <TextLogContainer onLogUpdate={setRawLogs} />
      <Container>
        <div style={{ height: '100%' }}>
          <TimeSummary logs={logsForCharts} />
          <h1>[초과 휴식 시간]</h1>
          <AvailableRestTimeChart logs={logsForCharts} />
        </div>
      </Container>
      <Container>
        <h1>[생산 페이스]</h1>
        <div>
          <span>목표 페이스 설정: </span>
          <input value={targetPace} onChange={updateTargetPace} />
        </div>
        <ProductivePaceChart
          data={logsForCharts}
          totalAvg={0}
          targetPace={targetPace}
          todayAvg={avgPaceOf(logsForCharts)}
        />
      </Container>
    </div>
  );
};
