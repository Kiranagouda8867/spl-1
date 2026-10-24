import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    if (!message) return null;
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);

    return id;
  }, []);

  const showToast = useCallback((type, message, duration) => {
    return addToast(message, type, duration);
  }, [addToast]);

  const success = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
  const error = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast]);
  const info = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);
  const warning = useCallback((msg, duration) => addToast(msg, 'warning', duration), [addToast]);

  const value = useMemo(() => ({
    showToast,
    success,
    error,
    info,
    warning,
    addToast,
    removeToast,
  }), [showToast, success, error, info, warning, addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

const TOAST_STYLES = {
  success: { border: 'border-emerald-500/30', bg: 'bg-emerald-950/80', icon: '✓', color: 'text-emerald-400' },
  error: { border: 'border-red-500/30', bg: 'bg-red-950/80', icon: '✕', color: 'text-red-400' },
  warning: { border: 'border-amber-500/30', bg: 'bg-amber-950/80', icon: '⚠', color: 'text-amber-400' },
  info: { border: 'border-teal-500/30', bg: 'bg-navy-900/90', icon: 'ℹ', color: 'text-teal-400' },
};

function Toast({ toast, onRemove }) {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  return (
    <div
      className={`toast pointer-events-auto flex items-center gap-3 p-3.5 rounded-xl backdrop-blur-md border ${style.border} ${style.bg} shadow-lg shadow-black/40 text-sm`}
      role="alert"
    >
      <span className={`text-base font-bold ${style.color} flex-shrink-0`}>{style.icon}</span>
      <p className="text-slate-200 flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-slate-400 hover:text-white text-xs ml-1 flex-shrink-0 p-1"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Return graceful fallback so components don't crash if rendered outside provider
    return {
      showToast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
      warning: () => {},
      addToast: () => {},
      removeToast: () => {},
    };
  }
  return ctx;
}
