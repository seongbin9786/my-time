import clsx from 'clsx';
import { CornerDownLeft, Minus, Plus, TerminalSquare } from 'lucide-react';
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
import { Textarea } from '../ui/textarea';
import { ProductiveToggle } from './ProductiveToggle';

const storageListener = new StorageListener();

export const TextLogContainer = () => {
  const checkboxRef = useRef<HTMLInputElement>(null); // +/- 여부를 스페이스바로 토글하기 위한 실제 checkbox
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

  const logLineCount = rawLogs.trim()
    ? rawLogs.split('\n').filter((line) => line.trim()).length
    : 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-[#202621] p-4">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#f0f4f0]">
              <TerminalSquare size={14} className="text-[#c9ff3d]" />
              Activity ingest
            </div>
            <p className="mt-1 font-mono text-[10px] text-[#697169]">
              시각을 비우면 현재 시각으로 기록합니다.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[#6f776f]">
            <span className="flex items-center gap-1">
              focus
              <kbd className="deck-key">/</kbd>
            </span>
            <span className="flex items-center gap-1">
              palette
              <kbd className="deck-key">⌘/Ctrl P</kbd>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[112px_88px_minmax(0,1fr)_96px] items-end gap-2">
          <div>
            <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-[#697169]">
              Mode
            </label>
            <ProductiveToggle
              isProductive={isProductive}
              setIsProductive={setIsProductive}
              onKeyDown={handleEnterOnCheckbox}
              checkboxRef={checkboxRef}
            />
          </div>
          <div>
            <label
              htmlFor="quick-log-time"
              className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-[#697169]"
            >
              Time
            </label>
            <Input
              id="quick-log-time"
              ref={timeInputRef}
              className={clsx(
                'px-2 text-center',
                isTimeInputShaking && 'shake-animation border-[#ff6b4a]',
              )}
              placeholder={currentTimeConsideringMaxTime}
              value={timeInput}
              onChange={handleTimeInputChange}
              onKeyDown={handleEnterOnTextInput}
              aria-label="기록 시각"
            />
          </div>
          <div>
            <label
              htmlFor="quick-log-activity"
              className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-[#697169]"
            >
              Activity
            </label>
            <Input
              id="quick-log-activity"
              ref={inputRef}
              className={clsx(
                isQuickInputShaking && 'shake-animation border-[#ff6b4a]',
              )}
              placeholder="무엇에 시간을 쓰고 있나요?"
              value={quickInput}
              onChange={handleQuickInputChange}
              onKeyDown={handleEnterOnTextInput}
            />
          </div>
          <Button onClick={appendLog} className="w-full">
            Commit
            <CornerDownLeft size={13} />
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#1d221e] pt-3">
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-[#586058] xl:inline">
            Zero-input actions
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAppend(true, '생산')}
              title="현재 시각에 생산 기록 추가"
            >
              <Plus size={12} className="text-[#c9ff3d]" />
              Production now
              <kbd className="deck-key deck-key-dark">Alt 1</kbd>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAppend(false, '소비')}
              title="현재 시각에 소비 기록 추가"
            >
              <Minus size={12} className="text-[#ffb52e]" />
              Consumption now
              <kbd className="deck-key deck-key-dark">Alt 2</kbd>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4 pt-3">
        <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-[#687068]">
          <span>Raw event stream / editable source</span>
          <span className="text-[#9ca59d]">{logLineCount} entries</span>
        </div>
        <Textarea
          className="min-h-0 flex-1"
          value={rawLogs}
          ref={textareaRef}
          onChange={handleChange}
          spellCheck={false}
          aria-label="원본 활동 로그"
          placeholder="[09:00] + 첫 활동을 기록하세요"
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
