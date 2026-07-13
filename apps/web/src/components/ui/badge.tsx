import clsx from 'clsx';
import { HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'muted';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: 'border-[#c9ff3d]/40 bg-[#c9ff3d]/10 text-[#c9ff3d]',
  success: 'border-[#65f59a]/40 bg-[#65f59a]/10 text-[#65f59a]',
  warning: 'border-[#ffb52e]/40 bg-[#ffb52e]/10 text-[#ffbf49]',
  danger: 'border-[#ff6b4a]/40 bg-[#ff6b4a]/10 text-[#ff8a70]',
  muted: 'border-[#343a35] bg-[#151915] text-[#929b93]',
};

export const Badge = ({
  className,
  variant = 'default',
  ...props
}: BadgeProps) => (
  <span
    className={clsx(
      'inline-flex h-6 items-center border px-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em]',
      variants[variant],
      className,
    )}
    {...props}
  />
);
