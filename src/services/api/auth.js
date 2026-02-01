import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

export const authService = {
  login: async ({ email, password }) => {
    return apiClient.post(API_ENDPOINTS.LOGIN, { email, password });
  },

  register: async ({ name, email, password }) => {
    return apiClient.post(API_ENDPOINTS.REGISTER, { name, email, password });
  },

  getProfile: async () => {
    return apiClient.get(API_ENDPOINTS.PROFILE);
  },
};

