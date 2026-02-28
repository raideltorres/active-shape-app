import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';
import { API_ENDPOINTS } from '../../services/api/config';

export const fastingApi = createApi({
  reducerPath: 'fastingApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['FastingPlans', 'FastingSession'],
  endpoints: (builder) => ({
    getFastingPlans: builder.query({
      query: () => API_ENDPOINTS.FASTING_PLANS,
      providesTags: ['FastingPlans'],
    }),

    getFastingPlan: builder.query({
      query: (planId) => `${API_ENDPOINTS.FASTING_PLANS}/${planId}`,
      providesTags: (result, error, planId) => [{ type: 'FastingPlans', id: planId }],
    }),

    getOngoingFastingSession: builder.query({
      query: () => `${API_ENDPOINTS.FASTING_SESSIONS}/ongoing`,
      providesTags: ['FastingSession'],
    }),

    startFastingSession: builder.mutation({
      query: (data) => ({
        url: API_ENDPOINTS.FASTING_SESSIONS,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['FastingSession'],
    }),

    endFastingSession: builder.mutation({
      query: ({ sessionId, ...data }) => ({
        url: `${API_ENDPOINTS.FASTING_SESSIONS}/${sessionId}/end`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['FastingSession'],
    }),
  }),
});

export const {
  useGetFastingPlansQuery,
  useGetFastingPlanQuery,
  useGetOngoingFastingSessionQuery,
  useStartFastingSessionMutation,
  useEndFastingSessionMutation,
} = fastingApi;
