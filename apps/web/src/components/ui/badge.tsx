import clsx from 'clsx';
import * as React from 'react';

type BadgeVariant = 'default' | 'outline' | 'olive' | 'terracotta';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-[#342c26] text-[#fffaf1]',
  outline: 'border-[#c7b8a5] bg-transparent text-[#665b50]',
  olive: 'border-[#738069]/25 bg-[#738069]/10 text-[#4d5947]',
  terracotta: 'border-[#a64f38]/25 bg-[#a64f38]/10 text-[#8f412e]',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = ({
  className,
  variant = 'default',
  ...props
}: BadgeProps) => (
  <span
    className={clsx(
      'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]',
      variantClasses[variant],
      className,
    )}
    {...props}
  />
);
