import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

/**
 * Social authentication API service
 * Handles communication with backend social auth endpoints
 */
export const socialAuthService = {
  /**
   * Sign in with Google ID token
   * @param {string} token - Google ID token from OAuth flow
   */
  async googleSignIn(token) {
    return apiClient.post(API_ENDPOINTS.GOOGLE_SIGN_IN, { token });
  },

  /**
   * Sign up with Google ID token
   * @param {string} token - Google ID token from OAuth flow
   */
  async googleSignUp(token) {
    return apiClient.post(API_ENDPOINTS.GOOGLE_SIGN_UP, { token });
  },

  /**
   * Sign in with Facebook access token
   * @param {string} accessToken - Facebook access token
   */
  async facebookSignIn(accessToken) {
    return apiClient.post(API_ENDPOINTS.FACEBOOK_SIGN_IN, { accessToken });
  },

  /**
   * Sign up with Facebook access token
   * @param {string} accessToken - Facebook access token
   */
  async facebookSignUp(accessToken) {
    return apiClient.post(API_ENDPOINTS.FACEBOOK_SIGN_UP, { accessToken });
  },
};
