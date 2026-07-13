import {
  Bell,
  Command,
  Database,
  Focus,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AuthHeader } from '../components/auth/AuthHeader';
import { ConflictDialog } from '../components/common/ConflictDialog';
import { DayNavigator } from '../components/days/DayNavigator';
import { TextLogContainer } from '../components/texts/TextLogContainer';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Area_AvailableRestTimeChart } from '../features/AvailableRestTimeChartArea';
import { Area_ProductivePaceChart } from '../features/ProductivePaceChartArea';
import {
  useRemainingTime,
  useRestNotification,
} from '../features/restNotification';
import { SoundSettingsDialog } from '../features/soundSettings';
import { ThemeSelector } from '../features/theme/ThemeSelector';
import { RootState } from '../store';
import { triggerCurrentDateFetch } from '../store/logs';
import { minutesToTimeString } from '../utils/DateUtil';

const DataManagementDialog = lazy(() =>
  import('../features/dataManagement/DataManagementDialog').then((module) => ({
    default: module.DataManagementDialog,
  })),
);

const Metric = ({
  eyebrow,
  value,
  detail,
}: {
  eyebrow: string;
  value: string;
  detail: string;
}) => (
  <Card className="min-h-32">
    <CardContent className="flex h-full flex-col justify-between p-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
        {eyebrow}
      </span>
      <strong className="mt-5 text-3xl font-medium tracking-[-0.05em]">
        {value}
      </strong>
      <span className="mt-1 text-xs text-neutral-500">{detail}</span>
    </CardContent>
  </Card>
);

export const LogWriterPage = () => {
  useRestNotification();
  const dispatch = useDispatch();
  const [isSoundSettingsOpen, setIsSoundSettingsOpen] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);

  const { currentDate, logsForCharts } = useSelector(
    (state: RootState) => state.logs,
  );
  const currentNotification = useSelector(
    (state: RootState) => state.restNotification.currentNotification,
  );
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const { remainingTime, isOvertime } = useRemainingTime(currentNotification);

  useEffect(() => {
    if (isAuthenticated) dispatch(triggerCurrentDateFetch());
  }, [dispatch, isAuthenticated]);

  const latest = logsForCharts.at(-1);
  const productive = latest?.productive ?? 0;
  const wasted = latest?.wasted ?? 0;
  const total = productive + wasted;
  const balance = productive - wasted;
  const averagePace = logsForCharts.length
    ? Math.round(
        logsForCharts.reduce((sum, log) => sum + log.pace, 0) /
          logsForCharts.length,
      )
    : 0;
  const metrics = {
    productive,
    wasted,
    balance,
    averagePace,
    ratio: total ? Math.round((productive / total) * 100) : 0,
    entries: Math.max(logsForCharts.length - 1, 0),
  };

  return (
    <div className="monochrome-shell min-h-screen bg-[#f3f3ef] text-black">
      <div className="mx-auto max-w-[1600px] px-6 py-5 xl:px-10">
        <header className="min-h-16 flex items-center justify-between border-y border-black py-3">
          <div className="flex items-center gap-5">
            <div className="text-lg font-black tracking-[-0.06em]">
              MY<span className="mx-1 font-light">/</span>COMMIT
            </div>
            <Badge>{currentDate}</Badge>
            <Badge className="hidden border-neutral-300 text-neutral-500 xl:inline-flex">
              desktop focus edition
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <DayNavigator />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSoundSettingsOpen(true)}
              title="알림음 설정"
              aria-label="알림음 설정"
            >
              <Bell size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDataManagementOpen(true)}
              title="데이터 관리"
              aria-label="데이터 관리"
            >
              <Database size={16} />
            </Button>
            <ThemeSelector />
            <AuthHeader />
          </div>
        </header>

        <section className="grid grid-cols-12 border-x border-b border-black">
          <div className="col-span-8 flex min-h-64 flex-col justify-between border-r border-black p-7 xl:p-10">
            <Badge className="w-fit bg-black text-white">
              Daily control surface
            </Badge>
            <div>
              <h1 className="max-w-4xl text-5xl font-medium leading-[0.9] tracking-[-0.075em] xl:text-7xl">
                오늘의 시간을
                <br />
                의도대로 남기세요.
              </h1>
              <div className="mt-7 flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500">
                <span>/ 입력 포커스</span>
                <span>⌥1 생산</span>
                <span>⌥2 소비</span>
                <span>⌘P 명령</span>
              </div>
            </div>
          </div>

          <div className="col-span-4 flex flex-col justify-between bg-black p-7 text-white xl:p-10">
            <div className="flex items-start justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                productive ratio
              </span>
              <Focus size={20} />
            </div>
            <div>
              <div className="text-7xl font-light tracking-[-0.08em] xl:text-8xl">
                {metrics.ratio}
                <span className="ml-1 text-2xl text-neutral-400">%</span>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-white/25 pt-4 text-xs">
                <span>{metrics.entries}개 구간 기록</span>
                {currentNotification ? (
                  <span
                    className={isOvertime ? 'text-white' : 'text-neutral-400'}
                  >
                    <Timer className="mr-1 inline" size={13} />
                    {isOvertime ? '휴식 초과' : '휴식 잔여'} {remainingTime}
                  </span>
                ) : (
                  <span className="text-neutral-500">휴식 타이머 없음</span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-4 gap-3">
          <Metric
            eyebrow="productive"
            value={minutesToTimeString(metrics.productive)}
            detail="오늘 생산 시간"
          />
          <Metric
            eyebrow="consumed"
            value={minutesToTimeString(metrics.wasted)}
            detail="오늘 소비 시간"
          />
          <Metric
            eyebrow={metrics.balance >= 0 ? 'secured' : 'overtime'}
            value={minutesToTimeString(Math.abs(metrics.balance))}
            detail={metrics.balance >= 0 ? '확보한 시간' : '초과한 시간'}
          />
          <Metric
            eyebrow="average pace"
            value={`${metrics.averagePace}`}
            detail="분 / 시간"
          />
        </section>

        <main className="mt-3 grid min-h-[680px] grid-cols-12 gap-3">
          <Card className="col-span-5 overflow-hidden">
            <CardHeader className="flex-row items-center justify-between border-b border-black/20">
              <div>
                <CardTitle className="text-base">활동 기록</CardTitle>
                <p className="mt-1 text-xs text-neutral-500">
                  생각의 흐름을 끊지 않고 바로 추가
                </p>
              </div>
              <Command size={18} />
            </CardHeader>
            <CardContent className="h-[calc(100%-81px)] p-5">
              <TextLogContainer />
            </CardContent>
          </Card>

          <div className="col-span-7 grid grid-rows-2 gap-3">
            <Card className="min-h-0 overflow-hidden">
              <CardHeader className="flex-row items-center justify-between border-b border-black/20 py-4">
                <div>
                  <CardTitle>시간 잔고</CardTitle>
                  <p className="mt-1 text-xs text-neutral-500">
                    생산 시간에서 소비 시간을 차감한 흐름
                  </p>
                </div>
                <TrendingUp size={17} />
              </CardHeader>
              <CardContent className="h-[calc(100%-73px)] p-4">
                <Area_AvailableRestTimeChart logsForCharts={logsForCharts} />
              </CardContent>
            </Card>

            <Card className="min-h-0 overflow-hidden">
              <CardHeader className="border-b border-black/20 py-4">
                <CardTitle>생산 페이스</CardTitle>
                <p className="mt-1 text-xs text-neutral-500">
                  목표 대비 시간당 생산 분량
                </p>
              </CardHeader>
              <CardContent className="h-[calc(100%-73px)] p-4">
                <Area_ProductivePaceChart logsForCharts={logsForCharts} />
              </CardContent>
            </Card>
          </div>
        </main>

        <footer className="mt-3 flex items-center justify-between border-t border-black py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500">
          <span>Focus edition · proposal 03 / 05</span>
          <span>mouse optional · keyboard ready</span>
        </footer>
      </div>

      <SoundSettingsDialog
        isOpen={isSoundSettingsOpen}
        onClose={() => setIsSoundSettingsOpen(false)}
      />
      {isDataManagementOpen && (
        <Suspense
          fallback={
            <div className="modal modal-open modal-bottom sm:modal-middle">
              <div className="modal-box flex h-40 w-full max-w-2xl items-center justify-center">
                <span className="loading loading-spinner loading-md" />
              </div>
            </div>
          }
        >
          <DataManagementDialog
            isOpen={isDataManagementOpen}
            onClose={() => setIsDataManagementOpen(false)}
          />
        </Suspense>
      )}
      <ConflictDialog />
    </div>
  );
};
