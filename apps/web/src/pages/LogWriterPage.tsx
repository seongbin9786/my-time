import {
  Bell,
  Coffee,
  Database,
  Leaf,
  Sparkles,
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

const MiniMetric = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'sage' | 'peach' | 'cream';
}) => {
  const toneClass = {
    sage: 'bg-[#dce6ce]',
    peach: 'bg-[#f8d2c4]',
    cream: 'bg-[#fffaf0]',
  }[tone];

  return (
    <div className={`rounded-3xl p-5 ${toneClass}`}>
      <span className="text-[11px] font-semibold text-[#28362c]/55">
        {label}
      </span>
      <strong className="mt-3 block text-2xl font-semibold tracking-[-0.04em]">
        {value}
      </strong>
    </div>
  );
};

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
  const productiveRatio = total ? Math.round((productive / total) * 100) : 0;
  const averagePace = logsForCharts.length
    ? Math.round(
        logsForCharts.reduce((sum, log) => sum + log.pace, 0) /
          logsForCharts.length,
      )
    : 0;

  return (
    <div className="calm-shell relative min-h-screen overflow-hidden bg-[#edf0e6] text-[#28362c]">
      <div className="calm-orb calm-orb-one" />
      <div className="calm-orb calm-orb-two" />

      <div className="relative z-10 mx-auto max-w-[1540px] px-6 py-6 xl:px-10">
        <header className="flex items-center justify-between rounded-full border border-[#28362c]/10 bg-[#fffdf6]/90 px-4 py-3 shadow-[0_12px_35px_rgba(53,61,46,0.06)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#28362c] text-[#fffdf6]">
              <Leaf size={17} />
            </span>
            <div>
              <div className="font-serif text-lg font-semibold tracking-[-0.03em]">
                my.commit
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#28362c]/45">
                calm work studio
              </div>
            </div>
            <Badge className="ml-3 hidden xl:inline-flex">{currentDate}</Badge>
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
              <Bell size={17} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDataManagementOpen(true)}
              title="데이터 관리"
              aria-label="데이터 관리"
            >
              <Database size={17} />
            </Button>
            <ThemeSelector />
            <AuthHeader />
          </div>
        </header>

        <section className="mt-5 grid grid-cols-12 gap-4">
          <Card className="col-span-8 overflow-hidden bg-[#fff3e8]">
            <CardContent className="flex h-full min-h-72 items-end justify-between p-8 xl:p-10">
              <div className="max-w-2xl">
                <Badge className="bg-[#f4a88f] text-[#40261e]">
                  <Sparkles className="mr-1.5" size={12} /> 오늘의 스튜디오
                </Badge>
                <h1 className="mt-7 font-serif text-5xl leading-[0.96] tracking-[-0.055em] xl:text-6xl">
                  서두르지 말고,
                  <br />
                  지금의 리듬을 남겨요.
                </h1>
                <p className="mt-5 max-w-lg text-sm leading-6 text-[#28362c]/60">
                  생산과 휴식을 빠르게 기록하고, 하루의 균형은 한눈에만
                  확인하세요. 기록은 가볍게, 흐름은 오래 유지하도록.
                </p>
              </div>
              <div className="mb-1 grid gap-2 text-right text-[11px] font-semibold text-[#28362c]/50">
                <span>/ 입력 시작</span>
                <span>⌥1 생산 기록</span>
                <span>⌥2 휴식 기록</span>
                <span>⌘P 모든 명령</span>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-4 overflow-hidden border-0 bg-[#2f4034] text-[#f8f4e8]">
            <CardContent className="flex h-full min-h-72 flex-col justify-between p-8">
              <div className="flex items-center justify-between">
                <Badge className="bg-white/10 text-white/75">오늘의 균형</Badge>
                <TrendingUp size={19} className="text-[#bfd2a8]" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-6xl font-semibold tracking-[-0.075em]">
                    {productiveRatio}
                    <span className="ml-1 text-xl font-normal text-white/45">
                      %
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-white/45">생산 시간 비율</p>
                </div>
                <div className="text-right text-xs leading-6 text-white/60">
                  <div>
                    {balance >= 0 ? '확보' : '초과'}{' '}
                    <strong className="text-white">
                      {minutesToTimeString(Math.abs(balance))}
                    </strong>
                  </div>
                  {currentNotification ? (
                    <div className={isOvertime ? 'text-[#f4a88f]' : ''}>
                      <Timer className="mr-1 inline" size={12} />
                      {isOvertime ? '휴식 초과' : '휴식 잔여'} {remainingTime}
                    </div>
                  ) : (
                    <div className="text-white/35">진행 중인 휴식 없음</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <main className="mt-4 grid min-h-[790px] grid-cols-12 gap-4">
          <Card className="col-span-5 row-span-2 overflow-hidden bg-[#fffdf6]/95">
            <CardHeader className="flex items-start justify-between border-b border-[#28362c]/10 p-7 pb-5">
              <div>
                <Badge className="mb-3">지금 기록</Badge>
                <CardTitle className="font-serif text-2xl">
                  무엇을 하고 있나요?
                </CardTitle>
                <p className="mt-1 text-xs text-[#28362c]/50">
                  입력 후에도 포커스가 유지돼 연속 기록 가능
                </p>
              </div>
              <span className="rounded-full bg-[#f8d2c4] p-3 text-[#6d3c2d]">
                <Coffee size={17} />
              </span>
            </CardHeader>
            <CardContent className="h-[calc(100%_-_121px)] p-7 pt-5">
              <TextLogContainer />
            </CardContent>
          </Card>

          <Card className="col-span-7 min-h-0 overflow-hidden bg-[#f7f8f1]/95">
            <CardHeader className="flex items-center justify-between px-7 pt-6">
              <div>
                <CardTitle className="font-serif text-xl">
                  시간의 온도
                </CardTitle>
                <p className="mt-1 text-xs text-[#28362c]/50">
                  생산과 소비가 만든 오늘의 여유
                </p>
              </div>
              <Badge className="bg-[#f8d2c4] text-[#6d3c2d]">
                live balance
              </Badge>
            </CardHeader>
            <CardContent className="h-[315px] px-6 pb-6 pt-3">
              <Area_AvailableRestTimeChart logsForCharts={logsForCharts} />
            </CardContent>
          </Card>

          <Card className="col-span-4 min-h-0 overflow-hidden bg-[#fffdf6]/95">
            <CardHeader className="px-6 pt-6">
              <CardTitle className="font-serif text-xl">
                오늘의 페이스
              </CardTitle>
              <p className="mt-1 text-xs text-[#28362c]/50">
                목표와 실제 리듬 비교
              </p>
            </CardHeader>
            <CardContent className="h-[315px] px-5 pb-6 pt-2">
              <Area_ProductivePaceChart logsForCharts={logsForCharts} />
            </CardContent>
          </Card>

          <div className="col-span-3 grid grid-rows-3 gap-3">
            <MiniMetric
              label="생산 시간"
              value={minutesToTimeString(productive)}
              tone="sage"
            />
            <MiniMetric
              label="소비 시간"
              value={minutesToTimeString(wasted)}
              tone="peach"
            />
            <MiniMetric
              label="평균 페이스"
              value={`${averagePace}분 / 시간`}
              tone="cream"
            />
          </div>
        </main>

        <footer className="mt-4 flex justify-between px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#28362c]/35">
          <span>Calm bento · proposal 05 / 05</span>
          <span>Make the rhythm visible</span>
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
