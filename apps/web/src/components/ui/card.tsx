import clsx from 'clsx';
import * as React from 'react';

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      'rounded-lg border border-[#cfc1ae] bg-[#fbf4e8] text-[#2e2823] shadow-[0_18px_45px_rgba(76,55,38,0.08)]',
      className,
    )}
    {...props}
  />
));
Card.displayName = 'Card';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={clsx('p-5', className)} {...props} />
));
CardContent.displayName = 'CardContent';
