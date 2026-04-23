import * as React from 'react';
import { cn } from '@/lib/utils';

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('text-xs font-semibold uppercase tracking-[0.06em] text-[var(--ink-2)]', className)}
    {...props}
  />
));
Label.displayName = 'Label';

export { Label };
