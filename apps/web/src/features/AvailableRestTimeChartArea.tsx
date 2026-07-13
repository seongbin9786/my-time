import { AvailableRestTimeChart } from '../components/charts/AvailableRestTimeChart';
import { TimeSummary } from '../components/texts/TimeSummary';
import { Card, CardContent } from '../components/ui/card';
import { Log } from '../utils/PaceUtil';

/**
 * AvailableRestTime 차트 + 같이 표시 될 시간 정보를 포함하는 영역
 */
export const Area_AvailableRestTimeChart = ({
  logsForCharts,
}: {
  logsForCharts: Log[];
}) => (
  <Card className="editorial-analysis-card rounded-[3px] bg-[#f8efe2]/90">
    <CardContent className="p-4 xl:p-5">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#a64f38]">
            Figure 01
          </p>
          <h3 className="mt-1 font-serif text-xl tracking-[-0.025em]">
            회복 여력의 흐름
          </h3>
        </div>
        <p className="max-w-36 text-right text-[10px] leading-relaxed text-[#807468]">
          생산으로 확보한 시간과 소비로 사용한 시간의 균형
        </p>
      </div>
      <TimeSummary logs={logsForCharts} />
      <div className="mt-2 h-[205px]">
        <AvailableRestTimeChart logs={logsForCharts} />
      </div>
      <p className="mt-1 border-t border-[#d9cdbd] pt-2 text-[9px] leading-relaxed text-[#8b7e71]">
        0선 아래는 쉴 수 있는 시간이 남아 있음을, 위는 소비 시간이 앞섰음을
        뜻합니다.
      </p>
    </CardContent>
  </Card>
);
