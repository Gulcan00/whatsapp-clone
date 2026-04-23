import * as React from 'react';
import { X } from 'lucide-react';

export function Dialog({ open, onOpenChange, children }) {
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onOpenChange?.(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onOpenChange]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center fade-in"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={() => onOpenChange?.(false)}
    >
      {children}
    </div>
  );
}

export function DialogContent({ className = '', children }) {
  return (
    <div
      onClick={e => e.stopPropagation()}
      className={`relative rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden scale-in w-full max-w-lg ${className}`}
      style={{ background: 'var(--bg-0)' }}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ className = '', children }) {
  return (
    <div className={`px-6 py-5 flex items-center justify-between border-b ${className}`}
      style={{ borderColor: 'var(--line)' }}>
      {children}
    </div>
  );
}

export function DialogTitle({ className = '', children }) {
  return <h2 className={`text-xl font-extrabold tracking-tight ${className}`} style={{ color: 'var(--ink-0)' }}>{children}</h2>;
}

export function DialogFooter({ className = '', children }) {
  return (
    <div className={`flex items-center justify-end gap-2 pt-4 ${className}`}>
      {children}
    </div>
  );
}

export function DialogClose({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="h-9 w-9 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--bg-2)]"
      style={{ color: 'var(--ink-2)' }}
    >
      <X size={18} />
    </button>
  );
}
