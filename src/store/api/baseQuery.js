import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { API_BASE_URL, API_ENDPOINTS } from '../../services/api/config';
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

let refreshPromise = null;

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result?.error?.status !== 401) {
    return result;
  }

  const refreshToken = await storage.getItem('refreshToken');

  if (!refreshToken) {
    const token = await storage.getItem('token');
    if (token) {
      if (__DEV__) {
        console.log('[RTK Query] 401 with no refresh token — forcing logout');
      }
      emitUnauthorized();
    }
    return result;
  }

  if (!refreshPromise) {
    refreshPromise = attemptTokenRefresh(refreshToken, api, extraOptions).finally(() => {
      refreshPromise = null;
    });
  }

  const refreshSucceeded = await refreshPromise;

  if (!refreshSucceeded) {
    if (__DEV__) {
      console.log('[RTK Query] Token refresh failed — forcing logout');
    }
    await forceSignOut();
    emitUnauthorized();
    return result;
  }

  if (__DEV__) {
    console.log('[RTK Query] Token refreshed — retrying original request');
  }

  return await rawBaseQuery(args, api, extraOptions);
};

async function attemptTokenRefresh(refreshToken, api, extraOptions) {
  const refreshResult = await rawBaseQuery(
    {
      url: API_ENDPOINTS.REFRESH_TOKEN,
      method: 'POST',
      body: { refreshToken },
    },
    api,
    extraOptions,
  );

  if (refreshResult?.data) {
    await storage.setItem('token', refreshResult.data.access_token);
    await storage.setItem('refreshToken', refreshResult.data.refresh_token);

    if (refreshResult.data.data) {
      await storage.setItem('user', JSON.stringify(refreshResult.data.data));
    }

    return true;
  }

  return false;
}

async function forceSignOut() {
  await storage.removeItem('token');
  await storage.removeItem('refreshToken');
  await storage.removeItem('user');
}
