import clsx from 'clsx';
import { HTMLAttributes } from 'react';

export const Card = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <section
    className={clsx(
      'border border-[#242a25] bg-[#0a0d0b]/95 text-[#e8eee9] shadow-[0_24px_80px_rgba(0,0,0,0.22)]',
      className,
    )}
    {...props}
  />
);

export const CardHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx('border-b border-[#202621] px-4 py-3', className)}
    {...props}
  />
);

export const CardTitle = ({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className={clsx(
      'font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#f1f5f1]',
      className,
    )}
    {...props}
  />
);

export const CardContent = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('p-4', className)} {...props} />
);
