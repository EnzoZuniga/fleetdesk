import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../lib/cn';

export interface ToastConfig {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps extends ToastConfig {
  onClose: () => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

export function Toast({ message, type = 'info', duration = 5000, action, onClose }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const Icon = icons[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
      className={cn(
        'flex items-center gap-3 rounded-lg shadow-lg px-4 py-3 min-w-[320px] max-w-md',
        'bg-stone-900 text-white'
      )}
    >
      <Icon size={20} className="flex-shrink-0" />
      <p className="flex-1 text-sm">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="text-[#8B9A3D] hover:text-[#a0b347] font-medium text-sm transition"
        >
          {action.label}
        </button>
      )}
      <button
        onClick={onClose}
        className="text-stone-400 hover:text-white transition"
        aria-label="Fermer"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastConfig[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
