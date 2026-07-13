import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'default' | 'sm' | 'icon';

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400',
  outline:
    'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-blue-500',
  ghost:
    'text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-blue-500',
  danger:
    'bg-orange-50 text-orange-700 hover:bg-orange-100 focus-visible:ring-orange-500',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  icon: 'h-9 w-9',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      type = 'button',
      variant = 'default',
      size = 'default',
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={clsx(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
