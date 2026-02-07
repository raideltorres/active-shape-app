import { API_BASE_URL } from './config';
import { storage } from '../../utils/storage';
import { emitUnauthorized } from '../../utils/authEvents';

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async getHeaders() {
    const token = await storage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders();

    const config = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    // Debug logging
    if (__DEV__) {
      console.log(`[API] ${options.method || 'GET'} ${url}`);
    }

    try {
      const response = await fetch(url, config);
      
      // Debug logging
      if (__DEV__) {
        console.log(`[API] Response status: ${response.status}`);
      }

      // Handle 401 Unauthorized - only auto-logout if we had a token (session expired)
      // Don't logout for login failures or other 401s without a token
      if (response.status === 401) {
        const token = await storage.getItem('token');
        
        if (token) {
          if (__DEV__) {
            console.log('[API] 401 Unauthorized with existing token - session expired, triggering auto-logout');
          }

          emitUnauthorized();
        } else if (__DEV__) {
          console.log('[API] 401 Unauthorized without token - likely login failure, not triggering logout');
        }
        
        throw new Error('Unauthorized');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      // Enhanced error logging
      if (__DEV__) {
        console.error(`[API] Error:`, error.message);
        console.error(`[API] URL was: ${url}`);
      }
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

