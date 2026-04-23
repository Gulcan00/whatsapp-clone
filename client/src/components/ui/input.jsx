import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      'h-12 w-full px-4 rounded-xl bg-[var(--bg-1)] text-[15px] text-[var(--ink-1)] placeholder:text-[var(--ink-3)] border border-transparent focus:border-[var(--ink-0)] focus:bg-[var(--bg-0)] outline-none transition-all',
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };
