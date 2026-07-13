import { ChangeEvent, useState } from 'react';

import { DayRatioBar } from '../components/charts/DayRatioBar';
import { ProductivePaceChart } from '../components/charts/ProductivePaceChart';
import { Card, CardContent } from '../components/ui/card';
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
    <Card className="editorial-analysis-card rounded-[3px] bg-[#f8efe2]/90">
      <CardContent className="p-4 xl:p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#66715d]">
              Figure 02
            </p>
            <h3 className="mt-1 whitespace-nowrap font-serif text-xl tracking-[-0.025em]">
              몰입의 밀도
            </h3>
          </div>
          <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#807468]">
            목표
            <Input
              className="h-7 w-14 px-2 text-center font-mono text-[11px]"
              value={targetPace}
              onChange={updateTargetPace}
              inputMode="numeric"
              aria-label="목표 생산 페이스"
            />
          </label>
        </div>

        <DayRatioBar logs={logsForCharts} />
        <div className="mt-2 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8b7e71]">
          <span>생산</span>
          <span>하루의 방향 분포</span>
          <span>소비</span>
        </div>

        <div className="mt-1 h-[190px]">
          <ProductivePaceChart
            data={logsForCharts}
            totalAvg={0}
            targetPace={targetPace}
            todayAvg={logsForCharts.length ? avgPaceOf(logsForCharts) : 0}
          />
        </div>
        <p className="mt-1 border-t border-[#d9cdbd] pt-2 text-[9px] leading-relaxed text-[#8b7e71]">
          선이 높을수록 한 시간 안에 확보한 생산 시간이 많습니다. 목표선은 직접
          조정할 수 있습니다.
        </p>
      </CardContent>
    </Card>
  );
};
