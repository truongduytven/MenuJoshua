'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastMessage } from '@/types/restaurant';
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react';
import { soundManager } from '@/lib/audio';

interface ToastContextType {
  showToast: (message: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, description, type = 'success', action }: Omit<ToastMessage, 'id'>) => {
      const id = 'toast-' + Math.random().toString(36).substr(2, 9);
      const newToast: ToastMessage = { id, title, description, type, action };

      setToasts((prev) => [...prev.slice(-3), newToast]); // Keep at most 4 toasts

      if (type === 'success') {
        soundManager.playSuccessChime();
      } else {
        soundManager.playClick();
      }

      // Auto dismiss after 4.5s if no action, or 6s if action
      const duration = action ? 6000 : 4000;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          let icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
          if (toast.type === 'error') {
            icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
          } else if (toast.type === 'info') {
            icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className="pointer-events-auto bg-white/95 backdrop-blur-md dark:bg-zinc-900/95 border border-stone-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xl flex items-start gap-3 text-stone-800 dark:text-stone-100 animate-pop-in transition-all"
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 text-sm">
                <p className="font-bold text-stone-900 dark:text-stone-100">{toast.title}</p>
                {toast.description && (
                  <p className="text-stone-500 dark:text-stone-400 text-xs mt-0.5 leading-relaxed">{toast.description}</p>
                )}
                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action?.onClick();
                      removeToast(toast.id);
                    }}
                    className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-800 dark:text-stone-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
