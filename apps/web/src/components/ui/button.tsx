import React from 'react';

import { cn } from '../../lib/utils';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'default' | 'sm' | 'icon';

const variants: Record<ButtonVariant, string> = {
  default: 'bg-[#28362c] text-[#fffdf6] hover:bg-[#1f2a22]',
  secondary: 'bg-[#f4a88f] text-[#40261e] hover:bg-[#ee9577]',
  outline:
    'border border-[#28362c]/20 bg-white/55 text-[#28362c] hover:bg-white',
  ghost: 'bg-transparent text-[#28362c] hover:bg-[#28362c]/5',
};

const sizes: Record<ButtonSize, string> = {
  default: 'h-11 px-5',
  sm: 'h-8 px-3 text-xs',
  icon: 'h-10 w-10',
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
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28362c] focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
