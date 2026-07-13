import clsx from 'clsx';
import React from 'react';

interface ProductiveToggleProps {
  isProductive: boolean;
  setIsProductive: (value: boolean) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const ProductiveToggle = ({
  isProductive,
  setIsProductive,
  onKeyDown,
}: ProductiveToggleProps) => (
  <label className="relative grid h-12 cursor-pointer grid-cols-2 rounded-2xl bg-[#e8eadf] p-1 text-xs font-semibold text-[#28362c]">
    <input
      type="checkbox"
      className="peer sr-only"
      checked={isProductive}
      onChange={(e) => setIsProductive(e.target.checked)}
      onKeyDown={onKeyDown}
    />
    <span
      className={clsx(
        'flex items-center justify-center rounded-xl transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-[#28362c]',
        isProductive
          ? 'bg-[#354437] text-[#fffdf6] shadow-sm'
          : 'text-[#28362c]/45',
      )}
    >
      + 생산
    </span>
    <span
      className={clsx(
        'flex items-center justify-center rounded-xl transition-all',
        isProductive
          ? 'text-[#28362c]/45'
          : 'bg-[#f4a88f] text-[#40261e] shadow-sm',
      )}
    >
      − 소비
    </span>
  </label>
);
