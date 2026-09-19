import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smartloan_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.data.user);
        } catch (err) {
          console.error("Token invalid or expired", err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('smartloan_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await api.register(formData);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('smartloan_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const quickLoginAs = async (role) => {
    if (role === 'admin') {
      return login('admin@smartloan.ai', 'Admin@123');
    } else {
      return login('borrower@smartloan.ai', 'Borrower@123');
    }
  };

  const logout = () => {
    localStorage.removeItem('smartloan_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        quickLoginAs,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
