import clsx from 'clsx';
import { Braces, CornerDownLeft, Minus, Plus, Zap } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { addLogEntry, createLogItem } from '../../features/RawLogEditor';
import { useShake } from '../../hooks/useShake';
import { RootState } from '../../store';
import {
  hydrateRawLog,
  refreshDerivedLogs,
  updateRawLog,
} from '../../store/logs';
import {
  clearRestNotification,
  setRestNotification,
} from '../../store/restNotification';
import {
  addConsumptionStartListener,
  addFocusActivityInputListener,
  addProductionStartListener,
  isTextEntryTarget,
} from '../../utils/commandEvents';
import { StorageListener } from '../../utils/StorageListener';
import { loadFromStorage } from '../../utils/StorageUtil';
import {
  getCurrentTimeStringConsideringMaxTime,
  getMaxTimeFromLogs,
  parseTimeInput,
} from '../../utils/timeUtils';
import { RestTimeInputDialog } from '../dialogs/RestTimeInputDialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Input } from '../ui/input';
import { ProductiveToggle } from './ProductiveToggle';

const storageListener = new StorageListener();

export const TextLogContainer = () => {
  const checkboxRef = useRef<HTMLInputElement>(null); // NOTE: +/- 여부를 스페이스바로 쉽게 토글하고, 탭으로 곧장 quick input으로 이동 가능하므로, checkbox에 focus 둠.
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [timeInput, setTimeInput] = useState('');
  const [quickInput, setQuickInput] = useState('');
  const [isProductive, setIsProductive] = useState(true);
  const [isRestDialogOpen, setIsRestDialogOpen] = useState(false);
  const [pendingRestLog, setPendingRestLog] = useState<{
    timeStr: string;
    content: string;
  } | null>(null);
  const { isShaking: isTimeInputShaking, shake: shakeTimeInput } = useShake();
  const { isShaking: isQuickInputShaking, shake: shakeQuickInput } = useShake();

  const { currentDate, rawLogs } = useSelector(
    (state: RootState) => state.logs,
  );
  const dispatch = useDispatch();
  const setRawLogs = useCallback(
    (nextRawLog: string) => dispatch(updateRawLog(nextRawLog)),
    [dispatch],
  );

  // 이벤트 핸들러에서 항상 최신 rawLogs를 참조하기 위한 ref
  const rawLogsRef = useRef(rawLogs);
  useEffect(() => {
    rawLogsRef.current = rawLogs;
  }, [rawLogs]);

  // placeholder용: maxTime이 고려된 현재 시각
  const maxTime = getMaxTimeFromLogs(rawLogs);
  const currentTimeConsideringMaxTime =
    getCurrentTimeStringConsideringMaxTime(maxTime);

  useEffect(
    function updateChartEvery30Seconds() {
      const timer = setInterval(() => {
        dispatch(refreshDerivedLogs());
      }, 30_000);
      return () => clearInterval(timer);
    },
    [dispatch],
  );

  // TODO: 이게 무슨 동작인지 확인하기
  // 최근에 닫았던 탭을 다시 살리는 경우, input value가 채워진 상태로 켜짐.
  // 강제로 value를 rawLog로 동기화시킴.
  // 최초 렌더링 직후에 자동으로 채워진 텍스트는 안 보이게 됨.
  const synchronizeInput = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.value = rawLogsRef.current;
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextRawLog = e.target.value;
    setRawLogs(nextRawLog);
  };

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeInput(e.target.value);
  };

  const handleQuickInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuickInput(e.target.value);
  };

  const appendLog = () => {
    const isInputEmpty = !quickInput.trim();
    if (isInputEmpty) {
      shakeQuickInput();
      inputRef.current?.focus();
      return;
    }

    const parsedTime = parseTimeInput(timeInput);
    if (timeInput.trim() !== '' && !parsedTime) {
      // 잘못된 시간 형식이 입력된 경우
      shakeTimeInput();
      timeInputRef.current?.focus();
      return;
    }

    // 사용자가 직접 입력한 경우 parsedTime 그대로, 아니면 placeholder 값 사용
    const timeStr = parsedTime || currentTimeConsideringMaxTime;

    // 휴식 로그인 경우 Dialog 표시
    if (!isProductive) {
      setPendingRestLog({ timeStr, content: quickInput });
      setIsRestDialogOpen(true);
      return;
    }

    // 생산 로그 추가
    const newLogItem = createLogItem(timeStr, isProductive, quickInput);
    const updatedRawLog = addLogEntry(
      rawLogs,
      newLogItem,
      timeInput.trim() !== '',
    );

    setRawLogs(updatedRawLog);

    // 생산 로그 추가 시 알림 중단
    dispatch(clearRestNotification());

    resetInputs();
    inputRef.current?.focus();
  };

  const resetInputs = useCallback(() => {
    setTimeInput('');
    setQuickInput('');
    setIsProductive(true);
  }, []);

  const appendPendingConsumptionLog = useCallback(
    (minutes: number | null) => {
      if (!pendingRestLog) return;

      const { timeStr, content } = pendingRestLog;

      // 소비 로그 추가
      const newLogItem = createLogItem(timeStr, false, content);
      const updatedRawLog = addLogEntry(
        rawLogsRef.current,
        newLogItem,
        timeInput.trim() !== '',
      );

      setRawLogs(updatedRawLog);

      if (minutes && minutes > 0) {
        dispatch(
          setRestNotification({
            targetTime: timeStr,
            durationMinutes: minutes,
          }),
        );
      } else {
        dispatch(clearRestNotification());
      }

      // 상태 초기화
      resetInputs();
      setPendingRestLog(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    [dispatch, pendingRestLog, resetInputs, setRawLogs, timeInput],
  );

  const handleRestTimeSubmit = (minutes: number) => {
    appendPendingConsumptionLog(minutes);
  };

  const handleRestTimeSkip = () => {
    appendPendingConsumptionLog(null);
  };

  const handleRestDialogClose = () => {
    // Dialog를 취소한 경우 로그를 추가하지 않고 입력 상태 유지
    setPendingRestLog(null);
    setIsRestDialogOpen(false);
    // 입력 필드에 포커스를 다시 맞춤
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleEnterOnTextInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // NOTE: Enter 입력 시 마지막 글자도 함께 입력됨
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      appendLog();
    }
  };

  const handleEnterOnCheckbox = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      appendLog();
    }
  };

  useEffect(() => {
    synchronizeInput();
    inputRef.current?.focus();
  }, [synchronizeInput]);

  // handleDateChange를 하지 말고, 여기서 return을 해서 cleanup을 하도록 하면 prevDate 만들 필요 없음.
  // https://legacy.reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
  useEffect(() => {
    storageListener.install(currentDate, () => {
      const localData = loadFromStorage(currentDate);
      dispatch(hydrateRawLog(localData.content));
    });
    inputRef.current?.focus();
  }, [currentDate, dispatch]);

  const handleQuickAppend = useCallback(
    (isProductiveLog: boolean, message: string) => {
      const timeStr = currentTimeConsideringMaxTime;

      if (!isProductiveLog) {
        setPendingRestLog({ timeStr, content: message });
        setIsRestDialogOpen(true);
        return;
      }

      const newLogItem = createLogItem(timeStr, true, message);
      const updatedRawLog = addLogEntry(rawLogsRef.current, newLogItem, false);

      setRawLogs(updatedRawLog);
      dispatch(clearRestNotification());
      resetInputs();
      // 커맨드 팔레트가 닫힌 후 다음 기록을 바로 입력할 수 있게 이동
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    },
    [currentTimeConsideringMaxTime, dispatch, resetInputs, setRawLogs],
  );

  // Command Palette & Keyboard shortcuts
  useEffect(() => {
    const cleanups = [
      addFocusActivityInputListener(() => {
        inputRef.current?.focus();
      }),
      addProductionStartListener((content) => {
        handleQuickAppend(true, content || '생산');
      }),
      addConsumptionStartListener((content) => {
        handleQuickAppend(false, content || '소비');
      }),
    ];

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [handleQuickAppend]);

  useEffect(() => {
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      const hasOpenModal = document.querySelector('.modal-open') !== null;
      if (event.isComposing || isRestDialogOpen || hasOpenModal) return;

      if (
        event.key === '/' &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !isTextEntryTarget(event.target)
      ) {
        event.preventDefault();
        inputRef.current?.focus();
        return;
      }

      if (event.altKey && event.code === 'Digit1') {
        event.preventDefault();
        handleQuickAppend(true, '생산');
      }

      if (event.altKey && event.code === 'Digit2') {
        event.preventDefault();
        handleQuickAppend(false, '소비');
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcut);
    return () => window.removeEventListener('keydown', handleKeyboardShortcut);
  }, [handleQuickAppend, isRestDialogOpen]);

  const rawLogLineCount = rawLogs.trim()
    ? rawLogs.trim().split('\n').length
    : 0;

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="flex-row items-start justify-between border-b border-slate-100 p-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            Capture stream
          </CardTitle>
          <CardDescription className="mt-1">
            빠른 기록과 원본 로그를 한곳에서 편집합니다.
          </CardDescription>
        </div>
        <Badge variant="success">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
          Live
        </Badge>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <div className="border-b border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Quick capture
            </p>
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-slate-600">
                /
              </kbd>
              입력 포커스
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ProductiveToggle
              isProductive={isProductive}
              setIsProductive={setIsProductive}
              onKeyDown={handleEnterOnCheckbox}
              checkboxRef={checkboxRef}
            />
            <Input
              ref={timeInputRef}
              className={clsx(
                '!w-[74px] shrink-0 px-2 font-mono text-xs',
                isTimeInputShaking && 'shake-animation border-orange-400',
              )}
              placeholder={currentTimeConsideringMaxTime}
              value={timeInput}
              onChange={handleTimeInputChange}
              onKeyDown={handleEnterOnTextInput}
              aria-label="기록 시각"
            />
            <Input
              ref={inputRef}
              className={clsx(
                '!w-auto min-w-0 flex-1 text-xs',
                isQuickInputShaking && 'shake-animation border-orange-400',
              )}
              placeholder="지금 무엇을 하고 있나요?"
              value={quickInput}
              onChange={handleQuickInputChange}
              onKeyDown={handleEnterOnTextInput}
              aria-label="활동 내용"
            />
            <Button
              size="icon"
              className="h-9 w-9"
              onClick={appendLog}
              title="기록 추가 (Enter)"
              aria-label="기록 추가"
            >
              <CornerDownLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-between border-cyan-200 bg-cyan-50/70 text-cyan-800 hover:bg-cyan-100"
              onClick={() => handleQuickAppend(true, '생산')}
            >
              <span className="flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" /> 생산 시작
              </span>
              <kbd className="font-mono text-[10px] text-cyan-600">⌥1</kbd>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-between border-orange-200 bg-orange-50/70 text-orange-800 hover:bg-orange-100"
              onClick={() => handleQuickAppend(false, '소비')}
            >
              <span className="flex items-center gap-1.5">
                <Minus className="h-3.5 w-3.5" /> 소비 시작
              </span>
              <kbd className="font-mono text-[10px] text-orange-600">⌥2</kbd>
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col bg-slate-950">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Braces className="h-3.5 w-3.5 text-cyan-400" />
              raw.log
            </div>
            <span className="font-mono text-[10px] text-slate-500">
              {rawLogLineCount} lines · {rawLogs.length} chars
            </span>
          </div>
          <textarea
            className="cockpit-scrollbar min-h-0 flex-1 resize-none bg-transparent p-4 font-mono text-[12px] leading-6 text-slate-200 outline-none placeholder:text-slate-600 focus:bg-slate-900/60"
            value={rawLogs}
            ref={textareaRef}
            onChange={handleChange}
            placeholder="[09:00] + 첫 활동을 기록해 보세요"
            aria-label="원본 로그 편집기"
            spellCheck={false}
          />
        </div>
      </CardContent>

      <RestTimeInputDialog
        isOpen={isRestDialogOpen}
        onClose={handleRestDialogClose}
        onSubmit={handleRestTimeSubmit}
        onSkip={handleRestTimeSkip}
      />
    </Card>
  );
};
