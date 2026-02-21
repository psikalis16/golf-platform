import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User } from '../types';
import { fetchMe, login as apiLogin, logout as apiLogout } from '../api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // Re-fetches the user from the API (e.g. after a password change)
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate user from stored token on page load
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchMe()
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem('auth_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    localStorage.setItem('auth_token', res.data.token);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    localStorage.removeItem('auth_token');
    setUser(null);
  }, []);

  // Re-fetches the current user — call this after updating profile data
  const refreshUser = useCallback(async () => {
    const res = await fetchMe();
    setUser(res.data);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refreshUser, isAdmin: user?.role === 'admin' }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Convenience hook for consuming auth state in any component
export const useAuth = () => useContext(AuthContext);
