import clsx from 'clsx';
import type { HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'info' | 'success' | 'warning' | 'outline';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-slate-200 bg-slate-100 text-slate-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  success: 'border-cyan-200 bg-cyan-50 text-cyan-800',
  warning: 'border-orange-200 bg-orange-50 text-orange-700',
  outline: 'border-slate-200 bg-white text-slate-500',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = ({
  className,
  variant = 'default',
  ...props
}: BadgeProps) => (
  <span
    className={clsx(
      'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]',
      variantClasses[variant],
      className,
    )}
    {...props}
  />
);
