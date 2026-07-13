import clsx from 'clsx';
import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  type?: React.HTMLInputTypeAttribute;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={clsx(
        'flex h-10 w-full rounded-md border border-[#cbbdab] bg-[#fffaf1]/75 px-3 text-sm text-[#2f2924] outline-none transition placeholder:text-[#948577] focus:border-[#a64f38] focus:ring-2 focus:ring-[#a64f38]/10 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
