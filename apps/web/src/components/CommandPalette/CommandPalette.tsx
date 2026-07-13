import clsx from 'clsx';
import { MinusCircle, PlusCircle, Search } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Card } from '../ui/card';
import { Input } from '../ui/input';

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
            import('../../utils/commandEvents').then((module) => {
              module.dispatchAddProductionStart(content);
            });
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
            import('../../utils/commandEvents').then((module) => {
              module.dispatchAddConsumptionStart(content);
            });
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
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
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

  // 검색어 변경 시 선택 인덱스 초기화
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="editorial-command-palette fixed inset-0 z-50 flex items-start justify-center px-6 pt-[14vh]">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-[#241d18]/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="명령 팔레트 닫기"
      />

      <Card
        role="dialog"
        aria-modal="true"
        aria-label="명령 팔레트"
        className="relative w-full max-w-xl overflow-hidden rounded-[4px] border-[#bbaa96] bg-[#fbf4e8] shadow-[0_30px_100px_rgba(35,25,18,0.38)]"
      >
        <div className="flex items-center gap-3 border-b border-[#cfc1ae] px-5 py-4">
          <Search className="h-4 w-4 text-[#a64f38]" />
          <Input
            ref={inputRef}
            className="h-auto flex-1 border-0 bg-transparent px-0 font-serif text-lg focus:border-0 focus:ring-0"
            placeholder="무엇을 기록할까요?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <kbd className="editorial-kbd">ESC</kbd>
        </div>

        <div ref={listRef} className="max-h-80 overflow-y-auto py-2.5">
          {filteredCommands.length === 0 ? (
            <div className="px-5 py-9 text-center font-serif italic text-[#8a7d70]">
              검색 결과가 없습니다
            </div>
          ) : (
            filteredCommands.map((command, index) => (
              <button
                key={command.id}
                type="button"
                className={clsx(
                  'flex w-full items-center gap-3 border-l-2 px-5 py-3 text-left transition-colors',
                  index === selectedIndex
                    ? 'border-[#a64f38] bg-[#efe2d2] text-[#8f412e]'
                    : 'border-transparent text-[#41372f] hover:bg-[#f4eadd]',
                )}
                onClick={() => {
                  command.action();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {command.icon && (
                  <span className="flex-shrink-0 text-[#a64f38]">
                    {command.icon}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-serif font-semibold">
                    {command.label}
                  </div>
                  {command.description && (
                    <div className="mt-0.5 truncate text-[11px] text-[#85786b]">
                      {command.description}
                    </div>
                  )}
                </div>
                {index === selectedIndex && (
                  <kbd className="editorial-kbd">↵</kbd>
                )}
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#cfc1ae] bg-[#f1e6d8] px-5 py-2.5 text-[10px] text-[#776b5f]">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="editorial-kbd">↑</kbd>
              <kbd className="editorial-kbd">↓</kbd> 이동
            </span>
            <span>
              <kbd className="editorial-kbd">↵</kbd> 실행
            </span>
          </div>
          <span>
            <kbd className="editorial-kbd">ESC</kbd> 닫기
          </span>
        </div>
      </Card>
    </div>
  );
};

export default CommandPalette;
