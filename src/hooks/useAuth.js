import { useSelector, useDispatch } from 'react-redux';

import { setCredentials, logout, selectIsAuthenticated, selectUser, selectToken } from '../store/slices/authSlice';
import { storage } from '../utils/storage';
import { API_BASE_URL, API_ENDPOINTS } from '../services/api/config';

export const useAuth = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);

  const login = async (userData, authToken, refreshToken) => {
    await storage.setItem('token', authToken);

    if (refreshToken) {
      await storage.setItem('refreshToken', refreshToken);
    }

    if (userData) {
      await storage.setItem('user', JSON.stringify(userData));
    }

    dispatch(setCredentials({ user: userData, token: authToken }));
  };

  const signOut = async () => {
    const refreshToken = await storage.getItem('refreshToken');

    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGOUT}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // Best-effort revocation — don't block logout on network failure
      }
    }

    await storage.removeItem('token');
    await storage.removeItem('refreshToken');
    await storage.removeItem('user');
    dispatch(logout());
  };

  const restoreSession = async () => {
    try {
      const storedToken = await storage.getItem('token');
      const storedUser = await storage.getItem('user');
      const storedRefreshToken = await storage.getItem('refreshToken');

      if (storedToken && storedUser) {
        dispatch(setCredentials({
          user: JSON.parse(storedUser),
          token: storedToken,
        }));
        return true;
      }

      if (storedRefreshToken) {
        dispatch(setCredentials({ user: null, token: null }));
        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  return {
    isAuthenticated,
    user,
    token,
    login,
    signOut,
    restoreSession,
  };
};
