import { cn } from '@/lib/utils';

const variants = {
  default:     'bg-[var(--ink-0)] text-[var(--bg-0)]',
  accent:      'bg-[var(--accent-soft)] text-[var(--accent-ink)]',
  outline:     'border border-[var(--line-strong)] text-[var(--ink-2)]',
  secondary:   'bg-[var(--bg-2)] text-[var(--ink-1)]',
  destructive: 'bg-[var(--danger)] text-white',
};

export function Badge({ variant = 'default', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.04em]',
        variants[variant], className
      )}
      {...props}
    />
  );
}
