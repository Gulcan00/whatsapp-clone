import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] whitespace-nowrap',
  {
    variants: {
      variant: {
        default:     'bg-[var(--ink-0)] text-[var(--bg-0)] hover:bg-[var(--ink-1)]',
        accent:      'bg-[var(--accent)] text-[var(--accent-ink)] hover:brightness-95',
        outline:     'border border-[var(--line-strong)] bg-transparent text-[var(--ink-1)] hover:bg-[var(--bg-2)]',
        ghost:       'bg-transparent text-[var(--ink-1)] hover:bg-[var(--bg-2)]',
        destructive: 'bg-[var(--danger)] text-white hover:brightness-95',
        secondary:   'bg-[var(--bg-2)] text-[var(--ink-1)] hover:bg-[var(--bg-3)]',
        link:        'bg-transparent text-[var(--accent)] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-11 px-5 text-sm',
        sm:      'h-9 px-3.5 text-[13px]',
        lg:      'h-13 px-7 text-[15px]',
        icon:    'h-10 w-10 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
