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
  // h-full은 flex 구역 크기 설정 때문에 존재
  <div className="flex flex-col gap-2 h-1/2 sm:h-full">
    <div className="flex flex-col h-full">
      <div className="h-20">
        <h1 className="text-sm font-bold">[초과 휴식 시간]</h1>
        <TimeSummary logs={logsForCharts} />
      </div>
      <div className="h-full">
        <AvailableRestTimeChart logs={logsForCharts} />
      </div>
    </div>
  </div>
);
