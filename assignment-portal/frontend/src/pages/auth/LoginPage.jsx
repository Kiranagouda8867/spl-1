import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { GradientButton, FormField } from '../../components/ui';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await login(form.email, form.password);
    if (result.success) {
      success('Welcome back!');
      const role = result.user?.role?.toLowerCase() || JSON.parse(localStorage.getItem('user') || '{}').role?.toLowerCase() || 'student';
      navigate(`/${role}/dashboard`);
    } else {
      showError(result.message);
    }
  };

  return (
    <div className="min-h-screen page-bg flex items-center justify-center p-4">
      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/6 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-500/6 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel w-full max-w-md p-8 relative"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center mb-4"
          >
            <GraduationCap size={28} className="text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your Assignment Portal account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Email Address" error={errors.email} required>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="login-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@university.edu"
                className="input-glass pl-10"
                autoComplete="email"
              />
            </div>
          </FormField>

          <FormField label="Password" error={errors.password} required>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Your password"
                className="input-glass pl-10 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormField>

          <GradientButton
            type="submit"
            loading={loading}
            className="w-full duration-300 login-submit-button"
            size="lg"
            id="login-submit"
            whileHover={{ scale: loading ? 1 : 1.03 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
          >
            Sign In
            <span className="login-submit-shimmer" aria-hidden="true" />
          </GradientButton>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
            Create account
          </Link>
        </p>

        {/* Demo credentials hint */}
        <div className="mt-6 p-3 rounded-xl bg-teal-500/5 border border-teal-500/15 text-center">
          <p className="text-xs text-slate-400">
            <span className="text-teal-400 font-semibold">Demo Accounts:</span>{' '}
            <span className="text-slate-300">student@portal.local</span> (pw: Student123!) &bull;{' '}
            <span className="text-slate-300">faculty@portal.local</span> (pw: Faculty123!) &bull;{' '}
            <span className="text-slate-300">admin@portal.local</span> (pw: Admin123!)
          </p>
        </div>
      </motion.div>
    </div>
  );
}
