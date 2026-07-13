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
  <label className="group relative flex h-10 cursor-pointer items-center border border-[#303631] bg-[#080b09] p-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em]">
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
        'flex h-full w-full items-center justify-center gap-1.5 border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#c9ff3d]/60',
        isProductive
          ? 'border-[#c9ff3d]/40 bg-[#c9ff3d]/10 text-[#c9ff3d]'
          : 'border-[#ffb52e]/40 bg-[#ffb52e]/10 text-[#ffbf49]',
      )}
    >
      {isProductive ? '+ Production' : '− Consumption'}
    </span>
  </label>
);
