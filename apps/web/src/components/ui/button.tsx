import clsx from 'clsx';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'outline' | 'ghost';
type ButtonSize = 'default' | 'sm' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-[#c9ff3d] bg-[#c9ff3d] text-[#080a08] hover:bg-[#dbff78] hover:border-[#dbff78]',
  outline:
    'border-[#343a35] bg-[#0b0e0c] text-[#d5ddd6] hover:border-[#c9ff3d]/70 hover:text-[#c9ff3d]',
  ghost:
    'border-transparent bg-transparent text-[#889189] hover:bg-[#151a16] hover:text-[#f3f6f3]',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-10 px-4 text-[11px]',
  sm: 'h-8 px-3 text-[10px]',
  icon: 'h-9 w-9 p-0',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'default',
      type = 'button',
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={clsx(
        'inline-flex shrink-0 items-center justify-center gap-2 border font-mono font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9ff3d]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070907] disabled:pointer-events-none disabled:opacity-40',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
