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
  <label className="relative grid h-11 cursor-pointer grid-cols-2 border border-black bg-white p-1 text-xs font-semibold">
    <input
      type="checkbox"
      className="peer sr-only"
      checked={isProductive}
      onChange={(e) => setIsProductive(e.target.checked)}
      onKeyDown={onKeyDown}
      ref={checkboxRef}
    />
    <span
      className={clsx(
        'flex items-center justify-center transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4',
        isProductive ? 'bg-black text-white' : 'text-neutral-500',
      )}
    >
      + 생산
    </span>
    <span
      className={clsx(
        'flex items-center justify-center transition-colors',
        isProductive ? 'text-neutral-500' : 'bg-black text-white',
      )}
    >
      − 소비
    </span>
  </label>
);
