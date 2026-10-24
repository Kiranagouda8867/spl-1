import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, User, CreditCard, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { GradientButton, FormField } from '../../components/ui';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', studentId: '', department: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'At least 8 characters';
    else if (!/\d/.test(form.password)) errs.password = 'Must contain a number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await register(form);
    if (result.success) {
      success('Account created successfully!');
      navigate('/student/dashboard');
    } else {
      showError(result.message);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen page-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-violet-500/6 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-500/6 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel w-full max-w-md p-8 relative"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center mb-4">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Join the Assignment Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Full Name" error={errors.name} required>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input id="reg-name" type="text" value={form.name} onChange={set('name')} placeholder="Your full name" className="input-glass pl-10" />
            </div>
          </FormField>

          <FormField label="Email Address" error={errors.email} required>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input id="reg-email" type="email" value={form.email} onChange={set('email')} placeholder="you@university.edu" className="input-glass pl-10" />
            </div>
          </FormField>

          <FormField label="Password" error={errors.password} required hint="Min 8 characters, must include a number">
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="Create a strong password"
                className="input-glass pl-10 pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Student ID" hint="Optional">
              <div className="relative">
                <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="reg-student-id" type="text" value={form.studentId} onChange={set('studentId')} placeholder="e.g. CS2024001" className="input-glass pl-10" />
              </div>
            </FormField>
            <FormField label="Department" hint="Optional">
              <input id="reg-dept" type="text" value={form.department} onChange={set('department')} placeholder="e.g. CS" className="input-glass" />
            </FormField>
          </div>

          <div className="pt-1">
            <p className="text-xs text-slate-500 mb-3">
              Accounts are registered as <span className="text-teal-400">student</span> by default.
              Contact your administrator to request a different role.
            </p>
            <GradientButton type="submit" loading={loading} className="w-full" size="lg" id="reg-submit">
              Create Account
            </GradientButton>
          </div>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
