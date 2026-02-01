import { useSelector, useDispatch } from 'react-redux';

import { setCredentials, logout, selectIsAuthenticated, selectUser, selectToken } from '../store/slices/authSlice';
import { storage } from '../utils/storage';

export const useAuth = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);

  const login = async (userData, authToken) => {
    await storage.setItem('token', authToken);
    await storage.setItem('user', JSON.stringify(userData));
    dispatch(setCredentials({ user: userData, token: authToken }));
  };

  const signOut = async () => {
    await storage.removeItem('token');
    await storage.removeItem('user');
    dispatch(logout());
  };

  const restoreSession = async () => {
    try {
      const storedToken = await storage.getItem('token');
      const storedUser = await storage.getItem('user');

      if (storedToken && storedUser) {
        dispatch(setCredentials({
          user: JSON.parse(storedUser),
          token: storedToken,
        }));
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

