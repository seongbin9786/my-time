import clsx from 'clsx';
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  PropsWithChildren,
} from 'react';

export const Tabs = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('flex min-h-0 flex-col', className)} {...props} />
);

export const TabsList = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    role="tablist"
    className={clsx(
      'inline-flex h-9 items-center rounded-lg bg-slate-100 p-1 text-slate-500',
      className,
    )}
    {...props}
  />
);

interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const TabsTrigger = ({
  active = false,
  className,
  children,
  ...props
}: TabsTriggerProps) => (
  <button
    type="button"
    role="tab"
    aria-selected={active}
    className={clsx(
      'inline-flex h-7 items-center justify-center rounded-md px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
      active
        ? 'bg-white text-slate-950 shadow-sm'
        : 'text-slate-500 hover:text-slate-800',
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

interface TabsContentProps extends PropsWithChildren<
  HTMLAttributes<HTMLDivElement>
> {
  active?: boolean;
}

export const TabsContent = ({
  active = false,
  className,
  children,
  ...props
}: TabsContentProps) => {
  if (!active) return null;

  return (
    <div
      role="tabpanel"
      className={clsx('min-h-0 flex-1 outline-none', className)}
      {...props}
    >
      {children}
    </div>
  );
};
