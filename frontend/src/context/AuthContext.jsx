import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
  loginRequest,
  registerRequest,
  getMeRequest,
  updateProfileRequest,
} from '../services/authService.js';
import { AUTH_TOKEN_KEY } from '../utils/constants.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tracks the session that is currently in use.
  //
  // Why this exists: a /api/auth/me request started for a previous session can
  // still be in flight when the user logs in again (for example, the page was
  // opened with a stale patient token and the user then signs in as an admin).
  // Without a guard, that late response would resolve AFTER the fresh login and
  // overwrite the new user, so an admin would end up rendered as the old
  // patient. Every request records the session id it was started for, and a
  // response is only applied if that id is still the current one.
  const sessionIdRef = useRef(0);

  /** Starts a new session and returns its id. */
  const startSession = useCallback(() => {
    sessionIdRef.current += 1;
    return sessionIdRef.current;
  }, []);

  const logout = useCallback(() => {
    // Invalidate any in-flight /me so a late response cannot restore the
    // session that is being closed.
    startSession();
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
  }, [startSession]);

  // On page load, check whether the stored token is still valid.
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    const sessionId = startSession();

    getMeRequest()
      .then((data) => {
        // A newer login or logout happened while this request was in flight,
        // so this response describes a session that no longer exists.
        if (sessionIdRef.current !== sessionId) return;
        setUser(data.user);
      })
      .catch(() => {
        if (sessionIdRef.current !== sessionId) return;
        // Token expired or was revoked - clear it.
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setUser(null);
      })
      .finally(() => {
        if (sessionIdRef.current === sessionId) setLoading(false);
      });
  }, [startSession]);

  const login = async (payload) => {
    const data = await loginRequest(payload);

    // Replace any previous token: this must happen before the new session is
    // marked current, so a late /me for the old session is ignored.
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    startSession();

    // The role and email come straight from the backend response, which reads
    // them from the database. Nothing is inferred from the submitted form.
    setUser(data.user);
    setLoading(false);
    return data.user;
  };

  const register = async (payload) => {
    const data = await registerRequest(payload);

    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    startSession();

    setUser(data.user);
    setLoading(false);
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