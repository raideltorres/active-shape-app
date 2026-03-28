import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';
import { API_ENDPOINTS } from '../../services/api/config';

const USER_WORKOUTS_URL = '/user-workouts';

export const trackingApi = createApi({
  reducerPath: 'trackingApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Tracking', 'DailyTracking'],
  endpoints: (builder) => ({
    getTrackings: builder.query({
      query: (filters = {}) => ({
        url: API_ENDPOINTS.TRACKING,
        method: 'GET',
        params: filters,
      }),
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

    updateTracking: builder.mutation({
      query: (data) => ({
        url: API_ENDPOINTS.TRACKING,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Tracking', 'DailyTracking'],
    }),

    deleteTrackingField: builder.mutation({
      query: ({ userId, date, field }) => ({
        url: API_ENDPOINTS.TRACKING_FIELD,
        method: 'DELETE',
        body: { userId, date, field },
      }),
      invalidatesTags: ['Tracking', 'DailyTracking'],
    }),

    deleteTracking: builder.mutation({
      query: ({ userId, date }) => ({
        url: API_ENDPOINTS.TRACKING,
        method: 'DELETE',
        body: { userId, date },
      }),
      invalidatesTags: ['Tracking', 'DailyTracking'],
    }),

    recordWorkout: builder.mutation({
      query: (data) => ({
        url: USER_WORKOUTS_URL,
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
  useUpdateTrackingMutation,
  useDeleteTrackingFieldMutation,
  useDeleteTrackingMutation,
  useRecordWorkoutMutation,
} = trackingApi;
