import clsx from 'clsx';
import { forwardRef, TextareaHTMLAttributes } from 'react';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={clsx(
      'w-full resize-none border border-[#282e29] bg-[#060806] p-4 font-mono text-[12px] leading-6 text-[#cbd4cc] outline-none transition placeholder:text-[#505750] focus:border-[#c9ff3d]/60 focus:ring-1 focus:ring-[#c9ff3d]/15',
      className,
    )}
    {...props}
  />
));

Textarea.displayName = 'Textarea';
