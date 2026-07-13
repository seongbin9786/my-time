import React from 'react';

import { cn } from '../../lib/utils';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'inverse';
type ButtonSize = 'default' | 'sm' | 'icon';

const variants: Record<ButtonVariant, string> = {
  default: 'border-black bg-black text-white hover:bg-neutral-800',
  outline:
    'border-black bg-transparent text-black hover:bg-black hover:text-white',
  ghost: 'border-transparent bg-transparent text-black hover:bg-black/5',
  inverse: 'border-white bg-white text-black hover:bg-neutral-200',
};

const sizes: Record<ButtonSize, string> = {
  default: 'h-10 px-4',
  sm: 'h-8 px-3 text-xs',
  icon: 'h-9 w-9',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
