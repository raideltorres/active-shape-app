import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';
import { API_ENDPOINTS } from '../../services/api/config';

export const workoutsApi = createApi({
  reducerPath: 'workoutsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Workouts', 'Workout'],
  endpoints: (builder) => ({
    getWorkoutConfigurations: builder.query({
      query: () => API_ENDPOINTS.WORKOUTS_CONFIGURATION,
    }),

    getWorkouts: builder.query({
      query: ({ page, limit, filters }) => ({
        url: API_ENDPOINTS.WORKOUTS,
        method: 'GET',
        params: {
          page,
          limit,
          filters: JSON.stringify(filters),
        },
      }),
      providesTags: ['Workouts'],
    }),

    getWorkoutById: builder.query({
      query: (id) => `${API_ENDPOINTS.WORKOUTS}/${id}`,
      providesTags: ['Workout'],
    }),
  }),
});

export const {
  useGetWorkoutConfigurationsQuery,
  useGetWorkoutsQuery,
  useGetWorkoutByIdQuery,
} = workoutsApi;
