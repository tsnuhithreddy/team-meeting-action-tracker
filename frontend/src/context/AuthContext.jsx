import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token exists on app load and fetch profile
  useEffect(() => {
    const token = localStorage.getItem('tracker_token');
    if (token) {
      apiRequest('/auth/me')
        .then((res) => {
          if (res.success) {
            setUser(res.user);
          }
        })
        .catch(() => {
          localStorage.removeItem('tracker_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (res.success) {
      localStorage.setItem('tracker_token', res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('tracker_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}