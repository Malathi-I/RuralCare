import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  loginRequest,
  registerRequest,
  getMeRequest,
  updateProfileRequest,
} from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('rc_token');
    setUser(null);
  }, []);

  // On page load, check whether the stored token is still valid.
  useEffect(() => {
    const token = localStorage.getItem('rc_token');

    if (!token) {
      setLoading(false);
      return;
    }

    getMeRequest()
      .then((data) => setUser(data.user))
      .catch(() => {
        // Token expired or was revoked - clear it.
        localStorage.removeItem('rc_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload) => {
    const data = await loginRequest(payload);
    localStorage.setItem('rc_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await registerRequest(payload);
    localStorage.setItem('rc_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const updateProfile = async (payload) => {
    const data = await updateProfileRequest(payload);
    setUser(data.user);
    return data.user;
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    role: user?.role || null,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);