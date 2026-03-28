import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';
import { API_ENDPOINTS } from '../../services/api/config';

export const userWorkoutsApi = createApi({
  reducerPath: 'userWorkoutsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['UserFavoriteWorkouts'],
  endpoints: (builder) => ({
    getUserFavoriteWorkouts: builder.query({
      query: () => API_ENDPOINTS.USER_WORKOUTS_FAVORITE,
      providesTags: ['UserFavoriteWorkouts'],
    }),

    addUserFavoriteWorkout: builder.mutation({
      query: (workoutId) => ({
        url: `${API_ENDPOINTS.USER_WORKOUTS_FAVORITE}/${workoutId}`,
        method: 'POST',
      }),
      invalidatesTags: ['UserFavoriteWorkouts'],
    }),

    deleteUserFavoriteWorkout: builder.mutation({
      query: (id) => ({
        url: `${API_ENDPOINTS.USER_WORKOUTS_FAVORITE}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UserFavoriteWorkouts'],
    }),
  }),
});

export const {
  useGetUserFavoriteWorkoutsQuery,
  useAddUserFavoriteWorkoutMutation,
  useDeleteUserFavoriteWorkoutMutation,
} = userWorkoutsApi;
