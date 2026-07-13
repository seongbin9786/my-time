import clsx from 'clsx';
import { forwardRef, InputHTMLAttributes } from 'react';

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, type = 'text', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={clsx(
      'h-10 w-full border border-[#303631] bg-[#080b09] px-3 font-mono text-xs text-[#edf2ed] outline-none transition placeholder:text-[#596159] focus:border-[#c9ff3d]/80 focus:bg-[#0c100d] focus:ring-1 focus:ring-[#c9ff3d]/20 disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));

Input.displayName = 'Input';
