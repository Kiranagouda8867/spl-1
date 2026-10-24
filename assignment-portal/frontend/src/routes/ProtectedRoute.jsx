import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingState } from '../components/ui';

const VALID_ROLES = ['student', 'faculty', 'admin'];

export function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Authenticating session..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role?.toLowerCase();

  // If user object has no recognized academic role, send back to login
  if (!role || !VALID_ROLES.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  // If user is trying to access a role section they are not permitted for, redirect to their own dashboard
  if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(role)) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Checking session..." />;
  }

  // Only redirect away from login/register if fully authenticated WITH a valid recognized role
  if (isAuthenticated && user?.role) {
    const role = user.role.toLowerCase();
    if (VALID_ROLES.includes(role)) {
      return <Navigate to={`/${role}/dashboard`} replace />;
    }
  }

  return <Outlet />;
}
