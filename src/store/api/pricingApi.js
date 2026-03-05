import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';
import { API_ENDPOINTS } from '../../services/api/config';

export const pricingApi = createApi({
  reducerPath: 'pricingApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PricingPlans'],
  endpoints: (builder) => ({
    getPricingPlans: builder.query({
      query: (filter = { page: 1, limit: 10 }) => ({
        url: API_ENDPOINTS.PRICING_PLANS,
        method: 'GET',
        params: filter,
      }),
      providesTags: ['PricingPlans'],
    }),
  }),
});

export const { useGetPricingPlansQuery } = pricingApi;
