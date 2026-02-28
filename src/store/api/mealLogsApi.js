import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';
import { API_ENDPOINTS } from '../../services/api/config';

export const mealLogsApi = createApi({
  reducerPath: 'mealLogsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['MealLogs', 'DailySummary'],
  endpoints: (builder) => ({
    logMealFromRecipe: builder.mutation({
      query: (data) => ({
        url: API_ENDPOINTS.MEAL_LOGS_RECIPE,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MealLogs', 'DailySummary'],
    }),

    getDailySummary: builder.query({
      query: (date) => `${API_ENDPOINTS.MEAL_LOGS_DAILY}/${date}`,
      providesTags: ['DailySummary'],
    }),

    getMealsForDateRange: builder.query({
      query: ({ startDate, endDate }) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `${API_ENDPOINTS.MEAL_LOGS}?${params.toString()}`;
      },
      providesTags: ['MealLogs'],
    }),

    deleteMeal: builder.mutation({
      query: (mealId) => ({
        url: `${API_ENDPOINTS.MEAL_LOGS}/${mealId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MealLogs', 'DailySummary'],
    }),
  }),
});

export const {
  useLogMealFromRecipeMutation,
  useGetDailySummaryQuery,
  useGetMealsForDateRangeQuery,
  useDeleteMealMutation,
} = mealLogsApi;
