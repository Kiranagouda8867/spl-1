import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute, PublicOnlyRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentSubmissions from './pages/student/StudentSubmissions';
import StudentGrades from './pages/student/StudentGrades';
import Notifications from './pages/student/Notifications';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyCourses from './pages/faculty/FacultyCourses';
import FacultyAssignments from './pages/faculty/FacultyAssignments';
import FacultySubmissions from './pages/faculty/FacultySubmissions';
import FacultyGrades from './pages/faculty/FacultyGrades';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminAssignments from './pages/admin/AdminAssignments';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/courses" element={<StudentCourses />} />
                <Route path="/student/assignments" element={<StudentAssignments />} />
                <Route path="/student/submissions" element={<StudentSubmissions />} />
                <Route path="/student/grades" element={<StudentGrades />} />
                <Route path="/student/notifications" element={<Notifications />} />
              </Route>
            </Route>

            {/* Faculty Routes */}
            <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
                <Route path="/faculty/courses" element={<FacultyCourses />} />
                <Route path="/faculty/assignments" element={<FacultyAssignments />} />
                <Route path="/faculty/submissions" element={<FacultySubmissions />} />
                <Route path="/faculty/grades" element={<FacultyGrades />} />
                <Route path="/faculty/notifications" element={<Notifications />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/courses" element={<AdminCourses />} />
                <Route path="/admin/assignments" element={<AdminAssignments />} />
              </Route>
            </Route>

            {/* Default fallback */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
