import { createApi } from '@reduxjs/toolkit/query/react';

import { API_BASE_URL, API_ENDPOINTS } from '../../services/api/config';
import { storage } from '../../utils/storage';
import { emitUnauthorized } from '../../utils/authEvents';

/**
 * Custom base query for FormData uploads (image analysis).
 * fetchBaseQuery auto-sets Content-Type which breaks multipart/form-data,
 * so we use a manual fetch instead.
 */
const formDataBaseQuery = async ({ url, body }) => {
  let token = await storage.getItem('token');
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    let response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers,
      body,
    });

    if (response.status === 401 && token) {
      const refreshToken = await storage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const refreshResponse = await fetch(
            `${API_BASE_URL}${API_ENDPOINTS.REFRESH_TOKEN}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            },
          );

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            await storage.setItem('token', refreshData.access_token);
            await storage.setItem('refreshToken', refreshData.refresh_token);

            headers.Authorization = `Bearer ${refreshData.access_token}`;
            response = await fetch(`${API_BASE_URL}${url}`, {
              method: 'POST',
              headers,
              body,
            });
          } else {
            emitUnauthorized();
            return { error: { status: 401, data: 'Unauthorized' } };
          }
        } catch {
          emitUnauthorized();
          return { error: { status: 401, data: 'Unauthorized' } };
        }
      } else {
        emitUnauthorized();
        return { error: { status: 401, data: 'Unauthorized' } };
      }
    }

    const data = await response.json();

    if (!response.ok) {
      return { error: { status: response.status, data } };
    }

    return { data };
  } catch (error) {
    return { error: { status: 'FETCH_ERROR', error: error.message } };
  }
};

export const aiNutritionApi = createApi({
  reducerPath: 'aiNutritionApi',
  baseQuery: formDataBaseQuery,
  endpoints: (builder) => ({
    analyzeFoodImage: builder.mutation({
      query: ({ userId, imageUri, context = '' }) => {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append(
          'image',
          typeof imageUri === 'string'
            ? { uri: imageUri, type: 'image/jpeg', name: 'image.jpg' }
            : imageUri,
        );
        const contextMessage = context
          ? `Dish name or ingredients: ${context}. Please analyze this image considering this information and identify all components.`
          : 'Analyze this food image and identify all visible ingredients and components.';
        formData.append('context', contextMessage);

        return { url: API_ENDPOINTS.AI_NUTRITION_ANALYZE, body: formData };
      },
    }),

    analyzeExercise: builder.mutation({
      queryFn: async ({ description, userWeight }, _api, _extra) => {
        let token = await storage.getItem('token');
        const url = `${API_BASE_URL}${API_ENDPOINTS.AI_EXERCISE_ANALYZE}`;
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        try {
          let response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ description, userWeight }),
          });

          if (response.status === 401 && token) {
            const refreshToken = await storage.getItem('refreshToken');
            if (refreshToken) {
              try {
                const refreshResponse = await fetch(
                  `${API_BASE_URL}${API_ENDPOINTS.REFRESH_TOKEN}`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                  },
                );
                if (refreshResponse.ok) {
                  const refreshData = await refreshResponse.json();
                  await storage.setItem('token', refreshData.access_token);
                  await storage.setItem('refreshToken', refreshData.refresh_token);
                  headers.Authorization = `Bearer ${refreshData.access_token}`;
                  response = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ description, userWeight }),
                  });
                } else {
                  emitUnauthorized();
                  return { error: { status: 401, data: 'Unauthorized' } };
                }
              } catch {
                emitUnauthorized();
                return { error: { status: 401, data: 'Unauthorized' } };
              }
            } else {
              emitUnauthorized();
              return { error: { status: 401, data: 'Unauthorized' } };
            }
          }

          const data = await response.json();
          if (!response.ok) return { error: { status: response.status, data } };
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
    }),
  }),
});

export const { useAnalyzeFoodImageMutation, useAnalyzeExerciseMutation } = aiNutritionApi;
