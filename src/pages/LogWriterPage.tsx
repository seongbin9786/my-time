import { useSelector } from 'react-redux';

import { TextLogContainer } from '../components/texts/TextLogContainer';
import { Area_AvailableRestTimeChart } from '../features/AvailableRestTimeChartArea';
import { Area_ProductivePaceChart } from '../features/ProductivePaceChartArea';
import { RootState } from '../store';

export const LogWriterPage = () => {
  // 바로 다음 컴포넌트이니 직접 주입, redux 의존성 낮추기 위함.
  const logsForCharts = useSelector(
    (state: RootState) => state.logs.logsForCharts
  );

  return (
    <div className="min-w-[400px] h-screen max-w-screen-xl grid-cols-2 grid-rows-2 p-4 mx-auto my-0 sm:grid">
      <TextLogContainer />
      <Area_AvailableRestTimeChart logsForCharts={logsForCharts} />
      <Area_ProductivePaceChart logsForCharts={logsForCharts} />
    </div>
  );
};
