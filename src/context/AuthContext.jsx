import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
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
      localStorage.setItem('user', JSON.stringify({
        _id: normalized._id,
        name: normalized.name,
        email: normalized.email,
        role: normalized.role,
      }));
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
    const onExpired = () => {
      setUser(null);
      toast.warn('Session expired — sign in again. Your design draft is still on this device.', {
        autoClose: 8000,
      });
    };
    window.addEventListener('rspuk-session-expired', onExpired);
    return () => window.removeEventListener('rspuk-session-expired', onExpired);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }));
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
      localStorage.setItem('user', JSON.stringify({
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      }));
    }
  };

  /** Does not clear the basket in MongoDB or via cart APIs — only ends the session. */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
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
