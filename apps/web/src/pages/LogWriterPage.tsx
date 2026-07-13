import { Bell, BookOpenText, Timer } from 'lucide-react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AuthHeader } from '../components/auth/AuthHeader';
import { ConflictDialog } from '../components/common/ConflictDialog';
import { DataManagementButton } from '../components/dataManagement/DataManagementButton';
import { DayNavigator } from '../components/days/DayNavigator';
import { TextLogContainer } from '../components/texts/TextLogContainer';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
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

  const { currentDate } = useSelector((state: RootState) => state.logs);
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

  return (
    <div className="editorial-shell min-h-screen text-[#302923]">
      <div className="mx-auto flex min-h-screen max-w-[1680px] flex-col px-5 pb-6 pt-4 xl:px-8">
        <header className="editorial-topbar min-h-16 flex items-center justify-between gap-5 border-b border-[#aa9b88]/60 px-1 pb-4">
          <div className="flex min-w-fit items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#a64f38]/35 bg-[#fbf4e8] text-[#a64f38] shadow-sm">
              <BookOpenText size={19} strokeWidth={1.6} />
            </div>
            <div>
              <p className="font-serif text-lg leading-none tracking-[-0.02em]">
                My Commit
              </p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#776b5f]">
                Daily work journal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DayNavigator />
          </div>

          <div className="editorial-actions flex min-w-fit items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSoundSettingsOpen(true)}
              title="알림음 설정"
              aria-label="알림음 설정"
            >
              <Bell size={16} />
            </Button>
            <DataManagementButton
              onClick={() => setIsDataManagementOpen(true)}
            />
            <ThemeSelector />
            <AuthHeader />
          </div>
        </header>

        <main className="grid flex-1 gap-5 pt-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(360px,0.82fr)] xl:gap-7">
          <section className="journal-page relative flex min-h-[760px] min-w-0 flex-col overflow-hidden rounded-[3px] border border-[#c8b9a5] bg-[#fbf4e8] px-7 py-7 shadow-[0_24px_80px_rgba(78,58,40,0.13)] xl:px-10 xl:py-9">
            <div className="relative z-10 mb-7 flex items-end justify-between gap-5 border-b border-[#bfb09c]/70 pb-6">
              <div>
                <Badge variant="terracotta">Entry · {currentDate}</Badge>
                <h1 className="mt-4 font-serif text-[clamp(2.4rem,4vw,4.8rem)] leading-[0.86] tracking-[-0.055em] text-[#29211d]">
                  오늘의 기록.
                </h1>
              </div>
              <div className="max-w-48 pb-1 text-right">
                <p className="font-serif text-sm italic leading-relaxed text-[#6e6257]">
                  쌓인 시간은 숫자가 되고,
                  <br />쓴 문장은 하루가 됩니다.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex min-h-0 flex-1 flex-col">
              <TextLogContainer />
            </div>
          </section>

          <aside className="flex min-w-0 flex-col gap-4 pb-4">
            <div className="flex items-end justify-between border-b border-[#aa9b88]/60 px-1 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#a64f38]">
                  Marginalia
                </p>
                <h2 className="mt-1 font-serif text-2xl tracking-[-0.025em]">
                  흐름을 읽는 여백
                </h2>
              </div>
              {currentNotification ? (
                <Badge
                  variant={isOvertime ? 'terracotta' : 'olive'}
                  className={isOvertime ? 'animate-pulse' : ''}
                >
                  <Timer size={11} />
                  {isOvertime ? '휴식 초과' : `휴식 ${remainingTime}`}
                </Badge>
              ) : (
                <Badge variant="outline">휴식 알림 대기</Badge>
              )}
            </div>

            <Area_AvailableRestTimeChart logsForCharts={logsForCharts} />
            <Area_ProductivePaceChart logsForCharts={logsForCharts} />

            <div className="editorial-shortcuts mt-auto grid grid-cols-3 gap-px overflow-hidden rounded-md border border-[#c9baa7] bg-[#c9baa7] text-[#5f544a]">
              <ShortcutHint keys="/" label="입력으로" />
              <ShortcutHint keys="Alt 1 · 2" label="생산 · 소비" />
              <ShortcutHint keys="⌘ / Ctrl P" label="명령 팔레트" />
            </div>
          </aside>
        </main>
      </div>

      <SoundSettingsDialog
        isOpen={isSoundSettingsOpen}
        onClose={() => setIsSoundSettingsOpen(false)}
      />
      {isDataManagementOpen && (
        <Suspense
          fallback={
            <div className="modal modal-open modal-bottom sm:modal-middle">
              <div className="modal-box flex h-40 w-full max-w-2xl items-center justify-center bg-[#fbf4e8]">
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

const ShortcutHint = ({ keys, label }: { keys: string; label: string }) => (
  <div className="bg-[#f5ecdf] px-3 py-3 text-center">
    <kbd className="font-serif text-xs font-semibold text-[#3c332c]">
      {keys}
    </kbd>
    <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.11em]">
      {label}
    </p>
  </div>
);
