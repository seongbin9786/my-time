import clsx from 'clsx';
import { Minus, Plus } from 'lucide-react';
import React from 'react';

import { Button } from '../ui/button';

interface ProductiveToggleProps {
  isProductive: boolean;
  setIsProductive: (value: boolean) => void;
  firstButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export const ProductiveToggle = ({
  isProductive,
  setIsProductive,
  firstButtonRef,
}: ProductiveToggleProps) => (
  <div
    role="radiogroup"
    aria-label="기록 유형"
    className="inline-flex rounded-md border border-[#c8b9a5] bg-[#eee2d3] p-1"
  >
    <Button
      ref={firstButtonRef}
      role="radio"
      aria-checked={isProductive}
      variant="ghost"
      size="sm"
      className={clsx(
        'h-7 gap-1.5 px-2.5 text-[11px]',
        isProductive
          ? '!bg-[#66715d] !text-[#fffaf1] shadow-sm'
          : 'text-[#6d6359]',
      )}
      onClick={() => setIsProductive(true)}
    >
      <Plus size={12} /> 생산
      <span className="ml-0.5 text-[8px] opacity-65">ALT 1</span>
    </Button>
    <Button
      role="radio"
      aria-checked={!isProductive}
      variant="ghost"
      size="sm"
      className={clsx(
        'h-7 gap-1.5 px-2.5 text-[11px]',
        !isProductive
          ? '!bg-[#a64f38] !text-[#fffaf1] shadow-sm'
          : 'text-[#6d6359]',
      )}
      onClick={() => setIsProductive(false)}
    >
      <Minus size={12} /> 소비
      <span className="ml-0.5 text-[8px] opacity-65">ALT 2</span>
    </Button>
  </div>
);
