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
   * Update user profile
   */
  async updateProfile(data) {
    return apiClient.patch(API_ENDPOINTS.PROFILE, data);
  },

  /**
   * Upsert user data (create or update)
   */
  async upsertUser(data) {
    return apiClient.patch(`${API_ENDPOINTS.USERS}/${data.id}`, data);
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

  /**
   * Generate AI daily insights
   */
  async generateDailyInsights() {
    return apiClient.post(API_ENDPOINTS.DAILY_INSIGHTS);
  },

  /**
   * Get fasting plan by ID
   */
  async getFastingPlan(planId) {
    return apiClient.get(`${API_ENDPOINTS.FASTING_PLANS}/${planId}`);
  },

  /**
   * Get all fasting plans
   */
  async getFastingPlans() {
    return apiClient.get(API_ENDPOINTS.FASTING_PLANS);
  },

  /**
   * Start fasting session
   */
  async startFastingSession(data) {
    return apiClient.post(API_ENDPOINTS.FASTING_SESSIONS, data);
  },

  /**
   * End fasting session
   */
  async endFastingSession(sessionId, data) {
    return apiClient.patch(`${API_ENDPOINTS.FASTING_SESSIONS}/${sessionId}/end`, data);
  },

  /**
   * Get ongoing fasting session
   */
  async getOngoingFastingSession() {
    return apiClient.get(`${API_ENDPOINTS.FASTING_SESSIONS}/ongoing`);
  },
};
