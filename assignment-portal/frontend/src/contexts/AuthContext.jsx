import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);
const VALID_ROLES = ['student', 'faculty', 'admin'];

function getInitialAuth() {
  try {
    const rawToken = localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');

    if (!rawToken || !rawUser) {
      return { token: null, user: null };
    }

    const parsedUser = JSON.parse(rawUser);
    const role = parsedUser?.role?.toLowerCase();

    if (parsedUser && role && VALID_ROLES.includes(role)) {
      return { token: rawToken, user: { ...parsedUser, role } };
    }

    // Invalid or corrupted session data found in storage; clean it up safely
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { token: null, user: null };
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const initial = useMemo(() => getInitialAuth(), []);
  const [user, setUser] = useState(initial.user);
  const [token, setToken] = useState(initial.token);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      const { token: newToken, user: rawUser } = res.data.data;
      const normalizedUser = {
        ...rawUser,
        role: rawUser.role?.toLowerCase() || 'student',
      };

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setToken(newToken);
      setUser(normalizedUser);
      return { success: true, user: normalizedUser };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await authService.register(data);
      const { token: newToken, user: rawUser } = res.data.data;
      const normalizedUser = {
        ...rawUser,
        role: rawUser.role?.toLowerCase() || 'student',
      };

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setToken(newToken);
      setUser(normalizedUser);
      return { success: true, user: normalizedUser };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Registration failed.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await authService.getMe();
      const updated = res.data.data;
      if (updated?.role) {
        const normalized = { ...updated, role: updated.role.toLowerCase() };
        localStorage.setItem('user', JSON.stringify(normalized));
        setUser(normalized);
      }
    } catch {
      // Expired token or network error
    }
  }, [token]);

  const isAuthenticated = Boolean(token && user && user.role);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  }), [user, token, loading, isAuthenticated, login, register, logout, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
