import React from 'react';

import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  type?: React.HTMLInputTypeAttribute;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-12 w-full rounded-2xl border border-[#28362c]/15 bg-white/80 px-4 text-sm text-[#28362c] outline-none placeholder:text-[#28362c]/35 focus:border-[#28362c]/40 focus:ring-4 focus:ring-[#b9c8a3]/25 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
