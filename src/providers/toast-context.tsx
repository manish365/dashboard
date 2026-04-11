'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';
interface Toast { id: string; message: string; type: ToastType; }
interface ToastContextValue { showToast: (message: string, type?: ToastType) => void; }

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    error:   <AlertCircle className="h-5 w-5 text-red-500" />,
    info:    <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  };

  const colors = {
    success: 'border-emerald-500/20 bg-emerald-500/10',
    error:   'border-red-500/20 bg-red-500/10',
    info:    'border-blue-500/20 bg-blue-500/10',
    warning: 'border-amber-500/20 bg-amber-500/10',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2" style={{ minWidth: '300px' }}>
        {toasts.map(toast => (
          <div key={toast.id}
            className={`flex items-center gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-right-10 duration-300 ${colors[toast.type]}`}>
            {icons[toast.type]}
            <p className="theme-text flex-1 text-sm font-medium">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="rounded-lg p-1 transition-colors hover:bg-black/5">
              <X className="theme-text-muted h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
