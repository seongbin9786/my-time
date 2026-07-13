import { ChangeEvent, useState } from 'react';

import { DayRatioBar } from '../components/charts/DayRatioBar';
import { ProductivePaceChart } from '../components/charts/ProductivePaceChart';
import { Input } from '../components/ui/input';
import { DEFAULT_PACE_IN_MIN } from '../policies/userConfig';
import { avgPaceOf, Log } from '../utils/PaceUtil';
import { loadFromStorage, saveToStorage } from '../utils/StorageUtil';
import { parseOrDefault } from '../utils/StringUtil';

const STORAGE_KEY_TARGET_PACE = 'targetPace';
const storedTargetPace = loadFromStorage(STORAGE_KEY_TARGET_PACE).content;
const initialTargetPace = parseOrDefault(storedTargetPace, DEFAULT_PACE_IN_MIN);

/**
 * ProductivePace 차트 + 입력 폼을 포함한 영역
 */
export const Area_ProductivePaceChart = ({
  logsForCharts,
}: {
  logsForCharts: Log[];
}) => {
  const [targetPace, setTargetPace] = useState(initialTargetPace);

  const updateTargetPace = (e: ChangeEvent<HTMLInputElement>) => {
    const nextPace = Number.parseInt(e.target.value, 10);
    setTargetPace(nextPace);
    saveToStorage(STORAGE_KEY_TARGET_PACE, nextPace + '');
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="grid grid-cols-[1fr_auto] items-end gap-5">
        <div>
          <div className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-500">
            <span>소비</span>
            <span>생산</span>
          </div>
          <DayRatioBar logs={logsForCharts} />
        </div>
        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-500">
            목표
          </span>
          <Input
            className="h-8 w-16 px-2 font-mono text-xs"
            value={targetPace}
            onChange={updateTargetPace}
            inputMode="numeric"
            aria-label="목표 생산 페이스"
          />
        </label>
      </div>
      <div className="min-h-0 flex-1">
        <ProductivePaceChart
          data={logsForCharts}
          targetPace={targetPace}
          todayAvg={logsForCharts.length ? avgPaceOf(logsForCharts) : 0}
        />
      </div>
    </div>
  );
};
