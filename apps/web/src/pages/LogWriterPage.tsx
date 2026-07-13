import {
  Bell,
  CircleDot,
  Database,
  Keyboard,
  Radio,
  Timer,
} from 'lucide-react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AuthHeader } from '../components/auth/AuthHeader';
import { ConflictDialog } from '../components/common/ConflictDialog';
import { DataManagementButton } from '../components/dataManagement/DataManagementButton';
import { DayNavigator } from '../components/days/DayNavigator';
import { TextLogContainer } from '../components/texts/TextLogContainer';
import { TimeSummary } from '../components/texts/TimeSummary';
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

const DataManagementDialog = lazy(() =>
  import('../features/dataManagement/DataManagementDialog').then((module) => ({
    default: module.DataManagementDialog,
  })),
);

const SYNC_PRESENTATIONS = {
  idle: { label: 'Local idle', variant: 'muted' as const },
  pending: { label: 'Write pending', variant: 'warning' as const },
  syncing: { label: 'Sync in progress', variant: 'default' as const },
  synced: { label: 'Cloud synced', variant: 'success' as const },
  error: { label: 'Sync failure', variant: 'danger' as const },
};

const HOTKEYS = [
  { shortcut: '/', label: 'Focus activity' },
  { shortcut: 'Alt 1', label: 'Quick production' },
  { shortcut: 'Alt 2', label: 'Quick consumption' },
  { shortcut: '⌘/Ctrl P', label: 'Command palette' },
];

export const LogWriterPage = () => {
  // 휴식 알림 시스템 활성화
  useRestNotification();
  const dispatch = useDispatch();

  const [isSoundSettingsOpen, setIsSoundSettingsOpen] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);

  // 바로 다음 컴포넌트이니 직접 주입, redux 의존성 낮추기 위함.
  const logsForCharts = useSelector(
    (state: RootState) => state.logs.logsForCharts,
  );

  const { currentDate, rawLogs, syncStatus } = useSelector(
    (state: RootState) => state.logs,
  );
  const currentNotification = useSelector(
    (state: RootState) => state.restNotification.currentNotification,
  );
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  // 로그인 상태에서 현재 날짜를 서버와 즉시 동기화
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(triggerCurrentDateFetch());
    }
  }, [dispatch, isAuthenticated]);

  // 잔여 시간 계산
  const { remainingTime, isOvertime } = useRemainingTime(currentNotification);

  const syncPresentation = SYNC_PRESENTATIONS[syncStatus];
  const logLineCount = rawLogs.trim()
    ? rawLogs.split('\n').filter((line) => line.trim()).length
    : 0;

  return (
    <div className="focus-command-deck flex h-screen min-w-[1024px] flex-col overflow-hidden bg-[#050705] text-[#e6ece7]">
      <header className="relative z-20 flex h-[68px] shrink-0 items-center justify-between border-b border-[#252b26] px-4">
        <div className="flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center border border-[#c9ff3d]/60 bg-[#c9ff3d]/10 font-mono text-[10px] font-black tracking-[-0.06em] text-[#c9ff3d] shadow-[inset_0_0_20px_rgba(201,255,61,0.08)]">
            MC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#f1f5f1]">
                Focus command deck
              </h1>
              <Badge variant="success" className="h-5">
                <CircleDot size={8} className="mr-1 animate-pulse" />
                Operational
              </Badge>
            </div>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[#59625a]">
              My Commit / daily operations console
            </p>
          </div>
        </div>

        <div className="deck-toolbar flex items-center gap-2">
          <div className="mr-2 hidden items-center gap-2 border-r border-[#2a302b] pr-4 xl:flex">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697269]">
              Command
            </span>
            <kbd className="deck-key">⌘ / Ctrl P</kbd>
          </div>
          <DayNavigator />
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsSoundSettingsOpen(true)}
            title="알림음 설정"
            aria-label="알림음 설정"
          >
            <Bell size={16} />
          </Button>

          <DataManagementButton onClick={() => setIsDataManagementOpen(true)} />
          <ThemeSelector />
          <AuthHeader />
        </div>
      </header>

      <main className="relative z-10 grid min-h-0 flex-1 grid-cols-[180px_minmax(460px,1fr)_minmax(288px,0.7fr)] gap-3 p-3 xl:grid-cols-[220px_minmax(500px,1fr)_400px]">
        <aside className="flex min-h-0 flex-col gap-3">
          <Card className="shrink-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>/01 System status</CardTitle>
              <Radio size={12} className="text-[#c9ff3d]" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#5e675f]">
                  Active date
                </p>
                <p className="mt-1 font-mono text-sm font-bold tracking-[-0.03em] text-[#edf2ed]">
                  {currentDate}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant={syncPresentation.variant}>
                  <Database size={9} className="mr-1" />
                  {syncPresentation.label}
                </Badge>
                <Badge variant="muted">{logLineCount} events</Badge>
              </div>
              {currentNotification ? (
                <div className="border border-[#ffb52e]/30 bg-[#ffb52e]/5 p-2.5">
                  <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#ffbf49]">
                    <Timer size={11} />
                    Rest timer
                  </div>
                  <strong
                    className={`mt-1 block font-mono text-lg ${
                      isOvertime
                        ? 'animate-pulse text-[#ff6b4a]'
                        : 'text-[#f0f4f0]'
                    }`}
                  >
                    {remainingTime}
                  </strong>
                </div>
              ) : (
                <div className="border border-[#252b26] bg-[#0d110e] px-2.5 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#636c64]">
                  No active rest timer
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="min-h-0 flex-1 xl:flex-none">
            <CardHeader>
              <CardTitle>/02 Time telemetry</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSummary logs={logsForCharts} />
            </CardContent>
          </Card>

          <Card className="hidden min-h-0 flex-1 xl:flex xl:flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>/03 Hotkeys</CardTitle>
              <Keyboard size={13} className="text-[#ffb52e]" />
            </CardHeader>
            <CardContent className="space-y-1.5 p-3">
              {HOTKEYS.map(({ shortcut, label }) => (
                <div
                  key={shortcut}
                  className="flex items-center justify-between border border-[#232824] bg-[#0c100d] px-2 py-1.5"
                >
                  <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#778078]">
                    {label}
                  </span>
                  <kbd className="deck-key">{shortcut}</kbd>
                </div>
              ))}
              <div className="pt-1 font-mono text-[8px] leading-4 text-[#555d56]">
                / 는 입력 중 비활성, Alt quick action은 항상 실행됩니다.
              </div>
            </CardContent>
          </Card>
        </aside>

        <Card className="min-h-0 overflow-hidden">
          <TextLogContainer />
        </Card>

        <aside className="flex min-h-0 flex-col gap-3">
          <Card className="min-h-0 flex-1 overflow-hidden">
            <Area_AvailableRestTimeChart logsForCharts={logsForCharts} />
          </Card>
          <Card className="min-h-0 flex-1 overflow-hidden">
            <Area_ProductivePaceChart logsForCharts={logsForCharts} />
          </Card>
        </aside>
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
