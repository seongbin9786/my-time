import clsx from 'clsx';
import * as React from 'react';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'muted';
type ButtonSize = 'default' | 'sm' | 'icon';

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-[#a64f38] text-[#fffaf1] shadow-[0_1px_0_rgba(69,42,32,0.2)] hover:bg-[#8f412e]',
  outline:
    'border border-[#cbbdab] bg-[#fffaf1]/70 text-[#332a24] hover:border-[#a64f38] hover:bg-[#f5eadc]',
  ghost: 'text-[#665b50] hover:bg-[#ede1d1] hover:text-[#2c241f]',
  muted: 'bg-[#e9ddcc] text-[#4d4238] hover:bg-[#ded0bd]',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 px-3 text-xs',
  icon: 'h-9 w-9',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
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
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a64f38]/40 disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
