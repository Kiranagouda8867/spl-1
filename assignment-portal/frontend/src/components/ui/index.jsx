import React from 'react';
import { motion } from 'framer-motion';

export function GlassCard({ children, className = '', hover = true, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass ${hover ? 'hover:border-teal-500/30 transition-all duration-300' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function GlassPanel({ children, className = '', ...props }) {
  return (
    <div className={`glass-panel ${className}`} {...props}>
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, color = 'teal', trend, className = '' }) {
  const colors = {
    teal: 'from-teal-500/20 to-teal-600/10 border-teal-500/20 text-teal-400',
    violet: 'from-violet-500/20 to-violet-600/10 border-violet-500/20 text-violet-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400',
    rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/20 text-rose-400',
  };
  const [from, to, border, text] = colors[color]?.split(' ') || colors.teal.split(' ');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ translateY: -2 }}
      className={`stat-card ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value ?? '—'}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
          {trend !== undefined && (
            <span className={`text-xs font-medium mt-2 inline-block ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${from} ${to} border ${border} flex items-center justify-center flex-shrink-0`}>
            <Icon size={22} className={text} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    published: { cls: 'badge-teal', label: 'Published' },
    draft: { cls: 'badge-gray', label: 'Draft' },
    closed: { cls: 'badge-error', label: 'Closed' },
    submitted: { cls: 'badge-teal', label: 'Submitted' },
    late: { cls: 'badge-warning', label: 'Late' },
    graded: { cls: 'badge-success', label: 'Graded' },
    returned: { cls: 'badge-violet', label: 'Returned' },
    student: { cls: 'badge-teal', label: 'Student' },
    faculty: { cls: 'badge-violet', label: 'Faculty' },
    admin: { cls: 'badge-error', label: 'Admin' },
    active: { cls: 'badge-success', label: 'Active' },
    inactive: { cls: 'badge-gray', label: 'Inactive' },
  };
  const config = map[status?.toLowerCase()] || { cls: 'badge-gray', label: status };
  return <span className={`badge ${config.cls}`}>{config.label}</span>;
}

export function GradientButton({ children, onClick, type = 'button', disabled = false, size = 'md', className = '', loading = false, ...props }) {
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-2.5 text-sm rounded-xl',
    lg: 'px-8 py-3 text-base rounded-xl',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`btn-gradient ${sizes[size]} font-semibold transition-all duration-200 flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}

export function IconButton({ icon: Icon, onClick, label, size = 18, variant = 'ghost', className = '' }) {
  const variants = {
    ghost: 'hover:bg-white/5 text-slate-400 hover:text-white',
    teal: 'hover:bg-teal-500/15 text-teal-400/70 hover:text-teal-400',
    danger: 'hover:bg-red-500/15 text-slate-400 hover:text-red-400',
  };
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.98 }}
      className={`p-2 rounded-lg transition-all duration-200 ${variants[variant]} ${className}`}
    >
      <Icon size={size} />
    </motion.button>
  );
}

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-12 h-12 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 gap-4 text-center"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
          <Icon size={28} className="text-teal-400/60" />
        </div>
      )}
      <div>
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        {description && <p className="text-slate-400 text-sm mt-1 max-w-sm">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  );
}

export function PageHeader({ title, subtitle, action, breadcrumb }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        {breadcrumb && (
          <p className="text-slate-500 text-xs mb-1">{breadcrumb}</p>
        )}
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function FormField({ label, error, required, children, hint, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-teal-400 ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-glass pl-10"
      />
    </div>
  );
}

export { Modal, ConfirmDialog } from '../common/Modal';
