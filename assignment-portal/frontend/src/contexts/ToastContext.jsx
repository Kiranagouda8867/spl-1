import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

const TOAST_STYLES = {
  success: { border: 'border-emerald-500/30', icon: '✓', color: 'text-emerald-400' },
  error: { border: 'border-red-500/30', icon: '✕', color: 'text-red-400' },
  warning: { border: 'border-amber-500/30', icon: '⚠', color: 'text-amber-400' },
  info: { border: 'border-teal-500/30', icon: 'ℹ', color: 'text-teal-400' },
};

function Toast({ toast, onRemove }) {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  return (
    <div className={`toast border ${style.border}`} role="alert">
      <span className={`text-lg font-bold ${style.color} flex-shrink-0`}>{style.icon}</span>
      <p className="text-sm text-slate-200 flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-slate-400 hover:text-white text-xs ml-2 flex-shrink-0"
        aria-label="Dismiss"
      >✕</button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
