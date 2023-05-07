import { PropsWithChildren } from 'react';

import { EXAMPLE_AVAILABLE_REST_TIME } from './assets/api/AvailableRestTimeData';
import { FLOW_EXAPLE_DATA, FLOW_EXAPLE_RATIO } from './assets/api/FlowData';
import { EXAMPLE_PRODUCTIVE_PACE_DATA } from './assets/api/ProductivePaceData';
import { AvailableRestTimeChart } from './components/charts/AvailableRestTimeChart';
import { FlowStatusChart } from './components/charts/FlowStatusChart';
import { ProductivePaceChart } from './components/charts/ProductivePaceChart';

const Container = (props: PropsWithChildren) => (
  <div
    style={{
      width: '50vh',
      height: '40vh',
    }}
  >
    {props.children}
  </div>
);

export const App = () => (
  <div
    style={{
      display: 'flex',
    }}
  >
    <Container>
      <h1>[몰입 모니터링]</h1>
      <h2>"난도를 낮추면 더 재밌을 것 같다"</h2>
      <FlowStatusChart data={FLOW_EXAPLE_DATA} ratio={FLOW_EXAPLE_RATIO} />
    </Container>
    <Container>
      <h1>[초과 휴식 시간]</h1>
      <AvailableRestTimeChart logs={EXAMPLE_AVAILABLE_REST_TIME} />
    </Container>
    <Container>
      <h1>[생산 페이스]</h1>
      <ProductivePaceChart
        data={EXAMPLE_PRODUCTIVE_PACE_DATA}
        totalAvg={30}
        todayAvg={28}
      />
    </Container>
  </div>
);
