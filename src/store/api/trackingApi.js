import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';
import { API_ENDPOINTS } from '../../services/api/config';

export const trackingApi = createApi({
  reducerPath: 'trackingApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Tracking', 'DailyTracking'],
  endpoints: (builder) => ({
    getTrackings: builder.query({
      query: (userId) => {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        return `${API_ENDPOINTS.TRACKING}${query}`;
      },
      providesTags: ['Tracking'],
    }),

    getDailyTracking: builder.query({
      query: () => API_ENDPOINTS.DAILY_TRACKING,
      providesTags: ['DailyTracking'],
    }),

    createTracking: builder.mutation({
      query: (data) => ({
        url: API_ENDPOINTS.TRACKING,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Tracking', 'DailyTracking'],
    }),
  }),
});

export const {
  useGetTrackingsQuery,
  useGetDailyTrackingQuery,
  useCreateTrackingMutation,
} = trackingApi;
