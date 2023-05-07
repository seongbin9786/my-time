import { createRoot } from 'react-dom/client';

import { FLOW_EXAPLE_DATA, FLOW_EXAPLE_RATIO } from './assets/api/FlowData';
import { FlowStatusChart } from './components/charts/FlowStatusChart';

const App = () => (
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
);

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
