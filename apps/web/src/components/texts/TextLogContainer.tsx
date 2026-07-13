import clsx from 'clsx';
import { ArrowUpRight, Clock3, Minus, Plus } from 'lucide-react';
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
import { Input } from '../ui/input';
import { ProductiveToggle } from './ProductiveToggle';

const storageListener = new StorageListener();

export const TextLogContainer = () => {
  const modeControlRef = useRef<HTMLButtonElement>(null);
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
      // 커맨드 팔레트가 닫힌 후 포커스 이동
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
      const target = event.target;
      const isEditing =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      const isCommandPaletteTarget =
        target instanceof Element &&
        target.closest('.editorial-command-palette') !== null;

      if (
        isRestDialogOpen ||
        isCommandPaletteTarget ||
        event.metaKey ||
        event.ctrlKey
      ) {
        return;
      }

      if (event.altKey && event.code === 'Digit1') {
        event.preventDefault();
        setIsProductive(true);
        inputRef.current?.focus();
        return;
      }

      if (event.altKey && event.code === 'Digit2') {
        event.preventDefault();
        setIsProductive(false);
        inputRef.current?.focus();
        return;
      }

      if (!isEditing && !event.altKey && event.key === '/') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcut);
    return () => window.removeEventListener('keydown', handleKeyboardShortcut);
  }, [isRestDialogOpen]);

  const recordedLineCount = rawLogs
    .split('\n')
    .filter((line) => line.trim().length > 0).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-serif text-xl tracking-[-0.025em] text-[#322a24]">
              무엇에 시간을 썼나요?
            </p>
            <Badge variant="outline">{recordedLineCount} lines</Badge>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[#776b5f]">
            시각과 한 문장을 남기면 아래 원문과 분석이 함께 갱신됩니다.
          </p>
        </div>
        <ProductiveToggle
          isProductive={isProductive}
          setIsProductive={setIsProductive}
          firstButtonRef={modeControlRef}
        />
      </div>

      <div className="journal-capture-bar grid grid-cols-[92px_minmax(0,1fr)_auto] items-end gap-3 border-y border-[#a64f38]/35 bg-[#f5eadc]/70 px-4 py-4 shadow-[inset_3px_0_0_#a64f38]">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#7d6f62]">
            <Clock3 size={11} /> 시각
          </span>
          <Input
            ref={timeInputRef}
            className={clsx(
              'font-mono text-xs tabular-nums',
              isTimeInputShaking && 'shake-animation',
            )}
            placeholder={currentTimeConsideringMaxTime}
            value={timeInput}
            onChange={handleTimeInputChange}
            onKeyDown={handleEnterOnTextInput}
            aria-label="기록 시각"
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.18em] text-[#7d6f62]">
            한 문장 기록
          </span>
          <Input
            ref={inputRef}
            className={clsx(
              'font-serif text-[15px]',
              isQuickInputShaking && 'shake-animation',
            )}
            placeholder="예: 회의록을 정리하고 다음 작업을 골랐다"
            value={quickInput}
            onChange={handleQuickInputChange}
            onKeyDown={handleEnterOnTextInput}
            aria-label="활동 내용"
          />
        </label>

        <Button className="h-10 px-5" onClick={appendLog}>
          기록
          <ArrowUpRight size={14} />
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-[#d4c7b7] px-1 py-3">
        <div className="flex items-center gap-1.5">
          <span className="mr-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#8b7e70]">
            빠른 시작
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[#52604c]"
            onClick={() => handleQuickAppend(true, '생산')}
            title="생산 기록을 현재 시각으로 바로 추가"
          >
            <Plus size={12} /> 생산
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[#9a4a36]"
            onClick={() => handleQuickAppend(false, '소비')}
            title="소비 기록을 현재 시각으로 바로 추가"
          >
            <Minus size={12} /> 소비
          </Button>
        </div>
        <p className="text-[10px] text-[#8b7e70]">
          <kbd className="editorial-kbd">Enter</kbd> 저장 ·{' '}
          <kbd className="editorial-kbd">/</kbd> 입력 포커스
        </p>
      </div>

      <textarea
        className="journal-raw-log mt-5 min-h-[380px] flex-1 resize-none rounded-sm border border-[#c9baa7] px-6 py-5 font-mono text-[12px] leading-8 text-[#433a33] outline-none transition focus:border-[#a64f38]/70 focus:ring-2 focus:ring-[#a64f38]/10"
        value={rawLogs}
        ref={textareaRef}
        onChange={handleChange}
        aria-label="하루 원문 기록"
        spellCheck={false}
      />

      <div className="mt-2 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.15em] text-[#9a8d7f]">
        <span>Raw journal · 직접 수정 가능</span>
        <span>{currentDate}</span>
      </div>

      <RestTimeInputDialog
        isOpen={isRestDialogOpen}
        onClose={handleRestDialogClose}
        onSubmit={handleRestTimeSubmit}
        onSkip={handleRestTimeSkip}
      />
    </div>
  );
};
