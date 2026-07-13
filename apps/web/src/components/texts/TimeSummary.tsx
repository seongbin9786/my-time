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
  const colorClass = isProductiveSurplus ? 'text-[#56624f]' : 'text-[#a64f38]';

  return (
    <div className="grid grid-cols-[1.25fr_1fr_1fr] gap-3 border-y border-[#d5c8b7] py-3">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8c7f71]">
          오늘의 {label}
        </p>
        <p
          className={`mt-1 font-serif text-[28px] leading-none tracking-[-0.04em] ${colorClass}`}
        >
          {minutesToTimeString(Math.abs(difference))}
        </p>
      </div>
      <div className="border-l border-[#d5c8b7] pl-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#75806d]">
          생산 · {productiveRatio}%
        </p>
        <p className="mt-1 font-serif text-lg text-[#424b3d]">
          {minutesToTimeString(productive)}
        </p>
      </div>
      <div className="border-l border-[#d5c8b7] pl-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#a65c49]">
          소비 · {wastedRatio}%
        </p>
        <p className="mt-1 font-serif text-lg text-[#804331]">
          {minutesToTimeString(wasted)}
        </p>
      </div>
    </div>
  );
};
