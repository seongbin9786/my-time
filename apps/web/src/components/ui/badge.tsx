import React from 'react';

import { cn } from '../../lib/utils';

export const Badge = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      'inline-flex items-center border border-black px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]',
      className,
    )}
    {...props}
  />
);
