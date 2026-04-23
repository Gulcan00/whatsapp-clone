import { createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

const Ctx = createContext(null);

export function Tabs({ value, onValueChange, children, className }) {
  return <Ctx.Provider value={{ value, onValueChange }}><div className={className}>{children}</div></Ctx.Provider>;
}
export function TabsList({ className, children }) {
  return <div className={cn('inline-flex items-center gap-1 rounded-full bg-[var(--bg-1)] p-1', className)}>{children}</div>;
}
export function TabsTrigger({ value: v, children, className }) {
  const { value, onValueChange } = useContext(Ctx);
  const active = value === v;
  return (
    <button
      onClick={() => onValueChange(v)}
      className={cn(
        'px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors',
        active ? 'bg-[var(--ink-0)] text-[var(--bg-0)]' : 'text-[var(--ink-2)] hover:text-[var(--ink-0)]',
        className
      )}
    >
      {children}
    </button>
  );
}
export function TabsContent({ value: v, children, className }) {
  const { value } = useContext(Ctx);
  if (value !== v) return null;
  return <div className={className}>{children}</div>;
}
