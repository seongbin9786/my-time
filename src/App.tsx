import { PropsWithChildren } from 'react';

import { EXAMPLE_AVAILABLE_REST_TIME } from './assets/api/AvailableRestTimeData';
import { FLOW_EXAPLE_DATA, FLOW_EXAPLE_RATIO } from './assets/api/FlowData';
import { PLAN_BURNDOWN_DATA } from './assets/api/PlanBurdownData';
import { EXAMPLE_PRODUCTIVE_PACE_DATA } from './assets/api/ProductivePaceData';
import { AvailableRestTimeChart } from './components/charts/AvailableRestTimeChart';
import { FlowStatusChart } from './components/charts/FlowStatusChart';
import { PlanBurndownChart } from './components/charts/PlanBurndownChart';
import { ProductivePaceChart } from './components/charts/ProductivePaceChart';

const Container = (props: PropsWithChildren) => (
  <div
    style={{
      height: '45vh',
    }}
  >
    {props.children}
  </div>
);

export const App = () => (
  <div
    style={{
      display: 'grid',
      width: '95vw',
      height: '95vh',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
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
    <Container>
      <h1>[계획 달성률]</h1>
      <PlanBurndownChart data={PLAN_BURNDOWN_DATA} />
    </Container>
  </div>
);
