import React, { createContext, useState, useCallback, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminData = localStorage.getItem('admin');
    if (token && adminData) {
      setIsAuthenticated(true);
      setAdmin(JSON.parse(adminData));
    }
    setLoading(false);
  }, []);

  const login = useCallback((token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('admin', JSON.stringify(user));
    setIsAuthenticated(true);
    setAdmin(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setIsAuthenticated(false);
    setAdmin(null);
  }, []);

  const updateAdmin = useCallback((userData) => {
    setAdmin(userData);
    localStorage.setItem('admin', JSON.stringify(userData));
  }, []);

  const value = {
    isAuthenticated,
    admin,
    loading,
    login,
    logout,
    updateAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
