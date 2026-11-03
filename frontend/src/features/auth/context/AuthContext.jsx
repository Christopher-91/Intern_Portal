import { createContext, useState, useEffect } from 'react';
import { login, getMe } from '../services/auth.service';

// Context exports are intentionally colocated with their provider for consumers.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

/**
 * Normalizes user data ensuring both nested `user` payloads and flat objects
 * expose consistent top-level fields (id, _id, role).
 */
const normalizeUser = (raw) => {
  if (!raw) return null;
  const data = raw.user || raw;
  if (!data || typeof data !== 'object') return null;
  return {
    ...data,
    id: data.id || data._id || data.userId,
    _id: data._id || data.id || data.userId,
    role: data.role
  };
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? normalizeUser(JSON.parse(saved)) : null;
    } catch {
      return null;
    }
  });

  // If token and cached user exist in localStorage, render immediately and verify in background
  const [loading, setLoading] = useState(() => {
    const hasToken = Boolean(localStorage.getItem('token'));
    const hasUser = Boolean(localStorage.getItem('user'));
    if (hasToken && hasUser) return false;
    return Boolean(hasToken);
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        const res = await getMe();
        const userData = normalizeUser(res);

        if (userData && userData.role) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.warn("Auth check failed:", err);
        const status = err?.status || err?.response?.status;
        // Clear session if unauthorized or forbidden
        if (status === 401 || status === 403) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await login(email, password);

      const userToken = data.token;
      const userData = normalizeUser(data.user || data);

      if (userToken) {
        setToken(userToken);
        localStorage.setItem('token', userToken);
      }
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }

      return { ...data, user: userData };
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        loading,
        setLoading,
        error,
        setError,
        handleLogin,
        handleLogout,
        isAuthenticated: !!user || !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
