import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Mail,
  Lock,
  User,
  CreditCard,
  Building2,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { GradientButton, FormField } from '../../components/ui';

const ROLES = [
  {
    id: 'student',
    title: 'Student',
    desc: 'Submit assignments and view grades.',
    icon: GraduationCap,
    idLabel: 'Student ID',
    idPlaceholder: 'e.g. CS2024001',
  },
  {
    id: 'faculty',
    title: 'Faculty',
    desc: 'Create assignments, review submissions, and grade students.',
    icon: BookOpen,
    idLabel: 'Faculty ID',
    idPlaceholder: 'e.g. FAC202401',
  },
  {
    id: 'admin',
    title: 'Admin',
    desc: 'Manage users, courses, and assignments.',
    icon: ShieldCheck,
    idLabel: 'Admin ID',
    idPlaceholder: 'e.g. ADM202401',
  },
];

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('student');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    department: '',
    inviteCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const activeRoleConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[0];
  const ActiveRoleIcon = activeRoleConfig.icon;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';

    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Must be at least 8 characters';
    else if (!/\d/.test(form.password)) errs.password = 'Must contain at least one number';

    if (selectedRole === 'faculty' && !form.inviteCode.trim()) {
      errs.inviteCode = 'Faculty Authorization Key is required';
    } else if (selectedRole === 'admin' && !form.inviteCode.trim()) {
      errs.inviteCode = 'Admin Master Security Key is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: selectedRole.toLowerCase(),
      studentId: form.studentId.trim() || undefined,
      department: form.department.trim() || undefined,
      inviteCode: selectedRole !== 'student' ? form.inviteCode.trim() : undefined,
    };

    const result = await register(payload);
    if (result.success) {
      const userRole = result.user?.role?.toLowerCase() || selectedRole;
      success(`Welcome! Your ${userRole} account has been created.`);
      navigate(`/${userRole}/dashboard`);
    } else {
      showError(result.message);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen page-bg flex items-center justify-center p-4 py-8">
      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-violet-500/6 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-500/6 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel w-full max-w-lg p-6 sm:p-8 relative"
      >
        {/* Header with dynamic role icon */}
        <div className="text-center mb-6">
          <motion.div
            key={selectedRole}
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center mb-3 shadow-lg shadow-teal-500/20"
          >
            <ActiveRoleIcon size={28} className="text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Join the Assignment Submission and Evaluation Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Role Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Account Role <span className="text-teal-400">*</span>
              </label>
              <span className="text-xs text-slate-400">Select your portal role</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" role="radiogroup" aria-label="Account Role">
              {ROLES.map((r) => {
                const isSelected = selectedRole === r.id;
                const RoleIcon = r.icon;
                return (
                  <button
                    type="button"
                    key={r.id}
                    id={`role-${r.id}`}
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      setSelectedRole(r.id);
                      if (errors.inviteCode) {
                        setErrors((prev) => ({ ...prev, inviteCode: undefined }));
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-200 relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-teal-400 bg-teal-500/10 shadow-[0_0_18px_rgba(20,184,166,0.18)] ring-1 ring-teal-400/40'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-gradient-to-br from-teal-500 to-violet-500 text-white shadow-md'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <RoleIcon size={16} />
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? 'border-teal-400 bg-teal-500' : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                        </div>
                      </div>

                      <div className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {r.title}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">{r.desc}</p>
                    </div>

                    {isSelected && (
                      <div className="mt-2.5 flex items-center gap-1 text-[10px] text-teal-400 font-medium">
                        <CheckCircle2 size={12} />
                        <span>Active Selection</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Name */}
          <FormField label="Full Name" error={errors.name} required>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="reg-name"
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="Your full name"
                className="input-glass pl-10"
              />
            </div>
          </FormField>

          {/* Email Address */}
          <FormField label="Email Address" error={errors.email} required>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@university.edu"
                className="input-glass pl-10"
              />
            </div>
          </FormField>

          {/* Password */}
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormField>

          {/* Conditional Security Key for Faculty / Admin */}
          <AnimatePresence mode="wait">
            {selectedRole === 'faculty' && (
              <motion.div
                key="faculty-key"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FormField
                  label="Faculty Authorization Key"
                  error={errors.inviteCode}
                  required
                  hint="Required for faculty onboarding (Dev key: FACULTY2024)"
                >
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="reg-faculty-code"
                      type="password"
                      value={form.inviteCode}
                      onChange={set('inviteCode')}
                      placeholder="Enter faculty authorization key"
                      className="input-glass pl-10"
                    />
                  </div>
                </FormField>
              </motion.div>
            )}

            {selectedRole === 'admin' && (
              <motion.div
                key="admin-key"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FormField
                  label="Admin Master Security Key"
                  error={errors.inviteCode}
                  required
                  hint="Master administrative key (Dev key: ADMIN2024)"
                >
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="reg-admin-code"
                      type="password"
                      value={form.inviteCode}
                      onChange={set('inviteCode')}
                      placeholder="Enter admin master security key"
                      className="input-glass pl-10"
                    />
                  </div>
                </FormField>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Role-adaptive ID and Department */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label={activeRoleConfig.idLabel} hint="Optional">
              <div className="relative">
                <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-student-id"
                  type="text"
                  value={form.studentId}
                  onChange={set('studentId')}
                  placeholder={activeRoleConfig.idPlaceholder}
                  className="input-glass pl-10"
                />
              </div>
            </FormField>
            <FormField label="Department" hint="Optional">
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-dept"
                  type="text"
                  value={form.department}
                  onChange={set('department')}
                  placeholder="e.g. CS"
                  className="input-glass pl-10"
                />
              </div>
            </FormField>
          </div>

          {/* Submit Button & Role Notice */}
          <div className="pt-2">
            <p className="text-xs text-slate-500 mb-3 text-center sm:text-left">
              Registering as <span className="text-teal-400 font-medium capitalize">{selectedRole}</span>.
              {selectedRole === 'student' && ' Free public registration.'}
              {selectedRole === 'faculty' && ' Verification key required for faculty access.'}
              {selectedRole === 'admin' && ' Administrative authorization strictly verified.'}
            </p>
            <GradientButton type="submit" loading={loading} className="w-full" size="lg" id="reg-submit">
              Create Account
            </GradientButton>
          </div>
        </form>

        <p className="text-center text-sm text-slate-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
