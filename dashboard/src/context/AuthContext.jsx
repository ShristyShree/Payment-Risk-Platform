import { createContext, useContext, useState, useCallback } from 'react';
import * as authApi from '../services/authApi';

const AuthContext = createContext(null);

/**
 * Why a context instead of just reading localStorage in every component:
 * multiple parts of the UI (sidebar, header, route guard) need to know
 * "who's logged in" and re-render when that changes (e.g. right after
 * login, or on logout). A context is the standard React way to share
 * that without prop-drilling it through every layout component.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email, password) => {
    const { token, user: loggedInUser } = await authApi.login(email, password);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(user && localStorage.getItem('token'));

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}