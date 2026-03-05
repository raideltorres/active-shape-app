import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';

export const supplementsApi = createApi({
  reducerPath: 'supplementsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Supplements', 'SupplementLogs'],
  endpoints: (builder) => ({
    getSupplements: builder.query({
      query: () => '/supplements',
      providesTags: ['Supplements'],
    }),
    createSupplement: builder.mutation({
      query: (body) => ({
        url: '/supplements',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Supplements', 'SupplementLogs'],
    }),
    updateSupplement: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/supplements/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Supplements', 'SupplementLogs'],
    }),
    deleteSupplement: builder.mutation({
      query: (id) => ({
        url: `/supplements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Supplements', 'SupplementLogs'],
    }),
    getDailySupplementSummary: builder.query({
      query: (date) => `/supplements/daily/${date}`,
      providesTags: ['SupplementLogs'],
    }),
    logSupplement: builder.mutation({
      query: (body) => ({
        url: '/supplements/log',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SupplementLogs'],
    }),
    unlogSupplement: builder.mutation({
      query: ({ supplementId, date }) => ({
        url: `/supplements/log/${supplementId}/${date}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SupplementLogs'],
    }),
  }),
});

export const {
  useGetSupplementsQuery,
  useCreateSupplementMutation,
  useUpdateSupplementMutation,
  useDeleteSupplementMutation,
  useGetDailySupplementSummaryQuery,
  useLogSupplementMutation,
  useUnlogSupplementMutation,
} = supplementsApi;
