import { AvailableRestTimeChart } from '../components/charts/AvailableRestTimeChart';
import { TimeSummary } from '../components/texts/TimeSummary';
import { Log } from '../utils/PaceUtil';

/**
 * AvailableRestTime 차트 + 같이 표시 될 시간 정보를 포함하는 영역
 */
export const Area_AvailableRestTimeChart = ({
  logsForCharts,
}: {
  logsForCharts: Log[];
}) => (
  <div className="flex h-full min-h-0 flex-col gap-3">
    <div>
      <TimeSummary logs={logsForCharts} />
    </div>
    <div className="min-h-0 flex-1">
      <AvailableRestTimeChart logs={logsForCharts} />
    </div>
  </div>
);
