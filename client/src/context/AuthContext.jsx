import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import authApi from '../services/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = async () => {
    setLoading(true);
    try {
      const response = await authApi.me();
      setUser(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null);
      } else {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth().catch(() => {
      setUser(null);
      setLoading(false);
    });
  }, []);

  const login = async (payload) => {
    const response = await authApi.login(payload);
    setUser(response.data);
    return response.data;
  };

  const register = async (payload) => {
    const response = await authApi.register(payload);
    setUser(response.data);
    return response.data;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshAuth,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
