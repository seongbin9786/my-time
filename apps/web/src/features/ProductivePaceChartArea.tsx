import { ChangeEvent, useState } from 'react';

import { DayRatioBar } from '../components/charts/DayRatioBar';
import { ProductivePaceChart } from '../components/charts/ProductivePaceChart';
import { Badge } from '../components/ui/badge';
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

  const todayAverage = logsForCharts.length ? avgPaceOf(logsForCharts) : 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-[#202621] px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#eef3ee]">
              /05 Flow velocity
            </h2>
            <p className="mt-1 font-mono text-[9px] text-[#606961]">
              시간당 생산 분량과 목표선 비교
            </p>
          </div>
          <Badge variant={todayAverage >= targetPace ? 'success' : 'warning'}>
            Avg {todayAverage} min/h
          </Badge>
        </div>
        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.12em] text-[#626b63]">
            <span>Daily allocation</span>
            <label className="flex items-center gap-2">
              Target
              <Input
                className="h-7 w-14 px-2 text-center text-[10px]"
                type="number"
                min="0"
                max="60"
                value={targetPace}
                onChange={updateTargetPace}
                aria-label="목표 생산 페이스"
              />
            </label>
          </div>
          <DayRatioBar logs={logsForCharts} />
        </div>
      </div>
      <div className="min-h-0 flex-1 p-2 pt-3">
        <ProductivePaceChart
          data={logsForCharts}
          targetPace={targetPace}
          todayAvg={todayAverage}
        />
      </div>
    </div>
  );
};
