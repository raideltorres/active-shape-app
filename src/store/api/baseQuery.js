import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { API_BASE_URL } from '../../services/api/config';
import { storage } from '../../utils/storage';
import { emitUnauthorized } from '../../utils/authEvents';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers) => {
    const token = await storage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Wrapper around fetchBaseQuery that handles 401 responses
 * by emitting an unauthorized event (triggers auto-logout).
 * Only triggers logout when a token exists (session expired),
 * not for unauthenticated requests like login failures.
 */
export const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const token = await storage.getItem('token');
    if (token) {
      if (__DEV__) {
        console.log('[RTK Query] 401 with existing token — session expired, triggering auto-logout');
      }
      emitUnauthorized();
    }
  }

  return result;
};
