import { PropsWithChildren, useState } from 'react';

import { avgPaceOf } from './assets/api/ProductivePaceData';
import { AvailableRestTimeChart } from './components/charts/AvailableRestTimeChart';
import { ProductivePaceChart } from './components/charts/ProductivePaceChart';
import { TextLogContainer } from './components/texts/TextLogContainer';
import { transformLogsToChartFormat } from './utils/ChartFormatTransformer';

const Container = (props: PropsWithChildren) => (
  <div
    style={{
      height: '45vh',
    }}
  >
    {props.children}
  </div>
);

export const App = () => {
  const [rawLog, setRawLog] = useState('');
  const actualLog = (() => {
    try {
      return transformLogsToChartFormat(rawLog);
    } catch {
      return [];
    }
  })();

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
      <TextLogContainer onLogUpdate={setRawLog} />
      <Container>
        <h1>[초과 휴식 시간]</h1>
        <AvailableRestTimeChart logs={actualLog} />
      </Container>
      <Container>
        <h1>[생산 페이스]</h1>
        <ProductivePaceChart
          data={actualLog}
          totalAvg={35}
          todayAvg={avgPaceOf(actualLog)}
        />
      </Container>
    </div>
  );
};
