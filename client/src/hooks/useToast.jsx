import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Sparkles,
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const pushToast = (toast) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, type: 'info', ...toast }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3600);
  };

  const value = useMemo(() => ({ pushToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = icons[toast.type] || icons.info;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="pointer-events-auto rounded-3xl border border-white/70 bg-slate-950/90 p-4 text-white shadow-2xl shadow-slate-900/30 backdrop-blur-xl"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white/10 p-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{toast.title}</p>
                    <p className="mt-1 text-xs text-slate-300">{toast.message}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
};
