import { useState, useCallback } from 'react';
import type { ToastConfig } from '../ui/Toast';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const addToast = useCallback((toast: Omit<ToastConfig, 'id'>) => {
    const id = `toast-${toastId++}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
  };
}
