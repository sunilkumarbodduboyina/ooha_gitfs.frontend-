import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const AuthCtx = createContext(null);

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('ooha_user') || 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser());
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('ooha_token')));

  useEffect(() => {
    const token = localStorage.getItem('ooha_token');
    if (!token) return;
    api.me()
      .then((d) => {
        setUser(d.user);
        localStorage.setItem('ooha_user', JSON.stringify(d.user));
      })
      .catch(() => {
        localStorage.removeItem('ooha_token');
        localStorage.removeItem('ooha_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback((token, u) => {
    localStorage.setItem('ooha_token', token);
    localStorage.setItem('ooha_user', JSON.stringify(u));
    setUser(u);
  }, []);

  const login = useCallback(async (identifier, password) => {
    const d = await api.login({ identifier, password });
    persist(d.token, d.user);
    return d;
  }, [persist]);

  const register = useCallback(async (payload) => {
    const d = await api.register(payload);
    persist(d.token, d.user);
    return d;
  }, [persist]);

  const logout = useCallback(() => {
    localStorage.removeItem('ooha_token');
    localStorage.removeItem('ooha_user');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setUser, isAdmin: user?.role === 'admin' }),
    [user, loading, login, register, logout]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
