import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, BookOpen, FileText, Upload, Award,
  Users, LogOut, Bell, ChevronLeft, GraduationCap,
  ClipboardList, BarChart3, Menu, X
} from 'lucide-react';

const studentNav = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/courses', icon: BookOpen, label: 'My Courses' },
  { to: '/student/assignments', icon: FileText, label: 'Assignments' },
  { to: '/student/submissions', icon: Upload, label: 'My Submissions' },
  { to: '/student/grades', icon: Award, label: 'Grades' },
  { to: '/student/notifications', icon: Bell, label: 'Notifications' },
];

const facultyNav = [
  { to: '/faculty/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/faculty/courses', icon: BookOpen, label: 'My Courses' },
  { to: '/faculty/assignments', icon: ClipboardList, label: 'Assignments' },
  { to: '/faculty/submissions', icon: FileText, label: 'Submissions' },
  { to: '/faculty/grades', icon: BarChart3, label: 'Grading' },
  { to: '/faculty/notifications', icon: Bell, label: 'Notifications' },
];

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { to: '/admin/assignments', icon: ClipboardList, label: 'Assignments' },
];

const navByRole = { student: studentNav, faculty: facultyNav, admin: adminNav };

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role?.toLowerCase() || 'student';
  const navItems = navByRole[role] || studentNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-teal-500/10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-teal-500/20">
          <GraduationCap size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight">Assignment</p>
            <p className="text-teal-400 text-xs font-semibold">Portal</p>
          </div>
        )}
      </div>

      {/* User info */}
      {!collapsed && user && (
        <div className="px-4 py-4 border-b border-teal-500/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500/30 to-violet-500/30 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-teal-400 font-bold text-sm">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.name || 'User'}</p>
              <p className="text-slate-400 text-xs capitalize">{user.role || 'Student'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-teal-500/10">
        <button
          onClick={handleLogout}
          className="sidebar-item w-full hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.2 }}
        className="hidden lg:flex flex-col h-screen glass-dark border-r border-teal-500/10 flex-shrink-0 overflow-hidden relative"
      >
        {renderSidebarContent()}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-6 -right-3 w-6 h-6 bg-navy-800 border border-teal-500/20 rounded-full flex items-center justify-center text-slate-400 hover:text-teal-400 transition-colors z-20 shadow-md"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft size={12} className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </motion.aside>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 glass rounded-xl text-teal-400"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 h-full w-72 z-50 glass-dark border-r border-teal-500/10 lg:hidden flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
              {renderSidebarContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
