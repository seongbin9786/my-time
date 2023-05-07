import { createRoot } from 'react-dom/client';

import { EXAMPLE_AVAILABLE_REST_TIME } from './assets/api/AvailableRestTimeData';
import { FLOW_EXAPLE_DATA, FLOW_EXAPLE_RATIO } from './assets/api/FlowData';
import { AvailableRestTimeChart } from './components/charts/AvailableRestTimeChart';
import { FlowStatusChart } from './components/charts/FlowStatusChart';

const App = () => (
  <div
    style={{
      display: 'flex',
    }}
  >
    <div
      style={{
        width: '50vh',
        height: '40vh',
      }}
    >
      <h1>[몰입 모니터링]</h1>
      <h2>"난도를 낮추면 더 재밌을 것 같다"</h2>
      <FlowStatusChart data={FLOW_EXAPLE_DATA} ratio={FLOW_EXAPLE_RATIO} />
    </div>
    <div
      style={{
        width: '50vh',
        height: '40vh',
      }}
    >
      <h1>[초과 휴식 시간]</h1>
      <AvailableRestTimeChart logs={EXAMPLE_AVAILABLE_REST_TIME} />
    </div>
  </div>
);

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
