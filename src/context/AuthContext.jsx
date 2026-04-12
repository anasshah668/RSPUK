import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import httpClient from '../utils/httpClient';
import { apiRoutes } from '../config/routes';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const mapMeToUser = (me) => ({
  _id: me._id,
  name: me.name,
  email: me.email,
  role: me.role,
  avatar: me.avatar,
  phone: me.phone,
  address: me.address,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const bootstrapSession = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      localStorage.removeItem('user');
      setAuthReady(true);
      return;
    }

    try {
      const me = await httpClient.get(apiRoutes.authentication.me);
      const normalized = mapMeToUser(me);
      setUser(normalized);
      localStorage.setItem('user', JSON.stringify(normalized));
    } catch {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setAuthReady(true);
    }
  }, []);

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const login = async (userData, token) => {
    if (token) {
      localStorage.setItem('token', token);
    }
    try {
      await httpClient.post(apiRoutes.cart.merge, {});
    } catch {
      /* basket merge is best-effort */
    }
    setUser(userData);
    if (userData && typeof userData === 'object') {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => user !== null;

  const getUserInitial = () => {
    if (!user || !user.name) return 'U';
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        login,
        logout,
        isAuthenticated,
        getUserInitial,
        refreshSession: bootstrapSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
