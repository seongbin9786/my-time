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
  const calculatedProductiveRatio = Math.round(
    (productive / (productive + wasted)) * 100,
  );
  const productiveRatio = hasAnyLogs ? calculatedProductiveRatio : 0;
  const wastedRatio = hasAnyLogs ? 100 - calculatedProductiveRatio : 0;

  const isProductiveSurplus = difference >= 0;
  const label = isProductiveSurplus ? '확보 시간' : '초과 시간';
  const colorClass = isProductiveSurplus ? 'text-[#c9ff3d]' : 'text-[#ff7b5c]';

  return (
    <div className="space-y-3 font-mono">
      <div className="border border-[#2a302b] bg-[#070a08] p-3">
        <div className="mb-2 flex items-center justify-between text-[9px] uppercase tracking-[0.16em] text-[#667067]">
          <span>Net time bank</span>
          <span className={colorClass}>{isProductiveSurplus ? '▲' : '▼'}</span>
        </div>
        <div className={`text-2xl font-bold tracking-[-0.05em] ${colorClass}`}>
          {minutesToTimeString(Math.abs(difference))}
        </div>
        <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#737c74]">
          {label}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="border border-[#2a302b] bg-[#0d110e] p-2.5">
          <span className="block text-[8px] uppercase tracking-[0.16em] text-[#657066]">
            Production
          </span>
          <strong className="mt-1 block text-sm text-[#c9ff3d]">
            {minutesToTimeString(productive)}
          </strong>
          <span className="text-[9px] text-[#818a82]">{productiveRatio}%</span>
        </div>
        <div className="border border-[#2a302b] bg-[#0d110e] p-2.5">
          <span className="block text-[8px] uppercase tracking-[0.16em] text-[#657066]">
            Consumption
          </span>
          <strong className="mt-1 block text-sm text-[#ffb52e]">
            {minutesToTimeString(wasted)}
          </strong>
          <span className="text-[9px] text-[#818a82]">{wastedRatio}%</span>
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex justify-between text-[8px] uppercase tracking-[0.12em] text-[#606960]">
          <span>Allocation</span>
          <span>
            {productiveRatio} / {wastedRatio}
          </span>
        </div>
        <div className="flex h-1.5 overflow-hidden bg-[#232824]">
          <div
            className="bg-[#c9ff3d] transition-[width] duration-500"
            style={{ width: `${productiveRatio}%` }}
          />
          <div
            className="bg-[#ffb52e] transition-[width] duration-500"
            style={{ width: `${wastedRatio}%` }}
          />
        </div>
      </div>
    </div>
  );
};
