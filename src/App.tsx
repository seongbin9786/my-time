import './App.css';

import { useState } from 'react';
import { useSelector } from 'react-redux';

import { TextLogContainer } from './components/texts/TextLogContainer';
import { Area_AvailableRestTimeChart } from './features/AvailableRestTimeChartArea';
import { Area_ProductivePaceChart } from './features/ProductivePaceChartArea';
import { RootState } from './store';
import { createLogsFromString } from './utils/LogConverter';

export const App = () => {
  const [rawLogs, setRawLogs] = useState('');
  const currentDate = useSelector((state: RootState) => state.currentDate);
  const logsForCharts = createLogsFromString(rawLogs, currentDate);

  return (
    <div className="min-w-[400px] h-screen max-w-screen-xl grid-cols-2 grid-rows-2 p-4 mx-auto my-0 sm:grid">
      <TextLogContainer onLogUpdate={setRawLogs} />
      <Area_AvailableRestTimeChart logsForCharts={logsForCharts} />
      <Area_ProductivePaceChart logsForCharts={logsForCharts} />
    </div>
  );
};
