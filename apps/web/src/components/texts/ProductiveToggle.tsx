import clsx from 'clsx';
import React from 'react';

interface ProductiveToggleProps {
  isProductive: boolean;
  setIsProductive: (value: boolean) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  checkboxRef: React.RefObject<HTMLInputElement | null>;
}

export const ProductiveToggle = ({
  isProductive,
  setIsProductive,
  onKeyDown,
  checkboxRef,
}: ProductiveToggleProps) => (
  <label
    className={clsx(
      'relative inline-flex h-9 w-[82px] shrink-0 cursor-pointer items-center rounded-lg border p-1 transition',
      isProductive
        ? 'border-cyan-200 bg-cyan-50'
        : 'border-orange-200 bg-orange-50',
    )}
    title="Space 키로 생산/소비 전환"
  >
    <input
      type="checkbox"
      className="peer sr-only"
      checked={isProductive}
      onChange={(e) => setIsProductive(e.target.checked)}
      onKeyDown={onKeyDown}
      ref={checkboxRef}
      aria-label={isProductive ? '생산 기록' : '소비 기록'}
    />
    <span className="pointer-events-none flex w-full items-center justify-center gap-1.5 text-xs font-bold">
      <span
        className={clsx(
          'flex h-5 w-5 items-center justify-center rounded-md text-sm text-white',
          isProductive ? 'bg-cyan-600' : 'bg-orange-500',
        )}
      >
        {isProductive ? '+' : '−'}
      </span>
      <span className={isProductive ? 'text-cyan-800' : 'text-orange-800'}>
        {isProductive ? '생산' : '소비'}
      </span>
    </span>
  </label>
);
