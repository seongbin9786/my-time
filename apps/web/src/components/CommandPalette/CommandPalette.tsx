import clsx from 'clsx';
import { MinusCircle, PlusCircle, Search } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  dispatchAddConsumptionStart,
  dispatchAddProductionStart,
} from '../../utils/commandEvents';

export interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 검색어로 커맨드 필터링
  const filteredCommands = useMemo(() => {
    const trimmedQuery = searchQuery.trim();

    // 1. Dynamic Command: 생산 (+ ...)
    if (trimmedQuery.startsWith('+')) {
      const content = trimmedQuery.substring(1).trim();
      return [
        {
          id: 'dynamic-add-production',
          label: content ? `생산 기록 추가: ${content}` : '생산 기록 추가',
          description: '입력한 내용으로 생산 기록을 추가합니다',
          icon: <PlusCircle size={18} />,
          action: () => {
            dispatchAddProductionStart(content);
          },
        },
      ];
    }

    // 2. Dynamic Command: 소비 (- ...)
    if (trimmedQuery.startsWith('-')) {
      const content = trimmedQuery.substring(1).trim();
      return [
        {
          id: 'dynamic-add-consumption',
          label: content ? `소비 기록 추가: ${content}` : '소비 기록 추가',
          description: '입력한 내용으로 소비 기록을 추가합니다',
          icon: <MinusCircle size={18} />,
          action: () => {
            dispatchAddConsumptionStart(content);
          },
        },
      ];
    }

    if (!trimmedQuery) return commands;

    const query = trimmedQuery.toLowerCase();
    return commands.filter((command) => {
      const labelMatch = command.label.toLowerCase().includes(query);
      const descriptionMatch = command.description
        ?.toLowerCase()
        .includes(query);
      const keywordMatch = command.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(query),
      );
      return labelMatch || descriptionMatch || keywordMatch;
    });
  }, [commands, searchQuery]);

  // 팔레트가 열릴 때 상태 초기화 및 포커스
  useEffect(() => {
    if (isOpen) {
      const focusTimer = setTimeout(() => {
        setSearchQuery('');
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 0);

      return () => clearTimeout(focusTimer);
    }
  }, [isOpen]);

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0,
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1,
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, selectedIndex, filteredCommands]);

  // 선택된 항목이 보이도록 스크롤
  useEffect(() => {
    if (listRef.current && filteredCommands.length > 0) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, filteredCommands.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] font-mono">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-[#020302]/85 backdrop-blur-sm"
        onClick={onClose}
        aria-label="커맨드 팔레트 닫기"
      />

      <div className="relative w-full max-w-xl overflow-hidden border border-[#3a423b] bg-[#080b09] shadow-[0_30px_100px_rgba(0,0,0,0.75),0_0_0_1px_rgba(201,255,61,0.05)]">
        <div className="flex items-center justify-between border-b border-[#262c27] bg-[#0d110e] px-4 py-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c9ff3d]">
            Command routing
          </span>
          <span className="text-[8px] uppercase tracking-[0.14em] text-[#59625a]">
            Focus deck / 01
          </span>
        </div>
        {/* 검색 입력 */}
        <div className="flex items-center gap-3 border-b border-[#303631] px-4 py-4">
          <Search className="h-4 w-4 text-[#c9ff3d]" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-sm text-[#edf2ed] outline-none placeholder:text-[#566057]"
            placeholder="명령 검색 또는 + / - 로 즉시 기록..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <kbd className="deck-key">ESC</kbd>
        </div>

        {/* 커맨드 목록 */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="border border-dashed border-[#2a302b] px-4 py-10 text-center text-[10px] uppercase tracking-[0.12em] text-[#687169]">
              검색 결과가 없습니다
            </div>
          ) : (
            filteredCommands.map((command, index) => (
              <button
                key={command.id}
                type="button"
                className={clsx(
                  'flex w-full items-center gap-3 border px-3 py-3 text-left transition-colors',
                  index === selectedIndex
                    ? 'border-[#c9ff3d]/40 bg-[#c9ff3d]/10 text-[#c9ff3d]'
                    : 'border-transparent text-[#b7c0b8] hover:border-[#2f3630] hover:bg-[#101511]',
                )}
                onClick={() => {
                  command.action();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {command.icon && (
                  <span className="flex-shrink-0 opacity-80">
                    {command.icon}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold uppercase tracking-[0.08em]">
                    {command.label}
                  </div>
                  {command.description && (
                    <div className="mt-1 truncate text-[9px] text-[#697269]">
                      {command.description}
                    </div>
                  )}
                </div>
                {index === selectedIndex && <kbd className="deck-key">↵</kbd>}
              </button>
            ))
          )}
        </div>

        {/* 도움말 */}
        <div className="flex items-center justify-between border-t border-[#303631] bg-[#0d110e] px-4 py-2 text-[8px] uppercase tracking-[0.12em] text-[#626b63]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="deck-key mr-1">↑↓</kbd> 이동
            </span>
            <span>
              <kbd className="deck-key mr-1">↵</kbd> 실행
            </span>
          </div>
          <span>
            <kbd className="deck-key mr-1">ESC</kbd> 닫기
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
