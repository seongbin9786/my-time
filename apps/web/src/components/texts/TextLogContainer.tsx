import clsx from 'clsx';
import { Clock3, CornerDownLeft, Minus, Plus } from 'lucide-react';
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
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ProductiveToggle } from './ProductiveToggle';

const storageListener = new StorageListener();
const LOG_PRESETS = [
  { productive: true, label: '집중' },
  { productive: true, label: '회의' },
  { productive: true, label: '리뷰' },
  { productive: false, label: '휴식' },
] as const;

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
      inputRef.current?.focus();
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
    const handleWorkspaceShortcut = (event: KeyboardEvent) => {
      if (event.isComposing || isRestDialogOpen) return;

      const target = event.target as HTMLElement | null;
      const isEditing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if (event.key === '/' && !isEditing) {
        event.preventDefault();
        inputRef.current?.focus();
        return;
      }

      if (!event.altKey) return;

      if (event.key === '1') {
        event.preventDefault();
        handleQuickAppend(true, '생산');
      }

      if (event.key === '2') {
        event.preventDefault();
        handleQuickAppend(false, '소비');
      }
    };

    window.addEventListener('keydown', handleWorkspaceShortcut);
    return () => window.removeEventListener('keydown', handleWorkspaceShortcut);
  }, [handleQuickAppend, isRestDialogOpen]);

  const applyPreset = (productive: boolean, content: string) => {
    setIsProductive(productive);
    setQuickInput(content);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-5">
      <div className="space-y-4 border-b border-black/20 pb-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
            기록 유형
          </span>
          <span className="font-mono text-[10px] text-neutral-400">
            SPACE 전환 · ENTER 등록
          </span>
        </div>

        <ProductiveToggle
          isProductive={isProductive}
          setIsProductive={setIsProductive}
          onKeyDown={handleEnterOnCheckbox}
          checkboxRef={checkboxRef}
        />

        <div className="grid grid-cols-[112px_1fr] gap-2">
          <label className="relative">
            <Clock3
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <Input
              ref={timeInputRef}
              className={clsx(
                'pl-9 font-mono text-xs',
                isTimeInputShaking && 'shake-animation',
              )}
              aria-label="기록 시각"
              placeholder={currentTimeConsideringMaxTime}
              value={timeInput}
              onChange={handleTimeInputChange}
              onKeyDown={handleEnterOnTextInput}
            />
          </label>
          <Input
            ref={inputRef}
            className={clsx(
              'text-sm',
              isQuickInputShaking && 'shake-animation',
            )}
            aria-label="활동 내용"
            placeholder="지금 무엇을 하고 있나요?"
            value={quickInput}
            onChange={handleQuickInputChange}
            onKeyDown={handleEnterOnTextInput}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {LOG_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="ghost"
                size="sm"
                className="border border-neutral-300 font-normal"
                onClick={() => applyPreset(preset.productive, preset.label)}
              >
                {preset.productive ? <Plus size={12} /> : <Minus size={12} />}
                {preset.label}
              </Button>
            ))}
          </div>
          <Button type="button" onClick={appendLog}>
            기록
            <CornerDownLeft size={14} />
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="raw-log-editor"
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500"
          >
            Raw timeline
          </label>
          <span className="font-mono text-[10px] text-neutral-400">
            직접 편집 가능
          </span>
        </div>
        <textarea
          id="raw-log-editor"
          className="monochrome-log-editor min-h-[260px] flex-1 resize-none border border-black bg-[#f8f8f5] p-4 font-mono text-xs leading-7 outline-none transition-shadow focus:ring-2 focus:ring-black focus:ring-offset-2"
          value={rawLogs}
          ref={textareaRef}
          onChange={handleChange}
          placeholder={'09:00 + 오늘의 첫 활동\n10:30 - 잠깐의 휴식'}
          spellCheck={false}
        />
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
