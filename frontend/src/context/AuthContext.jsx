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
        if (token.startsWith('mock_jwt_token_')) {
          const role = token.replace('mock_jwt_token_', '');
          const isAdmin = role === 'admin';
          const isGuest = role === 'guest';
          setUser({
            id: isAdmin ? 1 : (isGuest ? 99 : 2),
            full_name: isAdmin ? 'System Administrator' : (isGuest ? 'Guest Explorer' : 'Rahul Sharma'),
            email: `${role}@smartloan.ai`,
            role: isAdmin ? 'admin' : 'borrower'
          });
        } else {
          try {
            const res = await api.getMe();
            setUser(res.data.user);
          } catch (err) {
            console.error("Token invalid or expired", err);
            logout();
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('smartloan_token', access_token);
      setToken(access_token);
      setUser(userData);
      return userData;
    } catch (err) {
      // Offline / GitHub Pages fallback for demo accounts
      const lowerEmail = (email || '').toLowerCase();
      if (!err.response || err.message?.includes('Network Error')) {
        const isAdmin = lowerEmail.includes('admin');
        const isGuest = lowerEmail.includes('guest');
        const role = isAdmin ? 'admin' : 'borrower';
        const demoUser = {
          id: isAdmin ? 1 : (isGuest ? 99 : 2),
          full_name: isAdmin ? 'System Administrator' : (isGuest ? 'Guest Explorer' : 'Rahul Sharma'),
          email: email || `${role}@smartloan.ai`,
          role
        };
        const demoToken = 'mock_jwt_token_' + (isAdmin ? 'admin' : (isGuest ? 'guest' : 'borrower'));
        localStorage.setItem('smartloan_token', demoToken);
        setToken(demoToken);
        setUser(demoUser);
        return demoUser;
      }
      throw err;
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.register(formData);
      const { access_token, user: userData } = res.data;
      localStorage.setItem('smartloan_token', access_token);
      setToken(access_token);
      setUser(userData);
      return userData;
    } catch (err) {
      // Offline / GitHub Pages fallback
      if (!err.response || err.message?.includes('Network Error')) {
        const role = formData.role || 'borrower';
        const demoUser = {
          id: Date.now(),
          full_name: formData.full_name || 'New Registered User',
          email: formData.email,
          role
        };
        const demoToken = 'mock_jwt_token_' + role;
        localStorage.setItem('smartloan_token', demoToken);
        setToken(demoToken);
        setUser(demoUser);
        return demoUser;
      }
      throw err;
    }
  };

  const quickLoginAs = async (role) => {
    try {
      if (role === 'admin') {
        return await login('admin@smartloan.ai', 'Admin@123');
      } else if (role === 'guest') {
        return await login('guest@smartloan.ai', 'Guest@123');
      } else {
        return await login('borrower@smartloan.ai', 'Borrower@123');
      }
    } catch (err) {
      const isAdmin = role === 'admin';
      const isGuest = role === 'guest';
      const demoUser = {
        id: isAdmin ? 1 : (isGuest ? 99 : 2),
        full_name: isAdmin ? 'System Administrator' : (isGuest ? 'Guest Explorer' : 'Rahul Sharma'),
        email: `${role}@smartloan.ai`,
        role: isAdmin ? 'admin' : 'borrower'
      };
      const demoToken = 'mock_jwt_token_' + role;
      localStorage.setItem('smartloan_token', demoToken);
      setToken(demoToken);
      setUser(demoUser);
      return demoUser;
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
