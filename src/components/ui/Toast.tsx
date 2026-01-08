import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast = ({ id, type, title, message, duration = 5000, onClose }: ToastProps) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success-400" />,
    error: <XCircle className="w-5 h-5 text-danger-400" />,
    warning: <AlertCircle className="w-5 h-5 text-warning-400" />,
    info: <Info className="w-5 h-5 text-primary-400" />,
  };

  const borderColors = {
    success: 'border-l-success-500',
    error: 'border-l-danger-500',
    warning: 'border-l-warning-500',
    info: 'border-l-primary-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      className={`
        bg-dark-900 border border-dark-800 border-l-4 ${borderColors[type]}
        rounded-lg shadow-xl p-4 min-w-[300px] max-w-md
        flex items-start gap-3
      `}
    >
      {icons[type]}
      <div className="flex-1">
        <h4 className="font-semibold text-white">{title}</h4>
        {message && <p className="text-sm text-dark-400 mt-1">{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        aria-label="Cerrar notificación"
        className="text-dark-500 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// Toast Container and Hook
interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

let toastId = 0;
let addToastFn: ((toast: Omit<ToastData, 'id'>) => void) | null = null;

export const toast = {
  success: (title: string, message?: string) => {
    addToastFn?.({ type: 'success', title, message });
  },
  error: (title: string, message?: string) => {
    addToastFn?.({ type: 'error', title, message });
  },
  warning: (title: string, message?: string) => {
    addToastFn?.({ type: 'warning', title, message });
  },
  info: (title: string, message?: string) => {
    addToastFn?.({ type: 'info', title, message });
  },
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    addToastFn = (toast) => {
      const id = `toast_${++toastId}`;
      setToasts((prev) => [...prev, { ...toast, id }]);
    };

    return () => {
      addToastFn = null;
    };
  }, []);

  const handleClose = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={handleClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
