import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';
import { API_ENDPOINTS } from '../../services/api/config';

export const fastingApi = createApi({
  reducerPath: 'fastingApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['FastingPlans', 'FastingSessions', 'FastingStats'],
  endpoints: (builder) => ({
    getFastingPlans: builder.query({
      query: () => API_ENDPOINTS.FASTING_PLANS,
      providesTags: ['FastingPlans'],
    }),

    getFastingPlan: builder.query({
      query: (planId) => `${API_ENDPOINTS.FASTING_PLANS}/${planId}`,
      providesTags: (result, error, planId) => [{ type: 'FastingPlans', id: planId }],
    }),

    getOngoingSession: builder.query({
      query: () => `${API_ENDPOINTS.FASTING_SESSIONS}/ongoing`,
      providesTags: ['FastingSessions'],
    }),

    startFastingSession: builder.mutation({
      query: (body) => ({
        url: `${API_ENDPOINTS.FASTING_SESSIONS}/start`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FastingSessions', 'FastingStats'],
    }),

    endFastingSession: builder.mutation({
      query: ({ sessionId, ...body }) => ({
        url: `${API_ENDPOINTS.FASTING_SESSIONS}/${sessionId}/end`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['FastingSessions', 'FastingStats'],
    }),

    getFastingHistory: builder.query({
      query: ({ limit = 20, skip = 0, startDate, endDate } = {}) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit);
        if (skip) params.append('skip', skip);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `${API_ENDPOINTS.FASTING_SESSIONS}/history?${params.toString()}`;
      },
      providesTags: ['FastingSessions'],
    }),

    getFastingStats: builder.query({
      query: () => `${API_ENDPOINTS.FASTING_SESSIONS}/stats`,
      providesTags: ['FastingStats'],
    }),

    getFastingCalendar: builder.query({
      query: ({ startDate, endDate }) =>
        `${API_ENDPOINTS.FASTING_SESSIONS}/calendar?startDate=${startDate}&endDate=${endDate}`,
      providesTags: ['FastingSessions'],
    }),

    deleteFastingSession: builder.mutation({
      query: (sessionId) => ({
        url: `${API_ENDPOINTS.FASTING_SESSIONS}/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FastingSessions', 'FastingStats'],
    }),
  }),
});

export const {
  useGetFastingPlansQuery,
  useGetFastingPlanQuery,
  useGetOngoingSessionQuery,
  useStartFastingSessionMutation,
  useEndFastingSessionMutation,
  useGetFastingHistoryQuery,
  useGetFastingStatsQuery,
  useGetFastingCalendarQuery,
  useDeleteFastingSessionMutation,
} = fastingApi;
