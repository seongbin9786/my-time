import { minutesToTimeString } from '../../utils/DateUtil';
import { Log } from '../../utils/PaceUtil';

const DEFAULT_VALUE = {
  productive: 0,
  wasted: 0,
};

interface TimeSummaryProps {
  logs: Log[];
}

export const TimeSummary = ({ logs }: TimeSummaryProps) => {
  // 누적 값이므로 최종 값만 추출, 로그가 비어 있는 경우 추출 불가
  const { productive, wasted } = logs[logs.length - 1] || DEFAULT_VALUE;
  const difference = productive - wasted;

  // 로그가 없으면 비율을 둘 모두 0%로 표시
  const hasAnyLogs = productive + wasted > 0;
  const _ratio = Math.round((productive / (productive + wasted)) * 100);
  const productiveRatio = hasAnyLogs ? _ratio : 0;
  const wastedRatio = hasAnyLogs ? 100 - _ratio : 0;

  const isProductiveSurplus = difference >= 0;

  return (
    <div className="mt-3 flex items-center gap-5 text-[11px] text-slate-500">
      <span>
        현재 균형{' '}
        <strong
          className={isProductiveSurplus ? 'text-cyan-700' : 'text-orange-700'}
        >
          {isProductiveSurplus ? '+' : '−'}
          {minutesToTimeString(Math.abs(difference))}
        </strong>
      </span>
      <span>
        생산 <strong className="text-slate-800">{productiveRatio}%</strong>
      </span>
      <span>
        소비 <strong className="text-slate-800">{wastedRatio}%</strong>
      </span>
    </div>
  );
};
