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
  <div className="flex h-full min-h-0 flex-col gap-4">
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
        Balance
      </p>
      <h2 className="mt-1 text-base font-semibold text-slate-950">
        누적 시간 밸런스
      </h2>
      <TimeSummary logs={logsForCharts} />
    </div>
    <div className="min-h-0 flex-1">
      <AvailableRestTimeChart logs={logsForCharts} />
    </div>
  </div>
);
