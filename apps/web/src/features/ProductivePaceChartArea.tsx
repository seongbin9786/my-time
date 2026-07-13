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
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="grid grid-cols-[1fr_auto] items-end gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
            Velocity
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-950">
            생산 페이스 흐름
          </h2>
          <div className="mt-3">
            <DayRatioBar logs={logsForCharts} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
          목표 페이스
          <span className="relative">
            <Input
              type="number"
              min={1}
              max={120}
              className="h-8 w-[76px] pr-7 text-right font-mono text-xs"
              value={targetPace}
              onChange={updateTargetPace}
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
              m/h
            </span>
          </span>
        </label>
      </div>
      <div className="min-h-0 flex-1">
        <ProductivePaceChart
          data={logsForCharts}
          targetPace={targetPace}
          todayAvg={avgPaceOf(logsForCharts)}
        />
      </div>
    </div>
  );
};
