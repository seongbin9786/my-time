import React from 'react';

import { cn } from '../../lib/utils';

export const Badge = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full bg-[#e4ead7] px-3 py-1.5 text-[11px] font-semibold text-[#35402f]',
      className,
    )}
    {...props}
  />
);
