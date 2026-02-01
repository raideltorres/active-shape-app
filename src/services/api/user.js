import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

export const userService = {
  /**
   * Get user profile
   */
  async getProfile() {
    return apiClient.get(API_ENDPOINTS.PROFILE);
  },

  /**
   * Get user's tracking data
   */
  async getTrackings() {
    return apiClient.get(API_ENDPOINTS.TRACKING);
  },

  /**
   * Get today's tracking data
   */
  async getDailyTracking() {
    return apiClient.get(API_ENDPOINTS.DAILY_TRACKING);
  },

  /**
   * Create or update tracking data
   */
  async createTracking(data) {
    return apiClient.post(API_ENDPOINTS.TRACKING, data);
  },
};
