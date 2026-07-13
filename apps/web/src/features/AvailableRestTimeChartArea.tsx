import { AvailableRestTimeChart } from '../components/charts/AvailableRestTimeChart';
import { Badge } from '../components/ui/badge';
import { Log } from '../utils/PaceUtil';

/**
 * AvailableRestTime 차트 + 같이 표시 될 시간 정보를 포함하는 영역
 */
export const Area_AvailableRestTimeChart = ({
  logsForCharts,
}: {
  logsForCharts: Log[];
}) => {
  const latest = logsForCharts[logsForCharts.length - 1];
  const restDelta = latest ? latest.wasted - latest.productive : 0;
  const isOverBudget = restDelta > 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-start justify-between border-b border-[#202621] px-4 py-3">
        <div>
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#eef3ee]">
            /04 Rest balance
          </h2>
          <p className="mt-1 font-mono text-[9px] text-[#606961]">
            생산 시간 대비 소비 시간의 누적 편차
          </p>
        </div>
        <Badge variant={isOverBudget ? 'danger' : 'success'}>
          {latest ? `${restDelta > 0 ? '+' : ''}${restDelta} min` : 'No signal'}
        </Badge>
      </div>
      <div className="min-h-0 flex-1 p-2 pt-3">
        <AvailableRestTimeChart logs={logsForCharts} />
      </div>
      <div className="flex shrink-0 items-center gap-4 border-t border-[#202621] px-4 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-[#687169]">
        <span className="flex items-center gap-1.5">
          <i className="h-1.5 w-1.5 bg-[#c9ff3d]" /> reserve
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-1.5 w-1.5 bg-[#ff6b4a]" /> over budget
        </span>
      </div>
    </div>
  );
};
