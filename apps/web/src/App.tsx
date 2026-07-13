import './App.css';

import { MinusCircle, PlusCircle } from 'lucide-react';
import { useEffect, useMemo } from 'react';

import { Command, CommandPalette } from './components/CommandPalette';
import { useCommandPalette } from './hooks/useCommandPalette';
import { Routes } from './Routes';
import {
  dispatchAddConsumptionStart,
  dispatchAddProductionStart,
  focusActivityInput,
} from './utils/commandEvents';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

export const App = () => {
  const { isOpen, close } = useCommandPalette();

  useEffect(() => {
    console.log(`[build version] ${__BUILD_VERSION__}`);
  }, []);

  useEffect(() => {
    const handleOperationalShortcuts = (event: KeyboardEvent) => {
      const hasOpenDialog = document.querySelector('.modal-open') !== null;
      if (isOpen || hasOpenDialog || event.isComposing) {
        return;
      }

      if (
        event.key === '/' &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !isEditableTarget(event.target)
      ) {
        event.preventDefault();
        focusActivityInput();
        return;
      }

      if (event.altKey && !event.ctrlKey && !event.metaKey) {
        if (event.code === 'Digit1') {
          event.preventDefault();
          dispatchAddProductionStart();
        }

        if (event.code === 'Digit2') {
          event.preventDefault();
          dispatchAddConsumptionStart();
        }
      }
    };

    window.addEventListener('keydown', handleOperationalShortcuts);
    return () =>
      window.removeEventListener('keydown', handleOperationalShortcuts);
  }, [isOpen]);

  const commands: Command[] = useMemo(
    () => [
      {
        id: 'focus-activity-input',
        label: '신규 활동 추가',
        description: '활동 입력창으로 이동하여 새 활동을 기록합니다',
        icon: <PlusCircle size={18} />,
        action: focusActivityInput,
        keywords: ['활동', '추가', '입력', 'activity', 'add', 'new'],
      },
      {
        id: 'add-production-start',
        label: '생산 시작 기록 추가',
        description: '현재 시각으로 생산 활동을 시작합니다',
        icon: <PlusCircle size={18} />,
        action: () => {
          dispatchAddProductionStart();
        },
        keywords: ['생산', 'production', 'start', '시작'],
      },
      {
        id: 'add-consumption-start',
        label: '소비 시작 기록 추가',
        description: '현재 시각으로 소비 활동을 시작합니다',
        icon: <MinusCircle size={18} />,
        action: () => {
          dispatchAddConsumptionStart();
        },
        keywords: ['소비', 'consumption', 'start', '시작'],
      },
    ],
    [],
  );

  return (
    <>
      <Routes />
      <CommandPalette isOpen={isOpen} onClose={close} commands={commands} />
    </>
  );
};
