import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';
import { API_ENDPOINTS } from '../../services/api/config';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => API_ENDPOINTS.PROFILE,
      providesTags: ['Profile'],
    }),

    updateProfile: builder.mutation({
      query: (data) => ({
        url: API_ENDPOINTS.PROFILE,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),

    upsertUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `${API_ENDPOINTS.USERS}/upsert/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),

    generatePersonalizedPlan: builder.mutation({
      query: () => ({
        url: `${API_ENDPOINTS.USERS}/plan/generate`,
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),

    regeneratePersonalizedPlan: builder.mutation({
      query: () => ({
        url: `${API_ENDPOINTS.USERS}/plan/regenerate`,
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),

    generateDailyInsights: builder.mutation({
      query: () => ({
        url: API_ENDPOINTS.DAILY_INSIGHTS,
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpsertUserMutation,
  useGeneratePersonalizedPlanMutation,
  useRegeneratePersonalizedPlanMutation,
  useGenerateDailyInsightsMutation,
} = usersApi;
