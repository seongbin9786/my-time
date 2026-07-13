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
  const label = isProductiveSurplus ? '확보 시간' : '초과 시간';
  return (
    <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/55 p-3">
      <span className="flex flex-col">
        <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#28362c]/40">
          {label}
        </span>
        <strong className="mt-1 text-sm font-semibold">
          {minutesToTimeString(Math.abs(difference))}
        </strong>
      </span>
      <span className="flex flex-col border-l border-[#28362c]/10 pl-3">
        <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#718466]">
          생산 · {productiveRatio}%
        </span>
        <strong className="mt-1 text-sm font-semibold">
          {minutesToTimeString(productive)}
        </strong>
      </span>
      <span className="flex flex-col border-l border-[#28362c]/10 pl-3">
        <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#b7674d]">
          소비 · {wastedRatio}%
        </span>
        <strong className="mt-1 text-sm font-semibold">
          {minutesToTimeString(wasted)}
        </strong>
      </span>
    </div>
  );
};
