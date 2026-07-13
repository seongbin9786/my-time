import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  Clock3,
  Command,
  Database,
  Gauge,
  LayoutDashboard,
  Percent,
  Timer,
} from 'lucide-react';
import {
  lazy,
  type ReactNode,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AuthHeader } from '../components/auth/AuthHeader';
import { ConflictDialog } from '../components/common/ConflictDialog';
import { DayNavigator } from '../components/days/DayNavigator';
import { TextLogContainer } from '../components/texts/TextLogContainer';
import { Badge, type BadgeProps } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { Area_AvailableRestTimeChart } from '../features/AvailableRestTimeChartArea';
import { Area_ProductivePaceChart } from '../features/ProductivePaceChartArea';
import {
  useRemainingTime,
  useRestNotification,
} from '../features/restNotification';
import { SoundSettingsDialog } from '../features/soundSettings';
import { ThemeSelector } from '../features/theme/ThemeSelector';
import { RootState } from '../store';
import {
  goToNextDate,
  goToPrevDate,
  goToToday,
  triggerCurrentDateFetch,
} from '../store/logs';
import { isTextEntryTarget, openCommandPalette } from '../utils/commandEvents';
import { minutesToTimeString } from '../utils/DateUtil';
import { avgPaceOf } from '../utils/PaceUtil';

const DataManagementDialog = lazy(() =>
  import('../features/dataManagement/DataManagementDialog').then((module) => ({
    default: module.DataManagementDialog,
  })),
);

type ChartView = 'pace' | 'balance';
type SyncStatus = RootState['logs']['syncStatus'];

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  accent: 'blue' | 'cyan' | 'orange' | 'graphite';
}

const metricAccentClasses: Record<MetricCardProps['accent'], string> = {
  blue: 'border-t-blue-600 text-blue-600',
  cyan: 'border-t-cyan-500 text-cyan-600',
  orange: 'border-t-orange-500 text-orange-600',
  graphite: 'border-t-slate-700 text-slate-700',
};

const MetricCard = ({
  label,
  value,
  detail,
  icon,
  accent,
}: MetricCardProps) => (
  <Card
    className={`relative overflow-hidden border-t-2 ${metricAccentClasses[accent]}`}
  >
    <CardContent className="flex h-full items-center justify-between p-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>
        <p className="mt-1.5 font-mono text-[24px] font-semibold leading-none tracking-tight text-slate-950">
          {value}
        </p>
        <p className="mt-2 text-[11px] text-slate-500">{detail}</p>
      </div>
      <div className="bg-current/10 flex h-9 w-9 items-center justify-center rounded-lg">
        {icon}
      </div>
    </CardContent>
  </Card>
);

interface RailActionProps {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  active?: boolean;
}

const RailAction = ({
  label,
  icon,
  onClick,
  active = false,
}: RailActionProps) => (
  <div className="flex flex-col items-center gap-1">
    <Button
      variant={active ? 'default' : 'ghost'}
      size="icon"
      className={
        active
          ? 'h-10 w-10 rounded-xl bg-slate-950 text-white hover:bg-slate-800'
          : 'h-10 w-10 rounded-xl'
      }
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      {icon}
    </Button>
    <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </span>
  </div>
);

const ShortcutHint = ({ keys, label }: { keys: string; label: string }) => (
  <span className="flex items-center gap-2 whitespace-nowrap text-[11px] text-slate-500">
    <kbd className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[10px] font-semibold text-slate-700 shadow-sm">
      {keys}
    </kbd>
    {label}
  </span>
);

function getSyncLabel(
  isAuthenticated: boolean,
  syncStatus: SyncStatus,
): string {
  if (!isAuthenticated) return 'Local only';

  switch (syncStatus) {
    case 'pending':
      return 'Save queued';
    case 'syncing':
      return 'Syncing';
    case 'synced':
      return 'Synced';
    case 'error':
      return 'Sync error';
    default:
      return 'Ready';
  }
}

function getSyncVariant(
  isAuthenticated: boolean,
  syncStatus: SyncStatus,
): BadgeProps['variant'] {
  if (!isAuthenticated) return 'outline';
  if (syncStatus === 'error') return 'warning';
  if (syncStatus === 'synced') return 'success';
  return 'info';
}

function getSyncDotClass(syncStatus: SyncStatus): string {
  if (syncStatus === 'error') return 'bg-orange-500';
  if (syncStatus === 'syncing') return 'motion-safe:animate-pulse bg-blue-500';
  return 'bg-cyan-500';
}

export const LogWriterPage = () => {
  useRestNotification();
  const dispatch = useDispatch();

  const [isSoundSettingsOpen, setIsSoundSettingsOpen] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);
  const [chartView, setChartView] = useState<ChartView>('pace');

  const { currentDate, logsForCharts, rawLogs, syncStatus, lastSyncedAt } =
    useSelector((state: RootState) => state.logs);
  const currentNotification = useSelector(
    (state: RootState) => state.restNotification.currentNotification,
  );
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(triggerCurrentDateFetch());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const handleDateShortcut = (event: KeyboardEvent) => {
      if (
        isTextEntryTarget(event.target) ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      ) {
        return;
      }

      if (event.key === '[') {
        event.preventDefault();
        dispatch(goToPrevDate());
      } else if (event.key === ']') {
        event.preventDefault();
        dispatch(goToNextDate());
      } else if (event.key.toLowerCase() === 't') {
        event.preventDefault();
        dispatch(goToToday());
      }
    };

    window.addEventListener('keydown', handleDateShortcut);
    return () => window.removeEventListener('keydown', handleDateShortcut);
  }, [dispatch]);

  const { remainingTime, isOvertime } = useRemainingTime(currentNotification);

  const currentDateLabel = useMemo(
    () =>
      new Date(`${currentDate}T00:00:00`).toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }),
    [currentDate],
  );

  const latestLog = logsForCharts[logsForCharts.length - 1];
  const productiveMinutes = latestLog?.productive ?? 0;
  const wastedMinutes = latestLog?.wasted ?? 0;
  const trackedMinutes = productiveMinutes + wastedMinutes;
  const productiveRatio = trackedMinutes
    ? Math.round((productiveMinutes / trackedMinutes) * 100)
    : 0;
  const balanceMinutes = productiveMinutes - wastedMinutes;
  const averagePace = avgPaceOf(logsForCharts);
  const logCount = rawLogs.trim() ? rawLogs.trim().split('\n').length : 0;

  const syncLabel = getSyncLabel(isAuthenticated, syncStatus);
  const syncVariant = getSyncVariant(isAuthenticated, syncStatus);

  const lastSyncLabel = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '아직 동기화되지 않음';

  return (
    <div className="flex h-screen min-h-[760px] min-w-[1180px] overflow-hidden bg-[#f3f6fa] text-slate-950">
      <aside className="flex w-[78px] shrink-0 flex-col items-center border-r border-slate-200 bg-white py-4">
        <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_8px_22px_rgba(37,99,235,0.24)]">
          <Activity className="h-5 w-5" />
        </div>

        <nav className="flex flex-col gap-5" aria-label="Cockpit navigation">
          <RailAction
            label="Overview"
            icon={<LayoutDashboard className="h-[18px] w-[18px]" />}
            active
          />
          <RailAction
            label="Data"
            icon={<Database className="h-[18px] w-[18px]" />}
            onClick={() => setIsDataManagementOpen(true)}
          />
          <RailAction
            label="Sound"
            icon={<Bell className="h-[18px] w-[18px]" />}
            onClick={() => setIsSoundSettingsOpen(true)}
          />
          <RailAction
            label="Command"
            icon={<Command className="h-[18px] w-[18px]" />}
            onClick={openCommandPalette}
          />
        </nav>

        <div className="mt-auto flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
            <ThemeSelector compact />
          </div>
          <div className="flex h-10 w-10 items-center justify-center overflow-visible rounded-xl border border-slate-200 bg-slate-50">
            <AuthHeader compact />
          </div>
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_0_4px_rgba(6,182,212,0.12)]" />
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                My Commit / Focus intelligence
              </p>
              <div className="mt-1 flex items-baseline gap-3">
                <h1 className="text-lg font-semibold tracking-tight text-slate-950">
                  Analytics cockpit
                </h1>
                <span className="font-mono text-xs text-slate-400">
                  {currentDate}
                </span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              {currentDateLabel}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentNotification && (
              <Badge variant={isOvertime ? 'warning' : 'success'}>
                <Timer className="h-3 w-3" />
                {isOvertime ? 'Overtime' : 'Rest'} {remainingTime}
              </Badge>
            )}
            <Badge variant={syncVariant}>
              <span
                className={`h-1.5 w-1.5 rounded-full ${getSyncDotClass(syncStatus)}`}
              />
              {syncLabel}
            </Badge>
            <DayNavigator />
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-rows-[110px_minmax(0,1fr)] gap-4 p-4">
          <section
            className="grid grid-cols-4 gap-4"
            aria-label="오늘의 핵심 지표"
          >
            <MetricCard
              label="Productive"
              value={minutesToTimeString(productiveMinutes)}
              detail={`${logCount}개 기록 중 생산 누적`}
              icon={<Clock3 className="h-[18px] w-[18px]" />}
              accent="blue"
            />
            <MetricCard
              label="Consumed"
              value={minutesToTimeString(wastedMinutes)}
              detail={`현재 균형 ${balanceMinutes >= 0 ? '+' : '−'}${minutesToTimeString(
                Math.abs(balanceMinutes),
              )}`}
              icon={<Timer className="h-[18px] w-[18px]" />}
              accent="orange"
            />
            <MetricCard
              label="Focus ratio"
              value={`${productiveRatio}%`}
              detail={`${minutesToTimeString(trackedMinutes)} 관측 기준`}
              icon={<Percent className="h-[18px] w-[18px]" />}
              accent="cyan"
            />
            <MetricCard
              label="Avg. pace"
              value={`${averagePace}`}
              detail="분 / 시간 · 오늘 평균"
              icon={<Gauge className="h-[18px] w-[18px]" />}
              accent="graphite"
            />
          </section>

          <section className="grid min-h-0 grid-cols-[minmax(0,1fr)_400px] gap-4">
            <div className="flex min-h-0 flex-col gap-4">
              <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <CardHeader className="flex-row items-center justify-between border-b border-slate-100 p-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      Focus analytics
                    </CardTitle>
                    <CardDescription className="mt-1">
                      생산 속도와 누적 시간 균형을 같은 시간축에서 확인합니다.
                    </CardDescription>
                  </div>
                  <TabsList>
                    <TabsTrigger
                      active={chartView === 'pace'}
                      onClick={() => setChartView('pace')}
                    >
                      생산 페이스
                    </TabsTrigger>
                    <TabsTrigger
                      active={chartView === 'balance'}
                      onClick={() => setChartView('balance')}
                    >
                      시간 밸런스
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="min-h-0 flex-1 p-4">
                  <Tabs className="h-full">
                    <TabsContent active={chartView === 'pace'}>
                      <Area_ProductivePaceChart logsForCharts={logsForCharts} />
                    </TabsContent>
                    <TabsContent active={chartView === 'balance'}>
                      <Area_AvailableRestTimeChart
                        logsForCharts={logsForCharts}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card className="h-[72px] shrink-0">
                <CardContent className="flex h-full items-center justify-between gap-5 p-4">
                  <div className="flex min-w-0 items-center gap-5 overflow-hidden">
                    <ShortcutHint keys="/" label="활동 입력" />
                    <ShortcutHint keys="⌥ 1" label="생산 시작" />
                    <ShortcutHint keys="⌥ 2" label="소비 시작" />
                    <ShortcutHint keys="[  ]" label="날짜 이동" />
                    <ShortcutHint keys="⌘ P" label="명령 팔레트" />
                  </div>
                  <div className="shrink-0 border-l border-slate-200 pl-5 text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Last sync
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-slate-700">
                      {lastSyncLabel}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <TextLogContainer />
          </section>
        </div>
      </main>

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
