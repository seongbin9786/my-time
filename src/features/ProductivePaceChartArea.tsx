import { ChangeEvent, useState } from 'react';

import { ProductivePaceChart } from '../components/charts/ProductivePaceChart';
import { avgPaceOf, Log } from '../utils/PaceUtil';
import { loadFromStorage, saveToStorage } from '../utils/Storage';

// 유틸 함수
const intOrZero = (x: string) => Number.parseInt(x) ?? 0;

const STORAGE_KEY_TARGET_PACE = 'targetPace';
const storedTargetPace = loadFromStorage(STORAGE_KEY_TARGET_PACE);
const initialTargetPace = intOrZero(storedTargetPace); // 최초 방문 시 값이 아예 없는 경우.

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
    const nextPace = intOrZero(e.target.value);
    setTargetPace(nextPace);
    saveToStorage(STORAGE_KEY_TARGET_PACE, nextPace + '');
  };

  return (
    // h-full은 flex 구역 크기 설정 때문에 존재
    <div className="flex flex-col gap-2 h-1/2 sm:h-full">
      <div>
        <h1 className="text-sm font-bold">[생산 페이스]</h1>
        <span className="text-xs">목표 페이스 설정: </span>
        <input
          className="input input-bordered input-xs"
          value={targetPace}
          onChange={updateTargetPace}
        />
      </div>
      <div className="h-full">
        <ProductivePaceChart
          data={logsForCharts}
          totalAvg={0}
          targetPace={targetPace}
          todayAvg={avgPaceOf(logsForCharts)}
        />
      </div>
    </div>
  );
};
