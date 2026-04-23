import { cn } from '@/lib/utils';

export function Card({ className, ...props }) {
  return <div className={cn('rounded-2xl border border-[var(--line)] bg-[var(--bg-0)] shadow-sm', className)} {...props} />;
}
export function CardHeader({ className, ...props }) {
  return <div className={cn('p-5 border-b border-[var(--line)]', className)} {...props} />;
}
export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-lg font-bold tracking-tight text-[var(--ink-0)]', className)} {...props} />;
}
export function CardContent({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />;
}
export function CardFooter({ className, ...props }) {
  return <div className={cn('p-5 border-t border-[var(--line)]', className)} {...props} />;
}
